-- ============================================================================
-- Salon Discovery & Booking Marketplace (Salonista)
-- Required Assessment SQL Queries
-- File: database/queries.sql
-- ============================================================================

-- ============================================================================
-- QUERY 1: Retrieve all salons
-- Retrieves active salons along with their location, rating, review count,
-- and aggregated services summary for the discovery view.
-- ============================================================================
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
    COUNT(srv.id) AS total_services,
    COALESCE(MIN(srv.price), 0.00) AS starting_price
FROM salons s
LEFT JOIN services srv ON s.id = srv.salon_id AND srv.is_active = TRUE
WHERE s.is_active = TRUE
GROUP BY s.id
ORDER BY s.rating DESC, s.name ASC;


-- ============================================================================
-- QUERY 2: Retrieve services belonging to a salon
-- Retrieves all active services offered by a specific salon (e.g. salon_id = 1),
-- including duration, pricing, and category.
-- ============================================================================
SELECT 
    srv.id,
    srv.salon_id,
    srv.name,
    srv.description,
    srv.category,
    srv.duration_minutes,
    srv.price,
    s.name AS salon_name
FROM services srv
INNER JOIN salons s ON srv.salon_id = s.id
WHERE srv.salon_id = 1
  AND srv.is_active = TRUE
ORDER BY srv.category ASC, srv.price ASC;


-- ============================================================================
-- QUERY 3: Retrieve bookings belonging to a customer
-- Retrieves complete booking history for a specific customer (e.g. customer_id = 1),
-- joining salons and services to provide full booking context.
-- ============================================================================
SELECT 
    b.id AS booking_id,
    b.booking_date,
    b.booking_time,
    b.status,
    b.payment_method,
    b.total_price,
    b.notes,
    b.created_at,
    s.id AS salon_id,
    s.name AS salon_name,
    s.address AS salon_address,
    s.city AS salon_city,
    s.phone AS salon_phone,
    srv.id AS service_id,
    srv.name AS service_name,
    srv.duration_minutes
FROM bookings b
INNER JOIN salons s ON b.salon_id = s.id
INNER JOIN services srv ON b.service_id = srv.id
WHERE b.customer_id = 1
ORDER BY b.booking_date DESC, b.booking_time DESC;


-- ============================================================================
-- QUERY 4: Check slot availability (Part D - Double Booking Prevention)
-- Checks if a specific salon service already has an active booking at a given date/time
-- ============================================================================
SELECT COUNT(*) AS conflict_count
FROM bookings
WHERE salon_id = 1
  AND service_id = 2
  AND booking_date = '2026-10-10'
  AND booking_time = '17:00'
  AND status != 'cancelled';


-- ============================================================================
-- QUERY 5: Search salons by name or location
-- Case-insensitive search supporting partial match on salon name or city/address
-- ============================================================================
SELECT 
    s.id,
    s.name,
    s.address,
    s.city,
    s.rating,
    s.image_url,
    COALESCE(MIN(srv.price), 0.00) AS starting_price
FROM salons s
LEFT JOIN services srv ON s.id = srv.salon_id AND srv.is_active = TRUE
WHERE s.is_active = TRUE
  AND (s.name ILIKE '%barber%' OR s.city ILIKE '%barber%' OR s.address ILIKE '%barber%')
GROUP BY s.id
ORDER BY s.rating DESC;
