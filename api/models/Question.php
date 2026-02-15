<?php

/**
 * Question Model
 * Represents a question with main number, sub-question, CO mapping, and optional status
 */
class Question
{
    private $question_id;
    private $testId;
    private $questionNumber;    // 1-20
    private $subQuestion;       // a-h or NULL
    private $isOptional;        // true/false
    private $co;                // 1-6
    private $maxMarks;          // decimal

    public function __construct(
        $question_id,
        $testId,
        $questionNumber,
        $subQuestion,
        $isOptional,
        $co,
        $maxMarks
    ) {
        $this->question_id = $question_id;
        $this->setTestId($testId);
        $this->setQuestionNumber($questionNumber);
        $this->setSubQuestion($subQuestion);
        $this->setIsOptional($isOptional);
        $this->setCo($co);
        $this->setMaxMarks($maxMarks);
    }

    // Getters
    public function getQuestionId()
    {
        return $this->question_id;
    }
    public function getTestId()
    {
        return $this->testId;
    }
    public function getQuestionNumber()
    {
        return $this->questionNumber;
    }
    public function getSubQuestion()
    {
        return $this->subQuestion;
    }
    public function getIsOptional()
    {
        return $this->isOptional;
    }
    public function getCo()
    {
        return $this->co;
    }
    public function getMaxMarks()
    {
        return $this->maxMarks;
    }

    /**
     * Get full question identifier (e.g., "5a", "10", "3b")
     */
    public function getQuestionIdentifier()
    {
        return $this->questionNumber . ($this->subQuestion ? $this->subQuestion : '');
    }

    // Setters with validation
    public function setQuestionId($question_id)
    {
        $this->question_id = $question_id;
    }

    public function setTestId($testId)
    {
        if (!is_numeric($testId)) {
            throw new Exception("Test ID must be a number");
        }
        $this->testId = (int)$testId;
    }

    public function setQuestionNumber($questionNumber)
    {
        if (!is_numeric($questionNumber) || $questionNumber < 1 || $questionNumber > 20) {
            throw new Exception("Question number must be between 1 and 20");
        }
        $this->questionNumber = (int)$questionNumber;
    }

    public function setSubQuestion($subQuestion)
    {
        if ($subQuestion !== null && $subQuestion !== '') {
            $subQuestion = strtolower(trim($subQuestion));
            if (!preg_match('/^[a-h]$/', $subQuestion)) {
                throw new Exception("Sub-question must be between 'a' and 'h' or NULL");
            }
            $this->subQuestion = $subQuestion;
        } else {
            $this->subQuestion = null;
        }
    }

    public function setIsOptional($isOptional)
    {
        // Convert to integer (0 or 1) for MySQL compatibility
        $this->isOptional = $isOptional ? 1 : 0;
    }

    public function setCo($co)
    {
        if (!is_numeric($co) || $co < 1 || $co > 6) {
            throw new Exception("CO must be between 1 and 6");
        }
        $this->co = (int)$co;
    }

    public function setMaxMarks($maxMarks)
    {
        if (!is_numeric($maxMarks) || $maxMarks < 0.5) {
            throw new Exception("Max marks must be at least 0.5");
        }
        $this->maxMarks = (float)$maxMarks;
    }

    /**
     * Convert to array
     */
    public function toArray()
    {
        return [
            'question_id' => $this->question_id,
            'test_id' => $this->testId,
            'question_number' => $this->questionNumber,
            'sub_question' => $this->subQuestion,
            'question_identifier' => $this->getQuestionIdentifier(),
            'is_optional' => $this->isOptional,
            'co' => $this->co,
            'max_marks' => $this->maxMarks
        ];
    }
}
