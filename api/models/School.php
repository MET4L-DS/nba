<?php

/**
 * School Model Class
 * Represents a School entity in the organizational hierarchy
 * Follows Single Responsibility Principle - handles only school data operations
 */
class School
{
    private $schoolId;
    private $schoolCode;
    private $schoolName;
    private $description;
    private $createdAt;

    public function __construct($schoolId = null, $schoolCode = null, $schoolName = null, $description = null, $createdAt = null)
    {
        $this->schoolId = $schoolId;
        $this->schoolCode = $schoolCode;
        $this->schoolName = $schoolName;
        $this->description = $description;
        $this->createdAt = $createdAt;
    }

    // Getters
    public function getSchoolId()
    {
        return $this->schoolId;
    }

    public function getSchoolCode()
    {
        return $this->schoolCode;
    }

    public function getSchoolName()
    {
        return $this->schoolName;
    }

    public function getDescription()
    {
        return $this->description;
    }

    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    // Setters with validation
    public function setSchoolId($schoolId)
    {
        if (!is_numeric($schoolId) || $schoolId <= 0) {
            throw new InvalidArgumentException("School ID must be a positive number");
        }
        $this->schoolId = $schoolId;
    }

    public function setSchoolCode($schoolCode)
    {
        if (empty($schoolCode) || strlen($schoolCode) > 10) {
            throw new InvalidArgumentException("School code must be between 1 and 10 characters");
        }
        $this->schoolCode = $schoolCode;
    }

    public function setSchoolName($schoolName)
    {
        if (empty($schoolName) || strlen($schoolName) < 2 || strlen($schoolName) > 150) {
            throw new InvalidArgumentException("School name must be between 2 and 150 characters");
        }
        $this->schoolName = $schoolName;
    }

    public function setDescription($description)
    {
        $this->description = $description;
    }

    public function setCreatedAt($createdAt)
    {
        $this->createdAt = $createdAt;
    }

    // Convert to array for JSON responses
    public function toArray()
    {
        return [
            'school_id' => $this->schoolId,
            'school_code' => $this->schoolCode,
            'school_name' => $this->schoolName,
            'description' => $this->description,
            'created_at' => $this->createdAt
        ];
    }

    // Validate the complete object
    public function validate()
    {
        if (empty($this->schoolCode)) {
            throw new InvalidArgumentException("School code is required");
        }
        if (empty($this->schoolName)) {
            throw new InvalidArgumentException("School name is required");
        }
        return true;
    }
}
