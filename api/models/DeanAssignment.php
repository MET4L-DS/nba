<?php

/**
 * DeanAssignment Model Class
 * Represents a Dean assignment record with historical tracking
 * Follows Single Responsibility Principle - handles only Dean assignment data operations
 */
class DeanAssignment
{
    private $id;
    private $schoolId;
    private $employeeId;
    private $startDate;
    private $endDate;
    private $isCurrent;
    private $appointmentOrder;
    private $createdAt;

    public function __construct($id = null, $schoolId = null, $employeeId = null, $startDate = null, $endDate = null, $isCurrent = 1, $appointmentOrder = null, $createdAt = null)
    {
        $this->id = $id;
        $this->schoolId = $schoolId;
        $this->employeeId = $employeeId;
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->isCurrent = $isCurrent;
        $this->appointmentOrder = $appointmentOrder;
        $this->createdAt = $createdAt;
    }

    // Getters
    public function getId()
    {
        return $this->id;
    }

    public function getSchoolId()
    {
        return $this->schoolId;
    }

    public function getEmployeeId()
    {
        return $this->employeeId;
    }

    public function getStartDate()
    {
        return $this->startDate;
    }

    public function getEndDate()
    {
        return $this->endDate;
    }

    public function getIsCurrent()
    {
        return $this->isCurrent;
    }

    public function getAppointmentOrder()
    {
        return $this->appointmentOrder;
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

    public function setSchoolId($schoolId)
    {
        if (!is_numeric($schoolId) || $schoolId <= 0) {
            throw new InvalidArgumentException("School ID must be a positive number");
        }
        $this->schoolId = $schoolId;
    }

    public function setEmployeeId($employeeId)
    {
        if (!is_numeric($employeeId) || $employeeId <= 0) {
            throw new InvalidArgumentException("Employee ID must be a positive number");
        }
        $this->employeeId = $employeeId;
    }

    public function setStartDate($startDate)
    {
        if (empty($startDate)) {
            throw new InvalidArgumentException("Start date is required");
        }
        $this->startDate = $startDate;
    }

    public function setEndDate($endDate)
    {
        $this->endDate = $endDate;
    }

    public function setIsCurrent($isCurrent)
    {
        $this->isCurrent = $isCurrent ? 1 : 0;
    }

    public function setAppointmentOrder($appointmentOrder)
    {
        $this->appointmentOrder = $appointmentOrder;
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
            'school_id' => $this->schoolId,
            'employee_id' => $this->employeeId,
            'start_date' => $this->startDate,
            'end_date' => $this->endDate,
            'is_current' => $this->isCurrent,
            'appointment_order' => $this->appointmentOrder,
            'created_at' => $this->createdAt
        ];
    }

    // Validate the complete object
    public function validate()
    {
        if (empty($this->schoolId)) {
            throw new InvalidArgumentException("School ID is required");
        }
        if (empty($this->employeeId)) {
            throw new InvalidArgumentException("Employee ID is required");
        }
        if (empty($this->startDate)) {
            throw new InvalidArgumentException("Start date is required");
        }
        return true;
    }
}
