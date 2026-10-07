/**
 * Express Application Setup
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const salonRoutes = require('./routes/salonRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const db = require('./config/db');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

// Health Check & Root Info
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    databaseEngine: db.getActiveEngine(),
    version: '1.0.0'
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Salon Discovery & Booking API (Salonista)',
    version: '1.0.0',
    endpoints: {
      salons: 'GET /salons (supports ?search=)',
      salonDetails: 'GET /salons/:id',
      salonServices: 'GET /salons/:id/services',
      createBooking: 'POST /bookings',
      customerBookings: 'GET /bookings/:customerId',
      customers: 'GET /customers',
      health: 'GET /health'
    }
  });
});

// Customers helper endpoint
app.get('/customers', async (req, res, next) => {
  try {
    const result = await db.query('SELECT id, name, email, phone FROM customers ORDER BY id ASC');
    res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// Mount Routes (supporting both root routes and /api prefixed routes)
app.use('/salons', salonRoutes);
app.use('/api/salons', salonRoutes);

app.use('/bookings', bookingRoutes);
app.use('/api/bookings', bookingRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
