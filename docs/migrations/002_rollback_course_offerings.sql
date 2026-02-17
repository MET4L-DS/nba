-- =============================================
-- ROLLBACK SCRIPT: Course-Offering Architecture Refactoring
-- Date: February 17, 2026
-- Purpose: Rollback migration 002 if needed
-- WARNING: This will restore from backup tables
-- =============================================

USE `nba_db`;

-- =============================================
-- STEP 1: Drop view
-- =============================================

DROP VIEW IF EXISTS `v_current_offerings`;

-- =============================================
-- STEP 2: Restore courses table from backup
-- =============================================

DROP TABLE IF EXISTS `courses`;

CREATE TABLE `courses` LIKE `courses_backup`;

INSERT INTO `courses` SELECT * FROM `courses_backup`;

-- =============================================
-- STEP 3: Restore course_faculty_assignments
-- =============================================

DROP TABLE IF EXISTS `course_faculty_assignments`;

CREATE TABLE `course_faculty_assignments` LIKE `course_faculty_assignments_backup`;

INSERT INTO `course_faculty_assignments` SELECT * FROM `course_faculty_assignments_backup`;

-- Recreate constraints
ALTER TABLE `course_faculty_assignments`
    ADD UNIQUE KEY `uk_course_emp_year_sem_type` (`course_id`, `employee_id`, `year`, `semester`, `assignment_type`),
    ADD INDEX `idx_course_year_sem` (`course_id`, `year`, `semester`),
    ADD INDEX `idx_emp_active` (`employee_id`, `is_active`),
    ADD INDEX `idx_year_sem` (`year`, `semester`),
    ADD FOREIGN KEY (`course_id`) REFERENCES `courses`(`course_id`) ON DELETE CASCADE,
    ADD FOREIGN KEY (`employee_id`) REFERENCES `users`(`employee_id`) ON DELETE RESTRICT;

-- =============================================
-- STEP 4: Restore tests table
-- =============================================

DROP TABLE IF EXISTS `tests`;

CREATE TABLE `tests` LIKE `tests_backup`;

INSERT INTO `tests` SELECT * FROM `tests_backup`;

ALTER TABLE `tests`
    ADD INDEX `idx_course` (`course_id`),
    ADD FOREIGN KEY (`course_id`) REFERENCES `courses`(`course_id`) ON DELETE CASCADE;

-- =============================================
-- STEP 5: Restore enrollments table
-- =============================================

DROP TABLE IF EXISTS `enrollments`;

CREATE TABLE `enrollments` LIKE `enrollments_backup`;

INSERT INTO `enrollments` SELECT * FROM `enrollments_backup`;

ALTER TABLE `enrollments`
    ADD UNIQUE KEY `uk_course_student` (`course_id`, `student_rollno`),
    ADD INDEX `idx_course` (`course_id`),
    ADD INDEX `idx_student` (`student_rollno`),
    ADD FOREIGN KEY (`course_id`) REFERENCES `courses`(`course_id`) ON DELETE CASCADE,
    ADD FOREIGN KEY (`student_rollno`) REFERENCES `students`(`roll_no`) ON DELETE CASCADE;

-- =============================================
-- STEP 6: Restore attainment_scale table
-- =============================================

DROP TABLE IF EXISTS `attainment_scale`;

CREATE TABLE `attainment_scale` LIKE `attainment_scale_backup`;

INSERT INTO `attainment_scale` SELECT * FROM `attainment_scale_backup`;

ALTER TABLE `attainment_scale`
    ADD UNIQUE KEY `uk_course_level` (`course_id`, `level`),
    ADD INDEX `idx_course` (`course_id`),
    ADD FOREIGN KEY (`course_id`) REFERENCES `courses`(`course_id`) ON DELETE CASCADE;

-- =============================================
-- STEP 7: Restore co_po_mapping table
-- =============================================

DROP TABLE IF EXISTS `co_po_mapping`;

CREATE TABLE `co_po_mapping` LIKE `co_po_mapping_backup`;

INSERT INTO `co_po_mapping` SELECT * FROM `co_po_mapping_backup`;

ALTER TABLE `co_po_mapping`
    ADD UNIQUE KEY `unique_mapping` (`course_id`, `co_name`, `po_name`),
    ADD FOREIGN KEY (`course_id`) REFERENCES `courses`(`course_id`) ON DELETE CASCADE;

-- =============================================
-- STEP 8: Drop course_offerings table
-- =============================================

DROP TABLE IF EXISTS `course_offerings`;

-- =============================================
-- STEP 9: Drop backup tables (optional)
-- =============================================

-- Uncomment to remove backups after successful rollback verification
-- DROP TABLE IF EXISTS `courses_backup`;
-- DROP TABLE IF EXISTS `course_faculty_assignments_backup`;
-- DROP TABLE IF EXISTS `tests_backup`;
-- DROP TABLE IF EXISTS `enrollments_backup`;
-- DROP TABLE IF EXISTS `attainment_scale_backup`;
-- DROP TABLE IF EXISTS `co_po_mapping_backup`;

-- =============================================
-- VERIFICATION
-- =============================================

SELECT 
    (SELECT COUNT(*) FROM courses) AS restored_courses,
    (SELECT COUNT(*) FROM tests) AS restored_tests,
    (SELECT COUNT(*) FROM enrollments) AS restored_enrollments,
    (SELECT COUNT(*) FROM course_faculty_assignments) AS restored_assignments;

-- =============================================
-- END OF ROLLBACK
-- =============================================
