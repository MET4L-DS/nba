# NBA API Reference

**Base URL:** `http://localhost/nba/api/`  
**Authentication:** All endpoints (except login) require: `Authorization: Bearer <jwt_token>`
**Version:** 8.0 (Surveys, Action Plans, Programme Batches, Staff Enrollment)

---

## Role Architecture

Users have a fixed **base role** (`admin`, `faculty`, `hod`, `dean`, `staff`). Additionally, `faculty`/`staff` users can hold dynamic assignments as HOD or Dean via the `hod_assignments`/`dean_assignments` tables. JWT tokens include `is_hod`, `is_dean`, `hod_department_id`, and `school_id` flags.

---

## Table of Contents

1. [Authentication & Common](#authentication--common)
2. [Admin Endpoints](#admin-endpoints)
3. [HOD Endpoints](#hod-endpoints)
4. [Dean Endpoints](#dean-endpoints)
5. [Faculty Endpoints](#faculty-endpoints)
6. [Staff Endpoints](#staff-endpoints)
7. [Course & Offering Management](#course--offering-management)
8. [Assessment Management](#assessment-management)
9. [Marks Management](#marks-management)
10. [Enrollment Management](#enrollment-management)
11. [Attainment Configuration](#attainment-configuration)
12. [Attainment Snapshots](#attainment-snapshots)
13. [Survey Management](#survey-management)
14. [Action Plan Management](#action-plan-management)
15. [Error Codes](#error-codes)

---

## Authentication & Common

### 1. Login

**POST** `/login`

```json
// REQUEST
{ "employeeIdOrEmail": "hod_cse@tezu.ac.in", "password": "password123" }

// RESPONSE (200)
{
  "success": true,
  "token": "eyJ0eXAiOiJKV1QiLCJhbGci...",
  "user": {
    "employee_id": 7000001,
    "username": "HOD CSE",
    "email": "hod_cse@tezu.ac.in",
    "role": "hod",
    "is_hod": true,
    "is_dean": false,
    "hod_department_id": 1,
    "school_id": null,
    "school_name": null,
    "department_id": 1,
    "department_name": "Computer Science & Engineering",
    "department_code": "CSE",
    "designation": "Professor",
    "phone_numbers": ["9876543212"]
  }
}

// ERROR (401)
{ "success": false, "message": "Invalid credentials" }
```

---

### 2. Get Profile

**GET** `/profile`

```json
// RESPONSE (200)
{
  "success": true,
  "data": {
    "employee_id": 7000001,
    "username": "HOD CSE",
    "email": "hod_cse@tezu.ac.in",
    "role": "hod",
    "is_hod": true,
    "is_dean": false,
    "hod_department_id": 1,
    "school_id": null
  }
}
```

---

### 3. Update Profile

**PUT** `/profile`

```json
// REQUEST (all optional)
{ "username": "newusername", "email": "newemail@nba.edu", "password": "newpassword" }

// RESPONSE (200)
{ "success": true, "message": "Profile updated successfully", "data": { /* updated user */ } }
```

---

### 4. Logout

**POST** `/logout`

```json
{ "success": true, "message": "Logout successful" }
```

---

### 5. Get User's Department

**GET** `/department`

```json
// RESPONSE (200)
{ "success": true, "data": { "department_id": 1, "department_name": "CSE", "department_code": "CSE" } }
```

---

### 6. Get All Departments

**GET** `/departments`

```json
// RESPONSE (200)
{ "success": true, "data": [ { "department_id": 1, "department_name": "CSE", "department_code": "CSE" } ] }
```

---

### 7. Get User Phones

**GET** `/users/{employeeId}/phones`

```json
// RESPONSE (200)
{ "success": true, "data": [ { "id": 1, "phone_number": "9876543210" } ] }
```

---

## Admin Endpoints

**Role Required:** `admin`

### 8. Get Admin Stats

**GET** `/admin/stats`

```json
{ "totalUsers": 50, "totalCourses": 25, "totalStudents": 500, "totalAssessments": 75 }
```

---

### 9. View Audit Logs

**GET** `/admin/logs?page=1&limit=20`

Query params: `page`, `limit`, `action` (CREATE|UPDATE|DELETE|LOGIN), `entity_type`, `entity_id`, `from_date`, `to_date`

```json
// RESPONSE (200)
{ "success": true, "data": [...], "pagination": { "page": 1, "limit": 20, "total": 100 } }
```

---

### 10. Manage Users

**GET** `/admin/users` — List all users  
**POST** `/admin/users` — Create user  
**PUT** `/admin/users/{id}` — Update user  
**DELETE** `/admin/users/{id}` — Delete user

```json
// POST Request
{
  "employee_id": 3020,
  "username": "New User",
  "email": "user@tezu.edu",
  "password": "pass123",
  "role": "faculty",
  "department_id": 1
}
```

---

### 11. Manage Departments

**GET** `/admin/departments` — List all  
**POST** `/admin/departments` — Create  
**PUT** `/admin/departments/{id}` — Update  
**DELETE** `/admin/departments/{id}` — Delete

```json
// POST Request
{ "department_name": "AI & ML", "department_code": "AIML", "school_id": 1 }
```

---

### 12. Manage Programmes

**GET** `/admin/programmes` — List all  
**POST** `/admin/programmes` — Create  
**PUT** `/admin/programmes/{id}` — Update  
**DELETE** `/admin/programmes/{id}` — Delete

```json
// POST Request
{ "department_id": 1, "programme_code": "CSE-MTECH", "programme_name": "M.Tech CSE", "degree_level": "PG", "duration_years": 2 }
```

**GET** `/admin/programmes/{id}/courses` — List courses in programme  
**POST** `/admin/programmes/{id}/courses` — Add course to programme  
**DELETE** `/admin/programmes/{id}/courses/{courseId}` — Remove course from programme  
**POST** `/admin/programmes/{id}/students/bulk` — Bulk enroll students into programme

---

### 13. Manage Schools

**GET** `/admin/schools` — List all  
**POST** `/admin/schools` — Create  
**PUT** `/admin/schools/{id}` — Update  
**DELETE** `/admin/schools/{id}` — Delete

```json
// POST Request
{ "school_code": "SoE", "school_name": "School of Engineering", "description": "..." }
```

---

### 14. Manage Deans (Admin only)

**POST** `/admin/schools/{schoolId}/dean` — Appoint/create Dean  
**DELETE** `/admin/dean/{employeeId}` — Demote Dean  
**GET** `/admin/dean/history` — View Dean appointment history

```json
// POST Request — assign existing faculty
{ "employee_id": 3001, "appointment_order": "ORD/DEAN/2026/01" }

// POST Request — create new user + assign as Dean
{ "employee_id": 5001, "username": "DEAN_SOE", "email": "dean_soe@tezu.ac.in", "password": "password123", "role": "faculty", "department_id": 1, "appointment_order": "ORD/DEAN/2026/01" }
```

---

### 15. View All Data

**GET** `/admin/courses` | **GET** `/admin/students` | **GET** `/admin/tests`

---

## HOD Endpoints

**Role Required:** `hod` (or `admin`)

### 16. Get HOD Stats

**GET** `/hod/stats`

```json
{ "totalCourses": 15, "totalFaculty": 8, "totalStudents": 200, "totalAssessments": 30 }
```

---

### 17. View Audit Logs

**GET** `/hod/logs?page=1&limit=20`

Same query params as admin logs, scoped to HOD's department.

---

### 18. Manage Base Courses (Templates)

**GET** `/hod/base-courses` — List department's course templates  
**POST** `/hod/base-courses` — Create new course template  
**GET** `/hod/base-courses/all` — List ALL course templates  
**PUT** `/hod/base-courses/{id}` — Update template  
**DELETE** `/hod/base-courses/{id}` — Delete template

```json
// POST Request
{
  "course_code": "CS401",
  "course_name": "Machine Learning",
  "course_type": "Theory",
  "course_level": "Undergraduate",
  "credit": 4,
  "department_id": 1
}
```

---

### 19. Manage Course Offerings

**GET** `/hod/courses` — List department offerings  
**POST** `/hod/courses` — Create offering (with optional faculty assignment)  
**PUT** `/hod/courses/{id}` — Update offering  
**DELETE** `/hod/courses/{id}` — Delete offering

```json
// POST Request
{
  "course_id": 1,
  "year": 2026,
  "semester": "Spring",
  "co_threshold": 40.0,
  "passing_threshold": 60.0,
  "faculty_id": 3001
}
```

---

### 20. Manage Department Users

**GET** `/hod/faculty` — List department faculty  
**POST** `/hod/users` — Create new faculty/staff  
**PUT** `/hod/users/{id}` — Update user  
**DELETE** `/hod/users/{id}` — Delete user

```json
// POST Request
{ "employee_id": 3020, "username": "New Faculty", "email": "faculty@tezu.edu", "password": "password", "role": "faculty" }
```

---

### 21. Manage Students

**GET** `/hod/students` — List department students  
**PUT** `/hod/students/{rollno}` — Update student

---

### 22. Manage Programmes

**GET** `/hod/programmes` — List department programmes  
**POST** `/hod/programmes` — Create programme  
**PUT** `/hod/programmes/{id}` — Update programme  
**DELETE** `/hod/programmes/{id}` — Delete programme  
**GET** `/hod/programmes/with-batches` — List programmes that have batches

**GET** `/hod/programmes/{id}/courses` — List courses in programme  
**POST** `/hod/programmes/{id}/courses` — Add course to programme  
**DELETE** `/hod/programmes/{id}/courses/{courseId}` — Remove course from programme  
**POST** `/hod/programmes/{id}/students/bulk` — Bulk enroll students into programme  
**PUT** `/hod/programmes/{id}/weightage` — Update programme weightage

```json
// POST Programme
{ "programme_code": "CSE-BTECH", "programme_name": "B.Tech CSE", "degree_level": "UG", "duration_years": 4 }

// PUT Weightage
{ "co_weightage": 40, "po_weightage": 60 }
```

---

### 23. Manage Programme Batches

**GET** `/hod/programmes/{programmeId}/batches` — List batches for a programme  
**POST** `/hod/programmes/{programmeId}/batches` — Create a new batch  
**GET** `/hod/batches/{batchId}` — Get batch details

```json
// POST Request
{ "batch_year": 2024, "academic_year": "2024-2028" }
```

---

### 24. Course Completion Workflow

**GET** `/hod/offerings/{offeringId}/test-averages` — View test averages  
**POST** `/hod/offerings/{offeringId}/reopen` — Reopen a concluded course (clears snapshot, sets `is_active = 1`)

---

## Dean Endpoints

**Role Required:** `is_dean: true`

### 25. Get Dean Stats

**GET** `/dean/stats`

```json
{ "totalDepartments": 7, "totalStudents": 1500, "totalCourses": 45, "usersByRole": { "faculty": 42, "staff": 8 } }
```

---

### 26. View All Data

**GET** `/dean/departments` | **GET** `/dean/users` | **GET** `/dean/courses` | **GET** `/dean/students` | **GET** `/dean/tests`

---

### 27. Department Analytics

**GET** `/dean/analytics`

```json
[ { "department_name": "CSE", "avg_attainment": 75.2 } ]
```

---

### 28. Manage HODs

**GET** `/dean/departments/{departmentId}/faculty` — List faculty in department  
**POST** `/dean/departments/{departmentId}/hod` — Appoint HOD  
**DELETE** `/dean/hod/{employeeId}` — Demote HOD  
**GET** `/dean/hod/history` — View HOD appointment history

```json
// POST Request — assign existing faculty
{ "employee_id": 3001, "appointment_order": "ORD/HOD/2026/01" }

// POST Request — create new HOD
{ "employee_id": 2005, "username": "New HOD", "email": "hod_new@tezu.ac.in", "password": "password123", "role": "faculty", "appointment_order": "ORD/HOD/2026/01" }
```

---

## Faculty Endpoints

**Role Required:** `faculty` or `hod`

### 29. Get Faculty Stats

**GET** `/faculty/stats`

```json
{ "totalCourses": 3, "totalTests": 12, "averageAttainment": 72.5 }
```

---

### 30. View Audit Logs

**GET** `/faculty/logs?page=1&limit=20`

---

### 31. Get Faculty Courses

**GET** `/faculty/courses`

Returns courses assigned to the authenticated faculty member.

```json
{
  "success": true,
  "data": [
    { "offering_id": 1, "course_id": 1, "course_code": "CS101", "course_name": "Intro to Programming", "year": 2026, "semester": "Spring", "assignment_type": "Primary", "is_active": 1 }
  ]
}
```

---

### 32. Get Enrolled Students

**GET** `/faculty/students`

Returns students enrolled in the faculty's courses.

---

### 33. Manage Students

**PUT** `/faculty/students/{rollno}` — Update student  
**DELETE** `/faculty/students/{rollno}` — Remove student from all courses

---

### 34. Course Completion Workflow

**GET** `/faculty/courses/{offeringId}/check-completion` — Check whether course can be concluded  
**POST** `/faculty/courses/{offeringId}/conclude` — Conclude (lock) course, computing & persisting attainment snapshots  
**GET** `/faculty/courses/{offeringId}/stats` — Get course-level statistics  
**GET** `/faculty/courses/{offeringId}/test-averages` — Get test averages for offering

---

### 35. Delete Test

**DELETE** `/tests/{id}`

```json
{ "success": true, "message": "Test deleted successfully" }
```

---

## Staff Endpoints

**Role Required:** `staff`

### 36. Get Staff Stats

**GET** `/staff/stats`

```json
{ "totalCourses": 20, "totalStudents": 300, "totalEnrollments": 450 }
```

---

### 37. Manage Courses

**GET** `/staff/courses` — List department courses  
**POST** `/staff/courses` — Create course offering  
**PUT** `/staff/courses/{id}` — Update offering  
**DELETE** `/staff/courses/{id}` — Delete offering

---

### 38. Manage Course Enrollments (Staff)

**GET** `/staff/courses/{courseId}/enrollments` — List enrollments for a course  
**POST** `/staff/courses/{courseId}/enrollments` — Bulk enroll students  
**DELETE** `/staff/courses/{courseId}/enrollments/{rollno}` — Remove a single enrollment

```json
// POST Request
{ "students": [ { "roll_no": "2024CSE001", "student_name": "Alice Johnson", "programme_id": 1 } ] }
```

---

### 39. View Data

**GET** `/staff/faculty` — List department faculty  
**GET** `/staff/students` — List department students

---

## Course & Offering Management

### 40. Get Courses (Available to all authenticated users)

**GET** `/courses`

```json
{
  "success": true,
  "data": [
    { "offering_id": 1, "course_id": 1, "course_code": "CS101", "course_name": "Intro to Programming", "year": 2026, "semester": "Spring", "assignment_type": "Primary" }
  ]
}
```

---

## Assessment Management

### 41. Create Assessment

**POST** `/assessment`

```json
// REQUEST
{
  "offering_id": 1,
  "name": "Mid Semester Exam",
  "test_type": "Mid Sem",
  "full_marks": 50,
  "pass_marks": 20,
  "questions": [
    { "question_number": 1, "co": 1, "max_marks": 10 },
    { "question_number": 2, "co": 2, "max_marks": 10 }
  ]
}

// RESPONSE (201)
{ "success": true, "message": "Assessment created successfully" }
```

---

### 42. Get Assessment Details

**GET** `/assessment?test_id=1`

```json
// RESPONSE (200)
{
  "success": true,
  "data": {
    "test_id": 1,
    "offering_id": 5,
    "test_name": "Mid Sem",
    "test_type": "Mid Sem",
    "full_marks": 50,
    "pass_marks": 20,
    "questions": [
      { "question_id": 1, "question_number": 1, "co": 1, "max_marks": 10 }
    ]
  }
}
```

---

### 43. Get Course Tests

**GET** `/course-tests?offering_id=1`

```json
{
  "success": true,
  "data": [
    { "test_id": 1, "offering_id": 1, "test_name": "Mid Sem", "test_type": "Mid Sem", "full_marks": 50, "pass_marks": 20 }
  ]
}
```

---

### 44. Update Question

**PUT** `/questions/{id}`

```json
// REQUEST (all optional)
{ "co_number": 3, "max_marks": 15, "is_optional": false }
```

---

### 45. Delete Question

**DELETE** `/questions/{id}`

```json
{ "success": true, "message": "Question deleted successfully" }
```

---

## Marks Management

### 46. Save Marks by Question

**POST** `/marks/by-question`

```json
// REQUEST
{ "test_id": 1, "student_id": "2024CSE001", "question_id": 5, "marks_obtained": 8.5 }

// RESPONSE (200)
{ "success": true, "message": "Marks saved successfully" }
```

---

### 47. Save Marks by CO

**POST** `/marks/by-co`

```json
// REQUEST
{ "test_id": 1, "student_roll_no": "2024CSE001", "CO1": 10, "CO2": 8, "CO3": 5, "CO4": 0, "CO5": 0, "CO6": 0 }

// RESPONSE (200)
{ "success": true, "message": "Marks saved successfully" }
```

---

### 48. Bulk Save Marks

**POST** `/marks/bulk`

```json
// REQUEST
{ "test_id": 1, "marks": [ { "student_id": "2024CSE001", "question_id": 1, "marks_obtained": 5 }, { "student_id": "2024CSE001", "question_id": 2, "marks_obtained": 4 } ] }

// RESPONSE (200)
{ "success": true, "message": "Bulk marks saved", "data": { "success_count": 2, "fail_count": 0 } }
```

---

### 49. Get Student Marks

**GET** `/marks?test_id=1&student_id=2024CSE001`

```json
// RESPONSE (200)
{ "success": true, "data": { "CO1": 10, "CO2": 15, "CO3": 5 } }
```

---

### 50. Get Test Marks (All Students)

**GET** `/marks/test?test_id=1&include_raw=true`

```json
// RESPONSE (200)
{
  "success": true,
  "data": [
    { "student_roll_no": "2024CSE001", "student_id": "2024CSE001", "student_name": "Alice Johnson", "CO1": 10, "CO2": 8, "CO3": 5, "programme_id": 1, "programme_name": "B.Tech CSE" }
  ]
}
```

---

### 51. Update Raw Marks Entry

**PUT** `/marks/raw/{id}`

```json
// REQUEST
{ "marks_obtained": 8.5 }
```

---

### 52. Delete Raw Marks Entry

**DELETE** `/marks/raw/{id}`

```json
{ "success": true, "message": "Marks entry deleted successfully" }
```

---

### 53. Delete All Student Marks

**DELETE** `/marks/student/{testId}/{studentId}`

```json
{ "success": true, "message": "All marks deleted for student in this test" }
```

---

## Enrollment Management

### 54. Bulk Enroll Students

**POST** `/offerings/{offeringId}/enroll`

```json
// REQUEST
{ "students": [ { "roll_no": "2024CSE001", "student_name": "Alice Johnson", "programme_id": 1 } ] }

// RESPONSE (200)
{ "success": true, "message": "Students enrolled successfully" }
```

---

### 55. Get Course Enrollments

**GET** `/offerings/{offeringId}/enrollments?test_id=1`

```json
{
  "success": true,
  "data": [
    { "enrollment_id": 1, "student_rollno": "2024CSE001", "student_name": "Alice Johnson", "programme_id": 1, "programme_name": "B.Tech CSE" }
  ]
}
```

---

### 56. Remove Enrollment

**DELETE** `/offerings/{offeringId}/enroll/{rollno}`

```json
{ "success": true, "message": "Enrollment removed successfully" }
```

---

## Attainment Configuration

### 57. Get Attainment Config

**GET** `/offerings/{offeringId}/attainment-config`

```json
// RESPONSE (200)
{
  "success": true,
  "data": {
    "offering_id": 1,
    "course_id": 1,
    "co_threshold": 40.0,
    "passing_threshold": 60.0,
    "attainment_thresholds": [
      { "id": 1, "level": 1, "percentage": 40 },
      { "id": 2, "level": 2, "percentage": 60 },
      { "id": 3, "level": 3, "percentage": 80 }
    ]
  }
}
```

---

### 58. Save Attainment Config

**POST** `/offerings/{offeringId}/attainment-config`

```json
// REQUEST
{
  "co_threshold": 40.0,
  "passing_threshold": 60.0,
  "attainment_thresholds": [
    { "id": 1, "percentage": 70 },
    { "id": 2, "percentage": 60 },
    { "id": 3, "percentage": 50 }
  ]
}

// RESPONSE (200)
{
  "success": true,
  "message": "Attainment configuration saved successfully",
  "data": { "offering_id": 1, "course_id": 1, "co_threshold": 40.0, "passing_threshold": 60.0, "attainment_thresholds_saved": 3 }
}
```

**Note:** The `level` for each threshold is auto-computed from the sort order of `percentage` (highest percentage = highest level).

---

### 59. Get CO-PO Matrix

**GET** `/offerings/{offeringId}/copo-matrix`

```json
// RESPONSE (200)
{
  "success": true,
  "data": [
    { "co_number": 1, "po_name": "PO1", "value": 3 },
    { "co_number": 1, "po_name": "PO2", "value": 2 }
  ]
}
```

---

### 60. Save CO-PO Matrix

**POST** `/offerings/{offeringId}/copo-matrix`

```json
// REQUEST
{
  "mappings": [
    { "co": "CO1", "po": "PO1", "value": 3 },
    { "co": "CO1", "po": "PO2", "value": 2 }
  ]
}

// RESPONSE (200)
{ "success": true, "message": "CO-PO Matrix saved successfully" }
```

**Note:** Uses `mappings` array with `co` (string), `po` (string), `value` (0-3).

---

## Attainment Snapshots

### 61. Get Offering Attainment

**GET** `/offerings/{offeringId}/attainment`

Returns persisted snapshot data when the course is concluded/locked, otherwise computes a live preview.

```json
// RESPONSE (200)
{
  "success": true,
  "snapshot_exists": true,
  "data": {
    "offering_id": 10,
    "co_threshold": 55.0,
    "passing_threshold": 30.0,
    "attainment_thresholds": [
      { "id": 1, "level": 3, "percentage": 70 },
      { "id": 2, "level": 2, "percentage": 60 },
      { "id": 3, "level": 1, "percentage": 50 }
    ],
    "co_attainment": [
      { "offering_id": 10, "co_number": 1, "co_name": "CO1", "attainment_percentage": 69.62, "attainment_level": 1.96, "calculated_at": "2026-05-15 12:00:00" }
    ],
    "po_attainment": [
      { "offering_id": 10, "po_name": "PO1", "attainment_value": 1.95, "calculated_at": "2026-05-15 12:00:00" }
    ]
  }
}
```

**Note:** `co_name` is computed as `CONCAT('CO', co_number)` for API backward compatibility.

---

### 62. Get Programme Attainment

**GET** `/programmes/{programmeId}/attainment?batch_year=2024`

Returns PO attainment averaged across all locked offerings whose enrolled students belong to the specified programme/batch. Uses an `EXISTS` clause to avoid student-count weighting.

```json
// RESPONSE (200)
{
  "success": true,
  "data": {
    "programme_id": 1,
    "batch_year": 2024,
    "po_attainment": [
      { "po_name": "PO1", "attainment_value": 1.95, "offering_count": 3 },
      { "po_name": "PO2", "attainment_value": 2.10, "offering_count": 3 }
    ]
  }
}
```

`batch_year` query param is optional — omit to include all batches.

---

### 63. Calculate Programme Attainment

**POST** `/programmes/{programmeId}/attainment?batch_year=2024`

Triggers a fresh calculation of programme-level attainment (PO attainment averaged across locked offerings).

```json
// RESPONSE (200)
{
  "success": true,
  "message": "Programme attainment calculated successfully",
  "data": {
    "programme_id": 1,
    "batch_year": 2024,
    "po_attainment": [ ... ]
  }
}
```

---

### 64. Get Course-Level Programme Attainment

**GET** `/programmes/{programmeId}/attainment/courses?batch_year=2024`

Returns course-level CO/PO attainment for a programme. Shows which courses contributed to programme PO attainment.

```json
// RESPONSE (200)
{
  "success": true,
  "data": [
    {
      "offering_id": 10,
      "course_code": "CS101",
      "course_name": "Intro to Programming",
      "co_attainment": [ ... ],
      "po_attainment": [ ... ]
    }
  ]
}
```

---

### Conclude Course (triggers snapshot)

**POST** `/faculty/courses/{offeringId}/conclude`

Persists CO and PO attainment snapshots, then sets `course_faculty_assignments.is_active = 0`.

```json
// RESPONSE (200)
{
  "success": true,
  "message": "Course concluded successfully",
  "data": {
    "offering_id": 10,
    "co_attainment": [ ... ],
    "po_attainment": [ ... ]
  }
}
```

---

### Reopen Course (clears snapshot)

**POST** `/hod/offerings/{offeringId}/reopen`

Clears attainment snapshots and sets `course_faculty_assignments.is_active = 1`.

```json
// RESPONSE (200)
{ "success": true, "message": "Course offering reopened successfully" }
```

---

## Survey Management

### 65. Course Exit Survey

**GET** `/offerings/{offeringId}/survey/course-exit` — Get course exit survey data  
**DELETE** `/offerings/{offeringId}/survey/course-exit` — Clear course exit survey data

**GET** `/offerings/{offeringId}/survey/course-exit/enrollments` — Get students eligible for course exit survey

**POST** `/offerings/{offeringId}/survey/course-exit/questions` — Save manually defined course exit questions

```json
// POST /questions Request
{
  "questions": [
    { "question_text": "Rate the course content", "question_type": "rating", "max_rating": 5 }
  ]
}
```

**POST** `/offerings/{offeringId}/survey/course-exit/responses/manual` — Save manual responses for course exit survey

```json
{
  "responses": [
    { "student_rollno": "2024CSE001", "question_id": 1, "response_value": 4 }
  ]
}
```

**POST** `/offerings/{offeringId}/survey/course-exit/import` — Import course exit CSV

**GET** `/offerings/{offeringId}/survey/course-exit/results` — Get course exit survey results

---

### 66. Stakeholder Survey (Programme Level)

**GET** `/programmes/{programmeId}/survey/stakeholder` — Get stakeholder survey data  
**DELETE** `/programmes/{programmeId}/survey/stakeholder` — Clear stakeholder survey data

**POST** `/programmes/{programmeId}/survey/stakeholder/questions` — Save stakeholder survey questions

**POST** `/programmes/{programmeId}/survey/stakeholder/import` — Import stakeholder survey CSV

**GET** `/programmes/{programmeId}/survey/stakeholder/responses/manual` — Get manual stakeholder responses  
**POST** `/programmes/{programmeId}/survey/stakeholder/responses/manual` — Save manual stakeholder responses

**GET** `/programmes/{programmeId}/survey/stakeholder/results` — Get stakeholder survey results

---

## Action Plan Management

### 67. Manage Action Plans

**GET** `/programmes/{programmeId}/action-plans` — List action plans for a programme  
**POST** `/programmes/{programmeId}/action-plans` — Create a new action plan

```json
// POST Request
{
  "po_name": "PO1",
  "target_value": 2.5,
  "strategy": "Improve lab assessments",
  "timeline": "2026-2027",
  "responsible_person": "Dr. Sharma"
}
```

**PUT** `/action-plans/{planId}` — Update an action plan  
**DELETE** `/action-plans/{planId}` — Delete an action plan

```json
// PUT Request
{ "strategy": "Updated strategy", "target_value": 2.8, "status": "in_progress" }
```

---

### 68. Programme Attainment Targets

**GET** `/programmes/{programmeId}/attainment/targets` — Get attainment targets for a programme  
**POST** `/programmes/{programmeId}/attainment/targets` — Set/update attainment targets

```json
// POST Request
{
  "targets": [
    { "po_name": "PO1", "target_value": 2.5 },
    { "po_name": "PO2", "target_value": 2.0 }
  ]
}
```

---

## Error Codes

| Code | Meaning      | Common Fix                     |
| ---- | ------------ | ------------------------------ |
| 200  | Success      | -                              |
| 201  | Created      | Resource created successfully  |
| 400  | Bad Request  | Check input format             |
| 401  | Unauthorized | Add valid JWT token            |
| 403  | Forbidden    | Use account with proper role   |
| 404  | Not Found    | Check resource ID              |
| 405  | Method Not Allowed | Check HTTP method         |
| 500  | Server Error | Check logs for details         |
