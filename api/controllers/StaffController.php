<?php

/**
 * Staff Controller
 * Handles Staff-specific operations like course management and student enrollment
 */
class StaffController
{
    protected $auditService;

    private $userRepository;
    private $courseRepository;
    private $departmentRepository;
    private $enrollmentRepository;
    private $studentRepository;
    private $courseOfferingRepository;
    private $courseFacultyAssignmentRepository;
    private $validationMiddleware;
    private $pdo;
    private $programmeRepository;
    private $programmeCourseRepository;

    public function __construct(
        ?UserRepository $userRepository = null,
        ?CourseRepository $courseRepository = null,
        ?DepartmentRepository $departmentRepository = null,
        ?EnrollmentRepository $enrollmentRepository = null,
        ?StudentRepository $studentRepository = null,
        ?ValidationMiddleware $validationMiddleware = null,
        $pdo = null,
        ?CourseOfferingRepository $courseOfferingRepository = null,
        ?CourseFacultyAssignmentRepository $courseFacultyAssignmentRepository = null
    , ?AuditService $auditService = null) {
        $this->auditService = $auditService;

        $this->userRepository = $userRepository;
        $this->courseRepository = $courseRepository;
        $this->departmentRepository = $departmentRepository;
        $this->enrollmentRepository = $enrollmentRepository;
        $this->studentRepository = $studentRepository;
        $this->courseOfferingRepository = $courseOfferingRepository;
        $this->courseFacultyAssignmentRepository = $courseFacultyAssignmentRepository;
        $this->validationMiddleware = $validationMiddleware;
        $this->pdo = $pdo;
        
        if ($this->pdo) {
            $this->programmeRepository = new ProgrammeRepository($this->pdo);
            $this->programmeCourseRepository = new ProgrammeCourseRepository($this->pdo);
        }
    }

    /**
     * Check if user is Staff
     */
    private function requireStaff()
    {
        $userData = $_REQUEST['authenticated_user'];
        
        if ($userData['role'] !== 'staff') {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'Access denied. Staff privileges required.'
            ]);
            return false;
        }
        return true;
    }

    /**
     * Get Staff dashboard statistics
     */
    public function getStats()
    {
        try {
            if (!$this->requireStaff()) return;
            
            $userData = $_REQUEST['authenticated_user'];
            $departmentId = $userData['department_id'];

            // Check if staff has department assigned
            if (!$departmentId) {
                http_response_code(200);
                header('Content-Type: application/json');
                echo json_encode([
                    'success' => true,
                    'message' => 'No department assigned',
                    'data' => [
                        'totalCourses' => 0,
                        'totalStudents' => 0,
                        'totalEnrollments' => 0
                    ]
                ]);
                return;
            }

            // Staff can see department-wide statistics
            $stats = [
                'totalCourses' => $this->courseRepository->countByDepartment($departmentId),
                'totalStudents' => $this->userRepository->countStudentsByDepartment($departmentId),
                'totalEnrollments' => $this->enrollmentRepository->countByDepartment($departmentId)
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
     * Get all courses for the staff's department
     */
    /**
     * Get courses in the staff's department — paginated
     */
    public function getDepartmentCourses()
    {
        try {
            if (!$this->requireStaff()) return;

            $departmentId = (int)($_REQUEST['authenticated_user']['department_id'] ?? 0);
            if (!$departmentId) {
                http_response_code(200);
                header('Content-Type: application/json');
                echo json_encode(['success' => true, 'message' => 'No department assigned', 'data' => [], 'pagination' => ['total' => 0, 'has_more' => false, 'next_cursor' => null, 'prev_cursor' => null, 'limit' => 20]]);
                return;
            }

            $params = PaginationHelper::parseParams(
                $_GET,
                'c.course_id',
                'c.course_id',
                ['c.course_id', 'c.course_code', 'c.course_name', 'c.credit', 'c.course_type', 'co.year', 'co.semester', 'u.username'],
                ['is_active', 'course_type', 'year', 'semester']
            );

            $total  = $this->courseRepository->countByDepartmentPaginated($departmentId, $params);
            $rows   = $this->courseRepository->findByDepartmentPaginated($departmentId, $params);
            $result = PaginationHelper::buildResponse($rows, 'course_id', $params['limit'], $total);

            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode(array_merge(['success' => true, 'message' => 'Department courses retrieved successfully'], $result));
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to retrieve courses', 'error' => $e->getMessage()]);
        }
    }

    /**
     * Get faculty/staff in the staff's department — paginated
     */
    public function getDepartmentFaculty()
    {
        try {
            if (!$this->requireStaff()) return;

            $departmentId = (int)($_REQUEST['authenticated_user']['department_id'] ?? 0);
            if (!$departmentId) {
                http_response_code(200);
                header('Content-Type: application/json');
                echo json_encode(['success' => true, 'message' => 'No department assigned', 'data' => [], 'pagination' => ['total' => 0, 'has_more' => false, 'next_cursor' => null, 'prev_cursor' => null, 'limit' => 20]]);
                return;
            }

            $params = PaginationHelper::parseParams(
                $_GET,
                'employee_id',
                'employee_id',
                ['employee_id', 'username', 'email', 'role', 'designation'],
                ['role']
            );

            $total  = $this->userRepository->countByDepartmentPaginated($departmentId, $params);
            $rows   = $this->userRepository->findByDepartmentPaginated($departmentId, $params);
            $result = PaginationHelper::buildResponse($rows, 'employee_id', $params['limit'], $total);

            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode(array_merge(['success' => true, 'message' => 'Department faculty retrieved successfully'], $result));
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to retrieve faculty', 'error' => $e->getMessage()]);
        }
    }

    /**
     * Create a new course for the department
     */
    public function createCourse()
    {
        try {
            if (!$this->requireStaff()) return;
            
            $userData = $_REQUEST['authenticated_user'];
            $departmentId = $userData['department_id'];

            if (!$departmentId) {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'No department assigned. Cannot create courses.'
                ]);
                return;
            }

            $input = json_decode(file_get_contents('php://input'), true);

            // Validate required fields
            $requiredFields = ['course_code', 'name', 'credit', 'faculty_id', 'year', 'semester'];
            $errors = [];

            foreach ($requiredFields as $field) {
                if (!isset($input[$field]) || $input[$field] === '') {
                    $errors[] = "Field '$field' is required";
                }
            }

            if (!empty($errors)) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $errors
                ]);
                return;
            }

            // Verify faculty belongs to the same department
            $faculty = $this->userRepository->findByEmployeeId($input['faculty_id']);
            $GLOBALS['audit_old_state'] = (isset($faculty) && is_object($faculty) && method_exists($faculty, 'toArray')) ? $faculty->toArray() : (isset($faculty) ? clone $faculty : null);
            if (!$faculty || $faculty->getDepartmentId() != $departmentId) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Faculty must belong to your department'
                ]);
                return;
            }

            // Check if course code already exists
            $existingCourse = $this->courseRepository->findByCourseCode($input['course_code']);
            if ($existingCourse) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Course code already exists'
                ]);
                return;
            }

            // 1. Create course template
            $course = new Course(
                null,
                $input['course_code'],
                $input['name'],
                $input['credit'],
                $departmentId
            );

            $this->courseRepository->save($course);

            // 2. Create course offering
            $offering = new CourseOffering(
                $course->getCourseId(),
                $input['year'],
                $input['semester'],
                $input['co_threshold'] ?? 40.00,
                $input['passing_threshold'] ?? 60.00
            );
            $this->courseOfferingRepository->save($offering);

            // 3. Create faculty assignment
            if (!empty($input['faculty_id'])) {
                $assignment = new CourseFacultyAssignment(
                    null,
                    $offering->getOfferingId(),
                    $input['faculty_id'],
                    'Primary'
                );
                $this->courseFacultyAssignmentRepository->save($assignment);
            }

            // Get the created course with faculty info for response
            $createdCourse = $this->courseRepository->findByIdWithFaculty($course->getCourseId());

            http_response_code(201);
            header('Content-Type: application/json');
            
            $auditPayload = isset($input) ? $input : (isset($data) ? $data : null);
            if (isset($this->auditService)) {
                $this->auditService->log('CREATE', 'Course', null, null, $auditPayload);
            }
            if (isset($GLOBALS['fileLogger'])) {
                $GLOBALS['fileLogger']->log('INFO', 'StaffController', 'CREATE operation successful in createCourse');
            }
            echo json_encode([
                'success' => true,
                'message' => 'Course created successfully',
                'data' => $createdCourse
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to create course',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Update a course
     */
    public function updateCourse($courseId)
    {
        try {
            if (!$this->requireStaff()) return;
            
            $userData = $_REQUEST['authenticated_user'];
            $departmentId = $userData['department_id'];

            if (!$departmentId) {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'No department assigned. Cannot update courses.'
                ]);
                return;
            }

            // Get existing course
            $existingCourse = $this->courseRepository->findById($courseId);
            $GLOBALS['audit_old_state'] = (isset($existingCourse) && is_object($existingCourse) && method_exists($existingCourse, 'toArray')) ? $existingCourse->toArray() : (isset($existingCourse) ? clone $existingCourse : null);
            if (!$existingCourse) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Course not found'
                ]);
                return;
            }

            // Check course belongs to department
            if ($existingCourse->getDepartmentId() != $departmentId) {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'You can only update courses in your department'
                ]);
                return;
            }

            $input = json_decode(file_get_contents('php://input'), true);

            // Update course fields
            if (isset($input['course_code'])) {
                // Check if new code conflicts with another course
                $conflictingCourse = $this->courseRepository->findByCourseCode($input['course_code']);
                if ($conflictingCourse && $conflictingCourse->getCourseId() != $courseId) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Course code already exists'
                    ]);
                    return;
                }
                $existingCourse->setCourseCode($input['course_code']);
            }
            if (isset($input['name'])) $existingCourse->setCourseName($input['name']);
            if (isset($input['credit'])) $existingCourse->setCredit($input['credit']);
            if (isset($input['faculty_id'])) {
                // Verify new faculty belongs to department
                $newFaculty = $this->userRepository->findByEmployeeId($input['faculty_id']);
                if (!$newFaculty || $newFaculty->getDepartmentId() != $departmentId) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Faculty must belong to your department'
                    ]);
                    return;
                }
                $existingCourse->setFacultyId($input['faculty_id']);
            }
            if (isset($input['year'])) $existingCourse->setYear($input['year']);
            if (isset($input['semester'])) $existingCourse->setSemester($input['semester']);

            $this->courseRepository->save($existingCourse);

            // Get updated course with faculty info
            $updatedCourse = $this->courseRepository->findByIdWithFaculty($courseId);

            http_response_code(200);
            header('Content-Type: application/json');
            
            $auditPayload = isset($input) ? $input : (isset($data) ? $data : null);
            if (isset($this->auditService)) {
                $this->auditService->log('UPDATE', 'Course', null, ($GLOBALS['audit_old_state'] ?? null), $auditPayload);
            }
            if (isset($GLOBALS['fileLogger'])) {
                $GLOBALS['fileLogger']->log('INFO', 'StaffController', 'UPDATE operation successful in updateCourse');
            }
            echo json_encode([
                'success' => true,
                'message' => 'Course updated successfully',
                'data' => $updatedCourse
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to update course',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Delete a course
     */
    public function deleteCourse($courseId)
    {
        try {
            if (!$this->requireStaff()) return;
            
            $userData = $_REQUEST['authenticated_user'];
            $departmentId = $userData['department_id'];

            if (!$departmentId) {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'No department assigned. Cannot delete courses.'
                ]);
                return;
            }

            // Get existing course
            $existingCourse = $this->courseRepository->findById($courseId);
            $GLOBALS['audit_old_state'] = (isset($existingCourse) && is_object($existingCourse) && method_exists($existingCourse, 'toArray')) ? $existingCourse->toArray() : (isset($existingCourse) ? clone $existingCourse : null);
            if (!$existingCourse) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Course not found'
                ]);
                return;
            }

            // Check course belongs to department
            if ($existingCourse->getDepartmentId() != $departmentId) {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'You can only delete courses in your department'
                ]);
                return;
            }

            $this->courseRepository->delete($courseId);

            http_response_code(200);
            header('Content-Type: application/json');
            
            $auditPayload = isset($input) ? $input : (isset($data) ? $data : null);
            if (isset($this->auditService)) {
                $this->auditService->log('DELETE', 'Course', null, ($GLOBALS['audit_old_state'] ?? $auditPayload), null);
            }
            if (isset($GLOBALS['fileLogger'])) {
                $GLOBALS['fileLogger']->log('INFO', 'StaffController', 'DELETE operation successful in deleteCourse');
            }
            echo json_encode([
                'success' => true,
                'message' => 'Course deleted successfully'
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to delete course',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Get enrollments for a specific course offering
     */
    public function getCourseEnrollments($offeringId)
    {
        try {
            if (!$this->requireStaff()) return;

            $userData = $_REQUEST['authenticated_user'];
            $departmentId = $userData['department_id'];

            // Verify offering exists
            $offering = $this->courseOfferingRepository->findById($offeringId);
            $GLOBALS['audit_old_state'] = (isset($offering) && is_object($offering) && method_exists($offering, 'toArray')) ? $offering->toArray() : (isset($offering) ? clone $offering : null);
            if (!$offering) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Course offering not found'
                ]);
                return;
            }

            // Verify course belongs to the staff's department
            $course = $this->courseRepository->findById($offering->getCourseId());
            if (!$course || $course->getDepartmentId() != $departmentId) {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'You are not authorized to view enrollments for this offering'
                ]);
                return;
            }

            // Get enrollments
            $enrollments = $this->enrollmentRepository->findByOfferingId($offeringId);
            $count = count($enrollments);

            http_response_code(200);
            
            $auditPayload = isset($input) ? $input : (isset($data) ? $data : null);
            if (isset($this->auditService)) {
                $this->auditService->log('CREATE', 'getCourseEnrollments', null, null, $auditPayload);
            }
            if (isset($GLOBALS['fileLogger'])) {
                $GLOBALS['fileLogger']->log('INFO', 'StaffController', 'CREATE operation successful in getCourseEnrollments');
            }
            echo json_encode([
                'success' => true,
                'message' => "Found $count enrolled students",
                'data' => [
                    'offering_id' => $offeringId,
                    'course_id' => $course->getCourseId(),
                    'course_code' => $course->getCourseCode(),
                    'course_name' => $course->getCourseName(),
                    'enrollment_count' => $count,
                    'enrollments' => $enrollments
                ]
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Bulk enroll students in a course offering
     */
    public function bulkEnroll($offeringId)
    {
        try {
            if (!$this->requireStaff()) return;

            $userData = $_REQUEST['authenticated_user'];
            $departmentId = $userData['department_id'];

            // Get request body
            $data = json_decode(file_get_contents('php://input'), true);

            // Validate students array
            if (!isset($data['students']) || !is_array($data['students'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'students array is required'
                ]);
                return;
            }

            if (empty($data['students'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'students array cannot be empty'
                ]);
                return;
            }

            // Verify offering exists
            $offering = $this->courseOfferingRepository->findById($offeringId);
            $GLOBALS['audit_old_state'] = (isset($offering) && is_object($offering) && method_exists($offering, 'toArray')) ? $offering->toArray() : (isset($offering) ? clone $offering : null);
            if (!$offering) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Course offering not found'
                ]);
                return;
            }

            // Check if the course belongs to the staff's department
            $course = $this->courseRepository->findById($offering->getCourseId());
            if (!$course || $course->getDepartmentId() != $departmentId) {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'You are not authorized to enroll students in this offering'
                ]);
                return;
            }

            // Validate each student entry
            $validatedStudents = [];
            foreach ($data['students'] as $index => $student) {
                if (!isset($student['rollno']) || !isset($student['name'])) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => "Student at index $index missing rollno or name"
                    ]);
                    return;
                }

                $rollno = trim($student['rollno']);
                $name = trim($student['name']);

                if (empty($rollno) || empty($name)) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => "Student at index $index has empty rollno or name"
                    ]);
                    return;
                }

                // Check if student exists in database, if not create them
                $existingStudent = $this->studentRepository->findByRollno($rollno);
                if (!$existingStudent) {
                    $programmeId = $this->studentRepository->findFirstProgrammeIdByDepartment((int)$departmentId);
                    if (!$programmeId) {
                        http_response_code(400);
                        echo json_encode([
                            'success' => false,
                            'message' => "No programme configured for department ID {$departmentId}"
                        ]);
                        return;
                    }

                    $studentModel = new Student($rollno, $name, $programmeId);
                    $this->studentRepository->save($studentModel);
                }

                $validatedStudents[] = [
                    'rollno' => $rollno,
                    'name' => $name
                ];
            }

            // Perform bulk enrollment using offering_id
            $results = $this->enrollmentRepository->bulkEnrollStudents($offeringId, $validatedStudents);

            // Return results
            http_response_code(200);
            
            $auditPayload = isset($input) ? $input : (isset($data) ? $data : null);
            if (isset($this->auditService)) {
                $this->auditService->log('CREATE', 'bulkEnroll', null, null, $auditPayload);
            }
            if (isset($GLOBALS['fileLogger'])) {
                $GLOBALS['fileLogger']->log('INFO', 'StaffController', 'CREATE operation successful in bulkEnroll');
            }
            echo json_encode([
                'success' => true,
                'message' => "Enrollment completed: {$results['success_count']} successful, {$results['failure_count']} failed",
                'data' => $results
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Remove a student from a course offering
     */
    public function removeEnrollment($offeringId, $rollno)
    {
        try {
            if (!$this->requireStaff()) return;

            $userData = $_REQUEST['authenticated_user'];
            $departmentId = $userData['department_id'];

            // Verify offering exists
            $offering = $this->courseOfferingRepository->findById($offeringId);
            $GLOBALS['audit_old_state'] = (isset($offering) && is_object($offering) && method_exists($offering, 'toArray')) ? $offering->toArray() : (isset($offering) ? clone $offering : null);
            if (!$offering) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Course offering not found'
                ]);
                return;
            }

            // Check if the course belongs to the staff's department
            $course = $this->courseRepository->findById($offering->getCourseId());
            if (!$course || $course->getDepartmentId() != $departmentId) {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'You are not authorized to remove enrollments from this offering'
                ]);
                return;
            }

            // Check if student is enrolled
            if (!$this->enrollmentRepository->isEnrolled($offeringId, $rollno)) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Student is not enrolled in this offering'
                ]);
                return;
            }            // Remove enrollment
            $this->enrollmentRepository->removeEnrollment($offeringId, $rollno);

            http_response_code(200);
            
            $auditPayload = isset($input) ? $input : (isset($data) ? $data : null);
            if (isset($this->auditService)) {
                $this->auditService->log('DELETE', 'removeEnrollment', null, null, $auditPayload);
            }
            if (isset($GLOBALS['fileLogger'])) {
                $GLOBALS['fileLogger']->log('INFO', 'StaffController', 'DELETE operation successful in removeEnrollment');
            }
            echo json_encode([
                'success' => true,
                'message' => 'Student removed from offering successfully'
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage()
            ]);
        }
    }


    /**
     * Get students in the staff's department — paginated
     */
    public function getDepartmentStudents()
    {
        try {
            if (!$this->requireStaff()) return;

            $departmentId = (int)($_REQUEST['authenticated_user']['department_id'] ?? 0);
            if (!$departmentId) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Department not assigned']);
                return;
            }

            $params = PaginationHelper::parseParams(
                $_GET,
                's.roll_no',
                's.roll_no',
                ['s.roll_no', 's.student_name', 's.batch_year', 's.student_status'],
                ['batch_year', 'student_status', 'programme_id', 'course_code']
            );

            $total  = $this->studentRepository->countByDepartmentPaginated($departmentId, $params);
            $rows   = $this->studentRepository->findByDepartmentPaginated($departmentId, $params);
            $result = PaginationHelper::buildResponse($rows, 'roll_no', $params['limit'], $total);

            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode(array_merge(['success' => true, 'message' => 'Department students retrieved successfully'], $result));
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to retrieve students', 'error' => $e->getMessage()]);
        }
    }

    /**
     * Get base courses for the staff's department — paginated
     */
    public function getBaseCourses() {
        try {
            if (!$this->requireStaff()) return;

            $departmentId = (int)($_REQUEST['authenticated_user']['department_id'] ?? 0);
            if (!$departmentId) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Department not assigned']);
                return;
            }

            $params = PaginationHelper::parseParams(
                $_GET,
                'course_id',
                'c.course_id',
                ['course_code', 'course_name', 'credit', 'course_type', 'course_level'],
                ['is_active', 'course_type']
            );

            $total = $this->courseRepository->countBaseCoursesByDepartmentPaginated($departmentId, $params);
            $rows  = $this->courseRepository->findBaseCoursesByDepartmentPaginated($departmentId, $params);

            $result = PaginationHelper::buildResponse($rows, 'course_id', $params['limit'], $total);

            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode(array_merge(['success' => true, 'message' => 'Base courses retrieved successfully'], $result));
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to retrieve base courses', 'error' => $e->getMessage()]);
        }
    }

    /**
     * Get programmes associated with the staff's department
     */
    public function getDepartmentProgrammes()
    {
        try {
            if (!$this->requireStaff()) return;

            $departmentId = (int)($_REQUEST['authenticated_user']['department_id'] ?? 0);

            $params = PaginationHelper::parseParams(
                $_GET,
                'p.programme_id',
                'p.programme_id',
                ['p.programme_id', 'p.programme_code', 'p.programme_name', 'd.department_name', 'd.department_code', 'p.degree_level', 'p.duration_years'],
                ['degree_level', 'year', 'has_batches', 'batch_year_max']
            );

            // Override department_id filter to restrict to staff's own department
            $params['department_id'] = $departmentId;

            $total = $this->programmeRepository->countEnrichedPaginated($params);
            $rows = $this->programmeRepository->findEnrichedPaginated($params);
            $result = PaginationHelper::buildResponse($rows, 'programme_id', $params['limit'], $total);

            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode(array_merge(['success' => true, 'message' => 'Programmes retrieved successfully'], $result));
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to retrieve programmes', 'error' => $e->getMessage()]);
        }
    }

    /**
     * Helper to restrict programme access to staff's department
     */
    private function requireProgrammeAccess(int $programmeId): ?array
    {
        $departmentId = (int)($_REQUEST['authenticated_user']['department_id'] ?? 0);
        $programme = $this->programmeRepository->findById($programmeId);
        if (!$programme || $programme->getDepartmentId() !== $departmentId) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Access denied to this programme']);
            return null;
        }
        return ['programme' => $programme, 'department_id' => $departmentId];
    }

    /**
     * Get programmes with distinct batch_year combinations for the staff's department
     */
    public function getProgrammesWithBatches()
    {
        try {
            if (!$this->requireStaff()) return;

            $departmentId = (int)($_REQUEST['authenticated_user']['department_id'] ?? 0);
            $rows = $this->programmeRepository->getProgrammesWithBatches($departmentId);

            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'message' => 'Programmes with batches retrieved successfully',
                'data' => $rows,
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to retrieve programmes with batches', 'error' => $e->getMessage()]);
        }
    }

    /**
     * Create a new programme (auto-assigned to staff's department)
     */
    public function createProgramme()
    {
        try {
            if (!$this->requireStaff()) return;

            $departmentId = (int)($_REQUEST['authenticated_user']['department_id'] ?? 0);
            if (!$departmentId) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Department not assigned']);
                return;
            }

            $input = json_decode(file_get_contents('php://input'), true);
            if (empty($input['programme_name']) || empty($input['programme_code'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'programme_name and programme_code are required']);
                return;
            }

            $programmeCode = strtoupper(trim($input['programme_code']));
            $programmeName = trim($input['programme_name']);

            if ($this->programmeRepository->codeExists($programmeCode)) {
                http_response_code(409);
                echo json_encode(['success' => false, 'message' => 'Programme code already exists']);
                return;
            }

            if ($this->programmeRepository->nameExists($programmeName)) {
                http_response_code(409);
                echo json_encode(['success' => false, 'message' => 'Programme name already exists']);
                return;
            }

            $programme = new Programme(
                null,
                $departmentId,
                $programmeCode,
                $programmeName,
                $input['degree_level'] ?? 'UG',
                isset($input['duration_years']) ? (int)$input['duration_years'] : 4
            );

            $result = $this->programmeRepository->save($programme);
            if (!$result) {
                throw new Exception('Failed to create programme');
            }

            http_response_code(201);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'message' => 'Programme created successfully',
                'data' => $programme->toArray(),
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to create programme', 'error' => $e->getMessage()]);
        }
    }

    /**
     * Update a programme (restricted to staff's department)
     */
    public function updateProgramme($programmeId)
    {
        try {
            if (!$this->requireStaff()) return;
            $access = $this->requireProgrammeAccess((int)$programmeId);
            if (!$access) return;

            $input = json_decode(file_get_contents('php://input'), true);
            $programme = $access['programme'];

            if (!empty($input['programme_code'])) {
                $newCode = strtoupper(trim($input['programme_code']));
                if ($newCode !== $programme->getProgrammeCode() && $this->programmeRepository->codeExists($newCode, (int)$programmeId)) {
                    http_response_code(409);
                    echo json_encode(['success' => false, 'message' => 'Programme code already exists']);
                    return;
                }
                $programme->setProgrammeCode($newCode);
            }

            if (!empty($input['programme_name'])) {
                $newName = trim($input['programme_name']);
                if ($newName !== $programme->getProgrammeName() && $this->programmeRepository->nameExists($newName, (int)$programmeId)) {
                    http_response_code(409);
                    echo json_encode(['success' => false, 'message' => 'Programme name already exists']);
                    return;
                }
                $programme->setProgrammeName($newName);
            }

            if (array_key_exists('degree_level', $input)) {
                $programme->setDegreeLevel($input['degree_level']);
            }

            if (array_key_exists('duration_years', $input)) {
                $programme->setDurationYears($input['duration_years']);
            }

            $result = $this->programmeRepository->save($programme);
            if (!$result) {
                throw new Exception('Failed to update programme');
            }

            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'message' => 'Programme updated successfully',
                'data' => $programme->toArray(),
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to update programme', 'error' => $e->getMessage()]);
        }
    }

    /**
     * Delete a programme (restricted to staff's department)
     */
    public function deleteProgramme($programmeId)
    {
        try {
            if (!$this->requireStaff()) return;
            $access = $this->requireProgrammeAccess((int)$programmeId);
            if (!$access) return;

            $studentCount = $this->programmeRepository->countStudents($programmeId);
            if ($studentCount > 0) {
                http_response_code(409);
                echo json_encode(['success' => false, 'message' => "Cannot delete programme. It has {$studentCount} student(s) assigned."]);
                return;
            }

            $result = $this->programmeRepository->delete($programmeId);
            if (!$result) {
                throw new Exception('Failed to delete programme');
            }

            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode(['success' => true, 'message' => 'Programme deleted successfully']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to delete programme', 'error' => $e->getMessage()]);
        }
    }

    /**
     * Bulk enroll students into a programme (restricted to staff's department)
     * POST /staff/programmes/{id}/students/bulk
     */
    public function bulkEnrollStudentsToProgramme($programmeId)
    {
        try {
            if (!$this->requireStaff()) return;
            $access = $this->requireProgrammeAccess((int)$programmeId);
            if (!$access) return;

            $input = json_decode(file_get_contents('php://input'), true);
            if (!isset($input['students']) || !is_array($input['students']) || empty($input['students'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'students array is required and cannot be empty']);
                return;
            }

            $globalBatchYear = isset($input['batch_year']) ? (int)$input['batch_year'] : null;

            $success = [];
            $failed = [];

            foreach ($input['students'] as $index => $row) {
                $rollno = isset($row['rollno']) ? trim($row['rollno']) : '';
                $name = isset($row['name']) ? trim($row['name']) : '';

                if ($rollno === '' || $name === '') {
                    $failed[] = ['index' => $index, 'rollno' => $rollno, 'reason' => 'rollno and name are required'];
                    continue;
                }

                $studentBatchYear = isset($row['batch_year']) ? (int)$row['batch_year'] : $globalBatchYear;

                try {
                    $existing = $this->studentRepository->findByRollno($rollno);
                    if ($existing) {
                        $existing->setStudentName($name);
                        $existing->setProgrammeId((int)$programmeId);
                        if ($studentBatchYear !== null) {
                            $existing->setBatchYear($studentBatchYear);
                        }
                        $this->studentRepository->update($existing);
                    } else {
                        $student = new Student($rollno, $name, (int)$programmeId, $studentBatchYear);
                        $this->studentRepository->save($student);
                    }
                    $success[] = ['rollno' => $rollno, 'name' => $name];
                } catch (Exception $ex) {
                    $failed[] = ['index' => $index, 'rollno' => $rollno, 'reason' => $ex->getMessage()];
                }
            }

            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'data' => [
                    'programme_id' => (int)$programmeId,
                    'success_count' => count($success),
                    'failure_count' => count($failed),
                    'successful' => $success,
                    'failed' => $failed,
                ],
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to bulk enroll students', 'error' => $e->getMessage()]);
        }
    }

    /**
     * Get courses assigned to a programme (restricted to staff's department)
     */
    public function getProgrammeCourses($programmeId)
    {
        try {
            if (!$this->requireStaff()) return;
            if (!$this->requireProgrammeAccess((int)$programmeId)) return;

            $courses = $this->programmeCourseRepository->findByProgrammeId((int)$programmeId);
            $available = $this->programmeCourseRepository->findAvailableCourses((int)$programmeId);

            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'data' => [
                    'courses' => $courses,
                    'available' => $available,
                ],
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to retrieve programme courses', 'error' => $e->getMessage()]);
        }
    }

    /**
     * Assign a course to a programme (restricted to staff's department)
     */
    public function addProgrammeCourse($programmeId)
    {
        try {
            if (!$this->requireStaff()) return;
            if (!$this->requireProgrammeAccess((int)$programmeId)) return;

            $input = json_decode(file_get_contents('php://input'), true);
            $courseId = isset($input['course_id']) ? (int)$input['course_id'] : 0;

            if ($courseId <= 0) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'course_id is required']);
                return;
            }

            $this->programmeCourseRepository->addCourse((int)$programmeId, $courseId);

            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode(['success' => true, 'message' => 'Course assigned to programme']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to assign course', 'error' => $e->getMessage()]);
        }
    }

    /**
     * Remove a course from a programme (restricted to staff's department)
     */
    public function removeProgrammeCourse($programmeId, $courseId)
    {
        try {
            if (!$this->requireStaff()) return;
            if (!$this->requireProgrammeAccess((int)$programmeId)) return;

            if (!$this->programmeCourseRepository->exists((int)$programmeId, (int)$courseId)) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Course not assigned to this programme']);
                return;
            }

            $this->programmeCourseRepository->removeCourse((int)$programmeId, (int)$courseId);

            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode(['success' => true, 'message' => 'Course removed from programme']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to remove course', 'error' => $e->getMessage()]);
        }
    }

    /**
     * List batches for a programme
     */
    public function listBatches($programmeId)
    {
        try {
            if (!$this->requireStaff()) return;
            if (!$this->requireProgrammeAccess((int)$programmeId)) return;

            $rows = $this->programmeRepository->getBatchesByProgramme((int)$programmeId);

            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode(['success' => true, 'data' => $rows]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to list batches', 'error' => $e->getMessage()]);
        }
    }

    /**
     * Create a new batch for a programme
     */
    public function createBatch($programmeId)
    {
        try {
            if (!$this->requireStaff()) return;
            if (!$this->requireProgrammeAccess((int)$programmeId)) return;

            $input = json_decode(file_get_contents('php://input'), true);
            $batchYear = isset($input['batch_year']) ? (int)$input['batch_year'] : 0;
            $status = $input['status'] ?? 'upcoming';

            if ($batchYear < 2000 || $batchYear > 2100) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid batch_year']);
                return;
            }

            $batchId = $this->programmeRepository->createBatch((int)$programmeId, $batchYear, $status);

            http_response_code(201);
            header('Content-Type: application/json');
            echo json_encode(['success' => true, 'data' => ['batch_id' => $batchId]]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to create batch', 'error' => $e->getMessage()]);
        }
    }

    /**
     * Get batch details
     */
    public function getBatch($batchId)
    {
        try {
            if (!$this->requireStaff()) return;

            $batch = $this->programmeRepository->getBatchById((int)$batchId);
            if (!$batch) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Batch not found']);
                return;
            }

            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode(['success' => true, 'data' => $batch]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to get batch', 'error' => $e->getMessage()]);
        }
    }
}
