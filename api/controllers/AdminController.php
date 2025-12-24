<?php

/**
 * Admin Controller
 * Handles admin-specific operations like dashboard stats and data management
 */
class AdminController
{
    private $userRepository;
    private $courseRepository;
    private $studentRepository;
    private $testRepository;
    private $departmentRepository;

    public function __construct(
        UserRepository $userRepository,
        CourseRepository $courseRepository,
        StudentRepository $studentRepository,
        TestRepository $testRepository,
        DepartmentRepository $departmentRepository
    ) {
        $this->userRepository = $userRepository;
        $this->courseRepository = $courseRepository;
        $this->studentRepository = $studentRepository;
        $this->testRepository = $testRepository;
        $this->departmentRepository = $departmentRepository;
    }

    /**
     * Get dashboard statistics (Admin only)
     */
    public function getStats()
    {
        try {
            $userData = $_REQUEST['authenticated_user'];
            
            // Check if user is admin
            if ($userData['role'] !== 'admin') {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'Access denied. Admin privileges required.'
                ]);
                return;
            }

            $stats = [
                'totalUsers' => $this->userRepository->countAll(),
                'totalCourses' => $this->courseRepository->countAll(),
                'totalStudents' => $this->studentRepository->countAll(),
                'totalAssessments' => $this->testRepository->countAll()
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
     * Get all courses (Admin only)
     */
    public function getAllCourses()
    {
        try {
            $userData = $_REQUEST['authenticated_user'];
            
            // Check if user is admin
            if ($userData['role'] !== 'admin') {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'Access denied. Admin privileges required.'
                ]);
                return;
            }

            $courses = $this->courseRepository->findAll();

            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'message' => 'Courses retrieved successfully',
                'data' => $courses
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
     * Get all students (Admin only)
     */
    public function getAllStudents()
    {
        try {
            $userData = $_REQUEST['authenticated_user'];
            
            // Check if user is admin
            if ($userData['role'] !== 'admin') {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'Access denied. Admin privileges required.'
                ]);
                return;
            }

            $students = $this->studentRepository->findAll();

            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'message' => 'Students retrieved successfully',
                'data' => $students
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
     * Get all tests (Admin only)
     */
    public function getAllTests()
    {
        try {
            $userData = $_REQUEST['authenticated_user'];
            
            // Check if user is admin
            if ($userData['role'] !== 'admin') {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'Access denied. Admin privileges required.'
                ]);
                return;
            }

            $tests = $this->testRepository->findAll();

            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'message' => 'Tests retrieved successfully',
                'data' => $tests
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
     * Check if user is admin
     */
    private function requireAdmin()
    {
        $userData = $_REQUEST['authenticated_user'];
        
        if ($userData['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'Access denied. Admin privileges required.'
            ]);
            return false;
        }
        return true;
    }

    /**
     * Create a new department (Admin only)
     */
    public function createDepartment()
    {
        try {
            if (!$this->requireAdmin()) return;

            $input = json_decode(file_get_contents('php://input'), true);

            // Validate required fields
            if (empty($input['department_name']) || empty($input['department_code'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Department name and code are required'
                ]);
                return;
            }

            $departmentName = trim($input['department_name']);
            $departmentCode = strtoupper(trim($input['department_code']));

            // Check if code already exists
            if ($this->departmentRepository->codeExists($departmentCode)) {
                http_response_code(409);
                echo json_encode([
                    'success' => false,
                    'message' => 'Department code already exists'
                ]);
                return;
            }

            // Check if name already exists
            if ($this->departmentRepository->nameExists($departmentName)) {
                http_response_code(409);
                echo json_encode([
                    'success' => false,
                    'message' => 'Department name already exists'
                ]);
                return;
            }

            // Create department
            $department = new Department(null, $departmentName, $departmentCode);
            $result = $this->departmentRepository->save($department);

            if ($result) {
                http_response_code(201);
                header('Content-Type: application/json');
                echo json_encode([
                    'success' => true,
                    'message' => 'Department created successfully',
                    'data' => [
                        'department_id' => $department->getDepartmentId(),
                        'department_name' => $department->getDepartmentName(),
                        'department_code' => $department->getDepartmentCode()
                    ]
                ]);
            } else {
                throw new Exception('Failed to create department');
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to create department',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Update a department (Admin only)
     */
    public function updateDepartment($departmentId)
    {
        try {
            if (!$this->requireAdmin()) return;

            $input = json_decode(file_get_contents('php://input'), true);

            // Find existing department
            $department = $this->departmentRepository->findById($departmentId);
            if (!$department) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Department not found'
                ]);
                return;
            }

            // Validate at least one field to update
            if (empty($input['department_name']) && empty($input['department_code'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'At least one field (name or code) is required'
                ]);
                return;
            }

            // Update fields
            if (!empty($input['department_name'])) {
                $newName = trim($input['department_name']);
                if ($newName !== $department->getDepartmentName() && 
                    $this->departmentRepository->nameExists($newName, $departmentId)) {
                    http_response_code(409);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Department name already exists'
                    ]);
                    return;
                }
                $department->setDepartmentName($newName);
            }

            if (!empty($input['department_code'])) {
                $newCode = strtoupper(trim($input['department_code']));
                if ($newCode !== $department->getDepartmentCode() && 
                    $this->departmentRepository->codeExists($newCode, $departmentId)) {
                    http_response_code(409);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Department code already exists'
                    ]);
                    return;
                }
                $department->setDepartmentCode($newCode);
            }

            $result = $this->departmentRepository->save($department);

            if ($result) {
                http_response_code(200);
                header('Content-Type: application/json');
                echo json_encode([
                    'success' => true,
                    'message' => 'Department updated successfully',
                    'data' => [
                        'department_id' => $department->getDepartmentId(),
                        'department_name' => $department->getDepartmentName(),
                        'department_code' => $department->getDepartmentCode()
                    ]
                ]);
            } else {
                throw new Exception('Failed to update department');
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to update department',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Delete a department (Admin only)
     */
    public function deleteDepartment($departmentId)
    {
        try {
            if (!$this->requireAdmin()) return;

            // Find existing department
            $department = $this->departmentRepository->findById($departmentId);
            if (!$department) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Department not found'
                ]);
                return;
            }

            // Check if department has users
            $userCount = $this->userRepository->countByDepartment($departmentId);
            if ($userCount > 0) {
                http_response_code(409);
                echo json_encode([
                    'success' => false,
                    'message' => "Cannot delete department. It has {$userCount} user(s) assigned."
                ]);
                return;
            }

            $result = $this->departmentRepository->delete($departmentId);

            if ($result) {
                http_response_code(200);
                header('Content-Type: application/json');
                echo json_encode([
                    'success' => true,
                    'message' => 'Department deleted successfully'
                ]);
            } else {
                throw new Exception('Failed to delete department');
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to delete department',
                'error' => $e->getMessage()
            ]);
        }
    }
}
