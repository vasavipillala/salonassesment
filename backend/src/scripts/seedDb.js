/**
 * Database Seed Script
 * Executes database/seed.sql to populate initial sample salons, services, customers, and bookings.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function seed() {
  console.log('[Seed] Populating sample data...');
  try {
    await db.initDatabase();
    const seedPath = path.resolve(__dirname, '../../../database/seed.sql');
    const sql = fs.readFileSync(seedPath, 'utf8');

    if (db.getActiveEngine() === 'postgres') {
      console.log('[Seed] Executing seed.sql on PostgreSQL...');
      await db.query(sql);
      console.log('[Seed] PostgreSQL sample data populated successfully!');
    } else {
      console.log('[Seed] SQLite demo data ready.');
    }
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err.message);
    process.exit(1);
  }
}

seed();
