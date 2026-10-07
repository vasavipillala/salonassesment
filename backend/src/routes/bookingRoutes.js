/**
 * Booking Routes
 * Endpoints for creating bookings and retrieving customer bookings
 */

const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { validateBookingInput, validateCustomerIdParam } = require('../middleware/validator');

// POST /bookings - Create a new booking
router.post('/', validateBookingInput, bookingController.createBooking);

// GET /bookings/:customerId - Retrieve all bookings for a customer
router.get('/:customerId', validateCustomerIdParam, bookingController.getCustomerBookings);

module.exports = router;
