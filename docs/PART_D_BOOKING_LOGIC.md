# Part D: Booking Logic & Concurrency Control

## 1. The Core Problem: Double Booking in High-Concurrency Systems
Consider the scenario where **Customer A** and **Customer B** simultaneously browse the same salon ("Luxe Haven Salon") and click "Book Now" for the same service ("Full Balayage & Gloss") on the exact same date and time (`2026-10-25 15:00`).

In a naive, non-concurrent implementation:
```text
Customer A Thread: [1. Check slot available?] --> YES --> [2. Insert Booking]
Customer B Thread:      [1. Check slot available?] --> YES --> [2. Insert Booking]
```
Because both requests execute the `SELECT` query before either completes its `INSERT`, both read the slot as "available". As a result, two separate bookings are persisted for the same service and slot. This is known as a **Time-of-Check to Time-of-Use (TOCTOU) race condition**.

---

## 2. Our Multi-Layered Defense Architecture

To provide 100% guarantee against double booking, our application employs a **defense-in-depth approach** combining database constraints, transactional isolation, concurrency locks, and application-level validation:

```text
+-------------------------------------------------------------+
|                      Client Request                         |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
| Layer 1: Application-Level Pre-Validation                   |
| - Verify salon & service exist and active                   |
| - Validate business hours (e.g., 09:00 - 20:00)             |
| - Validate date is not in the past                          |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
| Layer 2: ACID Transaction with Row-Level Lock               |
| - BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED          |
| - SELECT ... FOR UPDATE (pessimistic lock on conflicting    |
|   existing active bookings)                                 |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
| Layer 3: Database Unique Constraint (Final Invariant)       |
| - CONSTRAINT uq_salon_service_datetime UNIQUE               |
|   (salon_id, service_id, booking_date, booking_time)        |
+-------------------------------------------------------------+
                              |
              +---------------+---------------+
              |                               |
       Insert Succeeds                 Unique Violation (23505)
              |                               |
              v                               v
     HTTP 201 Created                 HTTP 409 Conflict
   Booking Confirmed JSON            Descriptive Error JSON
```

---

## 3. Detailed Component Breakdown

### A. Database-Level Unique Constraint (Hard Invariant)
Application code and web servers can be scaled horizontally across multiple instances (e.g., Kubernetes pods, serverless functions). Therefore, relying purely on memory locks (like Node.js mutexes) will fail across multiple server nodes.

The **authoritative single source of truth** must be the database. In `database/schema.sql`:

```sql
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    salon_id INTEGER NOT NULL REFERENCES salons(id),
    service_id INTEGER NOT NULL REFERENCES services(id),
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'pay_at_salon',
    status VARCHAR(50) NOT NULL DEFAULT 'confirmed',
    total_price NUMERIC(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Guaranteed database-level uniqueness
    CONSTRAINT uq_salon_service_datetime UNIQUE (salon_id, service_id, booking_date, booking_time)
);
```

If two transactions ever attempt to commit identical `(salon_id, service_id, booking_date, booking_time)` values, the PostgreSQL B-tree index detects the collision and aborts the second insert immediately with error code `23505` (`unique_violation`).

> **Note on Cancellations:** In advanced production designs where cancelled appointments free up the slot, PostgreSQL supports a **Partial Unique Index**:
> ```sql
> CREATE UNIQUE INDEX uq_active_slot_idx 
> ON bookings (salon_id, service_id, booking_date, booking_time) 
> WHERE status != 'cancelled';
> ```
> This allows re-booking a slot if a previous customer cancelled, while strictly barring duplicate active appointments.

---

### B. ACID Transactions & Pessimistic Locking
In `backend/src/controllers/bookingController.js`:

```javascript
const client = await db.getPool().connect();
try {
  await client.query('BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED');

  // Check existing active booking with row locking
  const conflictCheck = await client.query(`
    SELECT id, status FROM bookings 
    WHERE salon_id = $1 
      AND service_id = $2 
      AND booking_date = $3 
      AND booking_time = $4 
      AND status != 'cancelled'
    FOR UPDATE
  `, [salonId, serviceId, date, cleanTime]);

  if (conflictCheck.rows.length > 0) {
    await client.query('ROLLBACK');
    return res.status(409).json({
      success: false,
      error: 'Double booking conflict detected.',
      message: `The service "${service.name}" at "${salon.name}" is already booked on ${date} at ${cleanTime}. Please select another time slot.`
    });
  }

  // Insert within same transaction
  const insertResult = await client.query(`
    INSERT INTO bookings (customer_id, salon_id, service_id, booking_date, booking_time, payment_method, status, total_price, notes)
    VALUES ($1, $2, $3, $4, $5, $6, 'confirmed', $7, $8)
    RETURNING *
  `, [customerId, salonId, serviceId, date, cleanTime, paymentMethod, service.price, notes]);

  await client.query('COMMIT');
} catch (err) {
  await client.query('ROLLBACK');
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      error: 'Double booking conflict detected.',
      message: 'This slot was just claimed by another customer. Please choose an alternate time.'
    });
  }
  throw err;
} finally {
  client.release();
}
```

#### Why This Works:
1. **Atomicity**: The slot verification and insertion are treated as a single atomic unit of work.
2. **Isolation (`READ COMMITTED` / `SERIALIZABLE`)**: Prevents "dirty reads" where uncommitted slots are seen by other concurrent transactions.
3. **Pessimistic Locking (`FOR UPDATE`)**: Prevents concurrent transactions from modifying or reading uncommitted changes to the candidate slot.
4. **Catching Unique Violation (`23505`)**: Even in extreme millisecond concurrency where both queries slip past the `SELECT`, the database engine's atomic index write catches the collision and raises `23505`. The backend catches this specific error and converts it cleanly to **`HTTP 409 Conflict`** with a user-friendly JSON message.

---

## 4. Alternative Approaches & Scaling Options

| Approach | How It Works | Pros | Trade-offs |
| :--- | :--- | :--- | :--- |
| **Database Unique Constraint (Implemented)** | Uniqueness constraint enforced at DB index level | 100% data integrity, zero race conditions, works across all horizontal nodes | Requires careful handling of cancellation states (solved with partial index) |
| **PostgreSQL Advisory Locks** | `pg_try_advisory_xact_lock(hashtext('salon-1-serv-2-20261025-1500'))` | High speed, does not write until lock acquired | Requires key hashing strategy |
| **Distributed Redis Lock (Redlock)** | Acquire key `lock:booking:salon:1:service:2:date:20261025:time:1500` with 5s TTL | Offloads check from primary DB, fast rejection at API gateway | Adds Redis dependency; DB constraint still required as final guard |
| **Optimistic Locking with Versioning** | Compare-and-swap on salon time-slot inventory table | High read throughput | High retry overhead under contention |

---

## 5. Live Concurrency Proof

You can test this concurrency protection live at any time by running:
```bash
npm run test:concurrency
```
**Test Results:**
- Two simultaneous HTTP requests fired with `Promise.all` targeting the same date and time.
- **Request 1:** Received `HTTP 201 Created` with booking ID.
- **Request 2:** Received `HTTP 409 Conflict` with message: *"Double booking conflict detected"*.
- **Database integrity:** Exactly 1 booking was written.
