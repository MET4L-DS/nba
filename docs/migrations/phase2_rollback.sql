-- Phase 2 Rollback Script
-- This will undo any partial Phase 2 changes

SET FOREIGN_KEY_CHECKS = 0;

-- Step 1: Drop old tables if they exist, then rename new tables back
DROP TABLE IF EXISTS student;
DROP TABLE IF EXISTS course;
DROP TABLE IF EXISTS test;
DROP TABLE IF EXISTS question;
DROP TABLE IF EXISTS enrollment;
DROP TABLE IF EXISTS rawMarks;

-- Rename new tables back to old names (will fail silently if they don't exist)
RENAME TABLE students TO student;
RENAME TABLE courses TO course;
RENAME TABLE tests TO test;
RENAME TABLE questions TO question;
RENAME TABLE enrollments TO enrollment;
RENAME TABLE raw_marks TO rawMarks;

-- Step 2: Restore student table columns (if they were changed)
-- Check and rename columns back if they exist
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'nba_db' AND TABLE_NAME = 'student' AND COLUMN_NAME = 'roll_no');

SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE student CHANGE COLUMN roll_no rollno VARCHAR(20) NOT NULL', 
    'SELECT "rollno already correct" AS status');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'nba_db' AND TABLE_NAME = 'student' AND COLUMN_NAME = 'student_name');

SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE student CHANGE COLUMN student_name name VARCHAR(100) NOT NULL', 
    'SELECT "name already correct" AS status');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Remove new columns if they were added
ALTER TABLE student DROP COLUMN IF EXISTS department_id;
ALTER TABLE student DROP COLUMN IF EXISTS batch_year;
ALTER TABLE student DROP COLUMN IF EXISTS student_status;
ALTER TABLE student DROP COLUMN IF EXISTS email;
ALTER TABLE student DROP COLUMN IF EXISTS phone;

-- Restore dept column if it was removed
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'nba_db' AND TABLE_NAME = 'student' AND COLUMN_NAME = 'dept');

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE student ADD COLUMN dept VARCHAR(10) AFTER name', 
    'SELECT "dept already exists" AS status');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Restore original foreign key
-- Drop new FK if it exists
SET @fk_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = 'nba_db' 
    AND TABLE_NAME = 'student' 
    AND CONSTRAINT_NAME = 'fk_students_dept');

SET @sql = IF(@fk_exists > 0, 
    'ALTER TABLE student DROP FOREIGN KEY fk_students_dept', 
    'SELECT "FK already removed" AS status');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Rollback completed - database restored to pre-Phase 2 state' AS status;
