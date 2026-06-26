-- Combined Migration Script for Hosting PC
-- This script contains all recent schema changes including architectural upgrades, 
-- cohort-based snapshots, and the job queue.

-- 1. Drop foreign key constraints and columns from students and course_offerings
ALTER TABLE `students` DROP FOREIGN KEY `students_ibfk_2`;
ALTER TABLE `students` DROP COLUMN `batch_id`;

ALTER TABLE `course_offerings` DROP FOREIGN KEY `course_offerings_ibfk_2`;
ALTER TABLE `course_offerings` DROP COLUMN `programme_batch_id`;

-- 2. Add is_repeater to enrollments (if not already added)
ALTER TABLE `enrollments` ADD COLUMN `is_repeater` BOOLEAN DEFAULT FALSE;

-- 3. Drop existing snapshot tables (Data loss is acceptable as these are regenerated snapshots)
DROP TABLE IF EXISTS offering_po_attainment;
DROP TABLE IF EXISTS offering_co_attainment;
DROP TABLE IF EXISTS offering_po_attainment_snapshots;
DROP TABLE IF EXISTS offering_co_attainment_snapshots;

-- 4. Create the granular CO attainment snapshots table
CREATE TABLE offering_co_attainment_snapshots (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    offering_id BIGINT NOT NULL,
    programme_id INT NULL,        -- NULL means 'All Programmes' combined
    is_repeater BOOLEAN NULL,        -- NULL means 'All Students', TRUE means 'Repeaters Only', FALSE means 'Regular Only'
    co_number INT NOT NULL,
    co_name VARCHAR(10) NOT NULL,
    attainment_percentage DECIMAL(5,2),
    attainment_level DECIMAL(5,2),
    indirect_attainment_percentage DECIMAL(5,2),
    indirect_attainment_level DECIMAL(5,2),
    final_attainment_percentage DECIMAL(5,2),
    final_attainment_level DECIMAL(5,2),
    UNIQUE KEY unique_snapshot_co (offering_id, programme_id, is_repeater, co_number),
    FOREIGN KEY (offering_id) REFERENCES course_offerings(offering_id) ON DELETE CASCADE,
    FOREIGN KEY (programme_id) REFERENCES programmes(programme_id) ON DELETE CASCADE
);

-- 5. Create the granular PO attainment snapshots table
CREATE TABLE offering_po_attainment_snapshots (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    offering_id BIGINT NOT NULL,
    programme_id INT NULL,
    is_repeater BOOLEAN NULL,
    po_name VARCHAR(10) NOT NULL,
    attainment_value DECIMAL(5,2) NULL,
    direct_attainment_value DECIMAL(5,2) NULL,
    indirect_attainment_value DECIMAL(5,2) NULL,
    final_attainment_value DECIMAL(5,2) NULL,
    UNIQUE KEY unique_snapshot_po (offering_id, programme_id, is_repeater, po_name),
    FOREIGN KEY (offering_id) REFERENCES course_offerings(offering_id) ON DELETE CASCADE,
    FOREIGN KEY (programme_id) REFERENCES programmes(programme_id) ON DELETE CASCADE
);

-- 6. Create Job Queue for async processing
CREATE TABLE IF NOT EXISTS attainment_jobs (
    job_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    offering_id BIGINT NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    error_message TEXT NULL,
    FOREIGN KEY (offering_id) REFERENCES course_offerings(offering_id) ON DELETE CASCADE
);

-- 7. Heuristically mark historical repeaters in enrollments
-- For each course offering and programme, we find the most common batch_year (mode).
-- Any student enrolled in that course offering with an admission batch_year strictly 
-- less than that mode is identified and updated as a repeater (is_repeater = TRUE).
UPDATE enrollments e
JOIN students s ON e.student_rollno = s.roll_no
JOIN (
    SELECT offering_id, programme_id, batch_year as regular_batch_year
    FROM (
        SELECT 
            e2.offering_id,
            s2.programme_id,
            s2.batch_year,
            ROW_NUMBER() OVER (
                PARTITION BY e2.offering_id, s2.programme_id 
                ORDER BY COUNT(*) DESC, s2.batch_year DESC
            ) as rn
        FROM enrollments e2
        JOIN students s2 ON e2.student_rollno = s2.roll_no
        WHERE s2.batch_year IS NOT NULL
        GROUP BY e2.offering_id, s2.programme_id, s2.batch_year
    ) t
    WHERE rn = 1
) rc ON e.offering_id = rc.offering_id AND s.programme_id = rc.programme_id
SET e.is_repeater = TRUE
WHERE s.batch_year < rc.regular_batch_year;

