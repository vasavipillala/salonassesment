/**
 * Global Error Handling Middleware
 * Handles database constraint violations, HTTP errors, and unhandled exceptions.
 */

function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`
  });
}

function errorHandler(err, req, res, next) {
  console.error('[Error Occurred]:', {
    message: err.message,
    code: err.code,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // PostgreSQL Unique Constraint Violation (Error 23505) or SQLite Constraint
  if (err.code === '23505' || (err.message && err.message.includes('UNIQUE constraint failed'))) {
    return res.status(409).json({
      success: false,
      error: 'Conflict: Double booking detected.',
      message: 'This salon service is already booked at the specified date and time. Please choose another time slot.'
    });
  }

  // PostgreSQL Foreign Key Violation (Error 23503)
  if (err.code === '23503' || (err.message && err.message.includes('FOREIGN KEY constraint failed'))) {
    return res.status(400).json({
      success: false,
      error: 'Referential integrity error',
      message: 'One or more referenced IDs (customer, salon, or service) do not exist in the database.'
    });
  }

  // Custom HTTP Errors with status code
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      details: err.details || null
    });
  }

  // Default Internal Server Error
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred on the server.'
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
