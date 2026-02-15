# Phase 2 Implementation Plan: Table & Column Renames

## ⚠️ Warning: Breaking Changes Ahead

Phase 2 involves **destructive schema changes** that will break existing code. This phase must be executed atomically - the entire codebase needs to be updated simultaneously.

---

## 📋 Overview

**Goal:** Rename tables and columns to follow consistent naming conventions as specified in v3.0 schema.

**Risk Level:** 🔴 HIGH - All queries, repositories, controllers, and frontend code will be affected

**Estimated Impact:**

- 6 tables renamed
- 20+ columns renamed
- 10 repository files modified
- 8+ controller files modified
- Frontend TypeScript types updated
- SQL migrations for data preservation

---

## 🗂️ Table Renames

### 1. `student` → `students`

**Reason:** Plural table names for consistency

**Dependencies:**

- StudentRepository.php (all queries)
- UserRepository.php (countStudentsByDepartment)
- EnrollmentRepository.php (joins)
- MarksRepository.php (joins)
- RawMarksRepository.php (joins)

**Foreign Key Impact:**

- `enrollment.student_rollno` → references `students.rollno`
- `rawMarks.student_rollno` → references `students.rollno`
- `marks.student_id` → references `students.rollno`

---

### 2. `course` → `courses`

**Reason:** Plural table names

**Dependencies:**

- CourseRepository.php (all queries)
- TestRepository.php (course_id FK)
- EnrollmentRepository.php (course_id FK)
- AttainmentScaleRepository.php (course_id FK)
- CoPoRepository.php (course_id FK)
- FacultyController.php (6 raw SQL queries)
- HODController.php (raw SQL)
- StaffController.php (raw SQL)
- AssessmentController.php (raw SQL)
- course_faculty_assignments.course_id FK

**Foreign Key Impact:**

- `test.course_id` → `courses.id`
- `enrollment.course_id` → `courses.id`
- `attainment_scale.course_id` → `courses.id`
- `co_po_mapping.course_id` → `courses.id`
- `course_faculty_assignments.course_id` → `courses.id`

---

### 3. `test` → `tests`

**Reason:** Plural table names

**Dependencies:**

- TestRepository.php (all queries)
- QuestionRepository.php (test_id FK)
- RawMarksRepository.php (test_id FK)
- MarksRepository.php (joins)
- FacultyController.php (raw SQL)
- AssessmentController.php (raw SQL)

**Foreign Key Impact:**

- `question.test_id` → `tests.id`
- `rawMarks.test_id` → `tests.id`

---

### 4. `question` → `questions`

**Reason:** Plural table names

**Dependencies:**

- QuestionRepository.php (all queries)
- RawMarksRepository.php (question_id FK)

**Foreign Key Impact:**

- `rawMarks.question_id` → `questions.id`

---

### 5. `enrollment` → `enrollments`

**Reason:** Plural table names

**Dependencies:**

- EnrollmentRepository.php (all queries)
- FacultyController.php (raw SQL)
- StaffController.php (raw SQL)

**No FK dependencies** (enrollment is not referenced by other tables)

---

### 6. `rawMarks` → `raw_marks`

**Reason:** Snake_case naming convention

**Dependencies:**

- RawMarksRepository.php (all queries)
- FacultyController.php (raw SQL)
- MarksController.php (raw SQL)

**No FK dependencies** (rawMarks is not referenced by other tables)

---

## 🔤 Column Renames

### Student Table (`student` → `students`)

| Old Name | New Name        | Reason                         |
| -------- | --------------- | ------------------------------ |
| `rollno` | `roll_no`       | Snake_case convention          |
| `name`   | `student_name`  | Clarity (avoid generic "name") |
| `dept`   | `department_id` | Proper FK naming + INT type    |

**Migration Notes:**

- `dept` is currently VARCHAR storing department codes ('CSE', 'ECE')
- Need to **convert to INT** referencing `departments.department_id`
- Migration: `UPDATE students s JOIN departments d ON s.dept = d.department_code SET s.department_id = d.department_id`

**New Columns to Add:**

- `batch_year INT` - Year of admission
- `student_status ENUM('Active', 'Graduated', 'Dropped')` - Enrollment status
- `email VARCHAR(100)` - Student email
- `phone VARCHAR(15)` - Contact number

---

### Course Table (`course` → `courses`)

| Old Name | New Name      | Reason          |
| -------- | ------------- | --------------- |
| `id`     | `course_id`   | Explicit naming |
| `name`   | `course_name` | Clarity         |

**Already Added in Phase 1:**

- `department_id INT` ✅
- `course_type ENUM` ✅
- `created_at TIMESTAMP` ✅
- `updated_at TIMESTAMP` ✅

**New Columns to Add:**

- `course_level ENUM('Undergraduate', 'Postgraduate')` - UG/PG classification
- `is_active BOOLEAN DEFAULT 1` - Whether course is currently offered

---

### Test Table (`test` → `tests`)

| Old Name | New Name    | Reason          |
| -------- | ----------- | --------------- |
| `id`     | `test_id`   | Explicit naming |
| `name`   | `test_name` | Clarity         |

**New Columns to Add:**

- `test_type ENUM('Mid Sem', 'End Sem', 'Assignment', 'Quiz')` - Assessment type
- `test_date DATE` - When the test was conducted
- `max_marks DECIMAL(5,2)` - Total marks for the test
- `weightage DECIMAL(5,2)` - Contribution to final grade

---

### Question Table (`question` → `questions`)

| Old Name | New Name      | Reason          |
| -------- | ------------- | --------------- |
| `id`     | `question_id` | Explicit naming |

---

### Enrollment Table (`enrollment` → `enrollments`)

| Old Name | New Name        | Reason          |
| -------- | --------------- | --------------- |
| `id`     | `enrollment_id` | Explicit naming |

**New Columns to Add:**

- `enrollment_status ENUM('Enrolled', 'Dropped', 'Completed')` - Status
- `enrolled_date DATE DEFAULT CURRENT_DATE` - Enrollment timestamp

---

### Raw Marks Table (`rawMarks` → `raw_marks`)

| Old Name | New Name         | Reason                                |
| -------- | ---------------- | ------------------------------------- |
| `marks`  | `marks_obtained` | Clarity (specify it's obtained marks) |

---

### Marks Table (Already named `marks`)

| Old Name     | New Name          | Reason                                     |
| ------------ | ----------------- | ------------------------------------------ |
| `student_id` | `student_roll_no` | Reflects actual data type (rollno, not ID) |

---

## 📊 Migration Strategy

### Step-by-Step Execution Plan

#### Pre-Migration Checklist

1. ✅ **Backup database** - `mysqldump nba_db > nba_db_before_phase2.sql`
2. ✅ **Stop application** - Ensure no active connections
3. ✅ **Run in transaction** - Entire migration wrapped in BEGIN/COMMIT
4. ✅ **Test on dev copy** - Execute on test database first

#### Migration SQL Structure

```sql
START TRANSACTION;

-- 1. Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- 2. Rename tables
RENAME TABLE student TO students;
RENAME TABLE course TO courses;
RENAME TABLE test TO tests;
RENAME TABLE question TO questions;
RENAME TABLE enrollment TO enrollments;
RENAME TABLE rawMarks TO raw_marks;

-- 3. Rename columns in students
ALTER TABLE students
    CHANGE COLUMN rollno roll_no VARCHAR(20),
    CHANGE COLUMN name student_name VARCHAR(100),
    ADD COLUMN department_id INT(11) AFTER student_name,
    ADD COLUMN batch_year INT AFTER department_id,
    ADD COLUMN student_status ENUM('Active', 'Graduated', 'Dropped') DEFAULT 'Active',
    ADD COLUMN email VARCHAR(100),
    ADD COLUMN phone VARCHAR(15);

-- Populate department_id from dept
UPDATE students s
JOIN departments d ON s.dept = d.department_code
SET s.department_id = d.department_id;

-- Drop old dept column
ALTER TABLE students DROP COLUMN dept;

-- Add FK and indexes
ALTER TABLE students
    ADD INDEX idx_dept (department_id),
    ADD FOREIGN KEY (department_id) REFERENCES departments(department_id);

-- 4. Rename columns in courses
ALTER TABLE courses
    CHANGE COLUMN id course_id BIGINT NOT NULL AUTO_INCREMENT,
    CHANGE COLUMN name course_name VARCHAR(255),
    ADD COLUMN course_level ENUM('Undergraduate', 'Postgraduate') DEFAULT 'Undergraduate',
    ADD COLUMN is_active TINYINT(1) DEFAULT 1;

-- 5. Rename columns in tests
ALTER TABLE tests
    CHANGE COLUMN id test_id BIGINT NOT NULL AUTO_INCREMENT,
    CHANGE COLUMN name test_name VARCHAR(100),
    ADD COLUMN test_type ENUM('Mid Sem', 'End Sem', 'Assignment', 'Quiz'),
    ADD COLUMN test_date DATE,
    ADD COLUMN max_marks DECIMAL(5,2),
    ADD COLUMN weightage DECIMAL(5,2);

-- 6. Rename columns in questions
ALTER TABLE questions
    CHANGE COLUMN id question_id BIGINT NOT NULL AUTO_INCREMENT;

-- 7. Rename columns in enrollments
ALTER TABLE enrollments
    CHANGE COLUMN id enrollment_id BIGINT NOT NULL AUTO_INCREMENT,
    ADD COLUMN enrollment_status ENUM('Enrolled', 'Dropped', 'Completed') DEFAULT 'Enrolled',
    ADD COLUMN enrolled_date DATE DEFAULT (CURRENT_DATE);

-- 8. Rename columns in raw_marks
ALTER TABLE raw_marks
    CHANGE COLUMN marks marks_obtained DECIMAL(5,2);

-- 9. Rename columns in marks
ALTER TABLE marks
    CHANGE COLUMN student_id student_roll_no VARCHAR(20);

-- 10. Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

COMMIT;
```

---

## 🛠️ Code Updates Required

### Repository Files (10 files)

#### 1. StudentRepository.php

```php
// Change all occurrences of:
FROM student → FROM students
student.rollno → students.roll_no
student.name → students.student_name
student.dept → students.department_id

// Update constructor
new Student($data['rollno'], ...) → new Student($data['roll_no'], ...)

// Update Model instantiation to include new columns
```

#### 2. CourseRepository.php

```php
// Change all occurrences of:
FROM course → FROM courses
course.id → courses.course_id
course.name → courses.course_name

// Update joins:
JOIN course c → JOIN courses c
```

#### 3. TestRepository.php

```php
// Change:
FROM test → FROM tests
test.id → tests.test_id
test.name → tests.test_name
```

#### 4. QuestionRepository.php

```php
// Change:
FROM question → FROM questions
question.id → questions.question_id
```

#### 5. EnrollmentRepository.php

```php
// Change:
FROM enrollment → FROM enrollments
enrollment.id → enrollments.enrollment_id
```

#### 6. RawMarksRepository.php

```php
// Change:
FROM rawMarks → FROM raw_marks
rawMarks.marks → raw_marks.marks_obtained
student.rollno → students.roll_no
```

#### 7. MarksRepository.php

```php
// Change:
marks.student_id → marks.student_roll_no
student.rollno → students.roll_no
```

#### 8. AttainmentScaleRepository.php

```php
// Change:
course.id → courses.course_id
```

#### 9. CoPoRepository.php

```php
// Change:
course.id → courses.course_id
```

#### 10. UserRepository.php

```php
// Update countStudentsByDepartment:
FROM student → FROM students
```

---

### Controller Files (8+ files)

#### 1. FacultyController.php (6 raw SQL queries)

```php
// Line 37: SELECT id FROM course WHERE faculty_id = ?
SELECT course_id FROM courses WHERE faculty_id = ?

// Line 50: COUNT(*) FROM test WHERE course_id = ?
COUNT(*) FROM tests WHERE course_id = ?

// Line 57: COUNT(*) FROM enrollment WHERE course_id = ?
COUNT(*) FROM enrollments WHERE course_id = ?

// All other raw SQL queries
```

#### 2. AssessmentController.php

```php
// Update raw SQL queries referencing course/test
```

#### 3. HODController.php

```php
// Update queries with course table
```

#### 4. StaffController.php

```php
// Update queries with course/enrollment
```

#### 5. MarksController.php

```php
// Update rawMarks references
```

#### 6. EnrollmentController.php

```php
// Update enrollment/course references
```

#### 7. AdminController.php

```php
// Update dashboard stats queries
```

#### 8. DeanController.php

```php
// Update department stats queries
```

---

## 🧪 Testing Plan

### Database Validation

```sql
-- Verify table renames
SHOW TABLES;
-- Should show: students, courses, tests, questions, enrollments, raw_marks

-- Verify column renames
DESCRIBE students;
DESCRIBE courses;
DESCRIBE tests;

-- Verify data integrity
SELECT COUNT(*) FROM students; -- Should match old count
SELECT COUNT(*) FROM courses; -- Should match old count
SELECT COUNT(*) FROM enrollments; -- Should match old count

-- Verify FKs still work
SELECT s.roll_no, c.course_name
FROM enrollments e
JOIN students s ON e.student_rollno = s.roll_no
JOIN courses c ON e.course_id = c.course_id
LIMIT 5;
```

### API Testing

- Test all existing Postman endpoints
- Verify login still works
- Check role-based access
- Confirm CRUD operations on all entities
- Validate joins and relationships

---

## 📦 Deliverables

1. **phase2_table_column_renames.sql** - Complete migration script
2. **Updated Repository Files** - All 10 repositories with new table/column names
3. **Updated Controller Files** - All controllers with corrected SQL
4. **Updated Model Files** - Student, Course, Test models with new column names
5. **Migration Rollback Script** - Reverse migration in case of failure
6. **Testing Report** - Validation of all endpoints post-migration

---

## ⏱️ Estimated Timeline

| Task                 | Estimated Time |
| -------------------- | -------------- |
| SQL Migration Script | 2 hours        |
| Repository Updates   | 3 hours        |
| Controller Updates   | 2 hours        |
| Model Updates        | 1 hour         |
| Testing & Validation | 2 hours        |
| **Total**            | **10 hours**   |

---

## 🚨 Rollback Plan

If migration fails:

```sql
START TRANSACTION;

SET FOREIGN_KEY_CHECKS = 0;

-- Reverse table renames
RENAME TABLE students TO student;
RENAME TABLE courses TO course;
RENAME TABLE tests TO test;
RENAME TABLE questions TO question;
RENAME TABLE enrollments TO enrollment;
RENAME TABLE raw_marks TO rawMarks;

-- Reverse column renames (full script in rollback file)
-- ...

SET FOREIGN_KEY_CHECKS = 1;

COMMIT;
```

Or restore from backup:

```bash
mysql nba_db < nba_db_before_phase2.sql
```

---

## ✅ Success Criteria

- [ ] All tables successfully renamed
- [ ] All columns successfully renamed
- [ ] All foreign keys intact and functional
- [ ] All 10 repositories updated and error-free
- [ ] All 8+ controllers updated and error-free
- [ ] All Postman API tests passing
- [ ] No PHP errors in error logs
- [ ] Data integrity verified (counts match)
- [ ] Frontend can still fetch and display data

---

**Status:** 📝 Planning Phase
**Next Step:** Create phase2_table_column_renames.sql migration script
**Blocker:** None
**Notes:** Must be executed in one atomic transaction after full testing on dev database
