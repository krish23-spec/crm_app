-- Create Database
CREATE DATABASE IF NOT EXISTS crm_app;
USE crm_app;

-- Users Table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Leads Table
CREATE TABLE leads (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    country ENUM('India', 'International') DEFAULT 'India',
    email VARCHAR(100),
    phone VARCHAR(20),
    business_type VARCHAR(50),
    source ENUM('Instagram', 'Google', 'Referral', 'Other') DEFAULT 'Other',
    notes TEXT,
    status ENUM('New', 'Contacted', 'Interested', 'Not Interested', 'Closed (Won)', 'Closed (Lost)') DEFAULT 'New',
    outreach_count INT DEFAULT 0,
    last_outreach_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_country (country),
    INDEX idx_created_at (created_at)
);

-- Reminders Table
CREATE TABLE reminders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lead_id INT NOT NULL,
    user_id INT NOT NULL,
    reminder_date DATETIME NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_reminder_date (reminder_date),
    INDEX idx_is_completed (is_completed)
);

-- Deals Table
CREATE TABLE deals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lead_id INT NOT NULL,
    user_id INT NOT NULL,
    deal_value DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status ENUM('Negotiation', 'Won', 'Lost') DEFAULT 'Negotiation',
    closed_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_closed_date (closed_date)
);

-- Activity Log Table (Optional)
CREATE TABLE activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_created_at (created_at)
);

-- Insert Sample User (password: Admin@123)
INSERT INTO users (name, email, password) VALUES 
('Admin User', 'admin@crm.com', '$2b$10$YourHashedPasswordHere');

-- Insert Sample Leads
INSERT INTO leads (user_id, name, country, email, phone, business_type, source, status, outreach_count) VALUES
(1, 'Rajesh Kumar', 'India', 'rajesh@example.com', '+919876543210', 'Doctor', 'Referral', 'Interested', 3),
(1, 'Priya Sharma', 'India', 'priya@example.com', '+919876543211', 'Salon', 'Instagram', 'Contacted', 2),
(1, 'John Smith', 'International', 'john@example.com', '+1234567890', 'Retail', 'Google', 'New', 0),
(1, 'Sarah Johnson', 'International', 'sarah@example.com', '+1987654321', 'Tech Startup', 'Referral', 'Closed (Won)', 5),
(1, 'Amit Patel', 'India', 'amit@example.com', '+919876543212', 'Restaurant', 'Google', 'Not Interested', 2);

-- Insert Sample Reminders
INSERT INTO reminders (lead_id, user_id, reminder_date, title, description) VALUES
(1, 1, DATE_ADD(NOW(), INTERVAL 2 DAY), 'Follow up call', 'Discuss treatment plans and partnership'),
(2, 1, DATE_ADD(NOW(), INTERVAL 1 DAY), 'Send product catalog', 'Email the latest product catalog'),
(3, 1, DATE_ADD(NOW(), INTERVAL 3 DAY), 'Initial meeting', 'Schedule introductory call');

-- Insert Sample Deals
INSERT INTO deals (lead_id, user_id, deal_value, status, closed_date) VALUES
(1, 1, 25000.00, 'Negotiation', NULL),
(4, 1, 150000.00, 'Won', '2024-01-15'),
(5, 1, 0, 'Lost', '2024-01-10');