<?php

/**
 * Test Repository Class
 * Handles database operations for tests
 */
class TestRepository
{
    private $db;

    public function __construct($dbConnection)
    {
        $this->db = $dbConnection;
    }

    /**
     * Find test by ID
     */
    public function findById($id)
    {
        try {
            // Join with offering and course template
            $stmt = $this->db->prepare("
                SELECT t.*, co.year, co.semester, c.course_code
                FROM tests t
                JOIN course_offerings co ON t.offering_id = co.offering_id
                JOIN courses c ON co.course_id = c.course_id
                WHERE t.test_id = ?
            ");
            $stmt->execute([$id]);
            $data = $stmt->fetch();

            if ($data) {
                return new Test(
                    $data['test_id'],
                    $data['offering_id'],
                    $data['test_name'],
                    $data['full_marks'],
                    $data['pass_marks'],
                    $data['question_paper_pdf'],
                    $data['test_type'] ?? null,
                    $data['test_date'] ?? null,
                    $data['max_marks'] ?? null,
                    $data['weightage'] ?? null,
                    $data['course_code'],
                    $data['year'],
                    $data['semester']
                );
            }
            return null;
        } catch (PDOException $e) {
            throw new Exception("Database error: " . $e->getMessage());
        }
    }

    /**
     * Find tests by offering ID
     */
    public function findByOfferingId($offeringId)
    {
        try {
            // Join with offering and course template
            $stmt = $this->db->prepare("
                SELECT t.*, co.year, co.semester, c.course_code
                FROM tests t
                JOIN course_offerings co ON t.offering_id = co.offering_id
                JOIN courses c ON co.course_id = c.course_id
                WHERE t.offering_id = ? 
                ORDER BY t.test_id DESC
            ");
            $stmt->execute([$offeringId]);
            $tests = [];

            while ($data = $stmt->fetch()) {
                $tests[] = new Test(
                    $data['test_id'],
                    $data['offering_id'],
                    $data['test_name'],
                    $data['full_marks'],
                    $data['pass_marks'],
                    $data['question_paper_pdf'],
                    $data['test_type'] ?? null,
                    $data['test_date'] ?? null,
                    $data['max_marks'] ?? null,
                    $data['weightage'] ?? null,
                    $data['course_code'],
                    $data['year'],
                    $data['semester']
                );
            }

            return $tests;
        } catch (PDOException $e) {
            throw new Exception("Database error: " . $e->getMessage());
        }
    }

    /**
     * Count tests by school ID
     * @param int $schoolId
     * @return int
     */
    public function countBySchool($schoolId)
    {
        try {
            $stmt = $this->db->prepare("
                SELECT COUNT(*) 
                FROM tests t
                JOIN course_offerings co ON t.offering_id = co.offering_id
                JOIN courses c ON co.course_id = c.course_id
                JOIN departments d ON c.department_id = d.department_id
                WHERE d.school_id = ?
            ");
            $stmt->execute([$schoolId]);
            return (int)$stmt->fetchColumn();
        } catch (PDOException $e) {
            throw new Exception("Database error: " . $e->getMessage());
        }
    }

    /**
     * Find tests by school ID
     * @param int $schoolId
     * @return array
     */
    public function findBySchool($schoolId)
    {
        try {
            $stmt = $this->db->prepare("
                SELECT t.*, c.course_code, co.year, co.semester 
                FROM tests t
                JOIN course_offerings co ON t.offering_id = co.offering_id
                JOIN courses c ON co.course_id = c.course_id
                JOIN departments d ON c.department_id = d.department_id
                WHERE d.school_id = ?
                ORDER BY t.test_date DESC
            ");
            $stmt->execute([$schoolId]);
            $tests = [];

            while ($data = $stmt->fetch()) {
                $tests[] = new Test(
                    $data['test_id'],
                    $data['offering_id'],
                    $data['test_name'],
                    $data['full_marks'],
                    $data['pass_marks'],
                    $data['question_paper_pdf'],
                    $data['test_type'] ?? null,
                    $data['test_date'] ?? null,
                    $data['max_marks'] ?? null,
                    $data['weightage'] ?? null,
                    $data['course_code'],
                    $data['year'],
                    $data['semester']
                );
            }
            return $tests;
        } catch (PDOException $e) {
            throw new Exception("Database error: " . $e->getMessage());
        }
    }

    /**
     * Save test
     */
    public function save(Test $test)
    {
        try {
            if ($test->getTestId()) {
                // Update existing test
                $stmt = $this->db->prepare("UPDATE tests SET offering_id = ?, test_name = ?, full_marks = ?, pass_marks = ?, question_paper_pdf = ?, test_type = ?, test_date = ?, max_marks = ?, weightage = ? WHERE test_id = ?");
                return $stmt->execute([
                    $test->getOfferingId(),
                    $test->getTestName(),
                    $test->getFullMarks(),
                    $test->getPassMarks(),
                    $test->getQuestionPaperPdf(),
                    $test->getTestType(),
                    $test->getTestDate(),
                    $test->getMaxMarks(),
                    $test->getWeightage(),
                    $test->getTestId()
                ]);
            } else {
                // Insert new test
                $stmt = $this->db->prepare("INSERT INTO tests (offering_id, test_name, full_marks, pass_marks, question_paper_pdf, test_type, test_date, max_marks, weightage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $result = $stmt->execute([
                    $test->getOfferingId(),
                    $test->getTestName(),
                    $test->getFullMarks(),
                    $test->getPassMarks(),
                    $test->getQuestionPaperPdf(),
                    $test->getTestType(),
                    $test->getTestDate(),
                    $test->getMaxMarks(),
                    $test->getWeightage()
                ]);

                if ($result) {
                    $test->setTestId($this->db->lastInsertId());
                }

                return $result;
            }
        } catch (PDOException $e) {
            throw new Exception("Database error: " . $e->getMessage());
        }
    }

    /**
     * Delete test
     */
    public function delete($id)
    {
        try {
            $stmt = $this->db->prepare("DELETE FROM tests WHERE test_id = ?");
            return $stmt->execute([$id]);
        } catch (PDOException $e) {
            throw new Exception("Database error: " . $e->getMessage());
        }
    }

    /**
     * Get all tests with course info
     * @return array
     */
    public function findAll()
    {
        try {
            $stmt = $this->db->prepare("
                SELECT t.*, c.course_code, c.course_name, co.year, co.semester 
                FROM tests t 
                JOIN course_offerings co ON t.offering_id = co.offering_id
                JOIN courses c ON co.course_id = c.course_id 
                ORDER BY t.test_id DESC
            ");
            $stmt->execute();
            $tests = [];

            while ($data = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $tests[] = [
                    'test_id' => $data['test_id'],
                    'offering_id' => $data['offering_id'],
                    'course_code' => $data['course_code'],
                    'course_name' => $data['course_name'],
                    'test_name' => $data['test_name'],
                    'full_marks' => $data['full_marks'],
                    'pass_marks' => $data['pass_marks'],
                    'test_type' => $data['test_type'] ?? null,
                    'test_date' => $data['test_date'] ?? null,
                    'max_marks' => $data['max_marks'] ?? null,
                    'weightage' => $data['weightage'] ?? null,
                    'year' => $data['year'],
                    'semester' => $data['semester']
                ];
            }

            return $tests;
        } catch (PDOException $e) {
            throw new Exception("Database error: " . $e->getMessage());
        }
    }

    /**
     * Count all tests
     * @return int
     */
    public function countAll()
    {
        try {
            $stmt = $this->db->prepare("SELECT COUNT(*) FROM tests");
            $stmt->execute();
            return (int)$stmt->fetchColumn();
        } catch (PDOException $e) {
            throw new Exception("Database error: " . $e->getMessage());
        }
    }
}
