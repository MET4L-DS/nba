DROP TABLE IF EXISTS offering_po_attainment_snapshots;
DROP TABLE IF EXISTS offering_co_attainment_snapshots;

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
