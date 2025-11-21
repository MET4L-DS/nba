-- Migration: Add Attainment Configuration Support
-- Date: 2025
-- Description: Adds attainment_scale table and threshold columns to course table

-- Add CO and passing thresholds to course table
ALTER TABLE `course`
ADD COLUMN `co_threshold` DECIMAL(5, 2) DEFAULT 40.00 CHECK (`co_threshold` >= 0 AND `co_threshold` <= 100),
ADD COLUMN `passing_threshold` DECIMAL(5, 2) DEFAULT 60.00 CHECK (`passing_threshold` >= 0 AND `passing_threshold` <= 100);

-- Create attainment_scale table for storing level-percentage mappings
CREATE TABLE IF NOT EXISTS `attainment_scale` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `course_id` BIGINT NOT NULL,
    `level` SMALLINT NOT NULL CHECK (`level` >= 0 AND `level` <= 10),
    `min_percentage` DECIMAL(5, 2) NOT NULL CHECK (`min_percentage` >= 0 AND `min_percentage` <= 100),
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_course_level` (`course_id`, `level`),
    INDEX `idx_course_id` (`course_id`),
    CONSTRAINT `fk_attainment_course` 
        FOREIGN KEY (`course_id`) 
        REFERENCES `course`(`id`) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Note: Level 0 is calculated automatically (from lowest threshold to 0%)
-- and should not be stored in the database.

-- Example: Insert default attainment scales for existing courses
-- Uncomment and run if you want to set default scales for all courses:
-- INSERT INTO `attainment_scale` (`course_id`, `level`, `min_percentage`)
-- SELECT id, 3, 70.00 FROM course UNION ALL
-- SELECT id, 2, 60.00 FROM course UNION ALL
-- SELECT id, 1, 50.00 FROM course;
