<?php

class Enrollment
{
    private $enrollment_id;
    private $courseId;
    private $studentRollno;
    private $enrolledAt;
    private $enrollment_status;
    private $enrolled_date;

    public function __construct(
        $enrollment_id, 
        $courseId, 
        $studentRollno, 
        $enrolledAt = null, 
        $enrollment_status = 'Enrolled',
        $enrolled_date = null
    ) {
        $this->enrollment_id = $enrollment_id;
        $this->courseId = $courseId;
        $this->studentRollno = $studentRollno;
        $this->enrolledAt = $enrolledAt;
        $this->enrollment_status = $enrollment_status;
        $this->enrolled_date = $enrolled_date;
    }

    // Getters
    public function getEnrollmentId()
    {
        return $this->enrollment_id;
    }

    public function getCourseId()
    {
        return $this->courseId;
    }

    public function getStudentRollno()
    {
        return $this->studentRollno;
    }

    public function getEnrolledAt()
    {
        return $this->enrolledAt;
    }

    public function getEnrollmentStatus()
    {
        return $this->enrollment_status;
    }

    public function getEnrolledDate()
    {
        return $this->enrolled_date;
    }

    // Setters
    public function setEnrollmentId($enrollment_id)
    {
        $this->enrollment_id = $enrollment_id;
    }

    public function setCourseId($courseId)
    {
        $this->courseId = $courseId;
    }

    public function setStudentRollno($studentRollno)
    {
        $this->studentRollno = $studentRollno;
    }

    public function setEnrolledAt($enrolledAt)
    {
        $this->enrolledAt = $enrolledAt;
    }

    public function setEnrollmentStatus($enrollment_status)
    {
        $this->enrollment_status = $enrollment_status;
    }

    public function setEnrolledDate($enrolled_date)
    {
        $this->enrolled_date = $enrolled_date;
    }

    /**
     * Convert to array
     */
    public function toArray()
    {
        return [
            'enrollment_id' => $this->enrollment_id,
            'course_id' => $this->courseId,
            'student_rollno' => $this->studentRollno,
            'enrolled_at' => $this->enrolledAt,
            'enrollment_status' => $this->enrollment_status,
            'enrolled_date' => $this->enrolled_date
        ];
    }
}
