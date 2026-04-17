CREATE DATABASE IF NOT EXISTS air_travel_mvp
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE air_travel_mvp;

CREATE TABLE IF NOT EXISTS departments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL,
  parent_id BIGINT UNSIGNED NULL,
  status TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_departments_code (code),
  CONSTRAINT fk_departments_parent_id FOREIGN KEY (parent_id) REFERENCES departments(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  openid VARCHAR(100) NULL,
  employee_no VARCHAR(50) NOT NULL,
  name VARCHAR(50) NOT NULL,
  mobile VARCHAR(20) NULL,
  email VARCHAR(100) NULL,
  department_id BIGINT UNSIGNED NULL,
  role ENUM('EMPLOYEE', 'OPERATOR', 'ADMIN', 'FINANCE') NOT NULL DEFAULT 'EMPLOYEE',
  status TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_employee_no (employee_no),
  UNIQUE KEY uk_users_openid (openid),
  KEY idx_users_department_id (department_id),
  CONSTRAINT fk_users_department_id FOREIGN KEY (department_id) REFERENCES departments(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS travel_applications (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  application_no VARCHAR(50) NOT NULL,
  applicant_id BIGINT UNSIGNED NOT NULL,
  department_id BIGINT UNSIGNED NOT NULL,
  trip_type ENUM('ONE_WAY', 'ROUND_TRIP') NOT NULL DEFAULT 'ROUND_TRIP',
  departure_date DATE NOT NULL,
  return_date DATE NULL,
  from_city VARCHAR(50) NOT NULL,
  to_city VARCHAR(50) NOT NULL,
  return_from_city VARCHAR(50) NULL,
  return_to_city VARCHAR(50) NULL,
  reason VARCHAR(255) NOT NULL,
  remarks VARCHAR(500) NULL,
  status ENUM('PENDING', 'PROCESSING', 'BOOKED', 'TICKETED', 'COMPLETED', 'REJECTED', 'CANCELLED', 'FAILED', 'SUPPLEMENT') NOT NULL DEFAULT 'PENDING',
  current_handler_id BIGINT UNSIGNED NULL,
  latest_booking_id BIGINT UNSIGNED NULL,
  estimated_budget DECIMAL(12,2) NULL,
  actual_amount DECIMAL(12,2) NULL,
  submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME NULL,
  deleted_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_travel_applications_application_no (application_no),
  KEY idx_travel_applications_applicant_id (applicant_id),
  KEY idx_travel_applications_status (status),
  KEY idx_travel_applications_submitted_at (submitted_at),
  CONSTRAINT fk_travel_applications_applicant_id FOREIGN KEY (applicant_id) REFERENCES users(id),
  CONSTRAINT fk_travel_applications_department_id FOREIGN KEY (department_id) REFERENCES departments(id),
  CONSTRAINT fk_travel_applications_current_handler_id FOREIGN KEY (current_handler_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ticket_bookings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  application_id BIGINT UNSIGNED NOT NULL,
  attempt_no INT NOT NULL DEFAULT 1,
  operator_id BIGINT UNSIGNED NOT NULL,
  booking_channel VARCHAR(50) NULL,
  airline VARCHAR(50) NULL,
  flight_no VARCHAR(30) NULL,
  cabin_class VARCHAR(30) NULL,
  depart_time DATETIME NULL,
  arrive_time DATETIME NULL,
  ticket_status ENUM('INIT', 'PROCESSING', 'BOOKED', 'TICKETED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'INIT',
  ticket_price DECIMAL(12,2) NULL,
  tax_amount DECIMAL(12,2) NULL DEFAULT 0.00,
  service_fee DECIMAL(12,2) NULL DEFAULT 0.00,
  total_amount DECIMAL(12,2) NULL,
  booking_reference VARCHAR(100) NULL,
  failure_reason VARCHAR(255) NULL,
  issued_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_ticket_bookings_application_id (application_id),
  KEY idx_ticket_bookings_ticket_status (ticket_status),
  CONSTRAINT fk_ticket_bookings_application_id FOREIGN KEY (application_id) REFERENCES travel_applications(id),
  CONSTRAINT fk_ticket_bookings_operator_id FOREIGN KEY (operator_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE travel_applications
  ADD CONSTRAINT fk_travel_applications_latest_booking_id
  FOREIGN KEY (latest_booking_id) REFERENCES ticket_bookings(id);

CREATE TABLE IF NOT EXISTS application_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  application_id BIGINT UNSIGNED NOT NULL,
  operator_id BIGINT UNSIGNED NULL,
  action VARCHAR(50) NOT NULL,
  from_status ENUM('PENDING', 'PROCESSING', 'BOOKED', 'TICKETED', 'COMPLETED', 'REJECTED', 'CANCELLED', 'FAILED', 'SUPPLEMENT') NULL,
  to_status ENUM('PENDING', 'PROCESSING', 'BOOKED', 'TICKETED', 'COMPLETED', 'REJECTED', 'CANCELLED', 'FAILED', 'SUPPLEMENT') NULL,
  comment VARCHAR(500) NULL,
  extra_data JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_application_logs_application_id (application_id),
  CONSTRAINT fk_application_logs_application_id FOREIGN KEY (application_id) REFERENCES travel_applications(id),
  CONSTRAINT fk_application_logs_operator_id FOREIGN KEY (operator_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
