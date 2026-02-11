<?php

/**
 * Database Configuration Class
 * Follows Single Responsibility Principle - handles only database connections
 */
class DatabaseConfig
{
    private $host;
    private $username;
    private $password;
    private $database;
    private $charset;

    public function __construct()
    {
        // Try to get config from environment variables (Production/AWS), fallback to local XAMPP defaults
        $this->host = getenv('DB_HOST') ?: 'localhost';
        $this->username = getenv('DB_USER') ?: 'root';
        $this->password = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';
        $this->database = getenv('DB_NAME') ?: 'nba_db';
        $this->charset = 'utf8mb4';
    }

    /**
     * Get database connection
     * @return PDO
     * @throws Exception
     */
    public function getConnection()
    {
        try {
            $dsn = "mysql:host={$this->host};dbname={$this->database};charset={$this->charset}";
            $pdo = new PDO($dsn, $this->username, $this->password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            return $pdo;
        } catch (PDOException $e) {
            throw new Exception("Database connection failed: " . $e->getMessage());
        }
    }

    /**
     * Get database name
     * @return string
     */
    public function getDatabaseName()
    {
        return $this->database;
    }
}
