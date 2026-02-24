<?php

class Enrollment
{
    private $id;
    private $offeringId;
    private $rollNo;
    private $status;
    private $createdAt;
    private $studentData = null;

    public function __construct(
        $id, 
        $offeringId, 
        $rollNo, 
        $createdAt = null, 
        $status = 'Enrolled'
    ) {
        $this->id = $id;
        $this->offeringId = $offeringId;
        $this->rollNo = $rollNo;
        $this->createdAt = $createdAt;
        $this->status = $status;
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

    public function getCourseId()
    {
        // Compatibility
        return $this->offeringId;
    }

    public function getRollNo()
    {
        return $this->rollNo;
    }

    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    public function getStatus()
    {
        return $this->status;
    }

    public function setStudentData($data)
    {
        $this->studentData = $data;
    }

    /**
     * Convert to array
     */
    public function toArray()
    {
        return [
            'id' => $this->id,
            'offering_id' => $this->offeringId,
            'student_rollno' => $this->rollNo,
            'status' => $this->status,
            'enrolled_at' => $this->createdAt,
            'student_name' => $this->studentData['name'] ?? null,
            'student' => $this->studentData
        ];
    }
}
