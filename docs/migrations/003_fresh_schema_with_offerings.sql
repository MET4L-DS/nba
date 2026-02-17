-- =============================================
-- FRESH DATABASE SCHEMA WITH COURSE OFFERINGS
-- Date: February 17, 2026
-- Purpose: Clean schema with course-offering architecture
-- =============================================

USE `nba_db`;

-- =============================================
-- STEP 1: Drop all tables (Individual commands with FK bypass)
-- =============================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `marks`;
DROP TABLE IF EXISTS `raw_marks`;
DROP TABLE IF EXISTS `questions`;
DROP TABLE IF EXISTS `co_po_mapping`;
DROP TABLE IF EXISTS `attainment_scale`;
DROP TABLE IF EXISTS `enrollments`;
DROP TABLE IF EXISTS `tests`;
DROP TABLE IF EXISTS `course_faculty_assignments`;
DROP TABLE IF EXISTS `course_offerings`;
DROP TABLE IF EXISTS `courses`;
DROP TABLE IF EXISTS `hod_assignments`;
DROP TABLE IF EXISTS `dean_assignments`;
DROP TABLE IF EXISTS `students`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `departments`;
DROP TABLE IF EXISTS `schools`;

-- Drop backup/temp tables
DROP TABLE IF EXISTS `courses_backup`;
DROP TABLE IF EXISTS `course_faculty_assignments_backup`;
DROP TABLE IF EXISTS `tests_backup`;
DROP TABLE IF EXISTS `enrollments_backup`;
DROP TABLE IF EXISTS `attainment_scale_backup`;
DROP TABLE IF EXISTS `co_po_mapping_backup`;

-- Drop views
DROP VIEW IF EXISTS `v_current_offerings`;

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- STEP 2: Create parent tables
-- =============================================

CREATE TABLE `schools` (
    `school_id` BIGINT NOT NULL AUTO_INCREMENT,
    `school_name` VARCHAR(255) NOT NULL,
    `school_code` VARCHAR(50) NOT NULL UNIQUE,
    `dean_id` BIGINT DEFAULT NULL,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`school_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `departments` (
    `department_id` BIGINT NOT NULL AUTO_INCREMENT,
    `department_name` VARCHAR(255) NOT NULL,
    `department_code` VARCHAR(50) NOT NULL UNIQUE,
    `school_id` BIGINT DEFAULT NULL,
    `hod_id` BIGINT DEFAULT NULL,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`department_id`),
    FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `users` (
    `employee_id` BIGINT NOT NULL,
    `username` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('Admin', 'Dean', 'HOD', 'Faculty', 'Staff') NOT NULL,
    `department_id` BIGINT DEFAULT NULL,
    `designation` VARCHAR(100) DEFAULT NULL,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`employee_id`),
    INDEX `idx_email` (`email`),
    INDEX `idx_role` (`role`),
    FOREIGN KEY (`department_id`) REFERENCES `departments`(`department_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `students` (
    `roll_no` VARCHAR(50) NOT NULL,
    `student_name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) DEFAULT NULL,
    `department_id` BIGINT NOT NULL,
    `batch_year` INT NOT NULL,
    `current_semester` INT DEFAULT 1,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`roll_no`),
    INDEX `idx_department` (`department_id`),
    INDEX `idx_batch` (`batch_year`),
    FOREIGN KEY (`department_id`) REFERENCES `departments`(`department_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- STEP 2.1: Create appointment tracking tables
-- =============================================

CREATE TABLE `hod_assignments` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `department_id` BIGINT NOT NULL,
    `employee_id` BIGINT NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NULL,
    `is_current` TINYINT(1) DEFAULT 1,
    `appointment_order` VARCHAR(255) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`department_id`) REFERENCES `departments`(`department_id`) ON DELETE CASCADE,
    FOREIGN KEY (`employee_id`) REFERENCES `users`(`employee_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `dean_assignments` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `school_id` BIGINT NOT NULL,
    `employee_id` BIGINT NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NULL,
    `is_current` TINYINT(1) DEFAULT 1,
    `appointment_order` VARCHAR(255) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON DELETE CASCADE,
    FOREIGN KEY (`employee_id`) REFERENCES `users`(`employee_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- STEP 3: Create courses table (template only)
-- =============================================

CREATE TABLE `courses` (
    `course_id` BIGINT NOT NULL AUTO_INCREMENT,
    `course_code` VARCHAR(20) NOT NULL,
    `course_name` VARCHAR(255) NOT NULL,
    `credit` INT NOT NULL,
    `department_id` BIGINT DEFAULT NULL,
    `course_type` ENUM('Theory', 'Lab', 'Project', 'Seminar') DEFAULT 'Theory',
    `course_level` ENUM('Undergraduate', 'Postgraduate') DEFAULT 'Undergraduate',
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`course_id`),
    UNIQUE KEY `uk_course_code` (`course_code`),
    INDEX `idx_department` (`department_id`),
    INDEX `idx_course_type` (`course_type`),
    FOREIGN KEY (`department_id`) REFERENCES `departments`(`department_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- STEP 4: Create course_offerings table
-- =============================================

CREATE TABLE `course_offerings` (
    `offering_id` BIGINT NOT NULL AUTO_INCREMENT,
    `course_id` BIGINT NOT NULL,
    `year` INT NOT NULL CHECK (`year` BETWEEN 1000 AND 9999),
    `semester` INT NOT NULL CHECK (`semester` > 0),
    `co_threshold` DECIMAL(5, 2) DEFAULT 40.00 CHECK (`co_threshold` >= 0 AND `co_threshold` <= 100),
    `passing_threshold` DECIMAL(5, 2) DEFAULT 60.00 CHECK (`passing_threshold` >= 0 AND `passing_threshold` <= 100),
    `syllabus_pdf` LONGBLOB DEFAULT NULL,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`offering_id`),
    UNIQUE KEY `uk_course_year_sem` (`course_id`, `year`, `semester`),
    INDEX `idx_year_sem` (`year`, `semester`),
    INDEX `idx_course` (`course_id`),
    FOREIGN KEY (`course_id`) REFERENCES `courses`(`course_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- STEP 5: Create course_faculty_assignments table
-- =============================================

CREATE TABLE `course_faculty_assignments` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `offering_id` BIGINT NOT NULL,
    `employee_id` BIGINT NOT NULL,
    `assignment_type` ENUM('Primary', 'Co-instructor', 'Lab') DEFAULT 'Primary',
    `assigned_date` DATE DEFAULT NULL,
    `completion_date` DATE DEFAULT NULL,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_offering_emp_type` (`offering_id`, `employee_id`, `assignment_type`),
    INDEX `idx_offering` (`offering_id`),
    INDEX `idx_employee` (`employee_id`),
    INDEX `idx_type` (`assignment_type`),
    FOREIGN KEY (`offering_id`) REFERENCES `course_offerings`(`offering_id`) ON DELETE CASCADE,
    FOREIGN KEY (`employee_id`) REFERENCES `users`(`employee_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- STEP 6: Create tests table
-- =============================================

CREATE TABLE `tests` (
    `test_id` BIGINT NOT NULL AUTO_INCREMENT,
    `offering_id` BIGINT NOT NULL,
    `test_name` VARCHAR(255) NOT NULL,
    `test_type` ENUM('IA1', 'IA2', 'IA3', 'Assignment', 'Quiz', 'Seminar', 'EndSem') NOT NULL,
    `max_marks` DECIMAL(5, 2) NOT NULL,
    `weightage` DECIMAL(5, 2) DEFAULT 100.00,
    `test_date` DATE DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`test_id`),
    INDEX `idx_offering` (`offering_id`),
    INDEX `idx_test_type` (`test_type`),
    FOREIGN KEY (`offering_id`) REFERENCES `course_offerings`(`offering_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- STEP 7: Create enrollments table
-- =============================================

CREATE TABLE `enrollments` (
    `enrollment_id` BIGINT NOT NULL AUTO_INCREMENT,
    `offering_id` BIGINT NOT NULL,
    `roll_no` VARCHAR(50) NOT NULL,
    `enrollment_date` DATE DEFAULT NULL,
    `status` ENUM('Active', 'Dropped', 'Completed') DEFAULT 'Active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`enrollment_id`),
    UNIQUE KEY `uk_offering_student` (`offering_id`, `roll_no`),
    INDEX `idx_offering` (`offering_id`),
    INDEX `idx_student` (`roll_no`),
    FOREIGN KEY (`offering_id`) REFERENCES `course_offerings`(`offering_id`) ON DELETE CASCADE,
    FOREIGN KEY (`roll_no`) REFERENCES `students`(`roll_no`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- STEP 8: Create questions table
-- =============================================

CREATE TABLE `questions` (
    `question_id` BIGINT NOT NULL AUTO_INCREMENT,
    `test_id` BIGINT NOT NULL,
    `question_number` INT NOT NULL,
    `max_marks` DECIMAL(5, 2) NOT NULL,
    `co_name` VARCHAR(50) DEFAULT NULL,
    `blooms_level` ENUM('Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create') DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`question_id`),
    UNIQUE KEY `uk_test_question` (`test_id`, `question_number`),
    INDEX `idx_test` (`test_id`),
    INDEX `idx_co` (`co_name`),
    FOREIGN KEY (`test_id`) REFERENCES `tests`(`test_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- STEP 9: Create marks tables
-- =============================================

CREATE TABLE `raw_marks` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `test_id` BIGINT NOT NULL,
    `roll_no` VARCHAR(50) NOT NULL,
    `question_id` BIGINT NOT NULL,
    `marks_obtained` DECIMAL(5, 2) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_test_student_question` (`test_id`, `roll_no`, `question_id`),
    INDEX `idx_test` (`test_id`),
    INDEX `idx_student` (`roll_no`),
    INDEX `idx_question` (`question_id`),
    FOREIGN KEY (`test_id`) REFERENCES `tests`(`test_id`) ON DELETE CASCADE,
    FOREIGN KEY (`roll_no`) REFERENCES `students`(`roll_no`) ON DELETE CASCADE,
    FOREIGN KEY (`question_id`) REFERENCES `questions`(`question_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `marks` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `test_id` BIGINT NOT NULL,
    `roll_no` VARCHAR(50) NOT NULL,
    `CO1` DECIMAL(5, 2) DEFAULT 0,
    `CO2` DECIMAL(5, 2) DEFAULT 0,
    `CO3` DECIMAL(5, 2) DEFAULT 0,
    `CO4` DECIMAL(5, 2) DEFAULT 0,
    `CO5` DECIMAL(5, 2) DEFAULT 0,
    `CO6` DECIMAL(5, 2) DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_test_student` (`test_id`, `roll_no`),
    INDEX `idx_test` (`test_id`),
    INDEX `idx_student` (`roll_no`),
    FOREIGN KEY (`test_id`) REFERENCES `tests`(`test_id`) ON DELETE CASCADE,
    FOREIGN KEY (`roll_no`) REFERENCES `students`(`roll_no`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- STEP 10: Create attainment_scale table
-- =============================================

CREATE TABLE `attainment_scale` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `offering_id` BIGINT NOT NULL,
    `level` INT NOT NULL,
    `min_percentage` DECIMAL(5, 2) NOT NULL,
    `max_percentage` DECIMAL(5, 2) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_offering_level` (`offering_id`, `level`),
    INDEX `idx_offering` (`offering_id`),
    FOREIGN KEY (`offering_id`) REFERENCES `course_offerings`(`offering_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- STEP 11: Create co_po_mapping table
-- =============================================

CREATE TABLE `co_po_mapping` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `offering_id` BIGINT NOT NULL,
    `co_name` VARCHAR(50) NOT NULL,
    `po_name` VARCHAR(50) NOT NULL,
    `mapping_level` INT DEFAULT 1 CHECK (`mapping_level` BETWEEN 1 AND 3),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_offering_co_po` (`offering_id`, `co_name`, `po_name`),
    INDEX `idx_offering` (`offering_id`),
    INDEX `idx_co` (`co_name`),
    INDEX `idx_po` (`po_name`),
    FOREIGN KEY (`offering_id`) REFERENCES `course_offerings`(`offering_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- STEP 12: Create view for current offerings
-- =============================================

CREATE OR REPLACE VIEW `v_current_offerings` AS
SELECT 
    co.offering_id,
    co.course_id,
    c.course_code,
    c.course_name,
    c.credit,
    c.course_type,
    c.course_level,
    c.department_id,
    d.department_name,
    d.department_code,
    co.year,
    co.semester,
    co.co_threshold,
    co.passing_threshold,
    co.is_active,
    cfa.employee_id AS primary_faculty_id,
    u.username AS primary_faculty_name,
    u.email AS primary_faculty_email
FROM course_offerings co
INNER JOIN courses c ON co.course_id = c.course_id
LEFT JOIN departments d ON c.department_id = d.department_id
LEFT JOIN course_faculty_assignments cfa ON co.offering_id = cfa.offering_id 
    AND cfa.assignment_type = 'Primary' 
    AND cfa.is_active = 1
LEFT JOIN users u ON cfa.employee_id = u.employee_id
WHERE co.is_active = 1;

-- =============================================
-- VERIFICATION
-- =============================================

SELECT 'Database schema created successfully!' AS status;

SHOW TABLES;

-- =============================================
-- END OF SCRIPT
-- =============================================
