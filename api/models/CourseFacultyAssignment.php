<?php

/**
 * CourseFacultyAssignment Model Class
 * Represents a course-faculty assignment with year/semester tracking
 * Follows Single Responsibility Principle - handles only course faculty assignment data operations
 */
class CourseFacultyAssignment
{
    private $id;
    private $courseId;
    private $employeeId;
    private $year;
    private $semester;
    private $assignmentType;
    private $assignedDate;
    private $completionDate;
    private $isActive;
    private $createdAt;

    // Valid assignment types
    const ASSIGNMENT_TYPES = ['Primary', 'Co-instructor', 'Lab'];

    public function __construct($id = null, $courseId = null, $employeeId = null, $year = null, $semester = null, $assignmentType = 'Primary', $assignedDate = null, $completionDate = null, $isActive = 1, $createdAt = null)
    {
        $this->id = $id;
        $this->courseId = $courseId;
        $this->employeeId = $employeeId;
        $this->year = $year;
        $this->semester = $semester;
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

    public function getCourseId()
    {
        return $this->courseId;
    }

    public function getEmployeeId()
    {
        return $this->employeeId;
    }

    public function getYear()
    {
        return $this->year;
    }

    public function getSemester()
    {
        return $this->semester;
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

    public function setCourseId($courseId)
    {
        if (!is_numeric($courseId) || $courseId <= 0) {
            throw new InvalidArgumentException("Course ID must be a positive number");
        }
        $this->courseId = $courseId;
    }

    public function setEmployeeId($employeeId)
    {
        if (!is_numeric($employeeId) || $employeeId <= 0) {
            throw new InvalidArgumentException("Employee ID must be a positive number");
        }
        $this->employeeId = $employeeId;
    }

    public function setYear($year)
    {
        if (!is_numeric($year) || $year < 1000 || $year > 9999) {
            throw new InvalidArgumentException("Year must be a valid 4-digit year");
        }
        $this->year = $year;
    }

    public function setSemester($semester)
    {
        if (!is_numeric($semester) || $semester < 1 || $semester > 8) {
            throw new InvalidArgumentException("Semester must be between 1 and 8");
        }
        $this->semester = $semester;
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
            'course_id' => $this->courseId,
            'employee_id' => $this->employeeId,
            'year' => $this->year,
            'semester' => $this->semester,
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
        if (empty($this->courseId)) {
            throw new InvalidArgumentException("Course ID is required");
        }
        if (empty($this->employeeId)) {
            throw new InvalidArgumentException("Employee ID is required");
        }
        if (empty($this->year)) {
            throw new InvalidArgumentException("Year is required");
        }
        if (empty($this->semester)) {
            throw new InvalidArgumentException("Semester is required");
        }
        return true;
    }
}
