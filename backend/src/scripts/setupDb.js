/**
 * Database Setup Script
 * Executes database/schema.sql to build tables and constraints.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function setup() {
  console.log('[Setup] Initializing database schema...');
  try {
    await db.initDatabase();
    const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    if (db.getActiveEngine() === 'postgres') {
      console.log('[Setup] Executing schema.sql on PostgreSQL...');
      await db.query(sql);
      console.log('[Setup] PostgreSQL schema created successfully!');
    } else {
      console.log('[Setup] SQLite tables already initialized via schema definition.');
    }
    process.exit(0);
  } catch (err) {
    console.error('[Setup Error]:', err.message);
    process.exit(1);
  }
}

setup();
