<?php

/**
 * Environment Variable Loader
 * Parses a simple .env file and sets variables in putenv(), $_ENV, and $_SERVER
 */
class EnvLoader
{
    /**
     * Load environment variables from a file path
     * @param string $path Path to the .env file
     * @return bool
     */
    public static function load($path)
    {
        if (!file_exists($path)) {
            return false;
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            
            // Skip comments and empty lines
            if (empty($line) || strpos($line, '#') === 0) {
                continue;
            }

            // Parse key=value
            if (strpos($line, '=') !== false) {
                list($key, $value) = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);

                // Remove surrounding quotes if present
                if (preg_match('/^["\'](.*)["\']$/', $value, $matches)) {
                    $value = $matches[1];
                }

                // Put in environment if not already set
                if (getenv($key) === false) {
                    putenv("{$key}={$value}");
                }
                if (!isset($_ENV[$key])) {
                    $_ENV[$key] = $value;
                }
                if (!isset($_SERVER[$key])) {
                    $_SERVER[$key] = $value;
                }
            }
        }
        return true;
    }

    /**
     * Get environment variable safely, checking $_ENV, $_SERVER, and getenv()
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    public static function get($key, $default = null)
    {
        if (isset($_ENV[$key])) {
            return $_ENV[$key];
        }
        if (isset($_SERVER[$key])) {
            return $_SERVER[$key];
        }
        $val = getenv($key);
        return $val !== false ? $val : $default;
    }
}
