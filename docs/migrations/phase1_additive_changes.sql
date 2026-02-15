-- =============================================
-- NBA PHASE 1: ADDITIVE CHANGES
-- Version: 3.0-alpha
-- Date: February 14, 2026
-- Purpose: Add new tables and columns without breaking existing functionality
-- =============================================

USE `nba_db`;

-- =============================================
-- STEP 1: CREATE NEW TABLES
-- =============================================

-- 1.1 Schools Table
CREATE TABLE IF NOT EXISTS `schools` (
    `school_id` INT(11) NOT NULL AUTO_INCREMENT,
    `school_code` VARCHAR(10) NOT NULL,
    `school_name` VARCHAR(150) NOT NULL,
    `description` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`school_id`),
    UNIQUE KEY `uk_school_code` (`school_code`),
    UNIQUE KEY `uk_school_name` (`school_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.2 HOD Assignments Table (Historical tracking)
CREATE TABLE IF NOT EXISTS `hod_assignments` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `department_id` INT(11) NOT NULL,
    `employee_id` INT(11) NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NULL,
    `is_current` TINYINT(1) DEFAULT 1,
    `appointment_order` VARCHAR(50) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_dept_emp_start` (`department_id`, `employee_id`, `start_date`),
    INDEX `idx_dept_current` (`department_id`, `is_current`),
    INDEX `idx_employee` (`employee_id`),
    INDEX `idx_dates` (`start_date`, `end_date`),
    FOREIGN KEY (`department_id`) REFERENCES `departments`(`department_id`) ON DELETE CASCADE,
    FOREIGN KEY (`employee_id`) REFERENCES `users`(`employee_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.3 Dean Assignments Table (Historical tracking)
CREATE TABLE IF NOT EXISTS `dean_assignments` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `school_id` INT(11) NOT NULL,
    `employee_id` INT(11) NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NULL,
    `is_current` TINYINT(1) DEFAULT 1,
    `appointment_order` VARCHAR(50) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_school_emp_start` (`school_id`, `employee_id`, `start_date`),
    INDEX `idx_school_current` (`school_id`, `is_current`),
    INDEX `idx_employee` (`employee_id`),
    INDEX `idx_dates` (`start_date`, `end_date`),
    FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON DELETE CASCADE,
    FOREIGN KEY (`employee_id`) REFERENCES `users`(`employee_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.4 Course Faculty Assignments Table
CREATE TABLE IF NOT EXISTS `course_faculty_assignments` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `course_id` BIGINT NOT NULL,
    `employee_id` INT(11) NOT NULL,
    `year` INT NOT NULL CHECK (`year` BETWEEN 1000 AND 9999),
    `semester` INT NOT NULL,
    `assignment_type` ENUM('Primary', 'Co-instructor', 'Lab') DEFAULT 'Primary',
    `assigned_date` DATE DEFAULT (CURRENT_DATE),
    `completion_date` DATE NULL,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_course_emp_year_sem_type` (`course_id`, `employee_id`, `year`, `semester`, `assignment_type`),
    INDEX `idx_course_year_sem` (`course_id`, `year`, `semester`),
    INDEX `idx_emp_active` (`employee_id`, `is_active`),
    INDEX `idx_year_sem` (`year`, `semester`),
    FOREIGN KEY (`course_id`) REFERENCES `course`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`employee_id`) REFERENCES `users`(`employee_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- STEP 2: ADD NEW COLUMNS TO EXISTING TABLES
-- =============================================

-- 2.1 Departments
ALTER TABLE `departments`
ADD COLUMN `school_id` INT(11) NULL AFTER `department_id`,
ADD COLUMN `description` TEXT NULL AFTER `department_code`,
ADD COLUMN `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER `description`;

-- 2.2 Users
ALTER TABLE `users`
ADD COLUMN `designation` VARCHAR(50) NULL AFTER `role`,
ADD COLUMN `phone` VARCHAR(15) NULL AFTER `designation`,
ADD COLUMN `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER `phone`,
ADD COLUMN `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`;

-- 2.3 Course
ALTER TABLE `course`
ADD COLUMN `department_id` INT(11) NULL AFTER `course_code`,
ADD COLUMN `course_type` ENUM('Theory', 'Lab', 'Project', 'Seminar') DEFAULT 'Theory' AFTER `name`,
ADD COLUMN `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER `passing_threshold`,
ADD COLUMN `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`;

-- =============================================
-- STEP 3: POPULATE NEW TABLES
-- =============================================

-- Default school
INSERT INTO `schools` (`school_code`, `school_name`, `description`)
VALUES ('SoE', 'School of Engineering', 'Default school for existing departments');

-- Link departments to default school
UPDATE `departments` SET `school_id` = 1 WHERE `school_id` IS NULL;

-- Link courses to departments (via faculty)
UPDATE `course` c
JOIN `users` u ON c.faculty_id = u.employee_id
SET c.department_id = u.department_id
WHERE c.department_id IS NULL;

-- Populate HOD assignments
INSERT INTO `hod_assignments` (`department_id`, `employee_id`, `start_date`, `is_current`)
SELECT department_id, employee_id, CURDATE(), 1
FROM `users`
WHERE role = 'hod' AND department_id IS NOT NULL;

-- Populate Dean assignments
INSERT INTO `dean_assignments` (`school_id`, `employee_id`, `start_date`, `is_current`)
SELECT 1, employee_id, CURDATE(), 1
FROM `users`
WHERE role = 'dean'
LIMIT 1;

-- Populate course faculty assignments
INSERT INTO `course_faculty_assignments` 
    (`course_id`, `employee_id`, `year`, `semester`, `assignment_type`, `assigned_date`, `is_active`)
SELECT id, faculty_id, year, semester, 'Primary', CURDATE(), 1
FROM `course`
WHERE faculty_id IS NOT NULL;

-- =============================================
-- STEP 4: ADD FOREIGN KEYS
-- =============================================

ALTER TABLE `departments`
ADD CONSTRAINT `fk_dept_school` 
FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON DELETE RESTRICT;

ALTER TABLE `course`
ADD INDEX `idx_course_dept` (`department_id`),
ADD CONSTRAINT `fk_course_dept` 
FOREIGN KEY (`department_id`) REFERENCES `departments`(`department_id`) ON DELETE RESTRICT;

-- =============================================
-- STEP 5: CREATE VIEWS
-- =============================================

CREATE OR REPLACE VIEW `v_current_hods` AS
SELECT 
    h.department_id,
    d.department_name,
    d.department_code,
    u.employee_id,
    u.username AS hod_name,
    u.email,
    u.designation,
    h.start_date
FROM `hod_assignments` h
JOIN `users` u ON h.employee_id = u.employee_id
JOIN `departments` d ON h.department_id = d.department_id
WHERE h.is_current = 1;

CREATE OR REPLACE VIEW `v_current_deans` AS
SELECT 
    da.school_id,
    s.school_name,
    u.employee_id,
    u.username AS dean_name,
    u.email,
    u.designation,
    da.start_date
FROM `dean_assignments` da
JOIN `users` u ON da.employee_id = u.employee_id
JOIN `schools` s ON da.school_id = s.school_id
WHERE da.is_current = 1;

-- =============================================
-- STEP 6: UPDATE DEMO DATA
-- =============================================

UPDATE `users` SET `designation` = 'System Administrator' WHERE `role` = 'admin';
UPDATE `users` SET `designation` = 'Professor' WHERE `role` = 'hod';
UPDATE `users` SET `designation` = 'Associate Professor' WHERE `role` = 'faculty' AND employee_id IN (3001, 3002);
UPDATE `users` SET `designation` = 'Assistant Professor' WHERE `role` = 'faculty' AND employee_id NOT IN (3001, 3002);
UPDATE `users` SET `designation` = 'Lab Assistant' WHERE `role` = 'staff';