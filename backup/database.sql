-- Hotel Management System Database Schema

-- Create database
DROP DATABASE IF EXISTS hotel_management;
CREATE DATABASE IF NOT EXISTS hotel_management;
USE hotel_management;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE NOT NULL,
    cnic VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin','receptionist','staff', 'customer') DEFAULT 'customer',
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Room types table
CREATE TABLE room_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    max_occupancy INT NOT NULL,
    amenities JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rooms table
CREATE TABLE rooms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    room_number VARCHAR(10) UNIQUE NOT NULL,
    room_type_id INT NOT NULL,
    floor INT NOT NULL,
    status ENUM('available', 'occupied', 'maintenance', 'out_of_service') DEFAULT 'available',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE
);

-- Customers table (extends user information for customers)
CREATE TABLE customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    address TEXT,
    city VARCHAR(50),
    country VARCHAR(50),
    id_number VARCHAR(50),
    preferences JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bookings table
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    room_id INT NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    guests INT NOT NULL DEFAULT 1,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('unpaid', 'confirmed', 'checked_in', 'checked_out', 'cancelled') DEFAULT 'unpaid',
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- Payments table
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('cash', 'credit_card', 'debit_card', 'online') NOT NULL,
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(100),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Services table
CREATE TABLE services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category ENUM('food', 'spa', 'laundry', 'transport', 'other') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Booking services table (many-to-many relationship)
CREATE TABLE booking_services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    service_id INT NOT NULL,
    quantity INT DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    service_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- Reviews table
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_room ON bookings(room_id);
CREATE INDEX idx_rooms_type ON rooms(room_type_id);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Insert sample data

-- -- Insert room types
-- INSERT INTO room_types (name, description, base_price, max_occupancy, amenities) VALUES
-- ('Standard Single', 'Comfortable single room with basic amenities', 80.00, 1, '["Wi-Fi", "TV", "Air Conditioning"]'),
-- ('Standard Double', 'Spacious double room perfect for couples', 120.00, 2, '["Wi-Fi", "TV", "Air Conditioning", "Mini Bar"]'),
-- ('Deluxe Suite', 'Luxury suite with separate living area', 250.00, 4, '["Wi-Fi", "TV", "Air Conditioning", "Mini Bar", "Balcony", "Room Service"]'),
-- ('Family Room', 'Large room suitable for families', 180.00, 4, '["Wi-Fi", "TV", "Air Conditioning", "Mini Bar", "Extra Bed"]'),
-- ('Presidential Suite', 'Ultimate luxury experience', 500.00, 6, '["Wi-Fi", "TV", "Air Conditioning", "Mini Bar", "Balcony", "Room Service", "Jacuzzi", "Butler Service"]');

-- -- Insert rooms
-- INSERT INTO rooms (room_number, room_type_id, floor, status, description) VALUES
-- ('101', 1, 1, 'available', 'Ground floor single room'),
-- ('102', 2, 1, 'available', 'Ground floor double room'),
-- ('103', 2, 1, 'available', 'Ground floor double room'),
-- ('201', 2, 2, 'available', 'Second floor double room'),
-- ('202', 3, 2, 'available', 'Second floor deluxe suite'),
-- ('203', 4, 2, 'available', 'Second floor family room'),
-- ('301', 3, 3, 'available', 'Third floor deluxe suite'),
-- ('302', 4, 3, 'available', 'Third floor family room'),
-- ('401', 5, 4, 'available', 'Fourth floor presidential suite'),
-- ('402', 3, 4, 'available', 'Fourth floor deluxe suite');

-- -- Insert services
-- INSERT INTO services (name, description, price, category, is_active) VALUES
-- ('Room Service Breakfast', 'Continental breakfast delivered to room', 25.00, 'food', TRUE),
-- ('Spa Massage', '60-minute relaxing massage', 80.00, 'spa', TRUE),
-- ('Laundry Service', 'Same-day laundry service', 15.00, 'laundry', TRUE),
-- ('Airport Transfer', 'One-way airport transportation', 35.00, 'transport', TRUE),
-- ('Late Checkout', 'Checkout after 12 PM', 20.00, 'other', TRUE);

-- -- Insert customer details
-- INSERT INTO customers (user_id, address, city, country, id_number) VALUES
-- (2, '123 Main Street', 'New York', 'USA', 'ID123456789');

-- -- Sample booking
-- INSERT INTO bookings (user_id, room_id, check_in_date, check_out_date, guests, total_price, status, special_requests) VALUES
-- (2, 2, '2025-06-01', '2025-06-05', 2, 480.00, 'confirmed', 'Late checkout requested');

-- -- Sample payment
-- INSERT INTO payments (booking_id, amount, payment_method, payment_status, transaction_id) VALUES
-- (1, 480.00, 'credit_card', 'completed', 'TXN123456789');

-- -- Sample review
-- INSERT INTO reviews (booking_id, user_id, rating, comment) VALUES
-- (1, 2, 5, 'Excellent service and beautiful room. Will definitely stay again!');
