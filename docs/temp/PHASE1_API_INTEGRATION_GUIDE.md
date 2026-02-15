# Phase 1 Quick API Integration Guide

## New Repository Usage Examples

### 1. School Management

```php
// In a controller (e.g., AdminController.php)
require_once __DIR__ . '/../models/School.php';
require_once __DIR__ . '/../models/SchoolRepository.php';

// Get all schools
$schoolRepo = new SchoolRepository($this->db);
$schools = $schoolRepo->findAll();
// Returns: [
//   ['school_id' => 1, 'school_code' => 'SOE', 'school_name' => 'School of Engineering', ...]
// ]

// Create a new school
$school = new School(null, 'SOM', 'School of Management', 'Business school');
$schoolId = $schoolRepo->create($school);

// Get departments in a school
$departments = $schoolRepo->getDepartmentsBySchool(1);
```

---

### 2. HOD Assignment Management

```php
// In HODController.php or AdminController.php
require_once __DIR__ . '/../models/HODAssignment.php';
require_once __DIR__ . '/../models/HODAssignmentRepository.php';

$hodRepo = new HODAssignmentRepository($this->db);

// Get current HOD for a department
$currentHOD = $hodRepo->getCurrentHOD($departmentId);
// Returns: HODAssignment object or null

// Get all current HODs (for admin dashboard)
$allHODs = $hodRepo->getAllCurrentHODs();
// Returns: [
//   ['id' => 1, 'department_id' => 1, 'department_name' => 'CSE',
//    'employee_id' => 2001, 'username' => 'Dr. Smith', 'designation' => 'Professor', ...]
// ]

// Assign new HOD (automatically ends previous assignment)
$newAssignment = new HODAssignment(
    null,                    // id (auto-increment)
    $departmentId,          // department_id
    $newEmployeeId,         // employee_id
    date('Y-m-d'),          // start_date
    null,                   // end_date (null for current)
    1,                      // is_current
    'Order/2024/01'         // appointment_order (optional)
);
$assignmentId = $hodRepo->create($newAssignment);

// Get HOD history for a department
$history = $hodRepo->getHistoryByDepartment($departmentId);
// Returns: Array of all HOD assignments (past and present) with user details
```

---

### 3. Dean Assignment Management

```php
// In DeanController.php or AdminController.php
require_once __DIR__ . '/../models/DeanAssignment.php';
require_once __DIR__ . '/../models/DeanAssignmentRepository.php';

$deanRepo = new DeanAssignmentRepository($this->db);

// Get current Dean for a school
$currentDean = $deanRepo->getCurrentDean($schoolId);

// Get all current Deans
$allDeans = $deanRepo->getAllCurrentDeans();

// Assign new Dean
$newAssignment = new DeanAssignment(
    null, $schoolId, $newEmployeeId, date('Y-m-d'), null, 1, 'Order/2024/05'
);
$deanRepo->create($newAssignment);

// Get Dean history for a school
$history = $deanRepo->getHistoryBySchool($schoolId);
```

---

### 4. Course-Faculty Assignment Management

```php
// In FacultyController.php or HODController.php
require_once __DIR__ . '/../models/CourseFacultyAssignment.php';
require_once __DIR__ . '/../models/CourseFacultyAssignmentRepository.php';

$cfaRepo = new CourseFacultyAssignmentRepository($this->db);

// Get all faculty assigned to a course
$assignments = $cfaRepo->getAssignmentsByCourse($courseId, 2024, 1);
// Returns: [
//   ['id' => 1, 'course_id' => 101, 'employee_id' => 3001, 'year' => 2024,
//    'semester' => 1, 'assignment_type' => 'Primary', 'username' => 'Dr. Smith', ...]
// ]

// Get all courses for a faculty
$myCourses = $cfaRepo->getAssignmentsByFaculty($employeeId, 2024, 1);

// Get primary instructor for a course
$primaryFaculty = $cfaRepo->getPrimaryFaculty($courseId, 2024, 1);

// Assign faculty to a course
$assignment = new CourseFacultyAssignment(
    null,              // id
    $courseId,         // course_id
    $employeeId,       // employee_id
    2024,              // year
    1,                 // semester
    'Co-instructor',   // assignment_type (Primary/Co-instructor/Lab)
    date('Y-m-d'),     // assigned_date
    null,              // completion_date
    1                  // is_active
);
$cfaRepo->create($assignment);

// Get all assignments for a department
$deptAssignments = $cfaRepo->getAssignmentsByDepartment($departmentId, 2024, 1);
```

---

## Updated Repository Usage

### Department Repository (Now with school_id)

```php
$deptRepo = new DepartmentRepository($this->db);

// Create department with school
$dept = new Department(
    null,               // department_id
    'Mechanical Eng',   // department_name
    'MECH',            // department_code
    1,                 // school_id (links to schools table)
    'Mechanical and Manufacturing Engineering department',
    null               // created_at (auto)
);
$deptRepo->save($dept);

// Existing code still works (school_id optional)
$dept = new Department(null, 'CSE', 'CSE'); // Old way
$deptRepo->save($dept);
```

### User Repository (Now with designation & phone)

```php
$userRepo = new UserRepository($this->db);

// Create user with new fields
$user = new User(
    4001,                      // employee_id
    'Dr. Jane Doe',           // username
    'jane.doe@example.com',   // email
    password_hash('pass123', PASSWORD_BCRYPT),
    'faculty',                // role
    1,                        // department_id
    'Assistant Professor',    // designation (new)
    '+91-9876543210',        // phone (new)
    null,                     // created_at (auto)
    null                      // updated_at (auto)
);
$userRepo->save($user);

// Existing code still works
$user = new User(4002, 'Dr. Smith', 'smith@example.com', $hash, 'hod', 2);
$userRepo->save($user);
```

### Course Repository (Now with department_id & course_type)

```php
$courseRepo = new CourseRepository($this->db);

// Create course with new fields
$course = new Course(
    null,              // id
    'CS301',           // course_code
    'Data Structures', // name
    4,                 // credit
    3001,              // faculty_id (still required!)
    2024,              // year (still required!)
    1,                 // semester (still required!)
    null,              // syllabus_pdf
    40.00,             // co_threshold
    60.00,             // passing_threshold
    1,                 // department_id (new)
    'Theory',          // course_type (new: Theory/Lab/Project/Seminar)
    null,              // created_at (auto)
    null               // updated_at (auto)
);
$courseRepo->save($course);

// Existing code still works
$course = new Course(null, 'CS302', 'Algorithms', 4, 3001, 2024, 1);
$courseRepo->save($course);
```

---

## Helper Views Usage

### v_current_hods

```php
// Direct SQL query (in any controller)
$stmt = $this->db->query("SELECT * FROM v_current_hods ORDER BY department_name");
$currentHODs = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Returns:
// [
//   ['department_id' => 1, 'department_name' => 'CSE', 'department_code' => 'CSE',
//    'employee_id' => 2001, 'hod_name' => 'Dr. Smith', 'email' => '...',
//    'designation' => 'Professor', 'start_date' => '2024-02-14']
// ]
```

### v_current_deans

```php
$stmt = $this->db->query("SELECT * FROM v_current_deans ORDER BY school_name");
$currentDeans = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Returns:
// [
//   ['school_id' => 1, 'school_name' => 'School of Engineering',
//    'employee_id' => 1002, 'dean_name' => 'Dr. Admin', 'email' => '...', ...]
// ]
```

---

## Common Use Cases

### 1. Admin Dashboard - Show All HODs

```php
// In AdminController.php
public function getCurrentHODs() {
    try {
        require_once __DIR__ . '/../models/HODAssignmentRepository.php';
        $hodRepo = new HODAssignmentRepository($this->db);

        $hods = $hodRepo->getAllCurrentHODs();

        return [
            'success' => true,
            'data' => $hods
        ];
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => $e->getMessage()
        ];
    }
}
```

### 2. HOD Change Process

```php
// In AdminController.php
public function changeHOD($departmentId, $newEmployeeId) {
    try {
        require_once __DIR__ . '/../models/HODAssignment.php';
        require_once __DIR__ . '/../models/HODAssignmentRepository.php';

        $hodRepo = new HODAssignmentRepository($this->db);

        // Create new assignment (automatically ends previous one via transaction)
        $assignment = new HODAssignment(
            null,
            $departmentId,
            $newEmployeeId,
            date('Y-m-d'),
            null,
            1
        );

        $assignmentId = $hodRepo->create($assignment);

        return [
            'success' => true,
            'message' => 'HOD changed successfully',
            'assignment_id' => $assignmentId
        ];
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => $e->getMessage()
        ];
    }
}
```

### 3. Faculty Dashboard - My Courses (Using New System)

```php
// In FacultyController.php
public function getMyCourses($employeeId, $year, $semester) {
    try {
        require_once __DIR__ . '/../models/CourseFacultyAssignmentRepository.php';
        $cfaRepo = new CourseFacultyAssignmentRepository($this->db);

        $courses = $cfaRepo->getAssignmentsByFaculty($employeeId, $year, $semester);

        return [
            'success' => true,
            'data' => $courses
        ];
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => $e->getMessage()
        ];
    }
}
```

### 4. Course Details with All Instructors

```php
// In CourseController.php or FacultyController.php
public function getCourseWithInstructors($courseId, $year, $semester) {
    try {
        require_once __DIR__ . '/../models/CourseRepository.php';
        require_once __DIR__ . '/../models/CourseFacultyAssignmentRepository.php';

        $courseRepo = new CourseRepository($this->db);
        $cfaRepo = new CourseFacultyAssignmentRepository($this->db);

        $course = $courseRepo->findByIdWithFaculty($courseId);
        $instructors = $cfaRepo->getAssignmentsByCourse($courseId, $year, $semester);

        return [
            'success' => true,
            'course' => $course,
            'instructors' => $instructors
        ];
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => $e->getMessage()
        ];
    }
}
```

---

## Migration Tips

### Gradual Adoption Strategy:

1. **Phase 1A** (Now): Use new models for reading data
    - Query `hod_assignments` to show HOD history
    - Query `course_faculty_assignments` to show all instructors
    - No changes to core functionality

2. **Phase 1B** (Later): Use new models for writing data
    - Create HOD assignments when promoting users
    - Create course assignments when assigning courses
    - Keep old fields updated for backward compatibility

3. **Phase 2** (Future): Deprecate old fields
    - Stop using course.faculty_id in favor of course_faculty_assignments
    - Remove 'hod'/'dean' from role ENUM
    - Update all queries

### Dual-Write Pattern (Recommended for Now):

```php
// When assigning a course, update BOTH old and new systems
$course->setFacultyId($employeeId); // Old way (keep for now)
$courseRepo->save($course);

// Also create assignment record (new way)
$assignment = new CourseFacultyAssignment(
    null, $course->getId(), $employeeId, $year, $semester, 'Primary', date('Y-m-d'), null, 1
);
$cfaRepo->create($assignment);
```

---

## Testing Endpoints (Examples)

```bash
# Get all schools
curl -X GET http://localhost/nba/api/admin/schools

# Get current HODs
curl -X GET http://localhost/nba/api/admin/current-hods

# Get current Deans
curl -X GET http://localhost/nba/api/dean/current-deans

# Get course instructors
curl -X GET http://localhost/nba/api/courses/101/instructors?year=2024&semester=1

# Get faculty courses
curl -X GET http://localhost/nba/api/faculty/my-courses?year=2024&semester=1

# Change HOD
curl -X POST http://localhost/nba/api/admin/change-hod \
  -H "Content-Type: application/json" \
  -d '{"department_id": 1, "employee_id": 2002, "appointment_order": "Order/2024/10"}'
```

---

## Important Notes

1. **Existing code continues to work** - All old queries, models, and API endpoints remain functional
2. **New features are optional** - You can adopt them gradually
3. **No breaking changes** - course.faculty_id, users.role still in use
4. **Transaction safety** - HOD/Dean assignment creation uses DB transactions
5. **Validation** - All models validate input before saving

---

**Ready to use!** Start integrating new repositories into controllers as needed.
