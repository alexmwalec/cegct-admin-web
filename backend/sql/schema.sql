CREATE DATABASE IF NOT EXISTS cegct CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cegct;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('CITIZEN', 'INSPECTOR', 'ADMIN') NOT NULL DEFAULT 'CITIZEN',
  phone VARCHAR(20),
  fcm_token VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT
) ENGINE=InnoDB;

INSERT IGNORE INTO categories (name, description) VALUES
  ('Illegal dumping', 'Waste illegally left in a public or private area'),
  ('Water pollution', 'Contamination of a river, lake, or water source'),
  ('Air pollution', 'Smoke, fumes, or other harmful emissions'),
  ('Unsafe waste disposal', 'Waste disposal that may harm people or the environment'),
  ('Other', 'Other environmental concern');

CREATE TABLE IF NOT EXISTS reports (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  category_name VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  urgency ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
  status ENUM('SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'REOPENED') DEFAULT 'SUBMITTED',
  location POINT NOT NULL SRID 4326,
  address_text VARCHAR(255),
  photo_url VARCHAR(512),
  voice_note_url VARCHAR(512),
  assigned_officer_id VARCHAR(36) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_reports_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_reports_officer FOREIGN KEY (assigned_officer_id) REFERENCES users(id) ON DELETE SET NULL,
  SPATIAL INDEX idx_reports_location (location),
  INDEX idx_reports_status_created (status, created_at),
  INDEX idx_reports_category_created (category_name, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS report_sequences (
  report_date DATE PRIMARY KEY,
  last_number INT UNSIGNED NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS chat_messages (
  id VARCHAR(36) PRIMARY KEY,
  report_id VARCHAR(36) NOT NULL,
  sender_id VARCHAR(36) NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_chat_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
  CONSTRAINT fk_chat_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_chat_report_sent (report_id, sent_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(36) PRIMARY KEY,
  recipient_user_id VARCHAR(36) NOT NULL,
  report_id VARCHAR(36) NOT NULL,
  type VARCHAR(32) NOT NULL,
  title VARCHAR(160) NOT NULL,
  body VARCHAR(500) NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (recipient_user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_notifications_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
  INDEX idx_notifications_user_created (recipient_user_id, created_at),
  INDEX idx_notifications_user_unread (recipient_user_id, is_read)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS inspections (
  id VARCHAR(36) PRIMARY KEY,
  report_id VARCHAR(36) NOT NULL,
  officer_id VARCHAR(36) NOT NULL,
  notes TEXT,
  inspection_photo_url VARCHAR(512),
  inspected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_inspection_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
  CONSTRAINT fk_inspection_officer FOREIGN KEY (officer_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_inspections_report_date (report_id, inspected_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS announcements (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'GENERAL',
  author_name VARCHAR(100) DEFAULT 'CEGCT Team',
  is_important BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
