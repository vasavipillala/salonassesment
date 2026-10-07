/**
 * Salon Routes
 * Endpoints for discovering salons and fetching salon services
 */

const express = require('express');
const router = express.Router();
const salonController = require('../controllers/salonController');
const { validateSalonIdParam } = require('../middleware/validator');

// GET /salons - Retrieve all salons (supports ?search= query)
router.get('/', salonController.getAllSalons);

// GET /salons/:id - Retrieve specific salon details with services
router.get('/:id', validateSalonIdParam, salonController.getSalonById);

// GET /salons/:id/services - Retrieve all services for a specific salon
router.get('/:id/services', validateSalonIdParam, salonController.getSalonServices);

module.exports = router;
