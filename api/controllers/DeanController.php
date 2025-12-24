<?php

/**
 * Dean Controller
 * Handles dean-specific operations (read-only access to all data)
 * Dean can view all departments, users, courses, students, and analytics
 */
class DeanController
{
    private $userRepository;
    private $courseRepository;
    private $studentRepository;
    private $testRepository;
    private $departmentRepository;
    private $enrollmentRepository;
    private $marksRepository;

    public function __construct(
        UserRepository $userRepository,
        CourseRepository $courseRepository,
        StudentRepository $studentRepository,
        TestRepository $testRepository,
        DepartmentRepository $departmentRepository,
        EnrollmentRepository $enrollmentRepository,
        MarksRepository $marksRepository
    ) {
        $this->userRepository = $userRepository;
        $this->courseRepository = $courseRepository;
        $this->studentRepository = $studentRepository;
        $this->testRepository = $testRepository;
        $this->departmentRepository = $departmentRepository;
        $this->enrollmentRepository = $enrollmentRepository;
        $this->marksRepository = $marksRepository;
    }

    /**
     * Check if user is dean
     */
    private function requireDean()
    {
        $userData = $_REQUEST['authenticated_user'];
        
        if ($userData['role'] !== 'dean') {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'Access denied. Dean privileges required.'
            ]);
            return false;
        }
        return true;
    }

    /**
     * Get overall statistics (Dean only)
     */
    public function getStats()
    {
        if (!$this->requireDean()) return;

        try {
            // Count users by role
            $allUsers = $this->userRepository->findAll();
            $usersByRole = [
                'hod' => 0,
                'faculty' => 0,
                'staff' => 0
            ];
            foreach ($allUsers as $user) {
                $role = $user['role'];
                if (isset($usersByRole[$role])) {
                    $usersByRole[$role]++;
                }
            }

            $stats = [
                'totalDepartments' => $this->departmentRepository->countAll(),
                'totalUsers' => $this->userRepository->countAll(),
                'totalCourses' => $this->courseRepository->countAll(),
                'totalStudents' => $this->studentRepository->countAll(),
                'totalAssessments' => $this->testRepository->countAll(),
                'usersByRole' => $usersByRole
            ];

            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'message' => 'Stats retrieved successfully',
                'data' => $stats
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to retrieve stats',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Get all departments with summary (Dean only)
     */
    public function getAllDepartments()
    {
        if (!$this->requireDean()) return;

        try {
            $departments = $this->departmentRepository->findAll();
            
            // Enrich with counts
            $enrichedDepartments = [];
            foreach ($departments as $dept) {
                $deptId = $dept['department_id'];
                
                // Count users in department
                $users = $this->userRepository->findFacultyByDepartment($deptId);
                $facultyCount = 0;
                $staffCount = 0;
                $hodName = null;
                
                foreach ($users as $user) {
                    if ($user['role'] === 'faculty') $facultyCount++;
                    elseif ($user['role'] === 'staff') $staffCount++;
                    elseif ($user['role'] === 'hod') $hodName = $user['username'];
                }
                
                // Count courses in department
                $courses = $this->courseRepository->findByDepartment($deptId);
                
                // Count students in department
                $students = $this->studentRepository->findByDepartment($deptId);
                
                $enrichedDepartments[] = [
                    'department_id' => $deptId,
                    'department_name' => $dept['department_name'],
                    'department_code' => $dept['department_code'],
                    'hod_name' => $hodName,
                    'faculty_count' => $facultyCount,
                    'staff_count' => $staffCount,
                    'course_count' => count($courses),
                    'student_count' => count($students)
                ];
            }

            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'message' => 'Departments retrieved successfully',
                'data' => $enrichedDepartments
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to retrieve departments',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Get all users (Dean only)
     */
    public function getAllUsers()
    {
        if (!$this->requireDean()) return;

        try {
            $users = $this->userRepository->findAll();
            
            // Get department info for each user
            $enrichedUsers = [];
            foreach ($users as $user) {
                $userArray = [
                    'employee_id' => $user['employee_id'],
                    'username' => $user['username'],
                    'email' => $user['email'],
                    'role' => $user['role'],
                    'department_id' => $user['department_id'],
                    'department_name' => null,
                    'department_code' => null
                ];
                
                if ($user['department_id']) {
                    $dept = $this->departmentRepository->findById($user['department_id']);
                    if ($dept) {
                        $userArray['department_name'] = $dept->getDepartmentName();
                        $userArray['department_code'] = $dept->getDepartmentCode();
                    }
                }
                
                $enrichedUsers[] = $userArray;
            }

            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'message' => 'Users retrieved successfully',
                'data' => $enrichedUsers
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to retrieve users',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Get all courses with details (Dean only)
     */
    public function getAllCourses()
    {
        if (!$this->requireDean()) return;

        try {
            $courses = $this->courseRepository->findAll();
            
            // Enrich with faculty and department info
            $enrichedCourses = [];
            foreach ($courses as $course) {
                $courseArray = $course;
                
                // Get faculty info
                $faculty = $this->userRepository->findByEmployeeId($course['faculty_id']);
                if ($faculty) {
                    $courseArray['faculty_name'] = $faculty->getUsername();
                    
                    // Get department info from faculty
                    $deptId = $faculty->getDepartmentId();
                    if ($deptId) {
                        $dept = $this->departmentRepository->findById($deptId);
                        if ($dept) {
                            $courseArray['department_name'] = $dept->getDepartmentName();
                            $courseArray['department_code'] = $dept->getDepartmentCode();
                        }
                    }
                }
                
                // Get enrollment count
                $enrollments = $this->enrollmentRepository->findByCourseId($course['id']);
                $courseArray['enrollment_count'] = count($enrollments);
                
                // Get test count
                $tests = $this->testRepository->findByCourseId($course['id']);
                $courseArray['test_count'] = count($tests);
                
                $enrichedCourses[] = $courseArray;
            }

            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'message' => 'Courses retrieved successfully',
                'data' => $enrichedCourses
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to retrieve courses',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Get all students (Dean only)
     */
    public function getAllStudents()
    {
        if (!$this->requireDean()) return;

        try {
            $students = $this->studentRepository->findAll();
            
            // Enrich with department info
            $enrichedStudents = [];
            foreach ($students as $student) {
                $studentArray = $student;
                
                $dept = $this->departmentRepository->findById($student['dept']);
                if ($dept) {
                    $studentArray['department_name'] = $dept->getDepartmentName();
                    $studentArray['department_code'] = $dept->getDepartmentCode();
                }
                
                $enrichedStudents[] = $studentArray;
            }

            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'message' => 'Students retrieved successfully',
                'data' => $enrichedStudents
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to retrieve students',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Get all assessments/tests (Dean only)
     */
    public function getAllTests()
    {
        if (!$this->requireDean()) return;

        try {
            $tests = $this->testRepository->findAll();
            
            // Enrich with course and department info
            $enrichedTests = [];
            foreach ($tests as $test) {
                $testArray = $test;
                
                // Get course info
                $course = $this->courseRepository->findById($test['course_id']);
                if ($course) {
                    $testArray['course_code'] = $course->getCourseCode();
                    $testArray['course_name'] = $course->getName();
                    
                    // Get faculty info
                    $faculty = $this->userRepository->findByEmployeeId($course->getFacultyId());
                    if ($faculty) {
                        $testArray['faculty_name'] = $faculty->getUsername();
                        
                        // Get department info
                        $deptId = $faculty->getDepartmentId();
                        if ($deptId) {
                            $dept = $this->departmentRepository->findById($deptId);
                            if ($dept) {
                                $testArray['department_name'] = $dept->getDepartmentName();
                                $testArray['department_code'] = $dept->getDepartmentCode();
                            }
                        }
                    }
                }
                
                $enrichedTests[] = $testArray;
            }

            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'message' => 'Tests retrieved successfully',
                'data' => $enrichedTests
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to retrieve tests',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Get department-wise analytics (Dean only)
     */
    public function getDepartmentAnalytics()
    {
        if (!$this->requireDean()) return;

        try {
            $departments = $this->departmentRepository->findAll();
            
            $analytics = [];
            foreach ($departments as $dept) {
                $deptId = $dept['department_id'];
                
                // Get courses for this department
                $courses = $this->courseRepository->findByDepartment($deptId);
                $courseIds = array_column($courses, 'id');
                
                // Count tests for these courses
                $testCount = 0;
                foreach ($courseIds as $courseId) {
                    $tests = $this->testRepository->findByCourseId($courseId);
                    $testCount += count($tests);
                }
                
                // Count students
                $students = $this->studentRepository->findByDepartment($deptId);
                
                // Count enrollments
                $totalEnrollments = 0;
                foreach ($courseIds as $courseId) {
                    $enrollments = $this->enrollmentRepository->findByCourseId($courseId);
                    $totalEnrollments += count($enrollments);
                }
                
                $analytics[] = [
                    'department_id' => $deptId,
                    'department_name' => $dept['department_name'],
                    'department_code' => $dept['department_code'],
                    'total_courses' => count($courses),
                    'total_tests' => $testCount,
                    'total_students' => count($students),
                    'total_enrollments' => $totalEnrollments
                ];
            }

            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'message' => 'Department analytics retrieved successfully',
                'data' => $analytics
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to retrieve department analytics',
                'error' => $e->getMessage()
            ]);
        }
    }
}
