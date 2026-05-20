-- =============================================
-- MIGRATION 012: Programme Batches + Schema Cleanup
-- Version: 1.0
-- Date: May 20, 2026
-- =============================================

USE `nba_db`;

-- =============================================
-- STEP 1: CREATE programme_batches table
-- =============================================
CREATE TABLE IF NOT EXISTS `programme_batches` (
  `batch_id`       INT AUTO_INCREMENT PRIMARY KEY,
  `programme_id`   INT NOT NULL,
  `batch_year`     INT NOT NULL,
  `coordinator_id` INT DEFAULT NULL,
  `status`         ENUM('upcoming','active','completed') DEFAULT 'upcoming',
  `start_date`     DATE DEFAULT NULL,
  `end_date`       DATE DEFAULT NULL,
  `created_at`     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_programme_batch` (`programme_id`, `batch_year`),
  KEY `idx_pb_programme` (`programme_id`),
  KEY `idx_pb_coordinator` (`coordinator_id`),
  CONSTRAINT `programme_batches_ibfk_1` FOREIGN KEY (`programme_id`) REFERENCES `programmes` (`programme_id`) ON DELETE CASCADE,
  CONSTRAINT `programme_batches_ibfk_2` FOREIGN KEY (`coordinator_id`) REFERENCES `users` (`employee_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- STEP 2: ADD batch_id columns (nullable initially)
-- =============================================

-- 2a. students
ALTER TABLE `students`
  ADD COLUMN `batch_id` INT DEFAULT NULL AFTER `programme_id`,
  ADD KEY `idx_students_batch` (`batch_id`),
  ADD CONSTRAINT `students_ibfk_2` FOREIGN KEY (`batch_id`) REFERENCES `programme_batches` (`batch_id`) ON DELETE SET NULL;

-- 2b. course_offerings
ALTER TABLE `course_offerings`
  ADD COLUMN `programme_batch_id` INT DEFAULT NULL AFTER `course_id`,
  ADD KEY `idx_co_batch` (`programme_batch_id`),
  ADD CONSTRAINT `course_offerings_ibfk_2` FOREIGN KEY (`programme_batch_id`) REFERENCES `programme_batches` (`batch_id`) ON DELETE SET NULL;

-- 2c. programme_batch_attainments
ALTER TABLE `programme_batch_attainments`
  ADD COLUMN `batch_id` INT DEFAULT NULL AFTER `programme_id`,
  ADD KEY `idx_pba_batch` (`batch_id`),
  ADD CONSTRAINT `programme_batch_attainments_ibfk_2` FOREIGN KEY (`batch_id`) REFERENCES `programme_batches` (`batch_id`) ON DELETE CASCADE;

-- 2d. action_plans
ALTER TABLE `action_plans`
  ADD COLUMN `batch_id` INT DEFAULT NULL AFTER `programme_id`,
  ADD KEY `idx_ap_batch` (`batch_id`),
  ADD CONSTRAINT `action_plans_ibfk_4` FOREIGN KEY (`batch_id`) REFERENCES `programme_batches` (`batch_id`) ON DELETE SET NULL;

-- 2e. stakeholder_surveys
ALTER TABLE `stakeholder_surveys`
  ADD COLUMN `batch_id` INT DEFAULT NULL AFTER `programme_id`,
  ADD KEY `idx_ss_batch` (`batch_id`),
  ADD CONSTRAINT `stakeholder_surveys_ibfk_2` FOREIGN KEY (`batch_id`) REFERENCES `programme_batches` (`batch_id`) ON DELETE CASCADE;

-- =============================================
-- STEP 3: Populate programme_batches from students
-- =============================================
INSERT INTO `programme_batches` (`programme_id`, `batch_year`, `status`)
SELECT DISTINCT `programme_id`, `batch_year`, 'active'
FROM `students`
WHERE `batch_year` IS NOT NULL
  AND (`programme_id`, `batch_year`) NOT IN (
    SELECT `programme_id`, `batch_year` FROM `programme_batches`
  );

-- =============================================
-- STEP 4: Link existing records to their batch_id
-- =============================================

-- 4a. students
UPDATE `students` s
  JOIN `programme_batches` pb ON s.`programme_id` = pb.`programme_id` AND s.`batch_year` = pb.`batch_year`
  SET s.`batch_id` = pb.`batch_id`;

-- 4b. stakeholder_surveys
UPDATE `stakeholder_surveys` ss
  JOIN `programme_batches` pb ON ss.`programme_id` = pb.`programme_id` AND ss.`batch_year` = pb.`batch_year`
  SET ss.`batch_id` = pb.`batch_id`;

-- 4c. programme_batch_attainments
UPDATE `programme_batch_attainments` pba
  JOIN `programme_batches` pb ON pba.`programme_id` = pb.`programme_id` AND pba.`batch_year` = pb.`batch_year`
  SET pba.`batch_id` = pb.`batch_id`;

-- 4d. action_plans
UPDATE `action_plans` ap
  JOIN `programme_batches` pb ON ap.`programme_id` = pb.`programme_id` AND ap.`batch_year` = pb.`batch_year`
  SET ap.`batch_id` = pb.`batch_id`;
