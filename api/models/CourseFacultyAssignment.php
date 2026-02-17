<?php

/**
 * CourseFacultyAssignment Model Class
 * Represents a faculty assignment to a course offering
 * Follows Single Responsibility Principle - handles only course faculty assignment data operations
 */
class CourseFacultyAssignment
{
    private $id;
    private $offeringId;
    private $employeeId;
    private $assignmentType;
    private $assignedDate;
    private $completionDate;
    private $isActive;
    private $createdAt;

    // Valid assignment types
    const ASSIGNMENT_TYPES = ['Primary', 'Co-instructor', 'Lab'];

    public function __construct($id = null, $offeringId = null, $employeeId = null, $assignmentType = 'Primary', $assignedDate = null, $completionDate = null, $isActive = 1, $createdAt = null)
    {
        $this->id = $id;
        $this->offeringId = $offeringId;
        $this->employeeId = $employeeId;
        $this->assignmentType = $assignmentType;
        $this->assignedDate = $assignedDate;
        $this->completionDate = $completionDate;
        $this->isActive = $isActive;
        $this->createdAt = $createdAt;
    }

    // Getters
    public function getId()
    {
        return $this->id;
    }

    public function getOfferingId()
    {
        return $this->offeringId;
    }

    public function getEmployeeId()
    {
        return $this->employeeId;
    }

    public function getAssignmentType()
    {
        return $this->assignmentType;
    }

    public function getAssignedDate()
    {
        return $this->assignedDate;
    }

    public function getCompletionDate()
    {
        return $this->completionDate;
    }

    public function getIsActive()
    {
        return $this->isActive;
    }

    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    // Setters with validation
    public function setId($id)
    {
        if (!is_numeric($id) || $id <= 0) {
            throw new InvalidArgumentException("ID must be a positive number");
        }
        $this->id = $id;
    }

    public function setOfferingId($offeringId)
    {
        if (!is_numeric($offeringId) || $offeringId <= 0) {
            throw new InvalidArgumentException("Offering ID must be a positive number");
        }
        $this->offeringId = $offeringId;
    }

    public function setEmployeeId($employeeId)
    {
        if (!is_numeric($employeeId) || $employeeId <= 0) {
            throw new InvalidArgumentException("Employee ID must be a positive number");
        }
        $this->employeeId = $employeeId;
    }

    public function setAssignmentType($assignmentType)
    {
        if (!in_array($assignmentType, self::ASSIGNMENT_TYPES)) {
            throw new InvalidArgumentException("Invalid assignment type. Must be one of: " . implode(', ', self::ASSIGNMENT_TYPES));
        }
        $this->assignmentType = $assignmentType;
    }

    public function setAssignedDate($assignedDate)
    {
        $this->assignedDate = $assignedDate;
    }

    public function setCompletionDate($completionDate)
    {
        $this->completionDate = $completionDate;
    }

    public function setIsActive($isActive)
    {
        $this->isActive = $isActive ? 1 : 0;
    }

    public function setCreatedAt($createdAt)
    {
        $this->createdAt = $createdAt;
    }

    // Convert to array for JSON responses
    public function toArray()
    {
        return [
            'id' => $this->id,
            'offering_id' => $this->offeringId,
            'employee_id' => $this->employeeId,
            'assignment_type' => $this->assignmentType,
            'assigned_date' => $this->assignedDate,
            'completion_date' => $this->completionDate,
            'is_active' => $this->isActive,
            'created_at' => $this->createdAt
        ];
    }

    // Validate the complete object
    public function validate()
    {
        if (empty($this->offeringId)) {
            throw new InvalidArgumentException("Offering ID is required");
        }
        if (empty($this->employeeId)) {
            throw new InvalidArgumentException("Employee ID is required");
        }
        return true;
    }
}
