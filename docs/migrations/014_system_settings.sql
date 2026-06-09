-- Migration: 014_system_settings.sql
-- Create system_settings table and populate with default values

CREATE TABLE IF NOT EXISTS `system_settings` (
    `setting_key` VARCHAR(100) PRIMARY KEY,
    `setting_value` TEXT NOT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default configurations
INSERT INTO `system_settings` (`setting_key`, `setting_value`) VALUES
('university_name', 'Tezpur University'),
('university_subtitle', 'A Central University • Est. 1994'),
('system_name', 'Outcome Based Education System'),
('system_short_name', 'OBEMS'),
('logo_url', '/tulogo.png'),
('motto_text', 'विज्ञानं यज्ञं तनुते'),
('motto_subtext', 'Specialized knowledge promotes creativity')
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);
