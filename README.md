# Salonista — Salon Discovery & Booking Application

A full-stack mobile marketplace and backend service for discovering salons and scheduling beauty treatments. Built as an end-to-end technical skill assessment featuring a **React Native (Expo)** mobile application, a **Node.js + Express** REST API, and a robust **PostgreSQL** relational database with transactional concurrency controls.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technologies Used](#technologies-used)
3. [Architecture & Project Structure](#architecture--project-structure)
4. [Database Setup & Schema](#database-setup--schema)
5. [Backend API Setup & Running](#backend-api-setup--running)
6. [Frontend (React Native) Setup & Running](#frontend-react-native-setup--running)
7. [API Documentation](#api-endpoints)
8. [Part D: Booking Logic & Double Booking Prevention](#part-d-booking-logic--double-booking-prevention)
9. [Part E: Debugging Challenge ("Network Request Failed")](#part-e-debugging-challenge)
10. [Assumptions Made](#assumptions-made)
11. [Known Limitations & Future Roadmap](#known-limitations--future-roadmap)

---

## Project Overview

**Salonista** enables users to discover local beauty salons, explore service menus with transparent pricing and ratings, schedule appointments for specific time slots, choose **"Pay at Salon"**, and track confirmed appointments.

### Core Features
- **Screen 1 (Discovery):** Search & filter salons by name/city, browse ratings, view available services, inspect pricing, and tap "Book Now".
- **Screen 2 (Booking):** Review salon & service details, select dates from an interactive calendar carousel, choose business-hour time slots, select payment method (**"Pay at Salon"** default), add special notes, and submit.
- **Screen 3 (Confirmation):** Immediate confirmation receipt showing reference ID, salon name/address, service, date/time, payment method, confirmed status, and total price due upon arrival.
- **Screen 4 (My Bookings):** Customer appointment history view showing all scheduled treatments, status badges, dates, and times.
- **Concurrency Protection:** Multi-layered defense preventing double-booking using database constraints, ACID transactions, and HTTP 409 conflict handling.

---

## Technologies Used

- **Frontend (Mobile):** React Native, Expo SDK 57, React 19, JavaScript/ES6+, Custom Modular Design System, Vector Icons.
- **Backend (API):** Node.js v22, Express.js 4.x, CORS, Morgan logger, Dotenv.
- **Database:** PostgreSQL (Primary), with automatic zero-configuration SQLite fallback for maximum reviewer portability.
- **Testing & Tooling:** Automated API test suite, simultaneous HTTP concurrency stress test script.

---

## Architecture & Project Structure

```text
salon-booking-app/
├── backend/
│   ├── .env.example               # Backend environment variables template
│   ├── .env                       # Active environment configuration
│   ├── package.json               # Backend dependencies & npm scripts
│   ├── src/
│   │   ├── app.js                 # Express application setup & middleware
│   │   ├── server.js              # Server entrypoint (binds to 0.0.0.0 for mobile LAN)
│   │   ├── config/
│   │   │   └── db.js              # PostgreSQL client pool & SQLite fallback adapter
│   │   ├── controllers/
│   │   │   ├── salonController.js   # Handlers for /salons, /salons/:id, /salons/:id/services
│   │   │   └── bookingController.js # Handlers for POST /bookings, GET /bookings/:customerId
│   │   ├── middleware/
│   │   │   ├── validator.js       # Payload, date, time & ID validation
│   │   │   └── errorHandler.js    # Global error & constraint violation handler
│   │   ├── routes/
│   │   │   ├── salonRoutes.js     # Salon endpoints router
│   │   │   └── bookingRoutes.js   # Booking endpoints router
│   │   └── scripts/
│   │       ├── setupDb.js         # Schema migration script
│   │       ├── seedDb.js          # Database seeding script
│   │       ├── testEndpoints.js   # Automated API test suite
│   │       └── testConcurrency.js # Double-booking simulation test
├── mobile/
│   ├── App.js                     # Mobile application root & screen router
│   ├── app.json                   # Expo configuration
│   ├── package.json               # Mobile dependencies & npm scripts
│   └── src/
│       ├── api/
│       │   ├── config.js          # Dynamic IP resolver (Web, Emulator, Physical Phone)
│       │   └── client.js          # HTTP client service with timeout & diagnostics
│       ├── context/
│       │   └── AppContext.js      # Global state for customer, booking draft, navigation
│       ├── theme/
│       │   └── colors.js          # Design system colors, spacing, and radiuses
│       ├── components/
│       │   ├── Navbar.js          # Top header with back button & connection status
│       │   ├── SalonCard.js       # Screen 1 Salon card with image, rating, & services
│       │   ├── DateTimeSelector.js# Interactive date pill carousel & time slot grid
│       │   ├── PaymentSelector.js # Payment method selector ("Pay at Salon")
│       │   ├── LoadingSpinner.js  # Loading activity indicator
│       │   ├── ErrorMessage.js    # Error alert banner with retry CTA
│       │   └── ApiSettingsModal.js# In-app API switcher for physical device testing
│       └── screens/
│           ├── DiscoveryScreen.js # Screen 1: Salon discovery & search
│           ├── BookingScreen.js   # Screen 2: Scheduling & payment
│           ├── ConfirmationScreen.js # Screen 3: Confirmed appointment receipt
│           └── MyBookingsScreen.js# Screen 4: Customer booking history
├── database/
│   ├── schema.sql                 # PostgreSQL DDL table definitions & constraints
│   ├── seed.sql                   # Sample customers, salons, services, & bookings
│   └── queries.sql                # Assessment SQL queries
├── docs/
│   ├── PART_D_BOOKING_LOGIC.md    # In-depth concurrency & transaction analysis
│   └── PART_E_DEBUGGING_CHALLENGE.md # Step-by-step physical mobile network debugging
└── README.md                      # Complete project documentation
```

---

## Database Setup & Schema

### PostgreSQL Tables & Relationships
1. **`customers`**: Stores user profiles (`id`, `name`, `email`, `phone`, `created_at`).
2. **`salons`**: Stores salon locations, ratings, and operating hours (`id`, `name`, `address`, `city`, `phone`, `rating`, `review_count`, `image_url`, `open_time`, `close_time`, `is_active`).
3. **`services`**: Stores catalog of treatments linked to a salon via `salon_id` FK (`id`, `salon_id`, `name`, `description`, `category`, `duration_minutes`, `price`, `is_active`).
4. **`bookings`**: Stores customer appointments with foreign keys to `customers`, `salons`, and `services` (`id`, `customer_id`, `salon_id`, `service_id`, `booking_date`, `booking_time`, `payment_method`, `status`, `total_price`, `notes`).

### Hard Invariant: Unique Slot Constraint
```sql
CONSTRAINT uq_salon_service_datetime UNIQUE (salon_id, service_id, booking_date, booking_time)
```

### Setup Instructions
1. Ensure PostgreSQL is installed and running on port `5432`.
2. Create the target database:
   ```bash
   psql -U postgres -c "CREATE DATABASE salon_booking;"
   ```
3. Run the schema and seed scripts:
   ```bash
   psql -U postgres -d salon_booking -f database/schema.sql
   psql -U postgres -d salon_booking -f database/seed.sql
   ```
*(Note: If you do not have PostgreSQL configured locally, the backend automatically boots with an embedded SQLite database using identical schemas and seed data for immediate zero-friction testing!)*

---

## Backend API Setup & Running

### 1. Environment Variables
In `backend/.env`:
```env
PORT=5000
NODE_ENV=development
DB_TYPE=auto
PGHOST=localhost
PGPORT=5432
PGDATABASE=salon_booking
PGUSER=postgres
PGPASSWORD=postgres
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/salon_booking
```

### 2. Install & Start Backend
```bash
cd backend
npm install
npm start
```
The server will start and bind to `0.0.0.0:5000`, logging both your `localhost` URL and your host computer's **LAN IP** (e.g. `http://192.168.1.48:5000`).

### 3. Run Automated Tests
```bash
# Run all endpoint & validation tests
node src/scripts/testEndpoints.js

# Run simultaneous concurrency & double-booking stress test (Part D)
npm run test:concurrency
```

---

## Frontend (React Native) Setup & Running

### 1. Start the React Native App
```bash
cd mobile
npm install
npm start
```

### 2. Running Options
- **Web Browser (Fastest for review):**
  Press `w` in the Expo terminal or run:
  ```bash
  npm run web
  ```
  Opens `http://localhost:8081` directly in your browser.
- **Physical Mobile Device (Expo Go):**
  1. Install **Expo Go** from the App Store / Google Play.
  2. Scan the terminal QR code.
  3. Ensure your phone is on the same Wi-Fi network as your computer.
- **Android Emulator / iOS Simulator:**
  Press `a` for Android or `i` for iOS.

### 3. Connecting Mobile to Backend (Part E in practice)
The mobile app contains an **in-app connection helper** (`ApiSettingsModal.js`). Tap the **"API OK / Offline"** indicator in the top navbar to instantly toggle between `localhost`, `10.0.2.2` (Android emulator), or your host machine's LAN IP (`192.168.1.48`).

---

## API Endpoints

### 1. `GET /salons`
Retrieves all active salons, ratings, locations, and service catalogs.
- **Query Params:** `?search=barber` (optional case-insensitive search by name, city, or address)
- **Response (200 OK):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "name": "Luxe Haven Salon & Spa",
      "address": "124 Fashion Ave, Suite 300",
      "city": "Downtown",
      "rating": 4.9,
      "review_count": 128,
      "image_url": "https://images.unsplash.com/...",
      "open_time": "09:00:00",
      "close_time": "20:00:00",
      "service_count": 4,
      "starting_price": 65,
      "services": [
        {
          "id": 1,
          "salon_id": 1,
          "name": "Signature Blowout & Style",
          "category": "Hair",
          "duration_minutes": 45,
          "price": 65
        }
      ]
    }
  ]
}
```

### 2. `GET /salons/:id`
Retrieves detailed information and services for a single salon.
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Luxe Haven Salon & Spa",
    "address": "124 Fashion Ave, Suite 300",
    "city": "Downtown",
    "rating": 4.9,
    "services": [...]
  }
}
```
- **Error (404 Not Found):** `{"success": false, "error": "Salon with ID 999 not found."}`

### 3. `GET /salons/:id/services`
Retrieves only services offered by the specified salon.
- **Response (200 OK):**
```json
{
  "success": true,
  "salonName": "Luxe Haven Salon & Spa",
  "count": 4,
  "data": [
    {
      "id": 1,
      "name": "Signature Blowout & Style",
      "category": "Hair",
      "duration_minutes": 45,
      "price": 65
    }
  ]
}
```

### 4. `POST /bookings`
Creates a new appointment with transaction isolation and double-booking prevention.
- **Request Body:**
```json
{
  "customerId": 1,
  "salonId": 1,
  "serviceId": 2,
  "date": "2026-10-10",
  "time": "17:00",
  "paymentMethod": "pay_at_salon",
  "notes": "Allergy check requested"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Booking successfully confirmed!",
  "data": {
    "bookingId": 6,
    "customerId": 1,
    "customerName": "Alice Johnson",
    "customerPhone": "+1-555-0101",
    "salonId": 1,
    "salonName": "Luxe Haven Salon & Spa",
    "salonAddress": "124 Fashion Ave, Suite 300",
    "salonCity": "Downtown",
    "serviceId": 2,
    "serviceName": "Full Balayage & Gloss",
    "durationMinutes": 120,
    "date": "2026-10-10",
    "time": "17:00",
    "paymentMethod": "pay_at_salon",
    "status": "confirmed",
    "totalPrice": 220,
    "createdAt": "2026-10-07T14:34:08.332Z"
  }
}
```
- **Error: Double Booking Conflict (409 Conflict):**
```json
{
  "success": false,
  "error": "Double booking conflict detected.",
  "message": "The service \"Full Balayage & Gloss\" at \"Luxe Haven Salon & Spa\" is already booked on 2026-10-10 at 17:00. Please select another time slot."
}
```
- **Error: Validation Failure (400 Bad Request):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["Booking date cannot be in the past.", "time must be formatted as HH:MM"]
}
```

### 5. `GET /bookings/:customerId`
Retrieves appointment history for a given customer.
- **Response (200 OK):**
```json
{
  "success": true,
  "customer": {
    "id": 1,
    "name": "Alice Johnson",
    "email": "alice.johnson@example.com"
  },
  "count": 3,
  "data": [
    {
      "bookingId": 1,
      "date": "2026-10-10",
      "time": "10:00:00",
      "status": "confirmed",
      "paymentMethod": "pay_at_salon",
      "totalPrice": 65,
      "salonName": "Luxe Haven Salon & Spa",
      "serviceName": "Signature Blowout & Style"
    }
  ]
}
```

---

## Part D: Booking Logic & Double Booking Prevention

### Problem Scenario
Two customers attempt to book the exact same salon service at the exact same date and time (`2026-10-25 15:00`).

### Technical Solution
Our architecture implements **defense-in-depth across 3 layers**:

1. **Database Constraint (The Ultimate Guardrail):**
   ```sql
   CONSTRAINT uq_salon_service_datetime UNIQUE (salon_id, service_id, booking_date, booking_time)
   ```
   Relying solely on in-memory locks in Node.js fails if the backend is horizontally scaled across multiple instances. The database B-tree index guarantees at the storage engine level that two identical keys cannot be inserted simultaneously.

2. **ACID Transaction & Pessimistic Row Locking (`SELECT ... FOR UPDATE`):**
   In `bookingController.js`:
   - An explicit transaction begins: `BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED`.
   - The query checks for existing active appointments matching the slot with `FOR UPDATE`.
   - If an active booking exists, transaction immediately aborts (`ROLLBACK`) and returns `HTTP 409`.
   - If no conflict exists, the insert is executed and committed atomically (`COMMIT`).

3. **Concurrency Collision Recovery (Catching Error 23505):**
   In high-concurrency race conditions where two threads pass the check before either commits, PostgreSQL raises error code `23505` (`unique_violation`).
   The backend catches this specific code and returns a user-friendly `HTTP 409 Conflict`:
   ```json
   {
     "success": false,
     "error": "Double booking conflict detected.",
     "message": "This slot was just booked by another customer. Please select another time slot."
   }
   ```

### Verification
Run `npm run test:concurrency` in `backend/` to see two simultaneous HTTP requests fired at the same millisecond: **exactly one succeeds (201) and one is safely blocked (409)**.

*(For detailed theoretical analysis, refer to [docs/PART_D_BOOKING_LOGIC.md](docs/PART_D_BOOKING_LOGIC.md))*

---

## Part E: Debugging Challenge

### Scenario
React Native runs on a **physical mobile device**, Node.js backend runs on development computer on port `5000`. API calls fail with:
`TypeError: Network request failed`

### Step-by-Step Diagnostic & Resolution Methodology

1. **Understand Root Cause:**
   - In mobile OS runtimes, `localhost` and `127.0.0.1` refer to the **phone itself**, not the host computer.
   - If the backend is bound only to `localhost`, it will reject external network adapters.
   - Windows Defender or macOS Firewall frequently blocks incoming TCP traffic on port 5000.
   - Android 9+ (API 28+) blocks plain HTTP requests unless cleartext traffic is permitted.

2. **Step 1: Bind Server to `0.0.0.0`**
   Ensure `server.js` listens on all network interfaces:
   ```javascript
   app.listen(5000, '0.0.0.0');
   ```

3. **Step 2: Obtain Host Computer LAN IP**
   Run `ipconfig` (Windows) or `ifconfig` (macOS/Linux) and locate the local Wi-Fi IPv4 address (e.g. `192.168.1.48`).

4. **Step 3: Test Direct Connectivity in Phone Browser**
   Connect the phone to the **same Wi-Fi network**. Open Safari or Chrome on the phone and navigate to:
   ```text
   http://192.168.1.48:5000/health
   ```
   - If it loads `{"status":"healthy"}`, connectivity is confirmed.
   - If it times out, the host firewall is blocking port 5000 or the router has AP client isolation enabled.

5. **Step 4: Configure Firewall**
   On Windows, open PowerShell as Admin and permit port 5000:
   ```powershell
   New-NetFirewallRule -DisplayName "NodeJS 5000" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
   ```

6. **Step 5: Configure Android/iOS Cleartext HTTP**
   In `android/app/src/main/AndroidManifest.xml`:
   ```xml
   <application android:usesCleartextTraffic="true" ... />
   ```

7. **Step 6: Update React Native API Config**
   Configure the API client with the dynamic LAN IP or use our in-app connection switcher modal.

8. **Alternative Workaround: USB Reverse Tethering or Ngrok**
   - For USB debugging: `adb reverse tcp:5000 tcp:5000` (allows using `localhost:5000` on the phone!).
   - For remote/isolated Wi-Fi: `npx localtunnel --port 5000` (creates HTTPS tunnel).

*(For the complete debugging guide, refer to [docs/PART_E_DEBUGGING_CHALLENGE.md](docs/PART_E_DEBUGGING_CHALLENGE.md))*

---

## Assumptions Made

1. **Customer Authentication:** For the scope of this take-home assessment, Customer authentication is streamlined with a default active demo customer (`customerId: 1`, Alice Johnson) to evaluate the core discovery and booking workflows cleanly without requiring complex OAuth/JWT token flows.
2. **Time Slot Duration:** Standard booking slots are represented in 30-minute intervals conforming to salon service durations.
3. **Cancellation Behavior:** When an appointment is cancelled, the slot can become available again; in production, this is handled via a partial unique index (`WHERE status != 'cancelled'`).

---

## Known Limitations & Future Roadmap

1. **Staff / Stylist Allocation:** Currently slots are scoped to `(salon_id, service_id, date, time)`. In an expanded enterprise salon model, multiple stylists can offer the same service simultaneously, which can be modeled with a `stylists` table and a `stylist_id` foreign key.
2. **Push Notifications:** Adding Expo Push Notifications or Firebase Cloud Messaging (FCM) to send appointment reminders 2 hours before the booking.
3. **Real-time WebSockets:** Using Socket.io to push real-time slot lock updates to all browsing clients when a slot is booked.
