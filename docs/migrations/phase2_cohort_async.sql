-- Migration for Phase 2: Cohort Isolation and Async Background Processing

-- 1. Drop existing snapshot tables (Data loss is acceptable as these are regenerated snapshots)
DROP TABLE IF EXISTS offering_po_attainment;
DROP TABLE IF EXISTS offering_co_attainment;

-- 2. Create the granular CO attainment snapshots table
CREATE TABLE offering_co_attainment_snapshots (
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
    PRIMARY KEY (offering_id, programme_id, is_repeater, co_number),
    FOREIGN KEY (offering_id) REFERENCES course_offerings(offering_id) ON DELETE CASCADE,
    FOREIGN KEY (programme_id) REFERENCES programmes(programme_id) ON DELETE CASCADE
);

-- 3. Create the granular PO attainment snapshots table
CREATE TABLE offering_po_attainment_snapshots (
    offering_id BIGINT NOT NULL,
    programme_id INT NULL,
    is_repeater BOOLEAN NULL,
    po_name VARCHAR(10) NOT NULL,
    attainment_value DECIMAL(5,2) NULL,
    direct_attainment_value DECIMAL(5,2) NULL,
    indirect_attainment_value DECIMAL(5,2) NULL,
    final_attainment_value DECIMAL(5,2) NULL,
    PRIMARY KEY (offering_id, programme_id, is_repeater, po_name),
    FOREIGN KEY (offering_id) REFERENCES course_offerings(offering_id) ON DELETE CASCADE,
    FOREIGN KEY (programme_id) REFERENCES programmes(programme_id) ON DELETE CASCADE
);

-- 4. Create Job Queue for async processing
CREATE TABLE attainment_jobs (
    job_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    offering_id BIGINT NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    error_message TEXT NULL,
    FOREIGN KEY (offering_id) REFERENCES course_offerings(offering_id) ON DELETE CASCADE
);
