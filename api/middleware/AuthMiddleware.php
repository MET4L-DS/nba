<?php

/**
 * Authentication Middleware
 * Follows Single Responsibility Principle - handles only authentication middleware
 */
class AuthMiddleware
{
    private $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Authenticate request using JWT token
     * @param string $token JWT token from Authorization header
     * @return array|null User data or null if authentication fails
     */
    public function authenticate($token)
    {
        if (empty($token)) {
            return null;
        }

        // Remove "Bearer " prefix if present
        if (strpos($token, 'Bearer ') === 0) {
            $token = substr($token, 7);
        }

        return $this->authService->validateToken($token);
    }

    /**
     * Get token from Authorization header
     * @return string|null
     */
    public function getTokenFromHeader()
    {
        $headers = [];
        if (function_exists('getallheaders')) {
            $headers = getallheaders();
            if ($headers === false) {
                $headers = [];
            }
        }
        
        // Convert all header keys to lowercase to support case-insensitive checks (e.g. HTTP/2 lowers header names)
        $headers = array_change_key_case($headers, CASE_LOWER);
        
        $authHeader = '';
        if (isset($headers['authorization'])) {
            $authHeader = $headers['authorization'];
        } elseif (isset($_SERVER['Authorization'])) {
            $authHeader = $_SERVER['Authorization'];
        } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
             $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }

        if (empty($authHeader)) {
            return null;
        }

        // Remove "Bearer " prefix if present
        if (strpos($authHeader, 'Bearer ') === 0) {
            return substr($authHeader, 7);
        }

        return $authHeader;
    }

    /**
     * Require authentication for endpoint
     * @return array|null User data or sends error response and exits
     */
    public function requireAuth()
    {
        $token = $this->getTokenFromHeader();
        
        if (empty($token)) {
            if (isset($GLOBALS['fileLogger'])) { 
                $GLOBALS['fileLogger']->warn('AuthMiddleware', 'Unauthorized access attempt: Missing Authorization header', [
                    'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
                    'endpoint' => $_SERVER['REQUEST_URI'] ?? 'unknown'
                ]); 
            }
            $this->sendUnauthorizedResponse('Missing authentication token');
            exit;
        }

        $user = $this->authenticate($token);

        if (!$user) {
            if (isset($GLOBALS['fileLogger'])) { 
                $GLOBALS['fileLogger']->warn('AuthMiddleware', 'Unauthorized access attempt: Invalid token validation', [
                    'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
                    'endpoint' => $_SERVER['REQUEST_URI'] ?? 'unknown'
                ]); 
            }
            $this->sendUnauthorizedResponse('Invalid or missing authentication token');
            exit;
        }

        if (isset($GLOBALS['fileLogger'])) {
            $GLOBALS['fileLogger']->info('AuthMiddleware', 'Request authenticated successfully', [
                'employee_id' => $user['employee_id'],
                'role' => $user['role'],
                'endpoint' => $_SERVER['REQUEST_URI'] ?? 'unknown'
            ]);
        }

        return $user;
    }

    /**
     * Send unauthorized response
     */
    private function sendUnauthorizedResponse($errorMessage = 'Invalid or missing authentication token')
    {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'Unauthorized access',
            'error' => $errorMessage
        ]);
    }
}
