-- ============================================================================
-- Salon Discovery & Booking Marketplace (Salonista)
-- PostgreSQL Database Schema
-- File: database/schema.sql
-- ============================================================================

-- Clean up existing tables if they exist (in dependency order)
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS salons CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- ----------------------------------------------------------------------------
-- 1. CUSTOMERS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 2. SALONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE salons (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    rating NUMERIC(2, 1) NOT NULL DEFAULT 5.0 CHECK (rating >= 1.0 AND rating <= 5.0),
    review_count INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    open_time TIME NOT NULL DEFAULT '09:00',
    close_time TIME NOT NULL DEFAULT '20:00',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 3. SERVICES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    salon_id INTEGER NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'Hair',
    duration_minutes INTEGER NOT NULL DEFAULT 30 CHECK (duration_minutes > 0),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 4. BOOKINGS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    salon_id INTEGER NOT NULL REFERENCES salons(id) ON DELETE RESTRICT,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'pay_at_salon' CHECK (payment_method IN ('pay_at_salon', 'credit_card', 'cash', 'apple_pay')),
    status VARCHAR(50) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- ========================================================================
    -- CONCURRENCY & INTEGRITY: PREVENT DOUBLE BOOKING
    -- A salon service cannot be booked twice at the exact same date and time 
    -- unless the previous booking was cancelled.
    -- ========================================================================
    CONSTRAINT uq_salon_service_datetime UNIQUE (salon_id, service_id, booking_date, booking_time)
);

-- ----------------------------------------------------------------------------
-- INDEXES FOR HIGH-PERFORMANCE DISCOVERY & LOOKUPS
-- ----------------------------------------------------------------------------
CREATE INDEX idx_salons_city ON salons(city);
CREATE INDEX idx_salons_rating ON salons(rating DESC);
CREATE INDEX idx_services_salon_id ON services(salon_id);
CREATE INDEX idx_services_price ON services(price);
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_salon_date ON bookings(salon_id, booking_date);
CREATE INDEX idx_bookings_lookup ON bookings(salon_id, service_id, booking_date, booking_time);
