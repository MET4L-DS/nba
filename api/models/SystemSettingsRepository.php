<?php

require_once __DIR__ . '/SystemSetting.php';

class SystemSettingsRepository
{
    private PDO $connection;

    public function __construct(PDO $connection)
    {
        $this->connection = $connection;
    }

    /**
     * Get all system settings as key-value pairs
     * @return SystemSetting[]
     */
    public function getAll(): array
    {
        $stmt = $this->connection->query("SELECT * FROM system_settings");
        $settings = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $settings[] = new SystemSetting(
                $row['setting_key'],
                $row['setting_value'],
                $row['updated_at']
            );
        }
        return $settings;
    }

    /**
     * Get all system settings formatted as a associative array [key => value]
     * @return array
     */
    public function getAllKeyValue(): array
    {
        $stmt = $this->connection->query("SELECT setting_key, setting_value FROM system_settings");
        $result = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $result[$row['setting_key']] = $row['setting_value'];
        }
        return $result;
    }

    /**
     * Get a setting value by its key
     */
    public function getByKey(string $key): ?string
    {
        $stmt = $this->connection->prepare("SELECT setting_value FROM system_settings WHERE setting_key = ?");
        $stmt->execute([$key]);
        $value = $stmt->fetchColumn();
        return $value !== false ? $value : null;
    }

    /**
     * Update or insert a setting
     */
    public function update(string $key, string $value): bool
    {
        $stmt = $this->connection->prepare(
            "INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) 
             ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)"
        );
        return $stmt->execute([$key, $value]);
    }

    /**
     * Bulk update settings
     * @param array $settings Associative array of [key => value]
     */
    public function updateBulk(array $settings): bool
    {
        try {
            $this->connection->beginTransaction();
            $stmt = $this->connection->prepare(
                "INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) 
                 ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)"
            );
            foreach ($settings as $key => $value) {
                $stmt->execute([$key, $value]);
            }
            $this->connection->commit();
            return true;
        } catch (Exception $e) {
            $this->connection->rollBack();
            throw $e;
        }
    }
}
