-- =============================================
-- MIGRATION 002: Course-Offering Architecture Refactoring
-- Date: February 17, 2026
-- Purpose: Decouple courses from faculty/sessions using course_offerings table
-- =============================================

USE `nba_db`;

-- =============================================
-- STEP 1: Create course_offerings table
-- =============================================

CREATE TABLE IF NOT EXISTS `course_offerings` (
    `offering_id` BIGINT NOT NULL AUTO_INCREMENT,
    `course_id` BIGINT NOT NULL,
    `year` INT NOT NULL CHECK (`year` BETWEEN 1000 AND 9999),
    `semester` INT NOT NULL,
    `co_threshold` DECIMAL(5, 2) DEFAULT 40.00 CHECK (`co_threshold` >= 0 AND `co_threshold` <= 100),
    `passing_threshold` DECIMAL(5, 2) DEFAULT 60.00 CHECK (`passing_threshold` >= 0 AND `passing_threshold` <= 100),
    `syllabus_pdf` LONGBLOB NULL,
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
-- STEP 2: Migrate existing course data to offerings
-- =============================================

INSERT INTO `course_offerings` (
    `course_id`,
    `year`,
    `semester`,
    `co_threshold`,
    `passing_threshold`,
    `syllabus_pdf`,
    `is_active`,
    `created_at`,
    `updated_at`
)
SELECT 
    `course_id`,
    `year`,
    `semester`,
    `co_threshold`,
    `passing_threshold`,
    `syllabus_pdf`,
    `is_active`,
    `created_at`,
    `updated_at`
FROM `courses`
WHERE `year` IS NOT NULL AND `semester` IS NOT NULL;

-- =============================================
-- STEP 3: Create temporary mapping table for FK updates
-- =============================================

CREATE TEMPORARY TABLE `temp_course_offering_map` (
    `old_course_id` BIGINT NOT NULL,
    `offering_id` BIGINT NOT NULL,
    PRIMARY KEY (`old_course_id`)
);

INSERT INTO `temp_course_offering_map` (`old_course_id`, `offering_id`)
SELECT c.`course_id`, co.`offering_id`
FROM `courses` c
INNER JOIN `course_offerings` co ON c.`course_id` = co.`course_id` 
    AND c.`year` = co.`year` 
    AND c.`semester` = co.`semester`;

-- =============================================
-- STEP 4: Backup and update course_faculty_assignments
-- =============================================

-- Create backup
CREATE TABLE IF NOT EXISTS `course_faculty_assignments_backup` AS 
SELECT * FROM `course_faculty_assignments`;

-- Drop foreign key constraints
ALTER TABLE `course_faculty_assignments` 
    DROP FOREIGN KEY `course_faculty_assignments_ibfk_1`;

-- Add new offering_id column
ALTER TABLE `course_faculty_assignments` 
    ADD COLUMN `offering_id` BIGINT NULL AFTER `id`;

-- Populate offering_id from course_id + year + semester match
UPDATE `course_faculty_assignments` cfa
INNER JOIN `course_offerings` co 
    ON cfa.`course_id` = co.`course_id`
    AND cfa.`year` = co.`year`
    AND cfa.`semester` = co.`semester`
SET cfa.`offering_id` = co.`offering_id`;

-- Drop indexes first (before dropping columns they reference)
ALTER TABLE `course_faculty_assignments`
    DROP INDEX IF EXISTS `uk_course_emp_year_sem_type`,
    DROP INDEX IF EXISTS `idx_course_year_sem`,
    DROP INDEX IF EXISTS `idx_year_sem`;

-- Drop old columns
ALTER TABLE `course_faculty_assignments`
    DROP COLUMN `course_id`,
    DROP COLUMN `year`,
    DROP COLUMN `semester`;

-- Make offering_id NOT NULL
ALTER TABLE `course_faculty_assignments`
    MODIFY COLUMN `offering_id` BIGINT NOT NULL;

-- Add new indexes and constraints
ALTER TABLE `course_faculty_assignments`
    ADD UNIQUE KEY `uk_offering_emp_type` (`offering_id`, `employee_id`, `assignment_type`),
    ADD INDEX `idx_offering` (`offering_id`),
    ADD FOREIGN KEY (`offering_id`) REFERENCES `course_offerings`(`offering_id`) ON DELETE CASCADE;

-- =============================================
-- STEP 5: Migrate existing faculty_id to assignments
-- =============================================

-- Create Primary assignments for existing faculty_id on courses
INSERT INTO `course_faculty_assignments` (
    `offering_id`,
    `employee_id`,
    `assignment_type`,
    `assigned_date`,
    `is_active`,
    `created_at`
)
SELECT 
    co.`offering_id`,
    c.`faculty_id`,
    'Primary',
    CURRENT_DATE,
    1,
    CURRENT_TIMESTAMP
FROM `courses` c
INNER JOIN `course_offerings` co ON c.`course_id` = co.`course_id`
    AND c.`year` = co.`year`
    AND c.`semester` = co.`semester`
WHERE c.`faculty_id` IS NOT NULL
ON DUPLICATE KEY UPDATE `is_active` = 1;

-- =============================================
-- STEP 6: Update tests table
-- =============================================

CREATE TABLE IF NOT EXISTS `tests_backup` AS SELECT * FROM `tests`;

ALTER TABLE `tests` DROP FOREIGN KEY `tests_ibfk_1`;

ALTER TABLE `tests` ADD COLUMN `offering_id` BIGINT NULL AFTER `test_id`;

UPDATE `tests` t
INNER JOIN `temp_course_offering_map` m ON t.`course_id` = m.`old_course_id`
SET t.`offering_id` = m.`offering_id`;

ALTER TABLE `tests` DROP COLUMN `course_id`;

ALTER TABLE `tests` MODIFY COLUMN `offering_id` BIGINT NOT NULL;

ALTER TABLE `tests` 
    ADD INDEX `idx_offering` (`offering_id`),
    ADD FOREIGN KEY (`offering_id`) REFERENCES `course_offerings`(`offering_id`) ON DELETE CASCADE;

-- =============================================
-- STEP 7: Update enrollments table
-- =============================================

CREATE TABLE IF NOT EXISTS `enrollments_backup` AS SELECT * FROM `enrollments`;

ALTER TABLE `enrollments` DROP FOREIGN KEY `enrollments_ibfk_1`;

ALTER TABLE `enrollments` ADD COLUMN `offering_id` BIGINT NULL AFTER `enrollment_id`;

UPDATE `enrollments` e
INNER JOIN `temp_course_offering_map` m ON e.`course_id` = m.`old_course_id`
SET e.`offering_id` = m.`offering_id`;

ALTER TABLE `enrollments` 
    DROP INDEX `course_id`,
    DROP COLUMN `course_id`;

ALTER TABLE `enrollments` MODIFY COLUMN `offering_id` BIGINT NOT NULL;

ALTER TABLE `enrollments` 
    ADD UNIQUE KEY `uk_offering_student` (`offering_id`, `student_rollno`),
    ADD INDEX `idx_offering` (`offering_id`),
    ADD FOREIGN KEY (`offering_id`) REFERENCES `course_offerings`(`offering_id`) ON DELETE CASCADE;

-- =============================================
-- STEP 8: Update attainment_scale table
-- =============================================

CREATE TABLE IF NOT EXISTS `attainment_scale_backup` AS SELECT * FROM `attainment_scale`;

ALTER TABLE `attainment_scale` DROP FOREIGN KEY `attainment_scale_ibfk_1`;

ALTER TABLE `attainment_scale` ADD COLUMN `offering_id` BIGINT NULL AFTER `id`;

UPDATE `attainment_scale` a
INNER JOIN `temp_course_offering_map` m ON a.`course_id` = m.`old_course_id`
SET a.`offering_id` = m.`offering_id`;

ALTER TABLE `attainment_scale` 
    DROP INDEX `course_id`,
    DROP INDEX `course_id_2`,
    DROP COLUMN `course_id`;

ALTER TABLE `attainment_scale` MODIFY COLUMN `offering_id` BIGINT NOT NULL;

ALTER TABLE `attainment_scale` 
    ADD UNIQUE KEY `uk_offering_level` (`offering_id`, `level`),
    ADD INDEX `idx_offering` (`offering_id`),
    ADD FOREIGN KEY (`offering_id`) REFERENCES `course_offerings`(`offering_id`) ON DELETE CASCADE;

-- =============================================
-- STEP 9: Update co_po_mapping table
-- =============================================

CREATE TABLE IF NOT EXISTS `co_po_mapping_backup` AS SELECT * FROM `co_po_mapping`;

ALTER TABLE `co_po_mapping` DROP FOREIGN KEY `co_po_mapping_ibfk_1`;

ALTER TABLE `co_po_mapping` ADD COLUMN `offering_id` BIGINT NULL AFTER `id`;

UPDATE `co_po_mapping` cp
INNER JOIN `temp_course_offering_map` m ON cp.`course_id` = m.`old_course_id`
SET cp.`offering_id` = m.`offering_id`;

ALTER TABLE `co_po_mapping` 
    DROP INDEX `unique_mapping`,
    DROP COLUMN `course_id`;

ALTER TABLE `co_po_mapping` MODIFY COLUMN `offering_id` BIGINT NOT NULL;

ALTER TABLE `co_po_mapping` 
    ADD UNIQUE KEY `uk_offering_co_po` (`offering_id`, `co_name`, `po_name`),
    ADD FOREIGN KEY (`offering_id`) REFERENCES `course_offerings`(`offering_id`) ON DELETE CASCADE;

-- =============================================
-- STEP 10: Remove session-specific columns from courses
-- =============================================

CREATE TABLE IF NOT EXISTS `courses_backup` AS SELECT * FROM `courses`;

ALTER TABLE `courses` 
    DROP FOREIGN KEY `courses_ibfk_1`;

ALTER TABLE `courses` 
    DROP COLUMN `faculty_id`,
    DROP COLUMN `year`,
    DROP COLUMN `semester`,
    DROP COLUMN `co_threshold`,
    DROP COLUMN `passing_threshold`,
    DROP COLUMN `syllabus_pdf`;

-- =============================================
-- STEP 11: Create view for current offerings
-- =============================================

CREATE OR REPLACE VIEW `v_current_offerings` AS
SELECT 
    co.offering_id,
    co.course_id,
    c.course_code,
    c.course_name,
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
-- CLEANUP
-- =============================================

DROP TEMPORARY TABLE IF EXISTS `temp_course_offering_map`;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Verify migration counts
SELECT 
    (SELECT COUNT(*) FROM courses_backup) AS original_courses,
    (SELECT COUNT(*) FROM course_offerings) AS migrated_offerings,
    (SELECT COUNT(*) FROM tests) AS tests_count,
    (SELECT COUNT(*) FROM enrollments) AS enrollments_count,
    (SELECT COUNT(*) FROM course_faculty_assignments) AS assignments_count;

-- =============================================
-- END OF MIGRATION
-- =============================================
