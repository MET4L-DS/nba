<?php

require_once __DIR__ . '/../models/SystemSettingsRepository.php';

class SystemSettingsController
{
    private SystemSettingsRepository $settingsRepository;
    private ?AuditService $auditService;

    public function __construct(SystemSettingsRepository $settingsRepository, ?AuditService $auditService = null)
    {
        $this->settingsRepository = $settingsRepository;
        $this->auditService = $auditService;
    }

    /**
     * Get all public settings as a flat key-value JSON object
     * GET /api/settings/public
     */
    public function getPublicSettings()
    {
        try {
            $settings = $this->settingsRepository->getAllKeyValue();
            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'data' => $settings
            ]);
        } catch (Exception $e) {
            if (isset($GLOBALS['fileLogger'])) {
                $GLOBALS['fileLogger']->error('SystemSettingsController', 'getPublicSettings failed', ['error' => $e->getMessage()]);
            }
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to retrieve settings',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Bulk update settings (Admin only)
     * POST /api/settings
     */
    public function updateSettings()
    {
        try {
            if (!$this->requireAdmin()) return;

            $input = json_decode(file_get_contents('php://input'), true);
            if (!is_array($input)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
                return;
            }

            // Allowed setting keys to be bulk-updated via text form
            $allowedKeys = [
                'university_name',
                'university_subtitle',
                'system_name',
                'system_short_name',
                'motto_text',
                'motto_subtext'
            ];

            $updates = [];
            foreach ($input as $key => $value) {
                if (in_array($key, $allowedKeys)) {
                    $updates[$key] = trim((string)$value);
                }
            }

            if (empty($updates)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'No valid settings to update']);
                return;
            }

            // Fetch old state for auditing
            $oldSettings = $this->settingsRepository->getAllKeyValue();
            $oldState = [];
            foreach ($updates as $key => $val) {
                $oldState[$key] = $oldSettings[$key] ?? null;
            }

            $success = $this->settingsRepository->updateBulk($updates);

            if ($success) {
                if ($this->auditService) {
                    $this->auditService->log('UPDATE', 'SystemSettings', null, $oldState, $updates);
                }
                if (isset($GLOBALS['fileLogger'])) {
                    $GLOBALS['fileLogger']->info('SystemSettingsController', 'System settings updated successfully', ['updates' => $updates]);
                }
                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'message' => 'Settings updated successfully',
                    'data' => $this->settingsRepository->getAllKeyValue()
                ]);
            } else {
                throw new Exception('Failed to update system settings database entries');
            }
        } catch (Exception $e) {
            if (isset($GLOBALS['fileLogger'])) {
                $GLOBALS['fileLogger']->error('SystemSettingsController', 'updateSettings failed', ['error' => $e->getMessage()]);
            }
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to update settings',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Upload system branding logo (Admin only)
     * POST /api/settings/logo
     */
    public function uploadLogo()
    {
        try {
            if (!$this->requireAdmin()) return;

            if (!isset($_FILES['logo']) || $_FILES['logo']['error'] !== UPLOAD_ERR_OK) {
                $errorCode = $_FILES['logo']['error'] ?? 'no file uploaded';
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'No file uploaded or file upload error occurred. Error Code: ' . $errorCode
                ]);
                return;
            }

            $file = $_FILES['logo'];
            
            // Validate image file type
            $finfo = new finfo(FILEINFO_MIME_TYPE);
            $mimeType = $finfo->file($file['tmp_name']);
            $allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml'];

            if (!in_array($mimeType, $allowedMimeTypes)) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Invalid file type. Only standard images (PNG, JPEG, WEBP, GIF, SVG) are allowed. Detected mime: ' . $mimeType
                ]);
                return;
            }

            // Validate file extension
            $pathInfo = pathinfo($file['name']);
            $extension = strtolower($pathInfo['extension'] ?? '');
            $allowedExtensions = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'];
            
            if (!in_array($extension, $allowedExtensions)) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Invalid file extension. Allowed extensions: ' . implode(', ', $allowedExtensions)
                ]);
                return;
            }

            // Create branding upload directory if it doesn't exist
            $uploadDir = __DIR__ . '/../uploads/branding/';
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            // Delete existing uploaded logo if there is one and it's custom
            $oldLogoUrl = $this->settingsRepository->getByKey('logo_url');
            if ($oldLogoUrl && strpos($oldLogoUrl, '/uploads/branding/') !== false) {
                $oldLogoPath = __DIR__ . '/..' . strstr($oldLogoUrl, '/uploads/branding/');
                if (file_exists($oldLogoPath)) {
                    @unlink($oldLogoPath);
                }
            }

            // Generate unique filename
            $filename = 'logo_' . time() . '.' . $extension;
            $destination = $uploadDir . $filename;

            if (move_uploaded_file($file['tmp_name'], $destination)) {
                // Construct relative path served by Webserver
                // dirname($_SERVER['SCRIPT_NAME']) gives the base path e.g. /nba-met4l/api or /api
                $apiDir = dirname($_SERVER['SCRIPT_NAME']);
                // Normalize slashes
                $apiDir = rtrim(str_replace('\\', '/', $apiDir), '/');
                $logoUrl = $apiDir . '/uploads/branding/' . $filename;

                $this->settingsRepository->update('logo_url', $logoUrl);

                if ($this->auditService) {
                    $this->auditService->log('UPDATE', 'SystemSettings', 'logo_url', $oldLogoUrl, $logoUrl);
                }

                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'message' => 'Logo uploaded and updated successfully',
                    'data' => [
                        'logo_url' => $logoUrl
                    ]
                ]);
            } else {
                throw new Exception('Failed to move uploaded logo file to destination folder');
            }
        } catch (Exception $e) {
            if (isset($GLOBALS['fileLogger'])) {
                $GLOBALS['fileLogger']->error('SystemSettingsController', 'uploadLogo failed', ['error' => $e->getMessage()]);
            }
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to upload logo',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Check if user is admin
     */
    private function requireAdmin(): bool
    {
        $userData = $_REQUEST['authenticated_user'] ?? null;

        if (!$userData || $userData['role'] !== 'admin') {
            if (isset($GLOBALS['fileLogger'])) {
                $GLOBALS['fileLogger']->warn('SystemSettingsController', 'Unauthorized settings access attempt', ['user' => $userData ?? 'anonymous']);
            }
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'Access denied. Admin privileges required.'
            ]);
            return false;
        }
        return true;
    }
}
