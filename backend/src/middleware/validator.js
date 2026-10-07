/**
 * Input Validation Middleware for Salon & Booking Requests
 */

/**
 * Validate booking creation request payload
 */
function validateBookingInput(req, res, next) {
  const { customerId, salonId, serviceId, date, time, paymentMethod } = req.body;
  const errors = [];

  // 1. Check Customer ID
  if (!customerId) {
    errors.push('customerId is required and cannot be empty.');
  } else if (!Number.isInteger(Number(customerId)) || Number(customerId) <= 0) {
    errors.push('customerId must be a valid positive integer.');
  }

  // 2. Check Salon ID
  if (!salonId) {
    errors.push('salonId is required and cannot be empty.');
  } else if (!Number.isInteger(Number(salonId)) || Number(salonId) <= 0) {
    errors.push('salonId must be a valid positive integer.');
  }

  // 3. Check Service ID
  if (!serviceId) {
    errors.push('serviceId is required and cannot be empty.');
  } else if (!Number.isInteger(Number(serviceId)) || Number(serviceId) <= 0) {
    errors.push('serviceId must be a valid positive integer.');
  }

  // 4. Check Date Format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!date || typeof date !== 'string') {
    errors.push('date is required (format: YYYY-MM-DD).');
  } else if (!dateRegex.test(date)) {
    errors.push('date must be formatted as YYYY-MM-DD.');
  } else {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      errors.push('date is not a valid calendar date.');
    } else {
      // Validate not before today's date (ignoring time for comparison)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selected = new Date(date + 'T00:00:00');
      if (selected < today) {
        errors.push('Booking date cannot be in the past.');
      }
    }
  }

  // 5. Check Time Format (HH:MM in 24hr format)
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!time || typeof time !== 'string') {
    errors.push('time is required (format: HH:MM, e.g. "14:30" or "17:00").');
  } else if (!timeRegex.test(time)) {
    errors.push('time must be in valid 24-hour HH:MM format (between 00:00 and 23:59).');
  }

  // 6. Check Payment Method
  const validPaymentMethods = ['pay_at_salon', 'credit_card', 'cash', 'apple_pay'];
  if (!paymentMethod) {
    errors.push('paymentMethod is required.');
  } else if (!validPaymentMethods.includes(paymentMethod)) {
    errors.push(`paymentMethod must be one of: ${validPaymentMethods.join(', ')}.`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  // Cast parsed integers onto body for consistency
  req.body.customerId = Number(customerId);
  req.body.salonId = Number(salonId);
  req.body.serviceId = Number(serviceId);

  next();
}

/**
 * Validate customerId param
 */
function validateCustomerIdParam(req, res, next) {
  const { customerId } = req.params;
  if (!customerId || !Number.isInteger(Number(customerId)) || Number(customerId) <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid customerId parameter. Must be a positive integer.'
    });
  }
  next();
}

/**
 * Validate salonId param
 */
function validateSalonIdParam(req, res, next) {
  const { id } = req.params;
  if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid salon ID parameter. Must be a positive integer.'
    });
  }
  next();
}

module.exports = {
  validateBookingInput,
  validateCustomerIdParam,
  validateSalonIdParam
};
