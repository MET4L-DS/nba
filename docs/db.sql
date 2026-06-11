-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: nba_db
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `action_plans`
--

DROP TABLE IF EXISTS `action_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `action_plans` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `offering_id` bigint(20) DEFAULT NULL,
  `programme_id` int(11) DEFAULT NULL,
  `batch_id` int(11) DEFAULT NULL,
  `batch_year` int(11) DEFAULT NULL,
  `po_name` varchar(5) DEFAULT NULL,
  `gap_description` text NOT NULL,
  `action_text` text NOT NULL,
  `responsible_person` varchar(255) DEFAULT NULL,
  `target_date` date DEFAULT NULL,
  `status` enum('Open','In Progress','Completed') DEFAULT 'Open',
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_ap_offering` (`offering_id`),
  KEY `idx_ap_programme` (`programme_id`),
  KEY `idx_ap_status` (`status`),
  KEY `created_by` (`created_by`),
  KEY `idx_ap_batch` (`batch_id`),
  CONSTRAINT `action_plans_ibfk_1` FOREIGN KEY (`offering_id`) REFERENCES `course_offerings` (`offering_id`) ON DELETE CASCADE,
  CONSTRAINT `action_plans_ibfk_2` FOREIGN KEY (`programme_id`) REFERENCES `programmes` (`programme_id`) ON DELETE CASCADE,
  CONSTRAINT `action_plans_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`employee_id`) ON DELETE SET NULL,
  CONSTRAINT `action_plans_ibfk_4` FOREIGN KEY (`batch_id`) REFERENCES `programme_batches` (`batch_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `action_plans`
--

LOCK TABLES `action_plans` WRITE;
/*!40000 ALTER TABLE `action_plans` DISABLE KEYS */;
/*!40000 ALTER TABLE `action_plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attainment_scale`
--

DROP TABLE IF EXISTS `attainment_scale`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `attainment_scale` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `offering_id` bigint(20) NOT NULL,
  `level` smallint(6) NOT NULL CHECK (`level` >= 0 and `level` <= 10),
  `min_percentage` decimal(5,2) NOT NULL CHECK (`min_percentage` >= 0 and `min_percentage` <= 100),
  PRIMARY KEY (`id`),
  UNIQUE KEY `offering_id` (`offering_id`,`level`),
  KEY `offering_id_2` (`offering_id`),
  CONSTRAINT `attainment_scale_ibfk_1` FOREIGN KEY (`offering_id`) REFERENCES `course_offerings` (`offering_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attainment_scale`
--

LOCK TABLES `attainment_scale` WRITE;
/*!40000 ALTER TABLE `attainment_scale` DISABLE KEYS */;
/*!40000 ALTER TABLE `attainment_scale` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `audit_logs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action` enum('CREATE','UPDATE','DELETE','LOGIN') NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` varchar(50) NOT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_entity` (`entity_type`,`entity_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_action` (`action`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`employee_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=687 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `co_po_mapping`
--

DROP TABLE IF EXISTS `co_po_mapping`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `co_po_mapping` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `offering_id` bigint(20) NOT NULL,
  `co_number` tinyint(4) NOT NULL CHECK (`co_number` between 1 and 6),
  `po_name` varchar(5) NOT NULL,
  `value` tinyint(4) NOT NULL DEFAULT 0 CHECK (`value` between 0 and 3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_mapping` (`offering_id`,`co_number`,`po_name`),
  CONSTRAINT `co_po_mapping_ibfk_1` FOREIGN KEY (`offering_id`) REFERENCES `course_offerings` (`offering_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=90 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `co_po_mapping`
--

LOCK TABLES `co_po_mapping` WRITE;
/*!40000 ALTER TABLE `co_po_mapping` DISABLE KEYS */;
/*!40000 ALTER TABLE `co_po_mapping` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_faculty_assignments`
--

DROP TABLE IF EXISTS `course_faculty_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `course_faculty_assignments` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `offering_id` bigint(20) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `assignment_type` enum('Primary','Co-instructor','Lab') DEFAULT 'Primary',
  `assigned_date` date DEFAULT (curdate()),
  `completion_date` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_offering_emp_type` (`offering_id`,`employee_id`,`assignment_type`),
  KEY `idx_offering` (`offering_id`),
  KEY `idx_emp_active` (`employee_id`,`is_active`),
  CONSTRAINT `course_faculty_assignments_ibfk_1` FOREIGN KEY (`offering_id`) REFERENCES `course_offerings` (`offering_id`) ON DELETE CASCADE,
  CONSTRAINT `course_faculty_assignments_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `users` (`employee_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_faculty_assignments`
--

LOCK TABLES `course_faculty_assignments` WRITE;
/*!40000 ALTER TABLE `course_faculty_assignments` DISABLE KEYS */;
/*!40000 ALTER TABLE `course_faculty_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_offerings`
--

DROP TABLE IF EXISTS `course_offerings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `course_offerings` (
  `offering_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `course_id` bigint(20) NOT NULL,
  `programme_batch_id` int(11) DEFAULT NULL,
  `year` int(11) NOT NULL CHECK (`year` between 1000 and 9999),
  `semester` enum('Spring','Autumn') NOT NULL,
  `co_threshold` decimal(5,2) DEFAULT 40.00 CHECK (`co_threshold` >= 0 and `co_threshold` <= 100),
  `passing_threshold` decimal(5,2) DEFAULT 60.00 CHECK (`passing_threshold` >= 0 and `passing_threshold` <= 100),
  `syllabus_pdf` longblob DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `direct_weightage` decimal(5,2) DEFAULT 80.00 CHECK (`direct_weightage` >= 0 and `direct_weightage` <= 100),
  `indirect_weightage` decimal(5,2) DEFAULT 20.00 CHECK (`indirect_weightage` >= 0 and `indirect_weightage` <= 100),
  PRIMARY KEY (`offering_id`),
  UNIQUE KEY `uk_course_year_sem` (`course_id`,`year`,`semester`),
  KEY `year` (`year`,`semester`),
  KEY `course_id` (`course_id`),
  KEY `idx_co_batch` (`programme_batch_id`),
  CONSTRAINT `course_offerings_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE,
  CONSTRAINT `course_offerings_ibfk_2` FOREIGN KEY (`programme_batch_id`) REFERENCES `programme_batches` (`batch_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_offerings`
--

LOCK TABLES `course_offerings` WRITE;
/*!40000 ALTER TABLE `course_offerings` DISABLE KEYS */;
/*!40000 ALTER TABLE `course_offerings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_survey_questions`
--

DROP TABLE IF EXISTS `course_survey_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `course_survey_questions` (
  `question_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `survey_id` bigint(20) NOT NULL,
  `question_number` smallint(6) NOT NULL,
  `question_text` text NOT NULL,
  `co_number` tinyint(4) NOT NULL CHECK (`co_number` between 1 and 6),
  `mapping_weight` decimal(3,2) NOT NULL DEFAULT 1.00 CHECK (`mapping_weight` between 0.00 and 1.00),
  PRIMARY KEY (`question_id`),
  UNIQUE KEY `uk_survey_qnum` (`survey_id`,`question_number`),
  CONSTRAINT `course_survey_questions_ibfk_1` FOREIGN KEY (`survey_id`) REFERENCES `course_surveys` (`survey_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_survey_questions`
--

LOCK TABLES `course_survey_questions` WRITE;
/*!40000 ALTER TABLE `course_survey_questions` DISABLE KEYS */;
/*!40000 ALTER TABLE `course_survey_questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_survey_responses`
--

DROP TABLE IF EXISTS `course_survey_responses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `course_survey_responses` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `survey_id` bigint(20) NOT NULL,
  `student_rollno` varchar(20) NOT NULL,
  `question_id` bigint(20) NOT NULL,
  `likert_rating` tinyint(4) NOT NULL CHECK (`likert_rating` between 1 and 5),
  `imported_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_student_question` (`survey_id`,`student_rollno`,`question_id`),
  KEY `student_rollno` (`student_rollno`),
  KEY `question_id` (`question_id`),
  CONSTRAINT `course_survey_responses_ibfk_1` FOREIGN KEY (`survey_id`) REFERENCES `course_surveys` (`survey_id`) ON DELETE CASCADE,
  CONSTRAINT `course_survey_responses_ibfk_2` FOREIGN KEY (`student_rollno`) REFERENCES `students` (`roll_no`) ON DELETE CASCADE,
  CONSTRAINT `course_survey_responses_ibfk_3` FOREIGN KEY (`question_id`) REFERENCES `course_survey_questions` (`question_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_survey_responses`
--

LOCK TABLES `course_survey_responses` WRITE;
/*!40000 ALTER TABLE `course_survey_responses` DISABLE KEYS */;
/*!40000 ALTER TABLE `course_survey_responses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_surveys`
--

DROP TABLE IF EXISTS `course_surveys`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `course_surveys` (
  `survey_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `offering_id` bigint(20) NOT NULL,
  `title` varchar(255) DEFAULT 'Course Exit Survey',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`survey_id`),
  KEY `offering_id` (`offering_id`),
  CONSTRAINT `course_surveys_ibfk_1` FOREIGN KEY (`offering_id`) REFERENCES `course_offerings` (`offering_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_surveys`
--

LOCK TABLES `course_surveys` WRITE;
/*!40000 ALTER TABLE `course_surveys` DISABLE KEYS */;
/*!40000 ALTER TABLE `course_surveys` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `courses` (
  `course_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `course_code` varchar(20) NOT NULL,
  `department_id` int(11) DEFAULT NULL,
  `course_name` varchar(255) NOT NULL,
  `course_type` enum('Theory','Lab','Project','Seminar') DEFAULT 'Theory',
  `course_level` enum('Undergraduate','Postgraduate','UG & PG') DEFAULT 'Undergraduate',
  `is_active` tinyint(1) DEFAULT 1,
  `credit` smallint(6) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`course_id`),
  UNIQUE KEY `course_code` (`course_code`),
  KEY `idx_course_dept` (`department_id`),
  CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dean_assignments`
--

DROP TABLE IF EXISTS `dean_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dean_assignments` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `school_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `appointment_order` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_school_emp_start` (`school_id`,`employee_id`,`start_date`),
  KEY `idx_school_active` (`school_id`,`end_date`),
  KEY `idx_employee` (`employee_id`),
  KEY `idx_dates` (`start_date`,`end_date`),
  CONSTRAINT `dean_assignments_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`school_id`) ON DELETE CASCADE,
  CONSTRAINT `dean_assignments_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `users` (`employee_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dean_assignments`
--

LOCK TABLES `dean_assignments` WRITE;
/*!40000 ALTER TABLE `dean_assignments` DISABLE KEYS */;
INSERT INTO `dean_assignments` VALUES (1,1,8000001,'2026-01-01',NULL,'APT/2026/DEAN/SOE/001','2026-05-15 17:09:05');
/*!40000 ALTER TABLE `dean_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `departments` (
  `department_id` int(11) NOT NULL AUTO_INCREMENT,
  `school_id` int(11) DEFAULT NULL,
  `department_name` varchar(100) NOT NULL,
  `department_code` varchar(10) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`department_id`),
  UNIQUE KEY `department_name` (`department_name`),
  UNIQUE KEY `department_code` (`department_code`),
  KEY `school_id` (`school_id`),
  CONSTRAINT `departments_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`school_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enrollments`
--

DROP TABLE IF EXISTS `enrollments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `enrollments` (
  `enrollment_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `offering_id` bigint(20) NOT NULL,
  `enrollment_status` enum('Enrolled','Dropped','Completed') DEFAULT 'Enrolled',
  `enrolled_date` date DEFAULT (curdate()),
  `student_rollno` varchar(20) NOT NULL,
  `enrolled_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`enrollment_id`),
  UNIQUE KEY `offering_id` (`offering_id`,`student_rollno`),
  KEY `offering_id_2` (`offering_id`),
  KEY `student_rollno` (`student_rollno`),
  CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`offering_id`) REFERENCES `course_offerings` (`offering_id`) ON DELETE CASCADE,
  CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`student_rollno`) REFERENCES `students` (`roll_no`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=189 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enrollments`
--

LOCK TABLES `enrollments` WRITE;
/*!40000 ALTER TABLE `enrollments` DISABLE KEYS */;
/*!40000 ALTER TABLE `enrollments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hod_assignments`
--

DROP TABLE IF EXISTS `hod_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hod_assignments` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `department_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `appointment_order` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_dept_emp_start` (`department_id`,`employee_id`,`start_date`),
  KEY `idx_dept_active` (`department_id`,`end_date`),
  KEY `idx_employee` (`employee_id`),
  KEY `idx_dates` (`start_date`,`end_date`),
  CONSTRAINT `hod_assignments_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`) ON DELETE CASCADE,
  CONSTRAINT `hod_assignments_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `users` (`employee_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hod_assignments`
--

LOCK TABLES `hod_assignments` WRITE;
/*!40000 ALTER TABLE `hod_assignments` DISABLE KEYS */;
/*!40000 ALTER TABLE `hod_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `marks`
--

DROP TABLE IF EXISTS `marks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `marks` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `student_roll_no` varchar(20) NOT NULL,
  `test_id` bigint(20) NOT NULL,
  `co_number` tinyint(4) NOT NULL CHECK (`co_number` between 1 and 6),
  `marks_obtained` decimal(6,2) NOT NULL DEFAULT 0.00 CHECK (`marks_obtained` >= 0),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_student_test_co` (`student_roll_no`,`test_id`,`co_number`),
  KEY `test_id` (`test_id`),
  CONSTRAINT `marks_ibfk_1` FOREIGN KEY (`student_roll_no`) REFERENCES `students` (`roll_no`) ON DELETE CASCADE,
  CONSTRAINT `marks_ibfk_2` FOREIGN KEY (`test_id`) REFERENCES `tests` (`test_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4627 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marks`
--

LOCK TABLES `marks` WRITE;
/*!40000 ALTER TABLE `marks` DISABLE KEYS */;
/*!40000 ALTER TABLE `marks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `offering_co_attainment`
--

DROP TABLE IF EXISTS `offering_co_attainment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `offering_co_attainment` (
  `offering_id` bigint(20) NOT NULL,
  `co_number` tinyint(4) NOT NULL CHECK (`co_number` between 1 and 6),
  `attainment_percentage` decimal(5,2) NOT NULL DEFAULT 0.00,
  `attainment_level` decimal(5,2) NOT NULL DEFAULT 0.00,
  `indirect_attainment_percentage` decimal(5,2) DEFAULT NULL,
  `indirect_attainment_level` decimal(5,2) DEFAULT NULL,
  `final_attainment_percentage` decimal(5,2) DEFAULT NULL,
  `final_attainment_level` decimal(5,2) DEFAULT NULL,
  `calculated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`offering_id`,`co_number`),
  KEY `idx_oca_offering` (`offering_id`),
  CONSTRAINT `offering_co_attainment_ibfk_1` FOREIGN KEY (`offering_id`) REFERENCES `course_offerings` (`offering_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `offering_co_attainment`
--

LOCK TABLES `offering_co_attainment` WRITE;
/*!40000 ALTER TABLE `offering_co_attainment` DISABLE KEYS */;
/*!40000 ALTER TABLE `offering_co_attainment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `offering_po_attainment`
--

DROP TABLE IF EXISTS `offering_po_attainment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `offering_po_attainment` (
  `offering_id` bigint(20) NOT NULL,
  `po_name` varchar(5) NOT NULL,
  `attainment_value` decimal(5,2) NOT NULL DEFAULT 0.00,
  `indirect_attainment_value` decimal(5,2) DEFAULT NULL,
  `final_attainment_value` decimal(5,2) DEFAULT NULL,
  `calculated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`offering_id`,`po_name`),
  KEY `idx_opa_offering` (`offering_id`),
  KEY `idx_opa_po_name` (`po_name`),
  CONSTRAINT `offering_po_attainment_ibfk_1` FOREIGN KEY (`offering_id`) REFERENCES `course_offerings` (`offering_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `offering_po_attainment`
--

LOCK TABLES `offering_po_attainment` WRITE;
/*!40000 ALTER TABLE `offering_po_attainment` DISABLE KEYS */;
/*!40000 ALTER TABLE `offering_po_attainment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `programme_batch_attainments`
--

DROP TABLE IF EXISTS `programme_batch_attainments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `programme_batch_attainments` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `programme_id` int(11) NOT NULL,
  `batch_id` int(11) DEFAULT NULL,
  `batch_year` int(11) NOT NULL,
  `po_name` varchar(5) NOT NULL,
  `direct_attainment` decimal(5,2) DEFAULT 0.00,
  `indirect_attainment` decimal(5,2) DEFAULT 0.00,
  `final_attainment` decimal(5,2) DEFAULT 0.00,
  `target` decimal(5,2) DEFAULT 0.00,
  `calculated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_programme_batch_po` (`programme_id`,`batch_year`,`po_name`),
  KEY `idx_pba_batch` (`batch_id`),
  CONSTRAINT `programme_batch_attainments_ibfk_1` FOREIGN KEY (`programme_id`) REFERENCES `programmes` (`programme_id`) ON DELETE CASCADE,
  CONSTRAINT `programme_batch_attainments_ibfk_2` FOREIGN KEY (`batch_id`) REFERENCES `programme_batches` (`batch_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=205 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `programme_batch_attainments`
--

LOCK TABLES `programme_batch_attainments` WRITE;
/*!40000 ALTER TABLE `programme_batch_attainments` DISABLE KEYS */;
/*!40000 ALTER TABLE `programme_batch_attainments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `programme_batches`
--

DROP TABLE IF EXISTS `programme_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `programme_batches` (
  `batch_id` int(11) NOT NULL AUTO_INCREMENT,
  `programme_id` int(11) NOT NULL,
  `batch_year` int(11) NOT NULL,
  `coordinator_id` int(11) DEFAULT NULL,
  `status` enum('upcoming','active','completed') DEFAULT 'upcoming',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`batch_id`),
  UNIQUE KEY `uk_programme_batch` (`programme_id`,`batch_year`),
  KEY `idx_pb_programme` (`programme_id`),
  KEY `idx_pb_coordinator` (`coordinator_id`),
  CONSTRAINT `programme_batches_ibfk_1` FOREIGN KEY (`programme_id`) REFERENCES `programmes` (`programme_id`) ON DELETE CASCADE,
  CONSTRAINT `programme_batches_ibfk_2` FOREIGN KEY (`coordinator_id`) REFERENCES `users` (`employee_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `programme_batches`
--

LOCK TABLES `programme_batches` WRITE;
/*!40000 ALTER TABLE `programme_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `programme_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `programme_courses`
--

DROP TABLE IF EXISTS `programme_courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `programme_courses` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `programme_id` int(11) NOT NULL,
  `course_id` bigint(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_programme_course` (`programme_id`,`course_id`),
  KEY `idx_pc_programme` (`programme_id`),
  KEY `idx_pc_course` (`course_id`),
  CONSTRAINT `programme_courses_ibfk_1` FOREIGN KEY (`programme_id`) REFERENCES `programmes` (`programme_id`) ON DELETE CASCADE,
  CONSTRAINT `programme_courses_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `programme_courses`
--

LOCK TABLES `programme_courses` WRITE;
/*!40000 ALTER TABLE `programme_courses` DISABLE KEYS */;
/*!40000 ALTER TABLE `programme_courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `programmes`
--

DROP TABLE IF EXISTS `programmes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `programmes` (
  `programme_id` int(11) NOT NULL AUTO_INCREMENT,
  `department_id` int(11) NOT NULL,
  `programme_code` varchar(20) NOT NULL,
  `programme_name` varchar(150) NOT NULL,
  `degree_level` enum('UG','PG','Diploma','PhD') NOT NULL DEFAULT 'UG',
  `duration_years` tinyint(4) NOT NULL DEFAULT 4,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `direct_weightage` decimal(5,2) DEFAULT 80.00 CHECK (`direct_weightage` >= 0 and `direct_weightage` <= 100),
  `indirect_weightage` decimal(5,2) DEFAULT 20.00 CHECK (`indirect_weightage` >= 0 and `indirect_weightage` <= 100),
  PRIMARY KEY (`programme_id`),
  UNIQUE KEY `uk_programme_code` (`programme_code`),
  UNIQUE KEY `uk_programme_name` (`programme_name`),
  KEY `idx_programme_dept` (`department_id`),
  CONSTRAINT `programmes_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `programmes`
--

LOCK TABLES `programmes` WRITE;
/*!40000 ALTER TABLE `programmes` DISABLE KEYS */;
/*!40000 ALTER TABLE `programmes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `questions` (
  `question_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `test_id` bigint(20) NOT NULL,
  `question_number` smallint(6) NOT NULL CHECK (`question_number` between 1 and 20),
  `sub_question` varchar(10) DEFAULT NULL,
  `is_optional` tinyint(1) DEFAULT 0,
  `co` smallint(6) NOT NULL CHECK (`co` between 1 and 6),
  `max_marks` decimal(5,2) NOT NULL CHECK (`max_marks` >= 0.5),
  PRIMARY KEY (`question_id`),
  UNIQUE KEY `test_id_3` (`test_id`,`question_number`,`sub_question`),
  KEY `test_id` (`test_id`),
  KEY `test_id_2` (`test_id`,`question_number`),
  CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`test_id`) REFERENCES `tests` (`test_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `raw_marks`
--

DROP TABLE IF EXISTS `raw_marks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `raw_marks` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `student_id` varchar(20) NOT NULL,
  `question_id` bigint(20) NOT NULL,
  `marks_obtained` decimal(5,2) NOT NULL CHECK (`marks_obtained` >= 0),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_student_question` (`student_id`,`question_id`),
  KEY `question_id` (`question_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `raw_marks_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`roll_no`) ON DELETE CASCADE,
  CONSTRAINT `raw_marks_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `questions` (`question_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=286 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `raw_marks`
--

LOCK TABLES `raw_marks` WRITE;
/*!40000 ALTER TABLE `raw_marks` DISABLE KEYS */;
/*!40000 ALTER TABLE `raw_marks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schools`
--

DROP TABLE IF EXISTS `schools`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `schools` (
  `school_id` int(11) NOT NULL AUTO_INCREMENT,
  `school_code` varchar(10) NOT NULL,
  `school_name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`school_id`),
  UNIQUE KEY `uk_school_code` (`school_code`),
  UNIQUE KEY `uk_school_name` (`school_name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schools`
--

LOCK TABLES `schools` WRITE;
/*!40000 ALTER TABLE `schools` DISABLE KEYS */;
INSERT INTO `schools` VALUES (1,'SoE','School of Engineering','Default school for engineering departments','2026-05-15 17:09:05');
/*!40000 ALTER TABLE `schools` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stakeholder_survey_questions`
--

DROP TABLE IF EXISTS `stakeholder_survey_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stakeholder_survey_questions` (
  `question_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `survey_id` bigint(20) NOT NULL,
  `question_number` smallint(6) NOT NULL,
  `question_text` text NOT NULL,
  `po_name` varchar(5) NOT NULL,
  `mapping_weight` decimal(3,2) NOT NULL DEFAULT 1.00 CHECK (`mapping_weight` between 0.00 and 1.00),
  PRIMARY KEY (`question_id`),
  UNIQUE KEY `uk_stk_survey_qnum` (`survey_id`,`question_number`),
  CONSTRAINT `stakeholder_survey_questions_ibfk_1` FOREIGN KEY (`survey_id`) REFERENCES `stakeholder_surveys` (`survey_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stakeholder_survey_questions`
--

LOCK TABLES `stakeholder_survey_questions` WRITE;
/*!40000 ALTER TABLE `stakeholder_survey_questions` DISABLE KEYS */;
/*!40000 ALTER TABLE `stakeholder_survey_questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stakeholder_survey_responses`
--

DROP TABLE IF EXISTS `stakeholder_survey_responses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stakeholder_survey_responses` (
  `survey_id` bigint(20) NOT NULL,
  `respondent_identifier` varchar(255) NOT NULL,
  `respondent_name` varchar(255) DEFAULT NULL,
  `qualification` varchar(255) DEFAULT NULL,
  `question_id` bigint(20) NOT NULL,
  `likert_rating` tinyint(4) NOT NULL CHECK (`likert_rating` between 1 and 5),
  PRIMARY KEY (`survey_id`,`respondent_identifier`,`question_id`),
  KEY `idx_survey_question` (`survey_id`,`question_id`),
  KEY `stakeholder_survey_responses_ibfk_2` (`question_id`),
  CONSTRAINT `stakeholder_survey_responses_ibfk_1` FOREIGN KEY (`survey_id`) REFERENCES `stakeholder_surveys` (`survey_id`) ON DELETE CASCADE,
  CONSTRAINT `stakeholder_survey_responses_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `stakeholder_survey_questions` (`question_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stakeholder_survey_responses`
--

LOCK TABLES `stakeholder_survey_responses` WRITE;
/*!40000 ALTER TABLE `stakeholder_survey_responses` DISABLE KEYS */;
/*!40000 ALTER TABLE `stakeholder_survey_responses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stakeholder_surveys`
--

DROP TABLE IF EXISTS `stakeholder_surveys`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stakeholder_surveys` (
  `survey_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `programme_id` int(11) NOT NULL,
  `batch_id` int(11) DEFAULT NULL,
  `batch_year` int(11) NOT NULL,
  `stakeholder_type` enum('Alumni','Employer','Graduate Exit','Parent','Academic Peer') NOT NULL,
  `title` varchar(255) DEFAULT 'Stakeholder Survey',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`survey_id`),
  UNIQUE KEY `uk_prog_batch_type` (`programme_id`,`batch_year`,`stakeholder_type`),
  KEY `idx_ss_batch` (`batch_id`),
  CONSTRAINT `stakeholder_surveys_ibfk_1` FOREIGN KEY (`programme_id`) REFERENCES `programmes` (`programme_id`) ON DELETE CASCADE,
  CONSTRAINT `stakeholder_surveys_ibfk_2` FOREIGN KEY (`batch_id`) REFERENCES `programme_batches` (`batch_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stakeholder_surveys`
--

LOCK TABLES `stakeholder_surveys` WRITE;
/*!40000 ALTER TABLE `stakeholder_surveys` DISABLE KEYS */;
/*!40000 ALTER TABLE `stakeholder_surveys` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `students` (
  `roll_no` varchar(20) NOT NULL,
  `student_name` varchar(100) NOT NULL,
  `programme_id` int(11) NOT NULL,
  `batch_id` int(11) DEFAULT NULL,
  `batch_year` int(11) DEFAULT NULL,
  `student_status` enum('Active','Graduated','Dropped') DEFAULT 'Active',
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`roll_no`),
  KEY `idx_students_programme` (`programme_id`),
  KEY `idx_students_batch` (`batch_id`),
  CONSTRAINT `students_ibfk_1` FOREIGN KEY (`programme_id`) REFERENCES `programmes` (`programme_id`) ON DELETE CASCADE,
  CONSTRAINT `students_ibfk_2` FOREIGN KEY (`batch_id`) REFERENCES `programme_batches` (`batch_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `system_settings` (
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
INSERT INTO `system_settings` VALUES ('logo_url','/tulogo.png','2026-05-23 19:08:37'),('motto_subtext','Specialized knowledge promotes creativity','2026-05-23 19:08:37'),('motto_text','विज्ञानं यज्ञं तनुते','2026-05-23 19:08:37'),('system_name','Outcome Based Education System','2026-05-23 19:08:37'),('system_short_name','OBEMS','2026-05-23 19:08:37'),('university_name','Tezpur University','2026-05-23 19:08:37'),('university_subtitle','A Central University • Est. 1994','2026-05-23 19:08:37');
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tests`
--

DROP TABLE IF EXISTS `tests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tests` (
  `test_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `offering_id` bigint(20) NOT NULL,
  `test_name` varchar(100) NOT NULL,
  `test_type` enum('Mid Sem','End Sem','Assignment','Quiz') DEFAULT NULL,
  `test_date` date DEFAULT NULL,
  `weightage` decimal(5,2) DEFAULT NULL,
  `full_marks` int(11) NOT NULL CHECK (`full_marks` > 0),
  `pass_marks` int(11) NOT NULL CHECK (`pass_marks` >= 0),
  `question_paper_pdf` longblob DEFAULT NULL,
  PRIMARY KEY (`test_id`),
  KEY `offering_id` (`offering_id`),
  CONSTRAINT `tests_ibfk_1` FOREIGN KEY (`offering_id`) REFERENCES `course_offerings` (`offering_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tests`
--

LOCK TABLES `tests` WRITE;
/*!40000 ALTER TABLE `tests` DISABLE KEYS */;
/*!40000 ALTER TABLE `tests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_phones`
--

DROP TABLE IF EXISTS `user_phones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_phones` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `phone_number` varchar(15) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_emp_phone` (`employee_id`,`phone_number`),
  KEY `idx_user_phone` (`employee_id`),
  CONSTRAINT `user_phones_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `users` (`employee_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_phones`
--

LOCK TABLES `user_phones` WRITE;
/*!40000 ALTER TABLE `user_phones` DISABLE KEYS */;
INSERT INTO `user_phones` VALUES (1,9000001,'9876543210','2026-05-15 17:09:05'),(2,9000001,'9876543211','2026-05-15 17:09:05'),(7,8000001,'9876543216','2026-05-15 17:09:05');
/*!40000 ALTER TABLE `user_phones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `employee_id` int(11) NOT NULL,
  `username` varchar(64) NOT NULL,
  `email` varchar(64) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','faculty','hod','dean','staff') NOT NULL,
  `department_id` int(11) DEFAULT NULL,
  `school_id` int(11) DEFAULT NULL,
  `designation` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`employee_id`),
  UNIQUE KEY `email` (`email`),
  KEY `department_id` (`department_id`),
  KEY `school_id` (`school_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`) ON DELETE SET NULL,
  CONSTRAINT `users_ibfk_2` FOREIGN KEY (`school_id`) REFERENCES `schools` (`school_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (8000001,'Dean SoE','dean_soe@tezu.ac.in','$2y$10$Hcol8QcUPcwvAEDxXbEe/.aYPKmhwGloLSPoD6JKbZ4f8FYC82b7q','dean',NULL,1,'Dean','2026-05-15 17:09:05','2026-05-21 14:16:03'),(9000001,'Admin One','admin_01@tezu.ac.in','$2y$10$Hcol8QcUPcwvAEDxXbEe/.aYPKmhwGloLSPoD6JKbZ4f8FYC82b7q','admin',NULL,NULL,'System Administrator','2026-05-15 17:09:05','2026-05-21 14:15:56');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary table structure for view `v_current_deans`
--

DROP TABLE IF EXISTS `v_current_deans`;
/*!50001 DROP VIEW IF EXISTS `v_current_deans`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `v_current_deans` AS SELECT
 1 AS `school_id`,
  1 AS `school_name`,
  1 AS `employee_id`,
  1 AS `dean_name`,
  1 AS `email`,
  1 AS `designation`,
  1 AS `start_date` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_current_hods`
--

DROP TABLE IF EXISTS `v_current_hods`;
/*!50001 DROP VIEW IF EXISTS `v_current_hods`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `v_current_hods` AS SELECT
 1 AS `department_id`,
  1 AS `department_name`,
  1 AS `department_code`,
  1 AS `employee_id`,
  1 AS `hod_name`,
  1 AS `email`,
  1 AS `designation`,
  1 AS `start_date` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_current_offerings`
--

DROP TABLE IF EXISTS `v_current_offerings`;
/*!50001 DROP VIEW IF EXISTS `v_current_offerings`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `v_current_offerings` AS SELECT
 1 AS `offering_id`,
  1 AS `course_id`,
  1 AS `course_code`,
  1 AS `course_name`,
  1 AS `credit`,
  1 AS `course_type`,
  1 AS `course_level`,
  1 AS `department_id`,
  1 AS `department_name`,
  1 AS `department_code`,
  1 AS `year`,
  1 AS `semester`,
  1 AS `co_threshold`,
  1 AS `passing_threshold`,
  1 AS `primary_faculty_id`,
  1 AS `primary_faculty_name` */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `password_resets`
--

DROP TABLE IF EXISTS `password_resets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `password_resets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `email` (`email`),
  KEY `token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_resets`
--

LOCK TABLES `password_resets` WRITE;
/*!40000 ALTER TABLE `password_resets` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_resets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'nba_db'
--

--
-- Dumping routines for database 'nba_db'
--

--
-- Final view structure for view `v_current_deans`
--

/*!50001 DROP VIEW IF EXISTS `v_current_deans`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_current_deans` AS select `da`.`school_id` AS `school_id`,`s`.`school_name` AS `school_name`,`u`.`employee_id` AS `employee_id`,`u`.`username` AS `dean_name`,`u`.`email` AS `email`,`u`.`designation` AS `designation`,`da`.`start_date` AS `start_date` from ((`dean_assignments` `da` join `users` `u` on(`da`.`employee_id` = `u`.`employee_id`)) join `schools` `s` on(`da`.`school_id` = `s`.`school_id`)) where `da`.`end_date` is null */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_current_hods`
--

/*!50001 DROP VIEW IF EXISTS `v_current_hods`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_current_hods` AS select `h`.`department_id` AS `department_id`,`d`.`department_name` AS `department_name`,`d`.`department_code` AS `department_code`,`u`.`employee_id` AS `employee_id`,`u`.`username` AS `hod_name`,`u`.`email` AS `email`,`u`.`designation` AS `designation`,`h`.`start_date` AS `start_date` from ((`hod_assignments` `h` join `users` `u` on(`h`.`employee_id` = `u`.`employee_id`)) join `departments` `d` on(`h`.`department_id` = `d`.`department_id`)) where `h`.`end_date` is null */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_current_offerings`
--

/*!50001 DROP VIEW IF EXISTS `v_current_offerings`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_current_offerings` AS select `co`.`offering_id` AS `offering_id`,`co`.`course_id` AS `course_id`,`c`.`course_code` AS `course_code`,`c`.`course_name` AS `course_name`,`c`.`credit` AS `credit`,`c`.`course_type` AS `course_type`,`c`.`course_level` AS `course_level`,`c`.`department_id` AS `department_id`,`d`.`department_name` AS `department_name`,`d`.`department_code` AS `department_code`,`co`.`year` AS `year`,`co`.`semester` AS `semester`,`co`.`co_threshold` AS `co_threshold`,`co`.`passing_threshold` AS `passing_threshold`,`cfa`.`employee_id` AS `primary_faculty_id`,`u`.`username` AS `primary_faculty_name` from ((((`course_offerings` `co` join `courses` `c` on(`co`.`course_id` = `c`.`course_id`)) left join `departments` `d` on(`c`.`department_id` = `d`.`department_id`)) left join `course_faculty_assignments` `cfa` on(`co`.`offering_id` = `cfa`.`offering_id` and `cfa`.`assignment_type` = 'Primary' and `cfa`.`is_active` = 1)) left join `users` `u` on(`cfa`.`employee_id` = `u`.`employee_id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-23 19:08:37
