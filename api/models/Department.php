<?php

/**
 * Department Model Class
 * Follows Single Responsibility Principle - handles only department data operations
 * Follows Open/Closed Principle - can be extended without modification
 */
class Department
{
    private $departmentId;
    private $departmentName;
    private $departmentCode;
    private $schoolId;
    private $description;
    private $createdAt;

    public function __construct($departmentId = null, $departmentName = null, $departmentCode = null, $schoolId = null, $description = null, $createdAt = null)
    {
        $this->departmentId = $departmentId;
        $this->departmentName = $departmentName;
        $this->departmentCode = $departmentCode;
        $this->schoolId = $schoolId;
        $this->description = $description;
        $this->createdAt = $createdAt;
    }

    // Getters
    public function getDepartmentId()
    {
        return $this->departmentId;
    }
    public function getDepartmentName()
    {
        return $this->departmentName;
    }
    public function getDepartmentCode()
    {
        return $this->departmentCode;
    }
    public function getSchoolId()
    {
        return $this->schoolId;
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
    public function setDepartmentId($departmentId)
    {
        if (!is_numeric($departmentId) || $departmentId <= 0) {
            throw new InvalidArgumentException("Department ID must be a positive number");
        }
        $this->departmentId = $departmentId;
    }

    public function setDepartmentName($departmentName)
    {
        if (empty($departmentName) || strlen($departmentName) < 2) {
            throw new InvalidArgumentException("Department name must be at least 2 characters long");
        }
        $this->departmentName = $departmentName;
    }

    public function setDepartmentCode($departmentCode)
    {
        if (empty($departmentCode) || strlen($departmentCode) < 2) {
            throw new InvalidArgumentException("Department code must be at least 2 characters long");
        }
        $this->departmentCode = strtoupper($departmentCode);
    }

    public function setSchoolId($schoolId)
    {
        if ($schoolId !== null && (!is_numeric($schoolId) || $schoolId <= 0)) {
            throw new InvalidArgumentException("School ID must be a positive number or null");
        }
        $this->schoolId = $schoolId;
    }

    public function setDescription($description)
    {
        $this->description = $description;
    }

    public function setCreatedAt($createdAt)
    {
        $this->createdAt = $createdAt;
    }

    /**
     * Convert department object to array (for JSON responses)
     * @return array
     */
    public function toArray()
    {
        return [
            'department_id' => $this->departmentId,
            'department_name' => $this->departmentName,
            'department_code' => $this->departmentCode,
            'school_id' => $this->schoolId,
            'description' => $this->description,
            'created_at' => $this->createdAt
        ];
    }

    /**
     * Validate department data
     * @return array Array of validation errors, empty if valid
     */
    public function validate()
    {
        $errors = [];

        if (empty($this->departmentName)) {
            $errors[] = "Department name is required";
        } elseif (strlen($this->departmentName) < 2) {
            $errors[] = "Department name must be at least 2 characters long";
        }

        if (empty($this->departmentCode)) {
            $errors[] = "Department code is required";
        } elseif (strlen($this->departmentCode) < 2) {
            $errors[] = "Department code must be at least 2 characters long";
        }

        return $errors;
    }
}
