-- nba-met4l: Complete Test Data Seed for Multi-Cohort Attainment Verification
-- This script provides a comprehensive dataset to test the new Phase 2 async attainment infrastructure.
-- It creates a department, faculty, two programmes (B.Tech & M.Tech), a course, course offering,
-- tests, students, enrollments (including repeaters), raw marks, and course survey data.

-- Note: We use specific high-range IDs (e.g., 999xx) to prevent collision with your existing data.

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Create a Test Department
INSERT IGNORE INTO `departments` (`department_id`, `school_id`, `department_code`, `department_name`, `description`) 
VALUES (999, 1, 'TEST-CSE', 'Test Computer Science', 'Department for testing cohort features');

-- 2. Create a Test Faculty
INSERT IGNORE INTO `users` (`employee_id`, `username`, `email`, `password_hash`, `role`, `department_id`, `designation`) 
VALUES (9990001, 'Dr. Test Faculty', 'test_faculty@tezu.ac.in', '$2y$10$Hcol8QcUPcwvAEDxXbEe/.aYPKmhwGloLSPoD6JKbZ4f8FYC82b7q', 'faculty', 999, 'Professor');

-- 3. Create Test Programmes (B.Tech and M.Tech)
INSERT IGNORE INTO `programmes` (`programme_id`, `department_id`, `programme_code`, `programme_name`, `degree_level`, `duration_years`) 
VALUES 
(998, 999, 'BTECH-TEST', 'B.Tech in Test Engineering', 'UG', 4),
(999, 999, 'MTECH-TEST', 'M.Tech in Test Engineering', 'PG', 2);

-- 4. Create a Test Course
INSERT IGNORE INTO `courses` (`course_id`, `course_code`, `department_id`, `course_name`, `course_type`, `course_level`, `credit`, `is_active`) 
VALUES (9990, 'CS999', 999, 'Advanced Testing Methodologies', 'Theory', 'UG & PG', 4, 1);

-- 5. Create a Course Offering (2024 Autumn)
INSERT IGNORE INTO `course_offerings` (`offering_id`, `course_id`, `year`, `semester`, `co_threshold`, `passing_threshold`, `direct_weightage`, `indirect_weightage`) 
VALUES (99901, 9990, 2024, 'Autumn', 40.00, 60.00, 80.00, 20.00);

-- 6. Assign Faculty to Offering
INSERT IGNORE INTO `course_faculty_assignments` (`id`, `offering_id`, `employee_id`, `assignment_type`, `assigned_date`, `is_active`) 
VALUES (999001, 99901, 9990001, 'Primary', '2024-08-01', 1);

-- 7. Define Attainment Scale (Level 1: 50%, Level 2: 60%, Level 3: 70%)
INSERT IGNORE INTO `attainment_scale` (`id`, `offering_id`, `level`, `min_percentage`) VALUES 
(99901, 99901, 1, 50.00),
(99902, 99901, 2, 60.00),
(99903, 99901, 3, 70.00);

-- 8. Define CO-PO Mapping
INSERT IGNORE INTO `co_po_mapping` (`id`, `offering_id`, `co_number`, `po_name`, `value`) VALUES 
(99901, 99901, 1, 'PO1', 3), (99902, 99901, 1, 'PO2', 2),
(99903, 99901, 2, 'PO2', 3), (99904, 99901, 2, 'PO3', 2),
(99905, 99901, 3, 'PO3', 3), (99906, 99901, 3, 'PO4', 1),
(99907, 99901, 4, 'PO4', 2), (99908, 99901, 4, 'PO5', 3);

-- 9. Create Students (5 B.Tech, 5 M.Tech)
INSERT IGNORE INTO `students` (`roll_no`, `student_name`, `programme_id`, `batch_year`, `student_status`) VALUES 
('TESTB001', 'Alice (BTech Reg)', 998, 2022, 'Active'),
('TESTB002', 'Bob (BTech Reg)', 998, 2022, 'Active'),
('TESTB003', 'Charlie (BTech Reg)', 998, 2022, 'Active'),
('TESTB004', 'Dave (BTech Rep)', 998, 2021, 'Active'),
('TESTB005', 'Eve (BTech Rep)', 998, 2021, 'Active'),
('TESTM001', 'Frank (MTech Reg)', 999, 2023, 'Active'),
('TESTM002', 'Grace (MTech Reg)', 999, 2023, 'Active'),
('TESTM003', 'Heidi (MTech Reg)', 999, 2023, 'Active'),
('TESTM004', 'Ivan (MTech Rep)', 999, 2022, 'Active'),
('TESTM005', 'Judy (MTech Rep)', 999, 2022, 'Active');

-- 10. Enroll Students into the Course Offering (Notice the is_repeater flag)
INSERT IGNORE INTO `enrollments` (`enrollment_id`, `offering_id`, `enrollment_status`, `student_rollno`, `is_repeater`) VALUES 
(99901, 99901, 'Completed', 'TESTB001', 0),
(99902, 99901, 'Completed', 'TESTB002', 0),
(99903, 99901, 'Completed', 'TESTB003', 0),
(99904, 99901, 'Completed', 'TESTB004', 1),
(99905, 99901, 'Completed', 'TESTB005', 1),
(99906, 99901, 'Completed', 'TESTM001', 0),
(99907, 99901, 'Completed', 'TESTM002', 0),
(99908, 99901, 'Completed', 'TESTM003', 0),
(99909, 99901, 'Completed', 'TESTM004', 1),
(99910, 99901, 'Completed', 'TESTM005', 1);

-- 11. Create Tests (Mid Sem and End Sem)
INSERT IGNORE INTO `tests` (`test_id`, `offering_id`, `test_name`, `test_type`, `test_date`, `weightage`, `full_marks`, `pass_marks`) VALUES 
(99901, 99901, 'Mid Sem Exam', 'Mid Sem', '2024-10-15', 30.00, 30, 12),
(99902, 99901, 'End Sem Exam', 'End Sem', '2024-12-10', 70.00, 70, 28);

-- 12. Create Questions (Mapped to COs)
INSERT IGNORE INTO `questions` (`question_id`, `test_id`, `question_number`, `co`, `max_marks`) VALUES 
-- Mid Sem: 30 marks total
(999001, 99901, 1, 1, 10.00), -- Q1 (CO1) = 10m
(999002, 99901, 2, 2, 10.00), -- Q2 (CO2) = 10m
(999003, 99901, 3, 3, 10.00), -- Q3 (CO3) = 10m
-- End Sem: 70 marks total
(999004, 99902, 1, 1, 10.00), -- Q1 (CO1) = 10m
(999005, 99902, 2, 2, 10.00), -- Q2 (CO2) = 10m
(999006, 99902, 3, 3, 15.00), -- Q3 (CO3) = 15m
(999007, 99902, 4, 4, 35.00); -- Q4 (CO4) = 35m

-- 13. Insert Raw Marks & Aggregated Marks
-- (For brevity, we directly insert the aggregated marks into `marks` table as the backend reads from here for CO computation)
INSERT IGNORE INTO `marks` (`id`, `student_roll_no`, `test_id`, `co_number`, `marks_obtained`) VALUES 
-- BTech Regulars (High Performers)
(999001, 'TESTB001', 99901, 1, 8.0), (999002, 'TESTB001', 99901, 2, 9.0), (999003, 'TESTB001', 99901, 3, 7.0),
(999004, 'TESTB001', 99902, 1, 8.0), (999005, 'TESTB001', 99902, 2, 9.0), (999006, 'TESTB001', 99902, 3, 12.0), (999007, 'TESTB001', 99902, 4, 30.0),

(999011, 'TESTB002', 99901, 1, 7.0), (999012, 'TESTB002', 99901, 2, 8.0), (999013, 'TESTB002', 99901, 3, 8.0),
(999014, 'TESTB002', 99902, 1, 7.0), (999015, 'TESTB002', 99902, 2, 8.0), (999016, 'TESTB002', 99902, 3, 11.0), (999017, 'TESTB002', 99902, 4, 28.0),

(999021, 'TESTB003', 99901, 1, 9.0), (999022, 'TESTB003', 99901, 2, 7.0), (999023, 'TESTB003', 99901, 3, 9.0),
(999024, 'TESTB003', 99902, 1, 9.0), (999025, 'TESTB003', 99902, 2, 7.0), (999026, 'TESTB003', 99902, 3, 13.0), (999027, 'TESTB003', 99902, 4, 32.0),

-- BTech Repeaters (Low/Mixed Performers)
(999031, 'TESTB004', 99901, 1, 4.0), (999032, 'TESTB004', 99901, 2, 5.0), (999033, 'TESTB004', 99901, 3, 4.0),
(999034, 'TESTB004', 99902, 1, 4.0), (999035, 'TESTB004', 99902, 2, 5.0), (999036, 'TESTB004', 99902, 3, 6.0), (999037, 'TESTB004', 99902, 4, 15.0),

(999041, 'TESTB005', 99901, 1, 5.0), (999042, 'TESTB005', 99901, 2, 4.0), (999043, 'TESTB005', 99901, 3, 5.0),
(999044, 'TESTB005', 99902, 1, 5.0), (999045, 'TESTB005', 99902, 2, 4.0), (999046, 'TESTB005', 99902, 3, 7.0), (999047, 'TESTB005', 99902, 4, 16.0),

-- MTech Regulars (Medium Performers)
(999051, 'TESTM001', 99901, 1, 6.0), (999052, 'TESTM001', 99901, 2, 6.0), (999053, 'TESTM001', 99901, 3, 6.0),
(999054, 'TESTM001', 99902, 1, 6.0), (999055, 'TESTM001', 99902, 2, 6.0), (999056, 'TESTM001', 99902, 3, 9.0), (999057, 'TESTM001', 99902, 4, 21.0),

(999061, 'TESTM002', 99901, 1, 6.5), (999062, 'TESTM002', 99901, 2, 5.5), (999063, 'TESTM002', 99901, 3, 6.5),
(999064, 'TESTM002', 99902, 1, 6.5), (999065, 'TESTM002', 99902, 2, 5.5), (999066, 'TESTM002', 99902, 3, 9.5), (999067, 'TESTM002', 99902, 4, 22.0),

(999071, 'TESTM003', 99901, 1, 5.5), (999072, 'TESTM003', 99901, 2, 6.5), (999073, 'TESTM003', 99901, 3, 5.5),
(999074, 'TESTM003', 99902, 1, 5.5), (999075, 'TESTM003', 99902, 2, 6.5), (999076, 'TESTM003', 99902, 3, 8.5), (999077, 'TESTM003', 99902, 4, 20.0),

-- MTech Repeaters (Very Low Performers)
(999081, 'TESTM004', 99901, 1, 3.0), (999082, 'TESTM004', 99901, 2, 3.0), (999083, 'TESTM004', 99901, 3, 3.0),
(999084, 'TESTM004', 99902, 1, 3.0), (999085, 'TESTM004', 99902, 2, 3.0), (999086, 'TESTM004', 99902, 3, 4.0), (999087, 'TESTM004', 99902, 4, 10.0),

(999091, 'TESTM005', 99901, 1, 2.0), (999092, 'TESTM005', 99901, 2, 2.0), (999093, 'TESTM005', 99901, 3, 2.0),
(999094, 'TESTM005', 99902, 1, 2.0), (999095, 'TESTM005', 99902, 2, 2.0), (999096, 'TESTM005', 99902, 3, 3.0), (999097, 'TESTM005', 99902, 4, 8.0);


-- 14. Add Course Survey & Responses for Indirect Attainment
INSERT IGNORE INTO `course_surveys` (`survey_id`, `offering_id`, `title`) VALUES (99901, 99901, 'Course Exit Survey 2024');

-- Map Survey Questions to COs
INSERT IGNORE INTO `course_survey_questions` (`question_id`, `survey_id`, `question_number`, `question_text`, `co_number`, `mapping_weight`) VALUES 
(99901, 99901, 1, 'Did you understand CO1?', 1, 1.00),
(99902, 99901, 2, 'Did you understand CO2?', 2, 1.00),
(99903, 99901, 3, 'Did you understand CO3?', 3, 1.00),
(99904, 99901, 4, 'Did you understand CO4?', 4, 1.00);

-- Insert dummy responses for the survey
INSERT IGNORE INTO `course_survey_responses` (`id`, `survey_id`, `student_rollno`, `question_id`, `likert_rating`) VALUES
(999001, 99901, 'TESTB001', 99901, 5), (999002, 99901, 'TESTB001', 99902, 4), (999003, 99901, 'TESTB001', 99903, 5), (999004, 99901, 'TESTB001', 99904, 4),
(999005, 99901, 'TESTB002', 99901, 4), (999006, 99901, 'TESTB002', 99902, 4), (999007, 99901, 'TESTB002', 99903, 4), (999008, 99901, 'TESTB002', 99904, 4),
(999009, 99901, 'TESTM001', 99901, 3), (999010, 99901, 'TESTM001', 99902, 3), (999011, 99901, 'TESTM001', 99903, 3), (999012, 99901, 'TESTM001', 99904, 3);

SET FOREIGN_KEY_CHECKS = 1;
