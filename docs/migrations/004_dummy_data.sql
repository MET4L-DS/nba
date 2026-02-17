-- =============================================
-- DUMMY DATA FOR NBA DATABASE
-- Date: February 18, 2026
-- Purpose: Populate database with sample data for testing
-- =============================================

USE `nba_db`;

-- =============================================
-- STEP 1: Insert Schools
-- =============================================

INSERT INTO `schools` (`school_id`, `school_name`, `school_code`, `is_active`) VALUES
(1, 'School of Engineering', 'SOE', 1),
(2, 'School of Management', 'SOM', 1),
(3, 'School of Sciences', 'SOS', 1);

-- =============================================
-- STEP 2: Insert Departments
-- =============================================

INSERT INTO `departments` (`department_id`, `department_name`, `department_code`, `school_id`, `is_active`) VALUES
(1, 'Computer Science and Engineering', 'CSE', 1, 1),
(2, 'Electronics and Communication Engineering', 'ECE', 1, 1),
(3, 'Mechanical Engineering', 'MECH', 1, 1),
(4, 'Information Technology', 'IT', 1, 1),
(5, 'Business Administration', 'MBA', 2, 1);

-- =============================================
-- STEP 3: Insert Users (password: password123)
-- Note: Password hash is for 'password123' using bcrypt
-- =============================================

INSERT INTO `users` (`employee_id`, `username`, `email`, `password_hash`, `role`, `department_id`, `designation`, `is_active`) VALUES
-- Admin
(1001, 'admin', 'admin@university.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', NULL, 'System Administrator', 1),

-- Deans
(2001, 'dr_sharma', 'sharma@university.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dean', 1, 'Dean of Engineering', 1),
(2002, 'dr_patel', 'patel@university.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dean', 5, 'Dean of Management', 1),

-- HODs
(3001, 'prof_kumar', 'kumar@university.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'HOD', 1, 'Professor', 1),
(3002, 'prof_reddy', 'reddy@university.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'HOD', 2, 'Professor', 1),
(3003, 'prof_singh', 'singh@university.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'HOD', 4, 'Associate Professor', 1),

-- Faculty (CSE)
(4001, 'dr_agarwal', 'agarwal@university.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Faculty', 1, 'Assistant Professor', 1),
(4002, 'dr_verma', 'verma@university.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Faculty', 1, 'Associate Professor', 1),
(4003, 'dr_gupta', 'gupta@university.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Faculty', 1, 'Assistant Professor', 1),
(4004, 'dr_mehta', 'mehta@university.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Faculty', 1, 'Professor', 1),
(4005, 'dr_joshi', 'joshi@university.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Faculty', 1, 'Assistant Professor', 1),

-- Faculty (ECE)
(4006, 'dr_nair', 'nair@university.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Faculty', 2, 'Associate Professor', 1),
(4007, 'dr_rao', 'rao@university.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Faculty', 2, 'Assistant Professor', 1),

-- Faculty (IT)
(4008, 'dr_iyer', 'iyer@university.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Faculty', 4, 'Assistant Professor', 1),
(4009, 'dr_desai', 'desai@university.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Faculty', 4, 'Associate Professor', 1),

-- Staff
(5001, 'staff_cse', 'staffcse@university.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Staff', 1, 'Administrative Staff', 1),
(5002, 'staff_ece', 'staffece@university.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Staff', 2, 'Administrative Staff', 1);

-- =============================================
-- STEP 4: Insert HOD and Dean Assignments
-- =============================================

INSERT INTO `hod_assignments` (`department_id`, `employee_id`, `start_date`, `is_current`) VALUES
(1, 3001, '2025-01-01', 1),  -- Prof Kumar is HOD of CSE
(2, 3002, '2025-01-01', 1),  -- Prof Reddy is HOD of ECE
(4, 3003, '2025-01-01', 1);  -- Prof Singh is HOD of IT

INSERT INTO `dean_assignments` (`school_id`, `employee_id`, `start_date`, `is_current`) VALUES
(1, 2001, '2024-07-01', 1),  -- Dr Sharma is Dean of Engineering
(2, 2002, '2024-07-01', 1);  -- Dr Patel is Dean of Management

-- Update departments with HOD IDs
UPDATE `departments` SET `hod_id` = 3001 WHERE `department_id` = 1;
UPDATE `departments` SET `hod_id` = 3002 WHERE `department_id` = 2;
UPDATE `departments` SET `hod_id` = 3003 WHERE `department_id` = 4;

-- Update schools with Dean IDs
UPDATE `schools` SET `dean_id` = 2001 WHERE `school_id` = 1;
UPDATE `schools` SET `dean_id` = 2002 WHERE `school_id` = 2;

-- =============================================
-- STEP 5: Insert Students
-- =============================================

INSERT INTO `students` (`roll_no`, `student_name`, `email`, `department_id`, `batch_year`, `current_semester`) VALUES
-- CSE Students (Batch 2023 - Currently in Semester 3)
('CSE2023001', 'Rahul Sharma', 'rahul.s@student.edu', 1, 2023, 3),
('CSE2023002', 'Priya Patel', 'priya.p@student.edu', 1, 2023, 3),
('CSE2023003', 'Amit Kumar', 'amit.k@student.edu', 1, 2023, 3),
('CSE2023004', 'Sneha Reddy', 'sneha.r@student.edu', 1, 2023, 3),
('CSE2023005', 'Arjun Singh', 'arjun.s@student.edu', 1, 2023, 3),
('CSE2023006', 'Ananya Iyer', 'ananya.i@student.edu', 1, 2023, 3),
('CSE2023007', 'Vikram Desai', 'vikram.d@student.edu', 1, 2023, 3),
('CSE2023008', 'Neha Gupta', 'neha.g@student.edu', 1, 2023, 3),
('CSE2023009', 'Karan Mehta', 'karan.m@student.edu', 1, 2023, 3),
('CSE2023010', 'Pooja Nair', 'pooja.n@student.edu', 1, 2023, 3),
('CSE2023011', 'Rohan Joshi', 'rohan.j@student.edu', 1, 2023, 3),
('CSE2023012', 'Divya Agarwal', 'divya.a@student.edu', 1, 2023, 3),
('CSE2023013', 'Sahil Verma', 'sahil.v@student.edu', 1, 2023, 3),
('CSE2023014', 'Kavya Rao', 'kavya.r@student.edu', 1, 2023, 3),
('CSE2023015', 'Aditya Chopra', 'aditya.c@student.edu', 1, 2023, 3),

-- ECE Students (Batch 2023)
('ECE2023001', 'Sanjay Kumar', 'sanjay.k@student.edu', 2, 2023, 3),
('ECE2023002', 'Meera Iyer', 'meera.i@student.edu', 2, 2023, 3),
('ECE2023003', 'Rajesh Patel', 'rajesh.p@student.edu', 2, 2023, 3),
('ECE2023004', 'Lakshmi Reddy', 'lakshmi.r@student.edu', 2, 2023, 3),
('ECE2023005', 'Suresh Nair', 'suresh.n@student.edu', 2, 2023, 3),

-- IT Students (Batch 2023)
('IT2023001', 'Deepak Singh', 'deepak.s@student.edu', 4, 2023, 3),
('IT2023002', 'Swati Sharma', 'swati.s@student.edu', 4, 2023, 3),
('IT2023003', 'Manish Gupta', 'manish.g@student.edu', 4, 2023, 3),
('IT2023004', 'Ritu Verma', 'ritu.v@student.edu', 4, 2023, 3),
('IT2023005', 'Nikhil Joshi', 'nikhil.j@student.edu', 4, 2023, 3),

-- CSE Students (Batch 2024 - Currently in Semester 1)
('CSE2024001', 'Aarav Malhotra', 'aarav.m@student.edu', 1, 2024, 1),
('CSE2024002', 'Ishita Bansal', 'ishita.b@student.edu', 1, 2024, 1),
('CSE2024003', 'Vivek Sinha', 'vivek.s@student.edu', 1, 2024, 1),
('CSE2024004', 'Tanvi Kapoor', 'tanvi.k@student.edu', 1, 2024, 1),
('CSE2024005', 'Yash Agarwal', 'yash.a@student.edu', 1, 2024, 1),

-- IT Students (Batch 2024 - Currently in Semester 1)
('IT2024001', 'Aryan Reddy', 'aryan.r@student.edu', 4, 2024, 1),
('IT2024002', 'Shruti Menon', 'shruti.m@student.edu', 4, 2024, 1),
('IT2024003', 'Karthik Nambiar', 'karthik.n@student.edu', 4, 2024, 1),
('IT2024004', 'Priyanka Das', 'priyanka.d@student.edu', 4, 2024, 1),
('IT2024005', 'Rohit Saxena', 'rohit.s@student.edu', 4, 2024, 1);

-- =============================================
-- STEP 6: Insert Courses (Templates)
-- =============================================

INSERT INTO `courses` (`course_id`, `course_code`, `course_name`, `credit`, `department_id`, `course_type`, `course_level`) VALUES
-- CSE Courses
(1, 'CS101', 'Programming Fundamentals', 4, 1, 'Theory', 'Undergraduate'),
(2, 'CS102', 'Data Structures and Algorithms', 4, 1, 'Theory', 'Undergraduate'),
(3, 'CS103', 'Database Management Systems', 4, 1, 'Theory', 'Undergraduate'),
(4, 'CS104', 'Operating Systems', 4, 1, 'Theory', 'Undergraduate'),
(5, 'CS105', 'Computer Networks', 3, 1, 'Theory', 'Undergraduate'),
(6, 'CS106', 'Software Engineering', 3, 1, 'Theory', 'Undergraduate'),
(7, 'CS107', 'Web Technologies', 3, 1, 'Theory', 'Undergraduate'),
(8, 'CS108', 'Machine Learning', 4, 1, 'Theory', 'Undergraduate'),
(9, 'CS201', 'Advanced Algorithms', 4, 1, 'Theory', 'Postgraduate'),
(10, 'CS191', 'Programming Lab', 2, 1, 'Lab', 'Undergraduate'),

-- ECE Courses
(11, 'EC101', 'Digital Electronics', 4, 2, 'Theory', 'Undergraduate'),
(12, 'EC102', 'Signals and Systems', 4, 2, 'Theory', 'Undergraduate'),
(13, 'EC103', 'Electronic Devices', 3, 2, 'Theory', 'Undergraduate'),

-- IT Courses
(14, 'IT101', 'Introduction to IT', 3, 4, 'Theory', 'Undergraduate'),
(15, 'IT102', 'Object Oriented Programming', 4, 4, 'Theory', 'Undergraduate'),
(16, 'IT103', 'Computer Architecture', 3, 4, 'Theory', 'Undergraduate');

-- =============================================
-- STEP 7: Insert Course Offerings
-- =============================================

INSERT INTO `course_offerings` (`offering_id`, `course_id`, `year`, `semester`, `co_threshold`, `passing_threshold`) VALUES
-- Semester 1, 2024 (Current offerings for new batch)
(1, 1, 2024, 1, 40.00, 60.00),   -- CS101 Programming Fundamentals
(2, 10, 2024, 1, 40.00, 60.00),  -- CS191 Programming Lab
(3, 14, 2024, 1, 40.00, 60.00),  -- IT101 Introduction to IT

-- Semester 2, 2024 (Previous semester - students who are now in sem 3)
(4, 2, 2024, 2, 40.00, 60.00),   -- CS102 Data Structures
(5, 11, 2024, 2, 40.00, 60.00),  -- EC101 Digital Electronics

-- Semester 3, 2025 (Current semester for 2023 batch)
(6, 3, 2025, 3, 40.00, 60.00),   -- CS103 Database Management Systems
(7, 4, 2025, 3, 40.00, 60.00),   -- CS104 Operating Systems
(8, 5, 2025, 3, 40.00, 60.00),   -- CS105 Computer Networks
(9, 12, 2025, 3, 40.00, 60.00),  -- EC102 Signals and Systems
(10, 15, 2025, 3, 40.00, 60.00), -- IT102 OOP

-- Semester 4, 2025 (Upcoming semester)
(11, 6, 2025, 4, 40.00, 60.00),  -- CS106 Software Engineering
(12, 7, 2025, 4, 40.00, 60.00);  -- CS107 Web Technologies

-- =============================================
-- STEP 8: Insert Faculty Assignments
-- =============================================

INSERT INTO `course_faculty_assignments` (`offering_id`, `employee_id`, `assignment_type`, `assigned_date`) VALUES
-- Semester 1, 2024
(1, 4001, 'Primary', '2024-07-01'),    -- Dr Agarwal teaches CS101
(2, 4002, 'Primary', '2024-07-01'),    -- Dr Verma teaches CS191
(3, 4008, 'Primary', '2024-07-01'),    -- Dr Iyer teaches IT101

-- Semester 2, 2024
(4, 4002, 'Primary', '2024-01-01'),    -- Dr Verma teaches CS102
(5, 4006, 'Primary', '2024-01-01'),    -- Dr Nair teaches EC101

-- Semester 3, 2025 (Current)
(6, 4003, 'Primary', '2025-07-01'),    -- Dr Gupta teaches CS103 DBMS
(6, 4005, 'Co-instructor', '2025-07-01'), -- Dr Joshi co-teaches CS103
(7, 4004, 'Primary', '2025-07-01'),    -- Dr Mehta teaches CS104 OS
(8, 4001, 'Primary', '2025-07-01'),    -- Dr Agarwal teaches CS105 Networks
(9, 4007, 'Primary', '2025-07-01'),    -- Dr Rao teaches EC102
(10, 4009, 'Primary', '2025-07-01'),   -- Dr Desai teaches IT102

-- Semester 4, 2025 (Upcoming)
(11, 4002, 'Primary', '2025-12-01'),   -- Dr Verma teaches CS106
(12, 4001, 'Primary', '2025-12-01');   -- Dr Agarwal teaches CS107

-- =============================================
-- STEP 9: Insert Enrollments
-- =============================================

-- Enroll CSE 2024 batch in Semester 1 offerings
INSERT INTO `enrollments` (`offering_id`, `roll_no`, `status`) VALUES
(1, 'CSE2024001', 'Enrolled'),
(1, 'CSE2024002', 'Enrolled'),
(1, 'CSE2024003', 'Enrolled'),
(1, 'CSE2024004', 'Enrolled'),
(1, 'CSE2024005', 'Enrolled'),
(2, 'CSE2024001', 'Enrolled'),
(2, 'CSE2024002', 'Enrolled'),
(2, 'CSE2024003', 'Enrolled'),
(2, 'CSE2024004', 'Enrolled'),
(2, 'CSE2024005', 'Enrolled');

-- Enroll IT 2024 batch
INSERT INTO `enrollments` (`offering_id`, `roll_no`, `status`) VALUES
(3, 'IT2024001', 'Enrolled'),
(3, 'IT2024002', 'Enrolled'),
(3, 'IT2024003', 'Enrolled'),
(3, 'IT2024004', 'Enrolled'),
(3, 'IT2024005', 'Enrolled');

-- Enroll CSE 2023 batch in Semester 3 offerings (Current)
INSERT INTO `enrollments` (`offering_id`, `roll_no`, `status`) VALUES
-- CS103 DBMS
(6, 'CSE2023001', 'Enrolled'),
(6, 'CSE2023002', 'Enrolled'),
(6, 'CSE2023003', 'Enrolled'),
(6, 'CSE2023004', 'Enrolled'),
(6, 'CSE2023005', 'Enrolled'),
(6, 'CSE2023006', 'Enrolled'),
(6, 'CSE2023007', 'Enrolled'),
(6, 'CSE2023008', 'Enrolled'),
(6, 'CSE2023009', 'Enrolled'),
(6, 'CSE2023010', 'Enrolled'),
(6, 'CSE2023011', 'Enrolled'),
(6, 'CSE2023012', 'Enrolled'),
(6, 'CSE2023013', 'Enrolled'),
(6, 'CSE2023014', 'Enrolled'),
(6, 'CSE2023015', 'Enrolled'),

-- CS104 OS
(7, 'CSE2023001', 'Enrolled'),
(7, 'CSE2023002', 'Enrolled'),
(7, 'CSE2023003', 'Enrolled'),
(7, 'CSE2023004', 'Enrolled'),
(7, 'CSE2023005', 'Enrolled'),
(7, 'CSE2023006', 'Enrolled'),
(7, 'CSE2023007', 'Enrolled'),
(7, 'CSE2023008', 'Enrolled'),
(7, 'CSE2023009', 'Enrolled'),
(7, 'CSE2023010', 'Enrolled'),
(7, 'CSE2023011', 'Enrolled'),
(7, 'CSE2023012', 'Enrolled'),
(7, 'CSE2023013', 'Enrolled'),
(7, 'CSE2023014', 'Enrolled'),
(7, 'CSE2023015', 'Enrolled'),

-- CS105 Networks
(8, 'CSE2023001', 'Enrolled'),
(8, 'CSE2023002', 'Enrolled'),
(8, 'CSE2023003', 'Enrolled'),
(8, 'CSE2023004', 'Enrolled'),
(8, 'CSE2023005', 'Enrolled'),
(8, 'CSE2023006', 'Enrolled'),
(8, 'CSE2023007', 'Enrolled'),
(8, 'CSE2023008', 'Enrolled'),
(8, 'CSE2023009', 'Enrolled'),
(8, 'CSE2023010', 'Enrolled'),
(8, 'CSE2023011', 'Enrolled'),
(8, 'CSE2023012', 'Enrolled'),
(8, 'CSE2023013', 'Enrolled'),
(8, 'CSE2023014', 'Enrolled'),
(8, 'CSE2023015', 'Enrolled');

-- Enroll ECE students in EC102
INSERT INTO `enrollments` (`offering_id`, `roll_no`, `status`) VALUES
(9, 'ECE2023001', 'Enrolled'),
(9, 'ECE2023002', 'Enrolled'),
(9, 'ECE2023003', 'Enrolled'),
(9, 'ECE2023004', 'Enrolled'),
(9, 'ECE2023005', 'Enrolled');

-- Enroll IT students in IT102
INSERT INTO `enrollments` (`offering_id`, `roll_no`, `status`) VALUES
(10, 'IT2023001', 'Enrolled'),
(10, 'IT2023002', 'Enrolled'),
(10, 'IT2023003', 'Enrolled'),
(10, 'IT2023004', 'Enrolled'),
(10, 'IT2023005', 'Enrolled');

-- =============================================
-- STEP 10: Insert Tests/Assessments
-- =============================================

INSERT INTO `tests` (`test_id`, `offering_id`, `test_name`, `test_type`, `max_marks`, `weightage`, `test_date`) VALUES
-- CS103 DBMS Tests (offering_id = 6)
(1, 6, 'Internal Assessment 1', 'IA1', 50, 100.00, '2025-09-15'),
(2, 6, 'Assignment 1', 'Assignment', 20, 100.00, '2025-08-20'),
(3, 6, 'Quiz 1', 'Quiz', 10, 100.00, '2025-08-10'),

-- CS104 OS Tests (offering_id = 7)
(4, 7, 'Internal Assessment 1', 'IA1', 50, 100.00, '2025-09-16'),
(5, 7, 'Assignment 1', 'Assignment', 20, 100.00, '2025-08-22'),

-- CS105 Networks Tests (offering_id = 8)
(6, 8, 'Internal Assessment 1', 'IA1', 50, 100.00, '2025-09-17'),
(7, 8, 'Quiz 1', 'Quiz', 15, 100.00, '2025-08-15'),

-- IT102 OOP Tests (offering_id = 10)
(8, 10, 'Internal Assessment 1', 'IA1', 50, 100.00, '2025-09-18'),

-- CS101 Programming Fundamentals (offering_id = 1)
(9, 1, 'Quiz 1', 'Quiz', 10, 100.00, '2024-08-15');

-- =============================================
-- STEP 11: Insert Questions
-- =============================================

-- Questions for CS103 DBMS IA1 (test_id = 1)
INSERT INTO `questions` (`test_id`, `question_number`, `max_marks`, `co_name`, `blooms_level`) VALUES
(1, 1, 5, 'CO1', 'Remember'),
(1, 2, 5, 'CO1', 'Understand'),
(1, 3, 10, 'CO2', 'Apply'),
(1, 4, 10, 'CO2', 'Analyze'),
(1, 5, 10, 'CO3', 'Apply'),
(1, 6, 10, 'CO3', 'Analyze');

-- Questions for CS103 DBMS Assignment 1 (test_id = 2)
INSERT INTO `questions` (`test_id`, `question_number`, `max_marks`, `co_name`, `blooms_level`) VALUES
(2, 1, 10, 'CO1', 'Apply'),
(2, 2, 10, 'CO2', 'Analyze');

-- Questions for CS103 DBMS Quiz 1 (test_id = 3)
INSERT INTO `questions` (`test_id`, `question_number`, `max_marks`, `co_name`, `blooms_level`) VALUES
(3, 1, 5, 'CO1', 'Remember'),
(3, 2, 5, 'CO1', 'Understand');

-- Questions for CS104 OS IA1 (test_id = 4)
INSERT INTO `questions` (`test_id`, `question_number`, `max_marks`, `co_name`, `blooms_level`) VALUES
(4, 1, 5, 'CO1', 'Remember'),
(4, 2, 5, 'CO1', 'Understand'),
(4, 3, 15, 'CO2', 'Apply'),
(4, 4, 15, 'CO3', 'Analyze'),
(4, 5, 10, 'CO4', 'Apply');

-- =============================================
-- STEP 12: Insert Raw Marks (Sample)
-- =============================================

-- CS103 DBMS Mid Sem marks for some students
INSERT INTO `raw_marks` (`test_id`, `roll_no`, `question_id`, `marks_obtained`) VALUES
-- Student CSE2023001
(1, 'CSE2023001', 1, 4.5),
(1, 'CSE2023001', 2, 4.0),
(1, 'CSE2023001', 3, 8.5),
(1, 'CSE2023001', 4, 9.0),
(1, 'CSE2023001', 5, 8.0),
(1, 'CSE2023001', 6, 9.5),

-- Student CSE2023002
(1, 'CSE2023002', 1, 5.0),
(1, 'CSE2023002', 2, 4.5),
(1, 'CSE2023002', 3, 9.0),
(1, 'CSE2023002', 4, 8.5),
(1, 'CSE2023002', 5, 9.0),
(1, 'CSE2023002', 6, 9.0),

-- Student CSE2023003
(1, 'CSE2023003', 1, 3.5),
(1, 'CSE2023003', 2, 3.0),
(1, 'CSE2023003', 3, 7.0),
(1, 'CSE2023003', 4, 7.5),
(1, 'CSE2023003', 5, 6.5),
(1, 'CSE2023003', 6, 7.0);

-- CS103 DBMS Quiz 1 marks
INSERT INTO `raw_marks` (`test_id`, `roll_no`, `question_id`, `marks_obtained`) VALUES
(3, 'CSE2023001', 9, 4.5),
(3, 'CSE2023001', 10, 4.0),
(3, 'CSE2023002', 9, 5.0),
(3, 'CSE2023002', 10, 4.5),
(3, 'CSE2023003', 9, 3.5),
(3, 'CSE2023003', 10, 3.0);

-- =============================================
-- STEP 13: Insert CO-PO Mapping
-- =============================================

INSERT INTO `co_po_mapping` (`course_id`, `co`, `po1`, `po2`, `po3`, `po4`, `po5`) VALUES
-- CS103 DBMS
(3, 1, 3, 2, 1, 0, 0),
(3, 2, 2, 3, 2, 1, 0),
(3, 3, 1, 2, 3, 2, 1),

-- CS104 OS
(4, 1, 3, 2, 1, 0, 0),
(4, 2, 2, 3, 2, 0, 0),
(4, 3, 2, 2, 3, 1, 0),
(4, 4, 1, 2, 2, 3, 1),

-- CS105 Networks
(5, 1, 3, 2, 0, 0, 0),
(5, 2, 2, 3, 1, 0, 0),
(5, 3, 1, 2, 3, 1, 0);

-- =============================================
-- STEP 14: Insert Attainment Scale
-- =============================================

INSERT INTO `attainment_scale` (`course_id`, `level1_min`, `level1_max`, `level2_min`, `level2_max`, `level3_min`, `level3_max`) VALUES
(3, 40.00, 59.99, 60.00, 79.99, 80.00, 100.00),  -- CS103 DBMS
(4, 40.00, 59.99, 60.00, 79.99, 80.00, 100.00),  -- CS104 OS
(5, 40.00, 59.99, 60.00, 79.99, 80.00, 100.00),  -- CS105 Networks
(1, 40.00, 59.99, 60.00, 79.99, 80.00, 100.00);  -- CS101 Programming

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Verify data insertion
SELECT 'Schools:', COUNT(*) FROM schools;
SELECT 'Departments:', COUNT(*) FROM departments;
SELECT 'Users:', COUNT(*) FROM users;
SELECT 'Students:', COUNT(*) FROM students;
SELECT 'Courses:', COUNT(*) FROM courses;
SELECT 'Course Offerings:', COUNT(*) FROM course_offerings;
SELECT 'Faculty Assignments:', COUNT(*) FROM course_faculty_assignments;
SELECT 'Enrollments:', COUNT(*) FROM enrollments;
SELECT 'Tests:', COUNT(*) FROM tests;
SELECT 'Questions:', COUNT(*) FROM questions;
SELECT 'Raw Marks:', COUNT(*) FROM raw_marks;

-- =============================================
-- END OF SCRIPT
-- =============================================
