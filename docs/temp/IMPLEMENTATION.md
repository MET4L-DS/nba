## Feasibility Analysis: v2.x → v3.0 Schema Upgrade

### TL;DR

The v3.0 schema is well-designed but has **several issues and gaps** that need addressing before implementation. The biggest risk is the **role refactoring** (`hod`/`dean` removal from ENUM), which touches **every controller, the JWT payload, all middleware, and the entire frontend**. A phased approach across 3 phases is the right call. Below are the specific problems found AND modifications needed in the proposed schema.

---

### Schema Issues & Required Modifications

#### 1. `is_current` as a GENERATED STORED column — MySQL limitation

The schema proposes:

```sql
is_current BOOLEAN GENERATED (end_date IS NULL) STORED
```

**Problem:** MySQL/MariaDB does NOT support `GENERATED ALWAYS AS (expr IS NULL)` returning a BOOLEAN reliably across versions. MySQL 5.7 won't allow `IS NULL` in generated columns. MariaDB has limited support.

**Fix:** Use a regular `TINYINT(1) DEFAULT 1` column and manage it in application logic (set `is_current = 0` when `end_date` is written). Add a **partial unique index** or use a trigger to enforce "only one active HOD per department":

```sql
-- Use a unique constraint with is_current to enforce 1 active per dept
CREATE UNIQUE INDEX idx_one_active_hod
ON hod_assignments(department_id, is_current)
WHERE is_current = 1;  -- PostgreSQL syntax; MySQL needs a workaround
```

For MySQL, the enforcement must be in application code or via a BEFORE INSERT trigger.

#### 2. `course_faculty_assignments` breaks existing course ownership model

**Current model:** `course.faculty_id` directly links a course to its instructor. This FK is used in **13+ queries** across `CourseRepository`, `FacultyController`, `EnrollmentController`, `HODController`, and direct SQL in `FacultyController`.

**v3.0 model:** Removes `faculty_id` from courses and moves it to `course_faculty_assignments`.

**Problem:** Every query that currently does `WHERE course.faculty_id = ?` or `JOIN users ON course.faculty_id = users.employee_id` would need a 3-table join through `course_faculty_assignments`. This impacts:

- CourseRepository.php — `findByFacultyId`, `findByFacultyYearSemester`, `findAll`, `findByDepartment`, `countByDepartment` (5+ methods)
- FacultyController.php — 6 raw SQL queries
- EnrollmentController.php — ownership checks
- AssessmentController.php — course ownership validation

**Recommendation:** Keep `faculty_id` on the `courses` table as the "primary instructor" for backward compatibility during Phase 1-2. Add `course_faculty_assignments` as an **additive** table for co-instructors and history. Deprecate `faculty_id` only in Phase 3 after all queries are migrated.

#### 3. `courses.year` and `courses.semester` removal is premature

**v3.0** removes `year` and `semester` from the courses table (moved to `course_faculty_assignments`).

**Problem:** `year` and `semester` are fundamental to the current system — they're part of the course identity (same course_code taught in different semesters = different course rows). This is used for:

- Enrollment context (which offering is the student enrolled in)
- PDF filename generation: `{course_code}_{year}_{semester}_{testName}.pdf`
- Test lookup (tests belong to a specific course offering)

**Recommendation:** Keep `year` and `semester` on `courses` for now. The `course_faculty_assignments` table can reference `course_id` (which already implicitly contains year/semester). Remove them from courses only if you move to a "course catalog + offerings" model (which would be a Phase 4 level change).

#### 4. Table/column renames — high blast radius

| Rename                                                                         | Files Impacted                                                                                                                                                                 |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `student` → `students`                                                         | `StudentRepository`, `UserRepository`, `EnrollmentRepository`, `MarksRepository`, `RawMarksRepository`, db.sql                                                                 |
| `student.rollno` → `roll_no`                                                   | 5 repositories + FK references in `enrollment`, `rawMarks`, `marks`                                                                                                            |
| `student.name` → `student_name`                                                | `StudentRepository`, `EnrollmentRepository`, `MarksRepository` joins                                                                                                           |
| `student.dept` → `department_id`                                               | `StudentRepository`, `UserRepository.countStudentsByDepartment`                                                                                                                |
| `course` → `courses`, `course.id` → `course_id`, `course.name` → `course_name` | `CourseRepository`, `TestRepository`, `EnrollmentRepository`, `AttainmentScaleRepository`, `CoPoRepository`, `FacultyController` (raw SQL), `HODController`, `StaffController` |
| `test` → `tests`, `test.id` → `test_id`, `test.name` → `test_name`             | `TestRepository`, `QuestionRepository`, `RawMarksRepository`, `MarksRepository`, `FacultyController`, `AssessmentController`                                                   |
| `question` → `questions`, `question.id` → `question_id`                        | `QuestionRepository`, `RawMarksRepository`                                                                                                                                     |
| `enrollment` → `enrollments`, `enrollment.id` → `enrollment_id`                | `EnrollmentRepository`, `FacultyController`                                                                                                                                    |
| `rawMarks` → `raw_marks`, `rawMarks.marks` → `marks_obtained`                  | `RawMarksRepository`, `FacultyController`, `MarksController`                                                                                                                   |
| `marks.student_id` → `student_roll_no`                                         | `MarksRepository`, `MarksController`, `FacultyController`                                                                                                                      |

**Every single repository and several controllers need updating.** This is feasible but must be done atomically — the codebase can't be half-renamed.

#### 5. HOD/Dean role removal — the riskiest change

Removing `'hod'` and `'dean'` from the `users.role` ENUM affects:

| Component                | What breaks                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| User.php                 | `const ROLES` array                                                                                                             |
| UserRepository.php       | `hodExistsForDepartment()`, `deanExists()`, `findFacultyByDepartment()` (filters by `role IN ('faculty','hod','staff')`)        |
| DeanController.php       | `requireDean()` checks `role === 'dean'`; `appointHOD` promotes to `role = 'hod'`; `demoteHOD` downgrades to `role = 'faculty'` |
| HODController.php        | `requireHOD()` checks `role === 'hod'`; gets `department_id` from JWT                                                           |
| AssessmentController.php | Allows both `'faculty'` and `'hod'` for assessment management                                                                   |
| AdminController.php      | Groups users by role in stats                                                                                                   |
| UserController.php       | `createUser()` validates allowed roles, checks `hodExistsForDepartment()`, `deanExists()`                                       |
| JWTService.php           | Encodes `role` into JWT token                                                                                                   |
| **Frontend**             | Every dashboard routes by `role`; `LoginPage`, `DeanDashboard`, `HODDashboard` all check `user.role`                            |

**Recommendation for phased approach:**

- **Phase 1:** Do NOT remove `hod`/`dean` from ENUM yet. Add the `hod_assignments` and `dean_assignments` tables. Start writing to both the old role column AND the new assignment table simultaneously.
- **Phase 2:** Update all read queries to use assignment tables for HOD/Dean checks. Keep writing to role column for backward compat.
- **Phase 3:** Remove `hod`/`dean` from ENUM. Update JWT to include `is_hod`/`is_dean` flags derived from assignment tables.

#### 6. `schools` table — `NOT NULL` FK on departments

The schema adds `school_id` as a FK on `departments`. This means **all existing departments must have a school_id**.

**Modification needed:** The migration must:

1. Create the `schools` table
2. Insert a default school (e.g., "School of Engineering")
3. `ALTER TABLE departments ADD school_id INT(11)` (nullable first)
4. `UPDATE departments SET school_id = 1` (assign to default school)
5. `ALTER TABLE departments MODIFY school_id INT(11) NOT NULL`
6. Add the FK constraint

#### 7. `designation` ENUM is too large and rigid

The proposed ENUM has 11+ values mixing faculty, staff, and leadership titles. Adding/removing designations requires an ALTER TABLE.

**Recommendation:** Use a `VARCHAR(50)` with application-level validation instead of ENUM. Or create a separate `designations` lookup table. This is more future-proof.

#### 8. Missing: `co_po_mapping` table not addressed in v3.0 schema

The comparison doc doesn't mention any changes to `co_po_mapping`, but the table references `course(id)` which gets renamed to `courses(course_id)`. The v3.0 ERD includes it but the table definition section doesn't specify if any column renames are needed.

**Modification needed:** Explicitly document that `co_po_mapping.course_id` FK target changes from `course(id)` to `courses(course_id)`.

#### 9. `enrollment` adding `year`/`semester` is redundant if courses keep them

If we keep `year` and `semester` on the courses table (per recommendation #3), then adding them to enrollments creates data duplication — a student enrolled in course X already knows the year/semester via the course.

**Recommendation:** Only add `year`/`semester` to enrollments if you remove them from courses. Otherwise, add `enrollment_status` ENUM only.

---

### Recommended Phased Approach

**Phase 1 — Additive changes (low risk)**

1. Create `schools` table + assign existing departments to default school
2. Add `school_id`, `description`, `created_at` to `departments`
3. Add `phone`, `designation`, `created_at`, `updated_at` to `users`
4. Create `hod_assignments` table (populated from current HOD users)
5. Create `dean_assignments` table (populated from current Dean user)
6. Create `course_faculty_assignments` table (populated from `course.faculty_id`)
7. Add `department_id`, `course_type` to `courses` table
8. Backend: Create new model/repository files for `schools`, `hod_assignments`, `dean_assignments`, `course_faculty_assignments`
9. Backend: Start dual-writing (write to both old and new structures)

**Phase 2 — Table/column renames (medium risk)**

1. Rename tables: `student` → `students`, `course` → `courses`, `test` → `tests`, `question` → `questions`, `enrollment` → `enrollments`, `rawMarks` → `raw_marks`
2. Rename columns per v3.0 spec
3. Update ALL repository files, controllers, and raw SQL
4. Update frontend API type definitions
5. Add `test_type`, `test_date` to tests table
6. Add `batch_year`, `student_status`, `email`, `phone` to students table

**Phase 3 — Role refactoring (high risk)**

1. Update auth logic to check `hod_assignments`/`dean_assignments` instead of `users.role`
2. Update JWT to include `is_hod`, `is_dean`, `school_id` flags
3. Remove `'hod'` and `'dean'` from role ENUM
4. Update all controllers (`requireDean`, `requireHOD`) to use assignment-based checks
5. Update frontend routing and dashboard logic
6. Deprecate `course.faculty_id` in favor of `course_faculty_assignments`

---

### Verification

After each phase:

- Run full SQL migration script against a test database copy
- Execute the Postman API collection (postmanAPIScript.json) to verify all endpoints
- Check login/logout flow (JWT encoding/decoding)
- Test role-based access for admin, dean, hod, faculty, staff
- Verify cascade deletes still work (course → tests → questions → rawMarks)
