<?php

/**
 * User Controller
 * Follows Single Responsibility Principle - handles only user-related HTTP requests
 * Follows Dependency Inversion Principle - depends on abstractions
 */
class UserController
{
    protected $auditService;

    private $authService;
    private $userRepository;
    private $departmentRepository;
    private $validationMiddleware;

    public function __construct(AuthService $authService, UserRepository $userRepository, DepartmentRepository $departmentRepository, ValidationMiddleware $validationMiddleware, ?AuditService $auditService = null)
    {
        $this->auditService = $auditService;

        $this->authService = $authService;
        $this->userRepository = $userRepository;
        $this->departmentRepository = $departmentRepository;
        $this->validationMiddleware = $validationMiddleware;
    }

    /**
     * Handle user login
     */
    public function login()
    {
        try {
            $data = $this->validationMiddleware->getJsonInput();

            if (!$data) {
                throw new Exception("Invalid JSON input");
            }

            // Validate input
            $errors = $this->validationMiddleware->validateLoginData($data);
            if (!empty($errors)) {
                $this->validationMiddleware->sendValidationErrorResponse($errors);
                return;
            }

            // Attempt authentication
            $result = $this->authService->authenticate($data['employeeIdOrEmail'], $data['password']);

            if (isset($result['error'])) {
                if (isset($GLOBALS['fileLogger'])) { 
                    $GLOBALS['fileLogger']->warn('UserController', 'Login attempt failed', [
                        'identifier' => $data['employeeIdOrEmail'],
                        'reason' => $result['error'],
                        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
                    ]); 
                }
                http_response_code(401);
                $message = 'Invalid credentials';
                if ($result['error'] === 'user_not_found') {
                    $message = 'No account found with this email or employee ID.';
                } else if ($result['error'] === 'invalid_password') {
                    $message = 'Incorrect password. Please try again.';
                }
                echo json_encode([
                    'success' => false,
                    'message' => $message,
                    'error_code' => $result['error']
                ]);
                return;
            }

            // Success response
            if (isset($GLOBALS['fileLogger'])) {
                $GLOBALS['fileLogger']->info('UserController', 'Login successful', [
                    'employee_id' => $result['user']['employee_id'],
                    'role' => $result['user']['role'],
                    'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
                ]);
            }
            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'message' => 'Login successful',
                'data' => $result
            ]);
        } catch (Exception $e) {
            if (isset($GLOBALS['fileLogger'])) { $GLOBALS['fileLogger']->error('UserController', 'login prompt', ['error' => $e->getMessage()]); }
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Login failed',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Handle user profile retrieval
     */
    public function getProfile()
    {
        try {
            // Authentication is handled by middleware, user data is passed
            $userData = $_REQUEST['authenticated_user'];

            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'message' => 'Profile retrieved successfully',
                'data' => $userData
            ]);
        } catch (Exception $e) {
            if (isset($GLOBALS['fileLogger'])) { $GLOBALS['fileLogger']->error('UserController', 'getProfile prompt', ['error' => $e->getMessage()]); }
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to retrieve profile',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Handle user profile update
     */
    public function updateProfile()
    {
        try {
            $userData = $_REQUEST['authenticated_user'];
            $data = $this->validationMiddleware->getJsonInput();

            if (!$data) {
                throw new Exception("Invalid JSON input");
            }

            // Validate input
            $errors = $this->validationMiddleware->validateSelfProfileUpdateData($data);
            if (!empty($errors)) {
                $this->validationMiddleware->sendValidationErrorResponse($errors);
                return;
            }

            // Get current user
            $user = $this->userRepository->findByEmployeeId($userData['employee_id']);
            $GLOBALS['audit_old_state'] = (isset($user) && is_object($user) && method_exists($user, 'toArray')) ? $user->toArray() : (isset($user) ? clone $user : null);
            if (!$user) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'User not found'
                ]);
                return;
            }

            // Update user data
            if (isset($data['username'])) {
                // Check if username is already taken
                if ($this->userRepository->usernameExists($data['username'], $user->getEmployeeId())) {
                    http_response_code(409);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Username already exists'
                    ]);
                    return;
                }
                $user->setUsername($data['username']);
            }

            if (isset($data['email'])) {
                // Check if email is already taken
                if ($this->userRepository->emailExists($data['email'], $user->getEmployeeId())) {
                    http_response_code(409);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Email already exists'
                    ]);
                    return;
                }
                $user->setEmail($data['email']);
            }

            if (isset($data['designation'])) {
                $user->setDesignation($data['designation']);
            }

            if (isset($data['phones'])) {
                $user->setPhones($data['phones']);
            }

            // Note: Role changes are not allowed via self-profile update for security reasons
            // Only admins can change user roles via dedicated endpoints

            // Save updated user
            if ($this->userRepository->save($user)) {
                http_response_code(200);
                
            $auditPayload = isset($input) ? $input : (isset($data) ? $data : null);
            if (isset($this->auditService)) {
                $this->auditService->log('UPDATE', 'Profile', null, ($GLOBALS['audit_old_state'] ?? null), $auditPayload);
            }
            if (isset($GLOBALS['fileLogger'])) {
                $GLOBALS['fileLogger']->log('INFO', 'UserController', 'UPDATE operation successful in updateProfile');
            }
            echo json_encode([
                    'success' => true,
                    'message' => 'Profile updated successfully',
                    'data' => $user->toArray()
                ]);
            } else {
                throw new Exception("Failed to update profile");
            }
        } catch (Exception $e) {
            if (isset($GLOBALS['fileLogger'])) { $GLOBALS['fileLogger']->error('UserController', 'updateProfile prompt', ['error' => $e->getMessage()]); }
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to update profile',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Handle user logout
     */
    public function logout()
    {
        try {
            $userData = $_REQUEST['authenticated_user'];

            // In a stateless JWT system, logout is mainly client-side
            // Server-side could implement token blacklisting if needed
            $result = $this->authService->logout($_REQUEST['token']);

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Logout successful'
            ]);
        } catch (Exception $e) {
            if (isset($GLOBALS['fileLogger'])) { $GLOBALS['fileLogger']->error('UserController', 'logout prompt', ['error' => $e->getMessage()]); }
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Logout failed',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Get department information by employee ID
     */
    public function getDepartmentByEmployeeId()
    {
        try {
            // Authentication is handled by middleware, user data is passed
            $userData = $_REQUEST['authenticated_user'];

            // Get user's department
            $department = null;
            if ($userData['department_id']) {
                $department = $this->departmentRepository->findById($userData['department_id']);
            }

            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'message' => 'Department information retrieved successfully',
                'data' => $department ? $department->toArray() : null
            ]);
        } catch (Exception $e) {
            if (isset($GLOBALS['fileLogger'])) { $GLOBALS['fileLogger']->error('UserController', 'getDepartmentByEmployeeId prompt', ['error' => $e->getMessage()]); }
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to retrieve department information',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Get all users (Admin only) — paginated
     */
    public function getAllUsers()
    {
        try {
            $userData = $_REQUEST['authenticated_user'];
            
            if ($userData['role'] !== 'admin') {
                if (isset($GLOBALS['fileLogger'])) { $GLOBALS['fileLogger']->warn('UserController', 'Unauthorized access attempt', ['user' => $_REQUEST['authenticated_user'] ?? 'anonymous']); }
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Access denied. Admin privileges required.']);
                return;
            }

            $params = PaginationHelper::parseParams(
                $_GET,
                'u.employee_id',
                'u.employee_id',
                ['u.employee_id', 'u.username', 'u.email', 'u.role', 'u.designation', 'department_code'],
                ['role', 'department_id']
            );

            $total  = $this->userRepository->countPaginated($params);
            $rows   = $this->userRepository->findPaginated($params);
            $result = PaginationHelper::buildResponse($rows, 'employee_id', $params['limit'], $total);

            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode(array_merge(['success' => true, 'message' => 'Users retrieved successfully'], $result));
        } catch (Exception $e) {
            if (isset($GLOBALS['fileLogger'])) { $GLOBALS['fileLogger']->error('UserController', 'getAllUsers prompt', ['error' => $e->getMessage()]); }
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to retrieve users', 'error' => $e->getMessage()]);
        }
    }

    /**
     * Get all departments
     */
    public function getAllDepartments()
    {
        try {
            $departments = $this->departmentRepository->findAll();
            
            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'message' => 'Departments retrieved successfully',
                'data' => $departments
            ]);
        } catch (Exception $e) {
            if (isset($GLOBALS['fileLogger'])) { $GLOBALS['fileLogger']->error('UserController', 'getAllDepartments prompt', ['error' => $e->getMessage()]); }
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to retrieve departments',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Create a new user (Admin only)
     */
    public function createUser()
    {
        try {
            $fileLogger = $GLOBALS['fileLogger'] ?? null;
            $userData = $_REQUEST['authenticated_user'];
            
            if ($fileLogger) $fileLogger->info('UserController', 'CREATE USER: Request received', [
                'admin_id' => $userData['employee_id'],
                'admin_role' => $userData['role']
            ]);
            
            // Check if user is admin
            if ($userData['role'] !== 'admin') {
                if (isset($GLOBALS['fileLogger'])) { $GLOBALS['fileLogger']->warn('UserController', 'Unauthorized access attempt', ['user' => $_REQUEST['authenticated_user'] ?? 'anonymous']); }
                if ($fileLogger) $fileLogger->warn('UserController', 'CREATE USER: Access denied - not admin', [
                    'user_role' => $userData['role']
                ]);
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'Access denied. Admin privileges required.'
                ]);
                return;
            }

            $data = $this->validationMiddleware->getJsonInput();

            if (!$data) {
                if ($fileLogger) $fileLogger->error('UserController', 'CREATE USER: Invalid JSON input');
                throw new Exception("Invalid JSON input");
            }

            if ($fileLogger) $fileLogger->debug('UserController', 'CREATE USER: Input data received', [
                'employee_id' => $data['employee_id'] ?? null,
                'username' => $data['username'] ?? null,
                'email' => $data['email'] ?? null,
                'role' => $data['role'] ?? null
            ]);

            // Validate required fields
            $requiredFields = ['employee_id', 'username', 'email', 'password', 'role'];
            $errors = [];
            foreach ($requiredFields as $field) {
                if (empty($data[$field])) {
                    $errors[] = "$field is required";
                }
            }

            if (!empty($errors)) {
                if ($fileLogger) $fileLogger->warn('UserController', 'CREATE USER: Validation failed', ['errors' => $errors]);
                $this->validationMiddleware->sendValidationErrorResponse($errors);
                return;
            }

            // Valid roles for direct admin creation.
            // 'hod' is allowed so admins can create permanent dedicated HOD accounts
            // (e.g. hod_cse@tezu.ac.in). HOD appointment records are separate.
            // 'dean' is allowed for permanent dedicated Dean accounts.
            $validRoles = ['admin', 'faculty', 'hod', 'dean', 'staff'];
            if (!in_array($data['role'], $validRoles)) {
                if ($fileLogger) $fileLogger->warn('UserController', 'CREATE USER: Invalid role', ['role' => $data['role']]);
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Invalid role. Valid roles are: ' . implode(', ', $validRoles)
                ]);
                return;
            }

            // Check if employee_id already exists
            if ($this->userRepository->findByEmployeeId($data['employee_id'])) {
                if ($fileLogger) $fileLogger->warn('UserController', 'CREATE USER: Employee ID already exists', [
                    'employee_id' => $data['employee_id']
                ]);
                http_response_code(409);
                echo json_encode([
                    'success' => false,
                    'message' => 'Employee ID already exists'
                ]);
                return;
            }

            // Check if email already exists
            if ($this->userRepository->emailExists($data['email'])) {
                if ($fileLogger) $fileLogger->warn('UserController', 'CREATE USER: Email already exists', [
                    'email' => $data['email']
                ]);
                http_response_code(409);
                echo json_encode([
                    'success' => false,
                    'message' => 'Email already exists'
                ]);
                return;
            }

            // Create new user
            $newUser = new User(
                (int)$data['employee_id'],
                $data['username'],
                $data['email'],
                password_hash($data['password'], PASSWORD_DEFAULT),
                $data['role'],
                isset($data['department_id']) ? (int)$data['department_id'] : null,
                $data['designation'] ?? null,
                $data['phones'] ?? [],
                null,
                null,
                isset($data['school_id']) ? (int)$data['school_id'] : null
            );

            if ($this->userRepository->save($newUser)) {
                if ($fileLogger) $fileLogger->info('UserController', 'CREATE USER: User created successfully', [
                    'employee_id' => $data['employee_id'],
                    'username' => $data['username'],
                    'role' => $data['role']
                ]);
                http_response_code(201);
                
            $auditPayload = isset($input) ? $input : (isset($data) ? $data : null);
            if (isset($this->auditService)) {
                $this->auditService->log('CREATE', 'User', null, null, $auditPayload);
            }
            if (isset($GLOBALS['fileLogger'])) {
                $GLOBALS['fileLogger']->log('INFO', 'UserController', 'CREATE operation successful in createUser');
            }
            echo json_encode([
                    'success' => true,
                    'message' => 'User created successfully',
                    'data' => $newUser->toArray()
                ]);
            } else {
                throw new Exception("Failed to create user");
            }
        } catch (Exception $e) {
            $fileLogger = $GLOBALS['fileLogger'] ?? null;
            if ($fileLogger) $fileLogger->error('UserController', 'CREATE USER: Exception occurred', [
                'error' => $e->getMessage()
            ]);
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to create user',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Update a user (Admin only)
     */
    public function updateUser($employeeId)
    {
        try {
            $fileLogger = $GLOBALS['fileLogger'] ?? null;
            $userData = $_REQUEST['authenticated_user'];

            if ($fileLogger) $fileLogger->info('UserController', 'UPDATE USER: Request received', [
                'target_employee_id' => $employeeId,
                'admin_id' => $userData['employee_id'],
                'admin_role' => $userData['role']
            ]);

            // Check if user is admin
            if ($userData['role'] !== 'admin') {
                if (isset($GLOBALS['fileLogger'])) { $GLOBALS['fileLogger']->warn('UserController', 'Unauthorized access attempt', ['user' => $_REQUEST['authenticated_user'] ?? 'anonymous']); }
                if ($fileLogger) $fileLogger->warn('UserController', 'UPDATE USER: Access denied - not admin', [
                    'user_role' => $userData['role']
                ]);
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'Access denied. Admin privileges required.'
                ]);
                return;
            }

            $data = $this->validationMiddleware->getJsonInput();
            if (!$data) {
                if ($fileLogger) $fileLogger->error('UserController', 'UPDATE USER: Invalid JSON input');
                throw new Exception("Invalid JSON input");
            }

            if ($fileLogger) $fileLogger->debug('UserController', 'UPDATE USER: Input data received', [
                'fields_to_update' => array_keys($data)
            ]);

            // Validate input
            $errors = $this->validationMiddleware->validateProfileUpdateData($data);
            if (!empty($errors)) {
                if ($fileLogger) $fileLogger->warn('UserController', 'UPDATE USER: Validation failed', ['errors' => $errors]);
                $this->validationMiddleware->sendValidationErrorResponse($errors);
                return;
            }

            // Check if user exists
            $user = $this->userRepository->findByEmployeeId($employeeId);
            $GLOBALS['audit_old_state'] = (isset($user) && is_object($user) && method_exists($user, 'toArray')) ? $user->toArray() : (isset($user) ? clone $user : null);
            if (!$user) {
                if ($fileLogger) $fileLogger->error('UserController', 'UPDATE USER: User not found', [
                    'employee_id' => $employeeId
                ]);
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'User not found'
                ]);
                return;
            }

            // Prevent admin from demoting themselves
            if ($userData['employee_id'] == $employeeId && isset($data['role']) && $data['role'] !== 'admin') {
                if ($fileLogger) $fileLogger->warn('UserController', 'UPDATE USER: Admin cannot demote self', [
                    'admin_id' => $userData['employee_id']
                ]);
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Cannot change your own role'
                ]);
                return;
            }

            // Update user data
            if (isset($data['username'])) {
                // Check if username is already taken by another user
                $existing = $this->userRepository->findByUsername($data['username']);
                if ($existing && $existing->getEmployeeId() != $employeeId) {
                    if ($fileLogger) $fileLogger->warn('UserController', 'UPDATE USER: Username already taken', [
                        'username' => $data['username']
                    ]);
                    http_response_code(409);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Username already taken'
                    ]);
                    return;
                }
                $user->setUsername($data['username']);
            }

            if (isset($data['email'])) {
                // Check if email is already taken by another user
                if ($this->userRepository->emailExists($data['email']) && $user->getEmail() !== $data['email']) {
                    if ($fileLogger) $fileLogger->warn('UserController', 'UPDATE USER: Email already in use', [
                        'email' => $data['email']
                    ]);
                    http_response_code(409);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Email already in use'
                    ]);
                    return;
                }
                $user->setEmail($data['email']);
            }

            if (isset($data['role'])) {
                $user->setRole($data['role']);
            }

            if (isset($data['department_id'])) {
                if ($data['department_id'] === 'none' || empty($data['department_id'])) {
                    $user->setDepartmentId(null);
                } else {
                    $user->setDepartmentId($data['department_id']);
                }
            }

            if (isset($data['school_id'])) {
                if ($data['school_id'] === 'none' || empty($data['school_id'])) {
                    $user->setSchoolId(null);
                } else {
                    $user->setSchoolId($data['school_id']);
                }
            }

            if (array_key_exists('designation', $data)) {
                $user->setDesignation($data['designation']);
            }

            if (array_key_exists('phones', $data)) {
                $user->setPhones($data['phones']);
            }

            // Update user in database
            if ($this->userRepository->save($user)) {
                if ($fileLogger) $fileLogger->info('UserController', 'UPDATE USER: User updated successfully', [
                    'employee_id' => $employeeId,
                    'fields_updated' => array_keys($data)
                ]);
                http_response_code(200);
                
            $auditPayload = isset($input) ? $input : (isset($data) ? $data : null);
            if (isset($this->auditService)) {
                $this->auditService->log('UPDATE', 'User', null, ($GLOBALS['audit_old_state'] ?? null), $auditPayload);
            }
            if (isset($GLOBALS['fileLogger'])) {
                $GLOBALS['fileLogger']->log('INFO', 'UserController', 'UPDATE operation successful in updateUser');
            }
            echo json_encode([
                    'success' => true,
                    'message' => 'User updated successfully',
                    'data' => $user->toArray()
                ]);
            } else {
                throw new Exception("Failed to update user");
            }
        } catch (Exception $e) {
            $fileLogger = $GLOBALS['fileLogger'] ?? null;
            if ($fileLogger) $fileLogger->error('UserController', 'UPDATE USER: Exception occurred', [
                'employee_id' => $employeeId,
                'error' => $e->getMessage()
            ]);
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to update user',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Delete a user (Admin only)
     */
    public function deleteUser($employeeId)
    {
        try {
            $fileLogger = $GLOBALS['fileLogger'] ?? null;
            $userData = $_REQUEST['authenticated_user'];
            
            if ($fileLogger) $fileLogger->warn('UserController', 'DELETE USER: Request received', [
                'target_employee_id' => $employeeId,
                'admin_id' => $userData['employee_id'],
                'admin_role' => $userData['role']
            ]);
            
            // Check if user is admin
            if ($userData['role'] !== 'admin') {
                if ($fileLogger) $fileLogger->warn('UserController', 'DELETE USER: Access denied - not admin', [
                    'user_role' => $userData['role']
                ]);
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'Access denied. Admin privileges required.'
                ]);
                return;
            }

            // Prevent deleting self
            if ($userData['employee_id'] == $employeeId) {
                if ($fileLogger) $fileLogger->warn('UserController', 'DELETE USER: Admin cannot delete self', [
                    'admin_id' => $userData['employee_id']
                ]);
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Cannot delete your own account'
                ]);
                return;
            }

            // Check if user exists
            $user = $this->userRepository->findByEmployeeId($employeeId);
            $GLOBALS['audit_old_state'] = (isset($user) && is_object($user) && method_exists($user, 'toArray')) ? $user->toArray() : (isset($user) ? clone $user : null);
            if (!$user) {
                if ($fileLogger) $fileLogger->error('UserController', 'DELETE USER: User not found', [
                    'employee_id' => $employeeId
                ]);
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'User not found'
                ]);
                return;
            }

            if ($this->userRepository->delete($employeeId)) {
                if ($fileLogger) $fileLogger->warn('UserController', 'DELETE USER: User deleted successfully', [
                    'employee_id' => $employeeId,
                    'username' => $user->getUsername(),
                    'deleted_by' => $userData['employee_id']
                ]);
                http_response_code(200);
                
            $auditPayload = isset($input) ? $input : (isset($data) ? $data : null);
            if (isset($this->auditService)) {
                $this->auditService->log('DELETE', 'User', null, ($GLOBALS['audit_old_state'] ?? $auditPayload), null);
            }
            if (isset($GLOBALS['fileLogger'])) {
                $GLOBALS['fileLogger']->log('INFO', 'UserController', 'DELETE operation successful in deleteUser');
            }
            echo json_encode([
                    'success' => true,
                    'message' => 'User deleted successfully'
                ]);
            } else {
                throw new Exception("Failed to delete user");
            }
        } catch (Exception $e) {
            $fileLogger = $GLOBALS['fileLogger'] ?? null;
            if ($fileLogger) $fileLogger->error('UserController', 'DELETE USER: Exception occurred', [
                'employee_id' => $employeeId,
                'error' => $e->getMessage()
            ]);
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to delete user',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Get phone numbers for a user (Lazy loading endpoint)
     */
    public function getUserPhones($employeeId)
    {
        try {
            // Check if user exists
            $user = $this->userRepository->findByEmployeeId($employeeId);
            if (!$user) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'User not found']);
                return;
            }

            $phones = $this->userRepository->getUserPhones($employeeId);
            
            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'message' => 'Phones retrieved successfully',
                'data' => $phones
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to retrieve phones', 'error' => $e->getMessage()]);
        }
    }

    /**
     * Change user password (Authenticated user only)
     */
    public function changePassword()
    {
        try {
            $userData = $_REQUEST['authenticated_user'];
            $data = $this->validationMiddleware->getJsonInput();

            if (!$data) {
                throw new Exception("Invalid JSON input");
            }

            // Validate input
            $errors = $this->validationMiddleware->validateChangePasswordData($data);
            if (!empty($errors)) {
                $this->validationMiddleware->sendValidationErrorResponse($errors);
                return;
            }

            // Find user
            $user = $this->userRepository->findByEmployeeId($userData['employee_id']);
            if (!$user) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'User not found'
                ]);
                return;
            }

            // Verify current password
            if (!password_verify($data['current_password'], $user->getPassword())) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Incorrect current password'
                ]);
                return;
            }

            // Set and save new password
            $user->setPassword(password_hash($data['new_password'], PASSWORD_DEFAULT));
            if ($this->userRepository->save($user)) {
                if (isset($this->auditService)) {
                    $this->auditService->log('UPDATE', 'PasswordChange', $user->getEmployeeId(), null, ['employee_id' => $user->getEmployeeId()]);
                }
                
                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'message' => 'Password changed successfully'
                ]);
            } else {
                throw new Exception("Failed to save new password");
            }
        } catch (Exception $e) {
            if (isset($GLOBALS['fileLogger'])) {
                $GLOBALS['fileLogger']->error('UserController', 'changePassword error', ['error' => $e->getMessage()]);
            }
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to change password',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Forgot Password flow (Public endpoint)
     */
    public function forgotPassword()
    {
        try {
            $data = $this->validationMiddleware->getJsonInput();

            if (!$data) {
                throw new Exception("Invalid JSON input");
            }

            // Validate input
            $errors = $this->validationMiddleware->validateForgotPasswordData($data);
            if (!empty($errors)) {
                $this->validationMiddleware->sendValidationErrorResponse($errors);
                return;
            }

            $email = $data['email'];

            // Find user by email
            $user = $this->userRepository->findByEmail($email);
            if (!$user) {
                // Return success anyway for security / email enumeration prevention
                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'message' => 'If this email is registered, a password reset link has been sent.'
                ]);
                return;
            }

            // Generate a secure random token
            $token = bin2hex(random_bytes(32));
            $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));

            // Store in password_resets table
            $this->userRepository->createPasswordReset($email, $token, $expiresAt);

            // Determine frontend URL
            $origin = $_SERVER['HTTP_ORIGIN'] ?? (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]";
            
            $frontendUrl = getenv('FRONTEND_URL');
            if (!$frontendUrl) {
                $basePath = getenv('FRONTEND_BASE_PATH') ?: '';
                $frontendUrl = rtrim($origin, '/') . '/' . ltrim($basePath, '/');
            }
            $resetLink = rtrim($frontendUrl, '/') . '/reset-password?token=' . $token;

            // HTML Body for the email
            $subject = "Reset Your Password - OBEMS Platform";
            $bodyHTML = "
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;'>
                <h2 style='color: #2b6cb0; text-align: center;'>Password Reset Request</h2>
                <p>Hello,</p>
                <p>We received a request to reset the password for your account in the OBEMS Platform.</p>
                <p>Click the button below to reset your password. This link is valid for 1 hour.</p>
                <div style='text-align: center; margin: 30px 0;'>
                    <a href='{$resetLink}' style='background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;'>Reset Password</a>
                </div>
                <p>If the button doesn't work, you can copy and paste the following link into your browser:</p>
                <p style='word-break: break-all; color: #4a5568;'><a href='{$resetLink}'>{$resetLink}</a></p>
                <hr style='border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;' />
                <p style='font-size: 0.85em; color: #718096;'>If you did not request this change, you can safely ignore this email.</p>
            </div>
            ";

            // Send Mail
            EmailService::sendMail($email, $subject, $bodyHTML);

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'If this email is registered, a password reset link has been sent.'
            ]);
        } catch (Exception $e) {
            if (isset($GLOBALS['fileLogger'])) {
                $GLOBALS['fileLogger']->error('UserController', 'forgotPassword error', ['error' => $e->getMessage()]);
            }
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to process forgot password request',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Reset Password flow (Public endpoint)
     */
    public function resetPassword()
    {
        try {
            $data = $this->validationMiddleware->getJsonInput();

            if (!$data) {
                throw new Exception("Invalid JSON input");
            }

            // Validate input
            $errors = $this->validationMiddleware->validateResetPasswordData($data);
            if (!empty($errors)) {
                $this->validationMiddleware->sendValidationErrorResponse($errors);
                return;
            }

            $token = $data['token'];
            $newPassword = $data['new_password'];

            // Find reset record
            $resetRecord = $this->userRepository->findPasswordResetByToken($token);
            if (!$resetRecord) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Invalid or expired token. Please request a new password reset link.'
                ]);
                return;
            }

            // Check if expired
            $expiresAt = new DateTime($resetRecord['expires_at']);
            $now = new DateTime();
            if ($now > $expiresAt) {
                // Delete expired record
                $this->userRepository->deletePasswordResetByEmail($resetRecord['email']);
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Reset link has expired. Please request a new password reset link.'
                ]);
                return;
            }

            // Find user by email
            $user = $this->userRepository->findByEmail($resetRecord['email']);
            if (!$user) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'User not found'
                ]);
                return;
            }

            // Set new password
            $user->setPassword(password_hash($newPassword, PASSWORD_DEFAULT));

            if ($this->userRepository->save($user)) {
                // Delete reset token
                $this->userRepository->deletePasswordResetByEmail($resetRecord['email']);

                if (isset($this->auditService)) {
                    $this->auditService->log('UPDATE', 'PasswordReset', $user->getEmployeeId(), null, ['employee_id' => $user->getEmployeeId()]);
                }

                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'message' => 'Password reset successful. You can now login with your new password.'
                ]);
            } else {
                throw new Exception("Failed to save new password");
            }
        } catch (Exception $e) {
            if (isset($GLOBALS['fileLogger'])) {
                $GLOBALS['fileLogger']->error('UserController', 'resetPassword error', ['error' => $e->getMessage()]);
            }
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to reset password',
                'error' => $e->getMessage()
            ]);
        }
    }
}
