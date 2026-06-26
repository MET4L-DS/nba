<?php

require_once __DIR__ . '/Enrollment.php';
require_once __DIR__ . '/Student.php';

class EnrollmentRepository
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * Enroll a single student in a course offering
     */
    public function enrollStudent($offeringId, $rollNo)
    {
        $isRepeater = 0;
        $offeringStmt = $this->pdo->prepare("SELECT course_id, year, semester FROM course_offerings WHERE offering_id = ?");
        $offeringStmt->execute([$offeringId]);
        $offering = $offeringStmt->fetch(PDO::FETCH_ASSOC);

        if ($offering) {
            $courseId = $offering['course_id'];
            $year = $offering['year'];
            $semester = $offering['semester'];

            $repeaterStmt = $this->pdo->prepare("
                SELECT COUNT(*) 
                FROM enrollments e
                JOIN course_offerings co ON e.offering_id = co.offering_id
                WHERE e.student_rollno = ?
                  AND co.course_id = ?
                  AND (co.year < ? OR (co.year = ? AND co.semester = 'Spring' AND ? = 'Autumn'))
            ");
            $repeaterStmt->execute([$rollNo, $courseId, $year, $year, $semester]);
            if ($repeaterStmt->fetchColumn() > 0) {
                $isRepeater = 1;
            }
        }

        $sql = "INSERT INTO enrollments (offering_id, student_rollno, is_repeater) VALUES (?, ?, ?)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$offeringId, $rollNo, $isRepeater]);

        $enrollmentId = $this->pdo->lastInsertId();
        return $this->findById($enrollmentId);
    }

    /**
     * Bulk enroll students (returns array of results with success/failure info)
     */
    public function bulkEnrollStudents($offeringId, $students)
    {
        $results = [
            'successful' => [],
            'failed' => [],
            'total' => count($students),
            'success_count' => 0,
            'failure_count' => 0
        ];

        foreach ($students as $student) {
            $rollno = $student['rollno'];
            $name = $student['name'];

            try {
                // Check if student exists, if not create
                $existingStudent = $this->findStudentByRollno($rollno);

                if (!$existingStudent) {
                    // Student doesn't exist - we need department info
                    $results['failed'][] = [
                        'rollno' => $rollno,
                        'name' => $name,
                        'reason' => 'Student does not exist in system'
                    ];
                    $results['failure_count']++;
                    continue;
                }

                // Enroll the student
                $enrollment = $this->enrollStudent($offeringId, $rollno);

                $results['successful'][] = [
                    'rollno' => $rollno,
                    'name' => $name,
                    'enrollment_id' => $enrollment->getId()
                ];
                $results['success_count']++;
            } catch (PDOException $e) {
                // Check if it's a duplicate entry error
                if ($e->getCode() == 23000) {
                    $results['failed'][] = [
                        'rollno' => $rollno,
                        'name' => $name,
                        'reason' => 'Already enrolled in this course offering'
                    ];
                } else {
                    $results['failed'][] = [
                        'rollno' => $rollno,
                        'name' => $name,
                        'reason' => 'Database error: ' . $e->getMessage()
                    ];
                }
                $results['failure_count']++;
            }
        }

        return $results;
    }

    /**
     * Find enrollment by ID
     */
    public function findById($id)
    {
        $sql = "SELECT * FROM enrollments WHERE enrollment_id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) return null;

        return new Enrollment(
            $row['enrollment_id'],
            $row['offering_id'],
            $row['student_rollno'],
            $row['enrolled_at'],
            $row['enrollment_status'],
            (bool)($row['is_repeater'] ?? false)
        );
    }

    /**
     * Find enrollments by course template ID
     */
    public function findByCourseId($courseId)
    {
        $sql = "
            SELECT e.* 
            FROM enrollments e
            JOIN course_offerings co ON e.offering_id = co.offering_id
            WHERE co.course_id = ?
        ";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$courseId]);
        $results = [];

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $results[] = new Enrollment(
                $row['enrollment_id'],
                $row['offering_id'],
                $row['student_rollno'],
                $row['enrolled_at'],
                $row['enrollment_status'],
                (bool)($row['is_repeater'] ?? false)
            );
        }

        return $results;
    }

    /**
     * Get all enrollments for a course offering
     */
    public function findByOfferingId($offeringId)
    {
        $sql = "SELECT e.*, s.student_name as student_name 
                FROM enrollments e 
                JOIN students s ON e.student_rollno = s.roll_no 
                WHERE e.offering_id = ? 
                ORDER BY s.roll_no";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$offeringId]);

        $enrollments = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $enrollment = new Enrollment(
                $row['enrollment_id'],
                $row['offering_id'],
                $row['student_rollno'],
                $row['enrolled_at'],
                $row['enrollment_status'] ?? 'Enrolled',
                (bool)($row['is_repeater'] ?? false)
            );

            // Add student name to the array representation
            $enrollmentData = $enrollment->toArray();
            $enrollmentData['student_name'] = $row['student_name'];
            $enrollments[] = $enrollmentData;
        }

        return $enrollments;
    }

    /**
     * Get all enrollments for a student
     */
    public function findByStudentRollno($rollno)
    {
        $sql = "SELECT e.*, co.year, co.semester, c.course_code, c.course_name 
                FROM enrollments e 
                JOIN course_offerings co ON e.offering_id = co.offering_id
                JOIN courses c ON co.course_id = c.course_id 
                WHERE e.student_rollno = ? 
                ORDER BY co.year DESC, co.semester DESC, c.course_code";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$rollno]);

        $enrollments = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $enrollment = new Enrollment(
                $row['enrollment_id'],
                $row['offering_id'],
                $row['student_rollno'],
                $row['enrolled_at'],
                $row['enrollment_status'] ?? 'Enrolled',
                (bool)($row['is_repeater'] ?? false)
            );

            // Add course info to the array representation
            $enrollmentData = $enrollment->toArray();
            $enrollmentData['course_code'] = $row['course_code'];
            $enrollmentData['course_name'] = $row['course_name'];
            $enrollmentData['year'] = $row['year'];
            $enrollmentData['semester'] = $row['semester'];
            $enrollments[] = $enrollmentData;
        }

        return $enrollments;
    }

    /**
     * Remove a student from a course offering
     */
    public function removeEnrollment($offeringId, $rollNo)
    {
        $sql = "DELETE FROM enrollments WHERE offering_id = ? AND student_rollno = ?";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([$offeringId, $rollNo]);
    }

    /**
     * Check if a student is enrolled in a course offering
     */
    public function isEnrolled($offeringId, $rollNo)
    {
        $sql = "SELECT COUNT(*) FROM enrollments WHERE offering_id = ? AND student_rollno = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$offeringId, $rollNo]);
        return $stmt->fetchColumn() > 0;
    }

    /**
     * Helper: Find student by rollno
     */
    private function findStudentByRollno($rollno)
    {
        $sql = "SELECT * FROM students WHERE roll_no = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$rollno]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        return new Student(
            $row['roll_no'],
            $row['student_name'],
            $row['department_id']
        );
    }

    /**
     * Get enrollment count for a course offering
     */
    public function getEnrollmentCount($offeringId)
    {
        $sql = "SELECT COUNT(*) FROM enrollments WHERE offering_id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$offeringId]);
        return $stmt->fetchColumn();
    }

    /**
     * Count enrollments by department (through course and offerings)
     */
    public function countByDepartment($departmentId)
    {
        $sql = "SELECT COUNT(DISTINCT e.enrollment_id) FROM enrollments e
                INNER JOIN course_offerings co ON e.offering_id = co.offering_id
                INNER JOIN courses c ON co.course_id = c.course_id
                WHERE c.department_id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$departmentId]);
        return (int)$stmt->fetchColumn();
    }

    /**
     * Mark all enrollments for a course offering as completed
     */
    public function markEnrollmentsAsCompleted($offeringId)
    {
        $sql = "UPDATE enrollments SET enrollment_status = 'Completed' WHERE offering_id = ?";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([$offeringId]);
    }

    /**
     * Update is_repeater status for a student in a course offering
     */
    public function updateRepeaterStatus($offeringId, $rollNo, $isRepeater)
    {
        $sql = "UPDATE enrollments SET is_repeater = ? WHERE offering_id = ? AND student_rollno = ?";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([$isRepeater ? 1 : 0, $offeringId, $rollNo]);
    }
}

