-- Phase 2: Table & Column Renames Migration
-- WARNING: This script contains BREAKING CHANGES
-- Ensure you have a backup before running: mysqldump nba_db > nba_db_before_phase2.sql
-- Test on a dev database copy first!

START TRANSACTION;

-- ============================================
-- STEP 1: Disable Foreign Key Checks
-- ============================================
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- STEP 2: Rename Tables (Conditional)
-- ============================================

-- Function to rename tables safely if they exist
SET @rename_student = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'nba_db' AND TABLE_NAME = 'student');
SET @sql_student = IF(@rename_student > 0, 'RENAME TABLE student TO students', 'SELECT "Table student already renamed or does not exist"');
PREPARE stmt1 FROM @sql_student; EXECUTE stmt1; DEALLOCATE PREPARE stmt1;

SET @rename_course = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'nba_db' AND TABLE_NAME = 'course');
SET @sql_course = IF(@rename_course > 0, 'RENAME TABLE course TO courses', 'SELECT "Table course already renamed or does not exist"');
PREPARE stmt2 FROM @sql_course; EXECUTE stmt2; DEALLOCATE PREPARE stmt2;

SET @rename_test = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'nba_db' AND TABLE_NAME = 'test');
SET @sql_test = IF(@rename_test > 0, 'RENAME TABLE test TO tests', 'SELECT "Table test already renamed or does not exist"');
PREPARE stmt3 FROM @sql_test; EXECUTE stmt3; DEALLOCATE PREPARE stmt3;

SET @rename_question = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'nba_db' AND TABLE_NAME = 'question');
SET @sql_question = IF(@rename_question > 0, 'RENAME TABLE question TO questions', 'SELECT "Table question already renamed or does not exist"');
PREPARE stmt4 FROM @sql_question; EXECUTE stmt4; DEALLOCATE PREPARE stmt4;

SET @rename_enrollment = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'nba_db' AND TABLE_NAME = 'enrollment');
SET @sql_enrollment = IF(@rename_enrollment > 0, 'RENAME TABLE enrollment TO enrollments', 'SELECT "Table enrollment already renamed or does not exist"');
PREPARE stmt5 FROM @sql_enrollment; EXECUTE stmt5; DEALLOCATE PREPARE stmt5;

SET @rename_rawMarks = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'nba_db' AND TABLE_NAME = 'rawMarks');
SET @sql_rawMarks = IF(@rename_rawMarks > 0, 'RENAME TABLE rawMarks TO raw_marks', 'SELECT "Table rawMarks already renamed or does not exist"');
PREPARE stmt6 FROM @sql_rawMarks; EXECUTE stmt6; DEALLOCATE PREPARE stmt6;

-- ============================================
-- STEP 3: Update STUDENTS table
-- ============================================

-- First, drop existing foreign key constraint on dept column (if it exists)
SET @fk_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = 'nba_db' 
    AND TABLE_NAME = 'students' 
    AND CONSTRAINT_NAME = 'students_ibfk_1');

SET @sql = IF(@fk_exists > 0, 
    'ALTER TABLE students DROP FOREIGN KEY students_ibfk_1', 
    'SELECT "FK students_ibfk_1 does not exist, skipping" AS status');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Rename existing columns (Conditional)
SET @roll_no_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'nba_db' AND TABLE_NAME = 'students' AND COLUMN_NAME = 'roll_no');
SET @sql_roll_no = IF(@roll_no_exists = 0, 'ALTER TABLE students CHANGE COLUMN rollno roll_no VARCHAR(20) NOT NULL', 'SELECT "Column roll_no already exists"');
PREPARE stmt7 FROM @sql_roll_no; EXECUTE stmt7; DEALLOCATE PREPARE stmt7;

SET @student_name_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'nba_db' AND TABLE_NAME = 'students' AND COLUMN_NAME = 'student_name');
SET @sql_student_name = IF(@student_name_exists = 0, 'ALTER TABLE students CHANGE COLUMN name student_name VARCHAR(100) NOT NULL', 'SELECT "Column student_name already exists"');
PREPARE stmt8 FROM @sql_student_name; EXECUTE stmt8; DEALLOCATE PREPARE stmt8;

-- Add new department_id column (Conditional)
SET @dept_id_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'nba_db' AND TABLE_NAME = 'students' AND COLUMN_NAME = 'department_id');
SET @sql_dept_id = IF(@dept_id_exists = 0, 'ALTER TABLE students ADD COLUMN department_id INT(11) AFTER student_name', 'SELECT "Column department_id already exists"');
PREPARE stmt9 FROM @sql_dept_id; EXECUTE stmt9; DEALLOCATE PREPARE stmt9;

-- Populate department_id from dept column (Only if dept column still exists)
SET @dept_col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'nba_db' AND TABLE_NAME = 'students' AND COLUMN_NAME = 'dept');
SET @sql_pop_dept = IF(@dept_col_exists > 0, 'UPDATE students s JOIN departments d ON s.dept = d.department_code SET s.department_id = d.department_id', 'SELECT "dept column already removed, skipping population"');
PREPARE stmt10 FROM @sql_pop_dept; EXECUTE stmt10; DEALLOCATE PREPARE stmt10;

-- Make department_id NOT NULL after population
SET @sql_mod_dept = IF(@dept_id_exists = 0, 'ALTER TABLE students MODIFY COLUMN department_id INT(11) NOT NULL', 'SELECT "department_id already modified"');
PREPARE stmt11 FROM @sql_mod_dept; EXECUTE stmt11; DEALLOCATE PREPARE stmt11;

-- Now drop old dept column (Conditional)
SET @sql_drop_dept = IF(@dept_col_exists > 0, 'ALTER TABLE students DROP COLUMN dept', 'SELECT "dept column already dropped"');
PREPARE stmt12 FROM @sql_drop_dept; EXECUTE stmt12; DEALLOCATE PREPARE stmt12;

-- Add new columns (Conditional)
SET @batch_year_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'nba_db' AND TABLE_NAME = 'students' AND COLUMN_NAME = 'batch_year');
SET @sql_batch = IF(@batch_year_exists = 0, 'ALTER TABLE students ADD COLUMN batch_year INT AFTER department_id', 'SELECT "batch_year already exists"');
PREPARE stmt13 FROM @sql_batch; EXECUTE stmt13; DEALLOCATE PREPARE stmt13;

SET @status_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'nba_db' AND TABLE_NAME = 'students' AND COLUMN_NAME = 'student_status');
SET @sql_status = IF(@status_exists = 0, 'ALTER TABLE students ADD COLUMN student_status ENUM(\'Active\', \'Graduated\', \'Dropped\') DEFAULT \'Active\' AFTER batch_year', 'SELECT "student_status already exists"');
PREPARE stmt14 FROM @sql_status; EXECUTE stmt14; DEALLOCATE PREPARE stmt14;

SET @email_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'nba_db' AND TABLE_NAME = 'students' AND COLUMN_NAME = 'email');
SET @sql_email = IF(@email_exists = 0, 'ALTER TABLE students ADD COLUMN email VARCHAR(100) AFTER student_status', 'SELECT "email already exists"');
PREPARE stmt15 FROM @sql_email; EXECUTE stmt15; DEALLOCATE PREPARE stmt15;

SET @phone_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'nba_db' AND TABLE_NAME = 'students' AND COLUMN_NAME = 'phone');
SET @sql_phone = IF(@phone_exists = 0, 'ALTER TABLE students ADD COLUMN phone VARCHAR(15) AFTER email', 'SELECT "phone already exists"');
PREPARE stmt16 FROM @sql_phone; EXECUTE stmt16; DEALLOCATE PREPARE stmt16;

-- Add indexes and new foreign key (Conditional)
SET @fk_students_dept_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = 'nba_db' AND TABLE_NAME = 'students' AND CONSTRAINT_NAME = 'fk_students_dept');
SET @sql_fk = IF(@fk_students_dept_exists = 0, 'ALTER TABLE students ADD INDEX idx_students_dept (department_id), ADD CONSTRAINT fk_students_dept FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE', 'SELECT "FK fk_students_dept already exists"');
PREPARE stmt17 FROM @sql_fk; EXECUTE stmt17; DEALLOCATE PREPARE stmt17;

-- ============================================
-- STEP 4: Update COURSES table
-- ============================================

-- Rename columns (Conditional)
SET @course_id_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'nba_db' AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'course_id');
SET @sql_course_id = IF(@course_id_exists = 0, 'ALTER TABLE courses CHANGE COLUMN id course_id BIGINT NOT NULL AUTO_INCREMENT', 'SELECT "course_id already exists"');
PREPARE stmt18 FROM @sql_course_id; EXECUTE stmt18; DEALLOCATE PREPARE stmt18;

SET @course_name_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'nba_db' AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'course_name');
SET @sql_course_name = IF(@course_name_exists = 0, 'ALTER TABLE courses CHANGE COLUMN name course_name VARCHAR(255) NOT NULL', 'SELECT "course_name already exists"');
PREPARE stmt19 FROM @sql_course_name; EXECUTE stmt19; DEALLOCATE PREPARE stmt19;

-- Add new columns (Conditional)
SET @course_level_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'nba_db' AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'course_level');
SET @sql_course_level = IF(@course_level_exists = 0, 'ALTER TABLE courses ADD COLUMN course_level ENUM(\'Undergraduate\', \'Postgraduate\') DEFAULT \'Undergraduate\' AFTER course_type', 'SELECT "course_level already exists"');
PREPARE stmt20 FROM @sql_course_level; EXECUTE stmt20; DEALLOCATE PREPARE stmt20;

SET @is_active_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'nba_db' AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'is_active');
SET @sql_is_active = IF(@is_active_exists = 0, 'ALTER TABLE courses ADD COLUMN is_active TINYINT(1) DEFAULT 1 AFTER course_level', 'SELECT "is_active already exists"');
PREPARE stmt21 FROM @sql_is_active; EXECUTE stmt21; DEALLOCATE PREPARE stmt21;

-- ============================================
-- STEP 5: Update TESTS table
-- ============================================

-- Rename columns (Conditional)
SET @test_id_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'nba_db' AND TABLE_NAME = 'tests' AND COLUMN_NAME = 'test_id');
SET @sql_test_id = IF(@test_id_exists = 0, 'ALTER TABLE tests CHANGE COLUMN id test_id BIGINT NOT NULL AUTO_INCREMENT', 'SELECT "test_id already exists"');
PREPARE stmt22 FROM @sql_test_id; EXECUTE stmt22; DEALLOCATE PREPARE stmt22;

SET @test_name_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'nba_db' AND TABLE_NAME = 'tests' AND COLUMN_NAME = 'test_name');
SET @sql_test_name = IF(@test_name_exists = 0, 'ALTER TABLE tests CHANGE COLUMN name test_name VARCHAR(100) NOT NULL', 'SELECT "test_name already exists"');
PREPARE stmt23 FROM @sql_test_name; EXECUTE stmt23; DEALLOCATE PREPARE stmt23;

-- Add new columns (Conditional)
SET @test_type_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'nba_db' AND TABLE_NAME = 'tests' AND COLUMN_NAME = 'test_type');
SET @sql_test_type = IF(@test_type_exists = 0, 'ALTER TABLE tests ADD COLUMN test_type ENUM(\'Mid Sem\', \'End Sem\', \'Assignment\', \'Quiz\') AFTER test_name', 'SELECT "test_type already exists"');
PREPARE stmt24 FROM @sql_test_type; EXECUTE stmt24; DEALLOCATE PREPARE stmt24;

SET @test_date_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'nba_db' AND TABLE_NAME = 'tests' AND COLUMN_NAME = 'test_date');
SET @sql_test_date = IF(@test_date_exists = 0, 'ALTER TABLE tests ADD COLUMN test_date DATE AFTER test_type', 'SELECT "test_date already exists"');
PREPARE stmt25 FROM @sql_test_date; EXECUTE stmt25; DEALLOCATE PREPARE stmt25;

SET @max_marks_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'nba_db' AND TABLE_NAME = 'tests' AND COLUMN_NAME = 'max_marks');
SET @sql_max_marks = IF(@max_marks_exists = 0, 'ALTER TABLE tests ADD COLUMN max_marks DECIMAL(5,2) AFTER test_date', 'SELECT "max_marks already exists"');
PREPARE stmt26 FROM @sql_max_marks; EXECUTE stmt26; DEALLOCATE PREPARE stmt26;

SET @weightage_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'nba_db' AND TABLE_NAME = 'tests' AND COLUMN_NAME = 'weightage');
SET @sql_weightage = IF(@weightage_exists = 0, 'ALTER TABLE tests ADD COLUMN weightage DECIMAL(5,2) AFTER max_marks', 'SELECT "weightage already exists"');
PREPARE stmt27 FROM @sql_weightage; EXECUTE stmt27; DEALLOCATE PREPARE stmt27;

-- ============================================
-- STEP 6: Update QUESTIONS table
-- ============================================

-- Rename columns (Conditional)
SET @question_id_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'nba_db' AND TABLE_NAME = 'questions' AND COLUMN_NAME = 'question_id');
SET @sql_question_id = IF(@question_id_exists = 0, 'ALTER TABLE questions CHANGE COLUMN id question_id BIGINT NOT NULL AUTO_INCREMENT', 'SELECT "question_id already exists"');
PREPARE stmt28 FROM @sql_question_id; EXECUTE stmt28; DEALLOCATE PREPARE stmt28;

-- ============================================
-- STEP 7: Update ENROLLMENTS table
-- ============================================

-- Rename columns (Conditional)
SET @enrollment_id_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'nba_db' AND TABLE_NAME = 'enrollments' AND COLUMN_NAME = 'enrollment_id');
SET @sql_enrollment_id = IF(@enrollment_id_exists = 0, 'ALTER TABLE enrollments CHANGE COLUMN id enrollment_id BIGINT NOT NULL AUTO_INCREMENT', 'SELECT "enrollment_id already exists"');
PREPARE stmt29 FROM @sql_enrollment_id; EXECUTE stmt29; DEALLOCATE PREPARE stmt29;

-- Add new columns (Conditional)
SET @enrollment_status_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'nba_db' AND TABLE_NAME = 'enrollments' AND COLUMN_NAME = 'enrollment_status');
SET @sql_enrollment_status = IF(@enrollment_status_exists = 0, 'ALTER TABLE enrollments ADD COLUMN enrollment_status ENUM(\'Enrolled\', \'Dropped\', \'Completed\') DEFAULT \'Enrolled\' AFTER course_id', 'SELECT "enrollment_status already exists"');
PREPARE stmt30 FROM @sql_enrollment_status; EXECUTE stmt30; DEALLOCATE PREPARE stmt30;

SET @enrolled_date_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'nba_db' AND TABLE_NAME = 'enrollments' AND COLUMN_NAME = 'enrolled_date');
SET @sql_enrolled_date = IF(@enrolled_date_exists = 0, 'ALTER TABLE enrollments ADD COLUMN enrolled_date DATE DEFAULT (CURRENT_DATE) AFTER enrollment_status', 'SELECT "enrolled_date already exists"');
PREPARE stmt31 FROM @sql_enrolled_date; EXECUTE stmt31; DEALLOCATE PREPARE stmt31;

-- ============================================
-- STEP 8: Update RAW_MARKS table
-- ============================================

-- Rename columns (Conditional)
SET @marks_obtained_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'nba_db' AND TABLE_NAME = 'raw_marks' AND COLUMN_NAME = 'marks_obtained');
SET @sql_marks_obtained = IF(@marks_obtained_exists = 0, 'ALTER TABLE raw_marks CHANGE COLUMN marks marks_obtained DECIMAL(5,2)', 'SELECT "marks_obtained already exists"');
PREPARE stmt32 FROM @sql_marks_obtained; EXECUTE stmt32; DEALLOCATE PREPARE stmt32;

-- ============================================
-- STEP 9: Update MARKS table
-- ============================================

-- Rename columns (Conditional)
SET @student_roll_no_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'nba_db' AND TABLE_NAME = 'marks' AND COLUMN_NAME = 'student_roll_no');
SET @sql_student_roll_no = IF(@student_roll_no_exists = 0, 'ALTER TABLE marks CHANGE COLUMN student_id student_roll_no VARCHAR(20) NOT NULL', 'SELECT "student_roll_no already exists"');
PREPARE stmt33 FROM @sql_student_roll_no; EXECUTE stmt33; DEALLOCATE PREPARE stmt33;

-- ============================================
-- STEP 10: Re-enable Foreign Key Checks
-- ============================================
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- STEP 11: Verification Queries
-- ============================================

-- Check table existence
SELECT 'Tables renamed successfully' AS status;
SHOW TABLES;

-- Check row counts
SELECT 
    (SELECT COUNT(*) FROM students) AS students_count,
    (SELECT COUNT(*) FROM courses) AS courses_count,
    (SELECT COUNT(*) FROM tests) AS tests_count,
    (SELECT COUNT(*) FROM questions) AS questions_count,
    (SELECT COUNT(*) FROM enrollments) AS enrollments_count,
    (SELECT COUNT(*) FROM raw_marks) AS raw_marks_count;

-- Verify foreign keys still work
SELECT 
    s.roll_no, 
    s.student_name, 
    d.department_name
FROM students s
JOIN departments d ON s.department_id = d.department_id
LIMIT 5;

SELECT 
    c.course_id,
    c.course_name,
    COUNT(t.test_id) AS test_count
FROM courses c
LEFT JOIN tests t ON c.course_id = t.course_id
GROUP BY c.course_id
LIMIT 5;

COMMIT;

-- ============================================
-- Post-Migration Manual Checks
-- ============================================
-- 1. Verify all table names are updated
-- 2. Verify all column names are correct
-- 3. Check foreign key relationships
-- 4. Validate data integrity
-- 5. Test API endpoints
-- 6. Check application logs for errors
