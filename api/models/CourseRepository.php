<?php

/**
 * Course Repository Class
 * Handles database operations for courses
 */
class CourseRepository
{
    private $db;

    public function __construct($dbConnection)
    {
        $this->db = $dbConnection;
    }

    /**
     * Find course by ID
     */
    public function findById($id)
    {
        try {
            $stmt = $this->db->prepare("SELECT * FROM courses WHERE course_id = ?");
            $stmt->execute([$id]);
            $data = $stmt->fetch();

            if ($data) {
                return new Course(
                    $data['course_id'],
                    $data['course_code'],
                    $data['course_name'],
                    $data['credit'],
                    $data['department_id'] ?? null,
                    $data['course_type'] ?? 'Theory',
                    $data['course_level'] ?? 'Undergraduate',
                    $data['is_active'] ?? 1,
                    $data['created_at'] ?? null,
                    $data['updated_at'] ?? null
                );
            }
            return null;
        } catch (PDOException $e) {
            throw new Exception("Database error: " . $e->getMessage());
        }
    }



    /**
     * Find courses by School ID
     * @param int $schoolId
     * @return array
     */
    public function findBySchool($schoolId)
    {
        try {
            $stmt = $this->db->prepare("
                SELECT c.*, d.department_code, d.department_name
                FROM courses c
                JOIN departments d ON c.department_id = d.department_id
                WHERE d.school_id = ?
                ORDER BY c.course_code
            ");
            $stmt->execute([$schoolId]);
            $courses = [];

            while ($data = $stmt->fetch()) {
                $courses[] = new Course(
                    $data['course_id'],
                    $data['course_code'],
                    $data['course_name'],
                    $data['credit'],
                    $data['department_id'] ?? null,
                    $data['course_type'] ?? 'Theory',
                    $data['course_level'] ?? 'Undergraduate',
                    $data['is_active'] ?? 1,
                    $data['created_at'] ?? null,
                    $data['updated_at'] ?? null
                );
            }

            return $courses;
        } catch (PDOException $e) {
            throw new Exception("Database error: " . $e->getMessage());
        }
    }

    /**
     * Count courses by school ID
     * @param int $schoolId
     * @return int
     */
    public function countBySchool($schoolId)
    {
        try {
            $stmt = $this->db->prepare("
                SELECT COUNT(*) 
                FROM courses c
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
     * Save course
     */
    public function save(Course $course)
    {
        try {
            if ($course->getCourseId()) {
                // Update existing course
                $stmt = $this->db->prepare("UPDATE courses SET course_code = ?, course_name = ?, credit = ?, department_id = ?, course_type = ?, course_level = ?, is_active = ? WHERE course_id = ?");
                return $stmt->execute([
                    $course->getCourseCode(),
                    $course->getCourseName(),
                    $course->getCredit(),
                    $course->getDepartmentId(),
                    $course->getCourseType(),
                    $course->getCourseLevel(),
                    $course->getIsActive(),
                    $course->getCourseId()
                ]);
            } else {
                // Insert new course
                $stmt = $this->db->prepare("INSERT INTO courses (course_code, course_name, credit, department_id, course_type, course_level, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)");
                $result = $stmt->execute([
                    $course->getCourseCode(),
                    $course->getCourseName(),
                    $course->getCredit(),
                    $course->getDepartmentId(),
                    $course->getCourseType(),
                    $course->getCourseLevel(),
                    $course->getIsActive()
                ]);

                if ($result) {
                    $course->setCourseId($this->db->lastInsertId());
                }

                return $result;
            }
        } catch (PDOException $e) {
            throw new Exception("Database error: " . $e->getMessage());
        }
    }

    /**
     * Delete course
     */
    public function delete($id)
    {
        try {
            $stmt = $this->db->prepare("DELETE FROM courses WHERE course_id = ?");
            return $stmt->execute([$id]);
        } catch (PDOException $e) {
            throw new Exception("Database error: " . $e->getMessage());
        }
    }

    /**
     * Get all courses with department info
     * @return array
     */
    public function findAll()
    {
        try {
            $stmt = $this->db->prepare("
                SELECT c.*, d.department_code, d.department_name
                FROM courses c 
                LEFT JOIN departments d ON c.department_id = d.department_id
                ORDER BY c.course_code
            ");
            $stmt->execute();
            $courses = [];

            while ($data = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $courses[] = [
                    'course_id' => $data['course_id'],
                    'course_code' => $data['course_code'],
                    'course_name' => $data['course_name'],
                    'credit' => $data['credit'],
                    'department_id' => $data['department_id'] ?? null,
                    'department_code' => $data['department_code'] ?? null,
                    'department_name' => $data['department_name'] ?? null,
                    'course_type' => $data['course_type'] ?? 'Theory',
                    'course_level' => $data['course_level'] ?? 'Undergraduate',
                    'is_active' => $data['is_active'] ?? 1,
                    'created_at' => $data['created_at'] ?? null,
                    'updated_at' => $data['updated_at'] ?? null
                ];
            }

            return $courses;
        } catch (PDOException $e) {
            throw new Exception("Database error: " . $e->getMessage());
        }
    }

    /**
     * Count all courses
     * @return int
     */
    public function countAll()
    {
        try {
            $stmt = $this->db->prepare("SELECT COUNT(*) FROM courses");
            $stmt->execute();
            return (int)$stmt->fetchColumn();
        } catch (PDOException $e) {
            throw new Exception("Database error: " . $e->getMessage());
        }
    }

    /**
     * Find course by course code
     * @param string $courseCode
     * @return Course|null
     */
    public function findByCourseCode($courseCode)
    {
        try {
            $stmt = $this->db->prepare("SELECT * FROM courses WHERE course_code = ?");
            $stmt->execute([$courseCode]);
            $data = $stmt->fetch();

            if ($data) {
                return new Course(
                    $data['course_id'],
                    $data['course_code'],
                    $data['course_name'],
                    $data['credit'],
                    $data['department_id'] ?? null,
                    $data['course_type'] ?? 'Theory',
                    $data['course_level'] ?? 'Undergraduate',
                    $data['is_active'] ?? 1,
                    $data['created_at'] ?? null,
                    $data['updated_at'] ?? null
                );
            }
            return null;
        } catch (PDOException $e) {
            throw new Exception("Database error: " . $e->getMessage());
        }
    }

    /**
     * Find course by ID with department info
     * @param int $id
     * @return array|null
     */
    public function findByIdWithDepartment($id)
    {
        try {
            $stmt = $this->db->prepare("
                SELECT c.*, d.department_code, d.department_name
                FROM courses c 
                LEFT JOIN departments d ON c.department_id = d.department_id
                WHERE c.course_id = ?
            ");
            $stmt->execute([$id]);
            $data = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($data) {
                return [
                    'course_id' => $data['course_id'],
                    'course_code' => $data['course_code'],
                    'course_name' => $data['course_name'],
                    'credit' => $data['credit'],
                    'department_id' => $data['department_id'] ?? null,
                    'department_code' => $data['department_code'] ?? null,
                    'department_name' => $data['department_name'] ?? null,
                    'course_type' => $data['course_type'] ?? 'Theory',
                    'course_level' => $data['course_level'] ?? 'Undergraduate',
                    'is_active' => $data['is_active'] ?? 1,
                    'created_at' => $data['created_at'] ?? null,
                    'updated_at' => $data['updated_at'] ?? null
                ];
            }
            return null;
        } catch (PDOException $e) {
            throw new Exception("Database error: " . $e->getMessage());
        }
    }

    /**
     * Find courses by department
     * @param int $departmentId
     * @return array
     */
    public function findByDepartment($departmentId)
    {
        try {
            $stmt = $this->db->prepare("
                SELECT c.*
                FROM courses c 
                WHERE c.department_id = ?
                ORDER BY c.course_code
            ");
            $stmt->execute([$departmentId]);
            $courses = [];

            while ($data = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $courses[] = [
                    'course_id' => $data['course_id'],
                    'course_code' => $data['course_code'],
                    'course_name' => $data['course_name'],
                    'credit' => $data['credit'],
                    'department_id' => $data['department_id'] ?? null,
                    'course_type' => $data['course_type'] ?? 'Theory',
                    'course_level' => $data['course_level'] ?? 'Undergraduate',
                    'is_active' => $data['is_active'] ?? 1,
                    'created_at' => $data['created_at'] ?? null,
                    'updated_at' => $data['updated_at'] ?? null
                ];
            }

            return $courses;
        } catch (PDOException $e) {
            throw new Exception("Database error: " . $e->getMessage());
        }
    }

    /**
     * Count courses by department
     * @param int $departmentId
     * @return int
     */
    public function countByDepartment($departmentId)
    {
        try {
            $stmt = $this->db->prepare("SELECT COUNT(*) FROM courses WHERE department_id = ?");
            $stmt->execute([$departmentId]);
            return (int)$stmt->fetchColumn();
        } catch (PDOException $e) {
            throw new Exception("Database error: " . $e->getMessage());
        }
    }

    /**
     * Count offerings by department
     * @param int $departmentId
     * @return int
     */
    public function countOfferingsByDepartment($departmentId)
    {
        try {
            $stmt = $this->db->prepare("
                SELECT COUNT(*) FROM course_offerings co
                INNER JOIN courses c ON co.course_id = c.course_id
                WHERE c.department_id = ?
            ");
            $stmt->execute([$departmentId]);
            return (int)$stmt->fetchColumn();
        } catch (PDOException $e) {
            throw new Exception("Database error: " . $e->getMessage());
        }
    }

    /**
     * Count assessments (tests) by department
     * @param int $departmentId
     * @return int
     */
    public function countAssessmentsByDepartment($departmentId)
    {
        try {
            $stmt = $this->db->prepare("
                SELECT COUNT(DISTINCT t.test_id) FROM tests t
                INNER JOIN course_offerings co ON t.offering_id = co.offering_id
                INNER JOIN courses c ON co.course_id = c.course_id
                WHERE c.department_id = ?
            ");
            $stmt->execute([$departmentId]);
            return (int)$stmt->fetchColumn();
        } catch (PDOException $e) {
            throw new Exception("Database error: " . $e->getMessage());
        }
    }
}
