<?php

/**
 * RawMarks Model
 * Represents per-question marks for a student in a test
 */
class RawMarks
{
    private $id;
    private $testId;
    private $studentId;
    private $questionId;
    private $marks_obtained;

    public function __construct($testId, $studentId, $questionId, $marks_obtained, $id = null)
    {
        $this->id = $id;
        $this->testId = $testId;
        $this->studentId = $studentId;
        $this->questionId = $questionId;
        $this->marks_obtained = $marks_obtained;
    }

    // Getters
    public function getId()
    {
        return $this->id;
    }

    public function getTestId()
    {
        return $this->testId;
    }

    public function getStudentId()
    {
        return $this->studentId;
    }

    public function getQuestionId()
    {
        return $this->questionId;
    }

    public function getMarksObtained()
    {
        return $this->marks_obtained;
    }

    // Setters
    public function setId($id)
    {
        $this->id = $id;
    }

    public function setMarksObtained($marks_obtained)
    {
        $this->marks_obtained = $marks_obtained;
    }

    /**
     * Convert to array
     */
    public function toArray()
    {
        return [
            'id' => $this->id,
            'test_id' => $this->testId,
            'student_id' => $this->studentId,
            'question_id' => $this->questionId,
            'marks_obtained' => $this->marks_obtained
        ];
    }
}
