<?php

require_once __DIR__ . '/AttainmentScale.php';

class AttainmentScaleRepository
{
    private PDO $connection;

    public function __construct(PDO $connection)
    {
        $this->connection = $connection;
    }

    /**
     * Get all attainment scale entries for a course
     */
    public function getByCourseId(int $courseId): array
    {
        $stmt = $this->connection->prepare(
            "SELECT * FROM attainment_scale WHERE course_id = ? ORDER BY level DESC"
        );
        $stmt->execute([$courseId]);
        
        $scales = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $scales[] = new AttainmentScale(
                (int)$row['id'],
                (int)$row['course_id'],
                (int)$row['level'],
                (float)$row['min_percentage']
            );
        }
        
        return $scales;
    }

    /**
     * Save attainment scale for a course (replaces all existing entries)
     */
    public function saveBulk(int $courseId, array $scales): bool
    {
        try {
            $this->connection->beginTransaction();

            // Delete existing scales for this course
            $stmt = $this->connection->prepare(
                "DELETE FROM attainment_scale WHERE course_id = ?"
            );
            $stmt->execute([$courseId]);

            // Insert new scales
            $stmt = $this->connection->prepare(
                "INSERT INTO attainment_scale (course_id, level, min_percentage) VALUES (?, ?, ?)"
            );

            foreach ($scales as $scale) {
                $stmt->execute([
                    $courseId,
                    $scale['level'],
                    $scale['min_percentage']
                ]);
            }

            $this->connection->commit();
            return true;
        } catch (Exception $e) {
            $this->connection->rollBack();
            throw $e;
        }
    }

    /**
     * Delete all attainment scales for a course
     */
    public function deleteByCourseId(int $courseId): bool
    {
        $stmt = $this->connection->prepare(
            "DELETE FROM attainment_scale WHERE course_id = ?"
        );
        return $stmt->execute([$courseId]);
    }

    /**
     * Check if attainment scale exists for a course
     */
    public function existsForCourse(int $courseId): bool
    {
        $stmt = $this->connection->prepare(
            "SELECT COUNT(*) FROM attainment_scale WHERE course_id = ?"
        );
        $stmt->execute([$courseId]);
        return $stmt->fetchColumn() > 0;
    }
}
