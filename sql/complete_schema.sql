-- Drop and recreate the database
DROP DATABASE IF EXISTS employee_management;
CREATE DATABASE employee_management;
USE employee_management;

-- Create departments table
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default departments
INSERT INTO departments (name, description) VALUES 
('Information Technology Department', 'Handles IT and systems support'),
('Human Resources Department', 'Manages employee relations and hiring'),
('Finance and Accounting Department', 'Manages budgeting and finance'),
('Operations and Logistics Department', 'Oversees logistics and operations'),
('Sales and Business Development Department', 'Handles client acquisition and sales'),
('Marketing and Advertising Department', 'Manages branding and advertising');

-- Create employees table
CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    department_id INT NOT NULL,
    position VARCHAR(100),
    hire_date DATE,
    salary DECIMAL(10,2),
    address TEXT,
    profile_image VARCHAR(255),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

-- Create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'hr', 'employee') NOT NULL DEFAULT 'employee',
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
);

-- Create activity logs table
CREATE TABLE activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action VARCHAR(255) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample users
INSERT INTO users (username, password, email, full_name, role, is_active) VALUES
('admin', '$2y$10$DJFeQuLOw1bOfXBoVmlsZOL8vGq9yl3B2kZxq.FGAHpn5EZdJcKG2', 'admin@system.com', 'System Administrator', 'admin', 1),
('hr_user', '$2y$10$DJFeQuLOw1bOfXBoVmlsZOL8vGq9yl3B2kZxq.FGAHpn5EZdJcKG2', 'hr_user@example.com', 'HR Employee', 'hr', 1),
('it_user', '$2y$10$DJFeQuLOw1bOfXBoVmlsZOL8vGq9yl3B2kZxq.FGAHpn5EZdJcKG2', 'it_user@example.com', 'IT Employee', 'employee', 1);

-- Insert sample employees
INSERT INTO employees (name, email, phone, department_id, position, hire_date, salary, address, status) VALUES
('John Doe', 'john.doe@example.com', '1234567890', 1, 'Software Engineer', '2023-09-01', 60000, '123 Main St', 'active'),
('Jane Smith', 'jane.smith@example.com', '0987654321', 2, 'HR Manager', '2023-08-15', 70000, '456 Elm St', 'active');

-- Insert activity logs
INSERT INTO activity_logs (user_id, action, description, ip_address, created_at) VALUES
(1, 'Added employee', 'Added John Doe to IT department', '127.0.0.1', NOW()),
(1, 'Added employee', 'Added Jane Smith to HR department', '127.0.0.1', NOW()),
(1, 'Updated employee', 'Updated Jane Smith\'s position to HR Manager', '127.0.0.1', NOW());
