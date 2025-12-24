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
     * Enroll a single student in a course
     */
    public function enrollStudent($courseId, $studentRollno)
    {
        $sql = "INSERT INTO enrollment (course_id, student_rollno) VALUES (?, ?)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$courseId, $studentRollno]);

        $enrollmentId = $this->pdo->lastInsertId();
        return $this->findById($enrollmentId);
    }

    /**
     * Bulk enroll students (returns array of results with success/failure info)
     */
    public function bulkEnrollStudents($courseId, $students)
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
                    // For now, we'll add a note that student needs to be created first
                    $results['failed'][] = [
                        'rollno' => $rollno,
                        'name' => $name,
                        'reason' => 'Student does not exist in system'
                    ];
                    $results['failure_count']++;
                    continue;
                }

                // Enroll the student
                $enrollment = $this->enrollStudent($courseId, $rollno);

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
                        'reason' => 'Already enrolled in this course'
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
        $sql = "SELECT * FROM enrollment WHERE id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        return new Enrollment(
            $row['id'],
            $row['course_id'],
            $row['student_rollno'],
            $row['enrolled_at']
        );
    }

    /**
     * Get all enrollments for a course
     */
    public function findByCourseId($courseId)
    {
        $sql = "SELECT e.*, s.name as student_name 
                FROM enrollment e 
                JOIN student s ON e.student_rollno = s.rollno 
                WHERE e.course_id = ? 
                ORDER BY s.rollno";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$courseId]);

        $enrollments = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $enrollment = new Enrollment(
                $row['id'],
                $row['course_id'],
                $row['student_rollno'],
                $row['enrolled_at']
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
        $sql = "SELECT e.*, c.course_code, c.name as course_name 
                FROM enrollment e 
                JOIN course c ON e.course_id = c.id 
                WHERE e.student_rollno = ? 
                ORDER BY c.course_code";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$rollno]);

        $enrollments = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $enrollment = new Enrollment(
                $row['id'],
                $row['course_id'],
                $row['student_rollno'],
                $row['enrolled_at']
            );

            // Add course info to the array representation
            $enrollmentData = $enrollment->toArray();
            $enrollmentData['course_code'] = $row['course_code'];
            $enrollmentData['course_name'] = $row['course_name'];
            $enrollments[] = $enrollmentData;
        }

        return $enrollments;
    }

    /**
     * Remove a student from a course
     */
    public function removeEnrollment($courseId, $studentRollno)
    {
        $sql = "DELETE FROM enrollment WHERE course_id = ? AND student_rollno = ?";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([$courseId, $studentRollno]);
    }

    /**
     * Check if a student is enrolled in a course
     */
    public function isEnrolled($courseId, $studentRollno)
    {
        $sql = "SELECT COUNT(*) FROM enrollment WHERE course_id = ? AND student_rollno = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$courseId, $studentRollno]);
        return $stmt->fetchColumn() > 0;
    }

    /**
     * Helper: Find student by rollno
     */
    private function findStudentByRollno($rollno)
    {
        $sql = "SELECT * FROM student WHERE rollno = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$rollno]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        return new Student(
            $row['rollno'],
            $row['name'],
            $row['dept']
        );
    }

    /**
     * Get enrollment count for a course
     */
    public function getEnrollmentCount($courseId)
    {
        $sql = "SELECT COUNT(*) FROM enrollment WHERE course_id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$courseId]);
        return $stmt->fetchColumn();
    }

    /**
     * Count enrollments by department (through course faculty)
     */
    public function countByDepartment($departmentId)
    {
        $sql = "SELECT COUNT(*) FROM enrollment e
                INNER JOIN course c ON e.course_id = c.id
                INNER JOIN users u ON c.faculty_id = u.employee_id
                WHERE u.department_id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$departmentId]);
        return (int)$stmt->fetchColumn();
    }
}
