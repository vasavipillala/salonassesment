-- ============================================================================
-- Salon Discovery & Booking Marketplace (Salonista)
-- Sample Seed Data
-- File: database/seed.sql
-- ============================================================================

-- Clean existing data
TRUNCATE TABLE bookings, services, salons, customers RESTART IDENTITY CASCADE;

-- ----------------------------------------------------------------------------
-- 1. SEED CUSTOMERS
-- ----------------------------------------------------------------------------
INSERT INTO customers (id, name, email, phone) VALUES
(1, 'Alice Johnson', 'alice.johnson@example.com', '+1-555-0101'),
(2, 'Bob Smith', 'bob.smith@example.com', '+1-555-0102'),
(3, 'Emma Watson', 'emma.watson@example.com', '+1-555-0103'),
(4, 'David Lee', 'david.lee@example.com', '+1-555-0104');

-- Reset customer sequence to accommodate explicit IDs
SELECT setval('customers_id_seq', (SELECT MAX(id) FROM customers));

-- ----------------------------------------------------------------------------
-- 2. SEED SALONS
-- ----------------------------------------------------------------------------
INSERT INTO salons (id, name, address, city, phone, rating, review_count, image_url, open_time, close_time) VALUES
(1, 'Luxe Haven Salon & Spa', '124 Fashion Ave, Suite 300', 'Downtown', '+1-555-2001', 4.9, 128, 
 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80', '09:00', '20:00'),

(2, 'The Urban Barber & Grooming', '458 High Street, Floor 1', 'Midtown', '+1-555-2002', 4.8, 94, 
 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80', '08:30', '19:30'),

(3, 'Glow & Co. Aesthetics & Nails', '789 Sunset Blvd, Plaza East', 'Westside', '+1-555-2003', 4.7, 85, 
 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80', '10:00', '21:00'),

(4, 'Serenity Hair Studio & Color Lab', '321 Blossom Hill Rd', 'North Hills', '+1-555-2004', 4.9, 142, 
 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80', '09:00', '19:00'),

(5, 'Velvet Touch Beauty Lounge', '904 Riverwalk Way', 'Riverfront', '+1-555-2005', 4.6, 67, 
 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80', '09:30', '20:30');

-- Reset salon sequence
SELECT setval('salons_id_seq', (SELECT MAX(id) FROM salons));

-- ----------------------------------------------------------------------------
-- 3. SEED SERVICES
-- ----------------------------------------------------------------------------
INSERT INTO services (id, salon_id, name, description, category, duration_minutes, price) VALUES
-- Salon 1: Luxe Haven Salon & Spa
(1, 1, 'Signature Blowout & Style', 'Hydrating wash, relaxing scalp massage, and expert blowout styling.', 'Hair', 45, 65.00),
(2, 1, 'Full Balayage & Gloss', 'Hand-painted sun-kissed lightening with custom gloss toner and treatment.', 'Color', 120, 220.00),
(3, 1, 'Deep Cleansing Hydrafacial', 'Exfoliation, deep extraction, and intense peptide hydration infusion.', 'Skincare', 60, 150.00),
(4, 1, 'Aromatherapy Full Body Massage', 'Swedish massage with soothing custom essential botanical oils.', 'Spa', 60, 120.00),

-- Salon 2: The Urban Barber & Grooming
(5, 2, 'Executive Haircut & Wash', 'Precision fade or classic scissor cut with mint wash and hot towel.', 'Hair', 35, 45.00),
(6, 2, 'Traditional Hot Towel Shave', 'Straight razor shave with pre-shave oil, hot lathers, and soothing balm.', 'Grooming', 30, 35.00),
(7, 2, 'Beard Sculpting & Conditioning', 'Detailed beard shaping, line cleanup, and argan oil conditioning.', 'Grooming', 25, 28.00),

-- Salon 3: Glow & Co. Aesthetics & Nails
(8, 3, 'Deluxe Gel Manicure & Nail Art', 'Cuticle care, organic hand scrub, gel polish with minimalist art.', 'Nails', 50, 55.00),
(9, 3, 'Spa Pedicure with Paraffin Dip', 'Callus treatment, organic scrub, soothing paraffin wax, and polish.', 'Nails', 60, 70.00),
(10, 3, 'Lash Lift & Tint', 'Natural semi-permanent curl and rich dark pigment enhancement.', 'Lashes', 45, 80.00),

-- Salon 4: Serenity Hair Studio & Color Lab
(11, 4, 'Master Stylist Precision Cut', 'Consultation, scalp detox, master haircut, and finishing blowout.', 'Hair', 50, 85.00),
(12, 4, 'Keratin Smoothing Treatment', 'Frizz elimination, intensive protein repair lasting up to 4 months.', 'Hair', 150, 260.00),
(13, 4, 'Root Touchup & Color Refresh', 'Gray coverage, seamless color blending, and shine treatment.', 'Color', 75, 110.00),

-- Salon 5: Velvet Touch Beauty Lounge
(14, 5, 'Brow Lamination & Shaping', 'Custom brow mapping, gentle lamination, wax, and defining tint.', 'Brows', 45, 65.00),
(15, 5, 'Oxygen Glow Facial', 'Hyperbaric oxygen delivery with hyaluronic serum for immediate radiance.', 'Skincare', 60, 135.00);

-- Reset services sequence
SELECT setval('services_id_seq', (SELECT MAX(id) FROM services));

-- ----------------------------------------------------------------------------
-- 4. SEED SAMPLE BOOKINGS
-- ----------------------------------------------------------------------------
INSERT INTO bookings (customer_id, salon_id, service_id, booking_date, booking_time, payment_method, status, total_price, notes) VALUES
(1, 1, 1, '2026-10-10', '10:00', 'pay_at_salon', 'confirmed', 65.00, 'Customer requested lavender aroma oil.'),
(1, 2, 5, '2026-10-12', '14:30', 'pay_at_salon', 'confirmed', 45.00, 'First time booking at Urban Barber.'),
(2, 1, 2, '2026-10-11', '11:00', 'pay_at_salon', 'confirmed', 220.00, 'Allergy check completed.'),
(3, 3, 8, '2026-10-10', '15:00', 'pay_at_salon', 'confirmed', 55.00, 'Nail art reference sent.');
