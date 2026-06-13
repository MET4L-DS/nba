-- Step 1: Drop foreign key constraints and columns from students and course_offerings
ALTER TABLE `students` DROP FOREIGN KEY `students_ibfk_2`;
ALTER TABLE `students` DROP COLUMN `batch_id`;

ALTER TABLE `course_offerings` DROP FOREIGN KEY `course_offerings_ibfk_2`;
ALTER TABLE `course_offerings` DROP COLUMN `programme_batch_id`;

-- Step 2: Add is_repeater to enrollments
ALTER TABLE `enrollments` ADD COLUMN `is_repeater` BOOLEAN DEFAULT FALSE;
