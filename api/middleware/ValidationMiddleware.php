<?php

/**
 * Validation Middleware
 * Follows Single Responsibility Principle - handles only input validation
 */
class ValidationMiddleware
{

    /**
     * Validate login request data
     * @param array $data
     * @return array Array of validation errors, empty if valid
     */
    public function validateLoginData($data)
    {
        $errors = [];

        if (empty($data['employeeIdOrEmail'])) {
            $errors[] = "Employee ID or email is required";
        }

        if (empty($data['password'])) {
            $errors[] = "Password is required";
        }

        if (!empty($errors) && isset($GLOBALS['fileLogger'])) {
            $GLOBALS['fileLogger']->warn('ValidationMiddleware', 'Login validation failed', ['errors' => $errors]);
        }

        return $errors;
    }

    /**
     * Validate user profile update data
     * @param array $data
     * @return array Array of validation errors, empty if valid
     */
    public function validateProfileUpdateData($data)
    {
        $errors = [];

        if (isset($data['username']) && (empty($data['username']) || strlen($data['username']) < 3)) {
            $errors[] = "Username must be at least 3 characters long";
        }

        if (isset($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = "Invalid email format";
        }

        if (isset($data['password']) && strlen($data['password']) < 6) {
            $errors[] = "Password must be at least 6 characters long";
        }

        // Check if role is valid
        if (isset($data['role']) && !in_array($data['role'], ['admin', 'dean', 'hod', 'faculty', 'staff'])) {
            $errors[] = "Invalid role";
        }

        return $errors;
    }

    /**
     * Validate user profile self-update data (by normal users)
     * @param array $data
     * @return array Array of validation errors, empty if valid
     */
    public function validateSelfProfileUpdateData($data)
    {
        $errors = $this->validateProfileUpdateData($data);

        // Prevent users from changing their department
        if (isset($data['department_id'])) {
            $errors[] = "Department cannot be changed by user";
        }

        return $errors;
    }

    /**
     * Validate change password request data
     * @param array $data
     * @return array Array of validation errors, empty if valid
     */
    public function validateChangePasswordData($data)
    {
        $errors = [];

        if (empty($data['current_password'])) {
            $errors[] = "Current password is required";
        }

        if (empty($data['new_password'])) {
            $errors[] = "New password is required";
        } elseif (strlen($data['new_password']) < 6) {
            $errors[] = "New password must be at least 6 characters long";
        }

        return $errors;
    }

    /**
     * Validate forgot password request data
     * @param array $data
     * @return array Array of validation errors, empty if valid
     */
    public function validateForgotPasswordData($data)
    {
        $errors = [];

        if (empty($data['email'])) {
            $errors[] = "Email is required";
        } elseif (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = "Invalid email format";
        }

        return $errors;
    }

    /**
     * Validate reset password request data
     * @param array $data
     * @return array Array of validation errors, empty if valid
     */
    public function validateResetPasswordData($data)
    {
        $errors = [];

        if (empty($data['token'])) {
            $errors[] = "Token is required";
        }

        if (empty($data['new_password'])) {
            $errors[] = "New password is required";
        } elseif (strlen($data['new_password']) < 6) {
            $errors[] = "New password must be at least 6 characters long";
        }

        return $errors;
    }

    /**
     * Sanitize input data
     * @param array $data
     * @return array
     */
    public function sanitizeData($data)
    {
        $sanitized = [];

        foreach ($data as $key => $value) {
            if (is_string($value)) {
                $sanitized[$key] = trim(strip_tags($value));
            } else {
                $sanitized[$key] = $value;
            }
        }

        return $sanitized;
    }

    /**
     * Get JSON input from request body
     * @return array|null
     */
    public function getJsonInput()
    {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return null;
        }

        return $this->sanitizeData($data);
    }

    /**
     * Send validation error response
     * @param array $errors
     */
    public function sendValidationErrorResponse($errors)
    {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $errors
        ]);
    }
}
