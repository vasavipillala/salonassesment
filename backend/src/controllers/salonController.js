/**
 * Salon Controller
 * Handles salon discovery, detailed retrieval, and salon services
 */

const db = require('../config/db');

/**
 * GET /salons
 * Retrieve all salons, with optional search query (?search=...)
 */
async function getAllSalons(req, res, next) {
  try {
    const { search } = req.query;

    let sql = `
      SELECT 
        s.id,
        s.name,
        s.address,
        s.city,
        s.phone,
        s.rating,
        s.review_count,
        s.image_url,
        s.open_time,
        s.close_time,
        COUNT(srv.id) AS service_count,
        COALESCE(MIN(srv.price), 0.00) AS starting_price
      FROM salons s
      LEFT JOIN services srv ON s.id = srv.salon_id AND srv.is_active = TRUE
      WHERE s.is_active = TRUE
    `;

    const params = [];

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
      sql += ` AND (s.name ILIKE $1 OR s.city ILIKE $2 OR s.address ILIKE $3)`;
    }

    sql += ` GROUP BY s.id ORDER BY s.rating DESC, s.name ASC`;

    const result = await db.query(sql, params);

    // Also fetch service items for each salon so discovery screen can display available services
    const salonIds = result.rows.map(s => s.id);
    let servicesBySalon = {};

    if (salonIds.length > 0) {
      const servicesResult = await db.query(`
        SELECT id, salon_id, name, description, category, duration_minutes, price
        FROM services
        WHERE salon_id IN (${salonIds.join(',')}) AND is_active = TRUE
        ORDER BY price ASC
      `);

      for (const srv of servicesResult.rows) {
        if (!servicesBySalon[srv.salon_id]) {
          servicesBySalon[srv.salon_id] = [];
        }
        servicesBySalon[srv.salon_id].push(srv);
      }
    }

    const salonsWithServices = result.rows.map(salon => ({
      ...salon,
      rating: parseFloat(salon.rating),
      service_count: parseInt(salon.service_count, 10),
      starting_price: parseFloat(salon.starting_price),
      services: servicesBySalon[salon.id] || []
    }));

    return res.status(200).json({
      success: true,
      count: salonsWithServices.length,
      data: salonsWithServices
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /salons/:id
 * Retrieve details for a specific salon, including its services
 */
async function getSalonById(req, res, next) {
  try {
    const { id } = req.params;

    const salonResult = await db.query(`
      SELECT 
        id, name, address, city, phone, rating, review_count, 
        image_url, open_time, close_time, is_active, created_at
      FROM salons
      WHERE id = $1 AND is_active = TRUE
    `, [id]);

    if (salonResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Salon with ID ${id} not found.`
      });
    }

    const salon = salonResult.rows[0];

    // Fetch services for this salon
    const servicesResult = await db.query(`
      SELECT id, salon_id, name, description, category, duration_minutes, price
      FROM services
      WHERE salon_id = $1 AND is_active = TRUE
      ORDER BY category ASC, price ASC
    `, [id]);

    return res.status(200).json({
      success: true,
      data: {
        ...salon,
        rating: parseFloat(salon.rating),
        services: servicesResult.rows.map(s => ({ ...s, price: parseFloat(s.price) }))
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /salons/:id/services
 * Retrieve only services belonging to a specific salon
 */
async function getSalonServices(req, res, next) {
  try {
    const { id } = req.params;

    // First check if salon exists
    const salonCheck = await db.query('SELECT id, name FROM salons WHERE id = $1', [id]);
    if (salonCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Salon with ID ${id} not found.`
      });
    }

    const servicesResult = await db.query(`
      SELECT id, salon_id, name, description, category, duration_minutes, price
      FROM services
      WHERE salon_id = $1 AND is_active = TRUE
      ORDER BY category ASC, price ASC
    `, [id]);

    return res.status(200).json({
      success: true,
      salonName: salonCheck.rows[0].name,
      count: servicesResult.rows.length,
      data: servicesResult.rows.map(s => ({ ...s, price: parseFloat(s.price) }))
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllSalons,
  getSalonById,
  getSalonServices
};
