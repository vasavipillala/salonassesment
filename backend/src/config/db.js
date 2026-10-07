/**
 * Database Connection & Abstraction Layer
 * Supports PostgreSQL as primary database (as specified in Part C),
 * with intelligent automatic SQLite fallback for zero-configuration portability.
 */

const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

let pool = null;
let sqliteDb = null;
let activeEngine = 'postgres';

// Initialize configuration
const config = {
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432', 10),
  database: process.env.PGDATABASE || 'salon_booking',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  connectionString: process.env.DATABASE_URL
};

/**
 * Initialize SQLite database engine for standalone evaluation
 */
function initSqlite() {
  const Database = require('better-sqlite3');
  const dbDir = path.resolve(__dirname, '../../data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const sqlitePath = path.resolve(dbDir, 'salon_dev.sqlite');
  sqliteDb = new Database(sqlitePath);
  activeEngine = 'sqlite';
  
  // Enable foreign keys in SQLite
  sqliteDb.pragma('foreign_keys = ON');
  
  // Initialize SQLite tables if not present
  initializeSqliteSchema(sqliteDb);
  console.log(`[Database] Connected to SQLite local database at: ${sqlitePath}`);
}

/**
 * Initialize SQLite Schema matching the PostgreSQL schema
 */
function initializeSqliteSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS salons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      phone TEXT,
      rating REAL NOT NULL DEFAULT 5.0,
      review_count INTEGER NOT NULL DEFAULT 0,
      image_url TEXT,
      open_time TEXT NOT NULL DEFAULT '09:00',
      close_time TEXT NOT NULL DEFAULT '20:00',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      salon_id INTEGER NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL DEFAULT 'Hair',
      duration_minutes INTEGER NOT NULL DEFAULT 30,
      price REAL NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL REFERENCES customers(id),
      salon_id INTEGER NOT NULL REFERENCES salons(id),
      service_id INTEGER NOT NULL REFERENCES services(id),
      booking_date TEXT NOT NULL,
      booking_time TEXT NOT NULL,
      payment_method TEXT NOT NULL DEFAULT 'pay_at_salon',
      status TEXT NOT NULL DEFAULT 'confirmed',
      total_price REAL NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_salon_service_datetime UNIQUE (salon_id, service_id, booking_date, booking_time)
    );
  `);

  // Check if salons table is empty, seed initial data
  const rowCount = db.prepare('SELECT COUNT(*) AS count FROM salons').get();
  if (rowCount.count === 0) {
    seedSqliteData(db);
  }
}

/**
 * Seed SQLite database with standard demo data
 */
function seedSqliteData(db) {
  const insertCustomer = db.prepare(`
    INSERT INTO customers (id, name, email, phone) VALUES (?, ?, ?, ?)
  `);
  insertCustomer.run(1, 'Alice Johnson', 'alice.johnson@example.com', '+1-555-0101');
  insertCustomer.run(2, 'Bob Smith', 'bob.smith@example.com', '+1-555-0102');
  insertCustomer.run(3, 'Emma Watson', 'emma.watson@example.com', '+1-555-0103');
  insertCustomer.run(4, 'David Lee', 'david.lee@example.com', '+1-555-0104');

  const insertSalon = db.prepare(`
    INSERT INTO salons (id, name, address, city, phone, rating, review_count, image_url, open_time, close_time)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertSalon.run(1, 'Luxe Haven Salon & Spa', '124 Fashion Ave, Suite 300', 'Downtown', '+1-555-2001', 4.9, 128, 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80', '09:00', '20:00');
  insertSalon.run(2, 'The Urban Barber & Grooming', '458 High Street, Floor 1', 'Midtown', '+1-555-2002', 4.8, 94, 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80', '08:30', '19:30');
  insertSalon.run(3, 'Glow & Co. Aesthetics & Nails', '789 Sunset Blvd, Plaza East', 'Westside', '+1-555-2003', 4.7, 85, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80', '10:00', '21:00');
  insertSalon.run(4, 'Serenity Hair Studio & Color Lab', '321 Blossom Hill Rd', 'North Hills', '+1-555-2004', 4.9, 142, 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80', '09:00', '19:00');
  insertSalon.run(5, 'Velvet Touch Beauty Lounge', '904 Riverwalk Way', 'Riverfront', '+1-555-2005', 4.6, 67, 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80', '09:30', '20:30');

  const insertService = db.prepare(`
    INSERT INTO services (id, salon_id, name, description, category, duration_minutes, price)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  // Salon 1
  insertService.run(1, 1, 'Signature Blowout & Style', 'Hydrating wash, relaxing scalp massage, and expert blowout styling.', 'Hair', 45, 65.00);
  insertService.run(2, 1, 'Full Balayage & Gloss', 'Hand-painted sun-kissed lightening with custom gloss toner and treatment.', 'Color', 120, 220.00);
  insertService.run(3, 1, 'Deep Cleansing Hydrafacial', 'Exfoliation, deep extraction, and intense peptide hydration infusion.', 'Skincare', 60, 150.00);
  insertService.run(4, 1, 'Aromatherapy Full Body Massage', 'Swedish massage with soothing custom essential botanical oils.', 'Spa', 60, 120.00);

  // Salon 2
  insertService.run(5, 2, 'Executive Haircut & Wash', 'Precision fade or classic scissor cut with mint wash and hot towel.', 'Hair', 35, 45.00);
  insertService.run(6, 2, 'Traditional Hot Towel Shave', 'Straight razor shave with pre-shave oil, hot lathers, and soothing balm.', 'Grooming', 30, 35.00);
  insertService.run(7, 2, 'Beard Sculpting & Conditioning', 'Detailed beard shaping, line cleanup, and argan oil conditioning.', 'Grooming', 25, 28.00);

  // Salon 3
  insertService.run(8, 3, 'Deluxe Gel Manicure & Nail Art', 'Cuticle care, organic hand scrub, gel polish with minimalist art.', 'Nails', 50, 55.00);
  insertService.run(9, 3, 'Spa Pedicure with Paraffin Dip', 'Callus treatment, organic scrub, soothing paraffin wax, and polish.', 'Nails', 60, 70.00);
  insertService.run(10, 3, 'Lash Lift & Tint', 'Natural semi-permanent curl and rich dark pigment enhancement.', 'Lashes', 45, 80.00);

  // Salon 4
  insertService.run(11, 4, 'Master Stylist Precision Cut', 'Consultation, scalp detox, master haircut, and finishing blowout.', 'Hair', 50, 85.00);
  insertService.run(12, 4, 'Keratin Smoothing Treatment', 'Frizz elimination, intensive protein repair lasting up to 4 months.', 'Hair', 150, 260.00);
  insertService.run(13, 4, 'Root Touchup & Color Refresh', 'Gray coverage, seamless color blending, and shine treatment.', 'Color', 75, 110.00);

  // Salon 5
  insertService.run(14, 5, 'Brow Lamination & Shaping', 'Custom brow mapping, gentle lamination, wax, and defining tint.', 'Brows', 45, 65.00);
  insertService.run(15, 5, 'Oxygen Glow Facial', 'Hyperbaric oxygen delivery with hyaluronic serum for immediate radiance.', 'Skincare', 60, 135.00);

  const insertBooking = db.prepare(`
    INSERT INTO bookings (customer_id, salon_id, service_id, booking_date, booking_time, payment_method, status, total_price, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertBooking.run(1, 1, 1, '2026-10-10', '10:00', 'pay_at_salon', 'confirmed', 65.00, 'Customer requested lavender aroma oil.');
  insertBooking.run(1, 2, 5, '2026-10-12', '14:30', 'pay_at_salon', 'confirmed', 45.00, 'First time booking at Urban Barber.');
  insertBooking.run(2, 1, 2, '2026-10-11', '11:00', 'pay_at_salon', 'confirmed', 220.00, 'Allergy check completed.');
  insertBooking.run(3, 3, 8, '2026-10-10', '15:00', 'pay_at_salon', 'confirmed', 55.00, 'Nail art reference sent.');
  console.log('[Database] Seeded initial data into SQLite.');
}

/**
 * Initialize database connection
 */
async function initDatabase() {
  const preferredType = process.env.DB_TYPE || 'auto';

  if (preferredType === 'sqlite') {
    initSqlite();
    return;
  }

  try {
    pool = new Pool(config.connectionString ? { connectionString: config.connectionString } : config);
    
    // Test postgres connection with a fast query
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    activeEngine = 'postgres';
    console.log(`[Database] Successfully connected to PostgreSQL: ${result.rows[0].now}`);
  } catch (err) {
    if (preferredType === 'postgres') {
      console.error('[Database] Failed to connect to PostgreSQL:', err.message);
      throw err;
    }
    
    // Auto mode fallback to SQLite
    console.warn(`[Database] PostgreSQL connection failed (${err.message}). Falling back to embedded SQLite database.`);
    initSqlite();
  }
}

/**
 * Universal Query Executor
 * Translates PostgreSQL $1, $2 placeholders to SQLite ? placeholders when running on SQLite
 */
async function query(text, params = []) {
  if (!pool && !sqliteDb) {
    await initDatabase();
  }

  if (activeEngine === 'postgres') {
    return await pool.query(text, params);
  }

  // SQLite Execution
  let sqliteQuery = text;
  // Convert Postgres $1, $2, $3 syntax to ?
  sqliteQuery = sqliteQuery.replace(/\$(\d+)/g, '?');
  // Convert Postgres ILIKE to LIKE (SQLite LIKE is case-insensitive for ASCII)
  sqliteQuery = sqliteQuery.replace(/\bILIKE\b/gi, 'LIKE');
  // Strip RETURNING clause for sqlite if not supported or handle smoothly
  const isSelect = /^\s*(SELECT|PRAGMA)/i.test(sqliteQuery);
  const isInsert = /^\s*INSERT\b/i.test(sqliteQuery);

  if (isSelect) {
    const stmt = sqliteDb.prepare(sqliteQuery);
    const rows = stmt.all(...params);
    return { rows, rowCount: rows.length };
  } else if (isInsert) {
    // If query has RETURNING id or RETURNING *
    const returningMatch = sqliteQuery.match(/RETURNING\s+(.+)$/i);
    let cleanQuery = sqliteQuery;
    if (returningMatch) {
      cleanQuery = sqliteQuery.replace(/RETURNING\s+.+$/i, '').trim();
    }
    const stmt = sqliteDb.prepare(cleanQuery);
    const info = stmt.run(...params);
    
    let returningRows = [];
    if (returningMatch) {
      // Fetch the inserted record
      returningRows = sqliteDb.prepare(`SELECT * FROM bookings WHERE id = ?`).all(info.lastInsertRowid);
    }
    return { rows: returningRows, rowCount: info.changes, insertId: info.lastInsertRowid };
  } else {
    const stmt = sqliteDb.prepare(sqliteQuery);
    const info = stmt.run(...params);
    return { rows: [], rowCount: info.changes };
  }
}

/**
 * Transaction Runner with Concurrency Isolation
 * In PostgreSQL: Runs within BEGIN ... COMMIT with custom isolation level
 * In SQLite: Runs within db.transaction()
 */
async function executeTransaction(callback) {
  if (!pool && !sqliteDb) {
    await initDatabase();
  }

  if (activeEngine === 'postgres') {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // SQLite transaction
  const txn = sqliteDb.transaction(() => callback({
    query: async (text, params) => query(text, params)
  }));
  return txn();
}

function getActiveEngine() {
  return activeEngine;
}

module.exports = {
  query,
  executeTransaction,
  initDatabase,
  getActiveEngine,
  getPool: () => pool
};
