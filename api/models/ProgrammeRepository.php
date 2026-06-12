<?php

/**
 * Programme Repository Class
 * Handles database operations for programmes.
 */
class ProgrammeRepository
{
    private $db;

    public function __construct($dbConnection)
    {
        $this->db = $dbConnection;
    }

    public function findById($programmeId)
    {
        $stmt = $this->db->prepare('SELECT * FROM programmes WHERE programme_id = ?');
        $stmt->execute([(int)$programmeId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        return new Programme(
            (int)$row['programme_id'],
            (int)$row['department_id'],
            $row['programme_code'],
            $row['programme_name'],
            $row['degree_level'],
            (int)$row['duration_years'],
            isset($row['direct_weightage']) ? (float)$row['direct_weightage'] : 80.0,
            isset($row['indirect_weightage']) ? (float)$row['indirect_weightage'] : 20.0,
            $row['created_at'] ?? null
        );
    }

    public function findEnrichedPaginated(array $params): array
    {
        $sort = $params['sort'] ?? 'p.programme_id';
        $sortDir = strtoupper($params['sort_dir'] ?? 'ASC') === 'DESC' ? 'DESC' : 'ASC';
        $limit = max(1, (int)($params['limit'] ?? 20));
        $cursor = isset($params['cursor']) ? (int)$params['cursor'] : null;

        $where = [];
        $bindings = [];

        if (!empty($params['search'])) {
            $where[] = '(p.programme_code LIKE ? OR p.programme_name LIKE ? OR d.department_code LIKE ? OR d.department_name LIKE ?)';
            $like = '%' . $params['search'] . '%';
            $bindings[] = $like;
            $bindings[] = $like;
            $bindings[] = $like;
            $bindings[] = $like;
        }

        if (isset($params['department_id']) && $params['department_id'] !== '') {
            $where[] = 'p.department_id = ?';
            $bindings[] = (int)$params['department_id'];
        }

        if (isset($params['school_id']) && $params['school_id'] !== '') {
            $where[] = 'd.school_id = ?';
            $bindings[] = (int)$params['school_id'];
        }

        if (isset($params['degree_level']) && $params['degree_level'] !== '') {
            $where[] = 'p.degree_level = ?';
            $bindings[] = $params['degree_level'];
        }

        $from = "
            FROM programmes p
            JOIN departments d ON p.department_id = d.department_id
            LEFT JOIN schools s ON d.school_id = s.school_id
        ";

		// year filter → JOIN programme_batches (batches still in progress)
		if (!empty($params['filters']['year'])) {
			$where[] = 'pb.batch_year >= ? - p.duration_years + 1';
			$where[] = 'pb.batch_year <= ?';
			$bindings[] = (int)$params['filters']['year'];
			$bindings[] = (int)$params['filters']['year'];
			$from = "
				FROM programmes p
				JOIN programme_batches pb ON pb.programme_id = p.programme_id
				JOIN departments d ON p.department_id = d.department_id
				LEFT JOIN schools s ON d.school_id = s.school_id
			";
		} elseif (!empty($params['filters']['has_batches']) && $params['filters']['has_batches'] === '1') {
			$from = "
				FROM programmes p
				JOIN programme_batches pb ON pb.programme_id = p.programme_id
				JOIN departments d ON p.department_id = d.department_id
				LEFT JOIN schools s ON d.school_id = s.school_id
			";
			if (!empty($params['filters']['batch_year_max'])) {
				$where[] = 'pb.batch_year <= ?';
				$bindings[] = (int)$params['filters']['batch_year_max'];
			}
		}

        if ($cursor !== null) {
            $where[] = $sortDir === 'DESC' ? 'p.programme_id < ?' : 'p.programme_id > ?';
            $bindings[] = $cursor;
        }

        $whereSql = empty($where) ? '' : ('WHERE ' . implode(' AND ', $where));

		$selectBatchFields = "";
		if (!empty($params['filters']['year']) || (!empty($params['filters']['has_batches']) && $params['filters']['has_batches'] === '1')) {
			$selectBatchFields = ", pb.batch_id, pb.batch_year AS specific_batch_year, pb.status AS batch_status";
		}

		$sql = "
			SELECT
				p.programme_id,
				p.department_id,
				p.programme_code,
				p.programme_name,
				p.degree_level,
				p.duration_years,
				p.direct_weightage,
				p.indirect_weightage,
				p.created_at,
				d.department_name,
				d.department_code,
				d.school_id,
				s.school_name,
				s.school_code,
				(SELECT COUNT(*) FROM students st WHERE st.programme_id = p.programme_id) AS student_count,
				(SELECT COUNT(*) FROM programme_courses pc WHERE pc.programme_id = p.programme_id) AS course_count,
				(SELECT MAX(pb3.batch_year) FROM programme_batches pb3 WHERE pb3.programme_id = p.programme_id) AS latest_batch_year
				{$selectBatchFields}
			{$from}
            {$whereSql}
            ORDER BY {$sort} {$sortDir}
            LIMIT {$limit}
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($bindings);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map(function ($row) {
            return [
                'programme_id' => (int)$row['programme_id'],
                'department_id' => (int)$row['department_id'],
                'programme_code' => $row['programme_code'],
                'programme_name' => $row['programme_name'],
                'degree_level' => $row['degree_level'],
                'duration_years' => (int)$row['duration_years'],
                'direct_weightage' => isset($row['direct_weightage']) ? (float)$row['direct_weightage'] : 80.0,
                'indirect_weightage' => isset($row['indirect_weightage']) ? (float)$row['indirect_weightage'] : 20.0,
                'created_at' => $row['created_at'],
                'department_name' => $row['department_name'],
                'department_code' => $row['department_code'],
                'school_id' => $row['school_id'] !== null ? (int)$row['school_id'] : null,
                'school_name' => $row['school_name'],
                'school_code' => $row['school_code'],
				'student_count' => (int)$row['student_count'],
				'course_count' => (int)$row['course_count'],
				'latest_batch_year' => isset($row['latest_batch_year']) && $row['latest_batch_year'] !== null ? (int)$row['latest_batch_year'] : null,
				'batch_id' => isset($row['batch_id']) ? (int)$row['batch_id'] : null,
				'specific_batch_year' => isset($row['specific_batch_year']) && $row['specific_batch_year'] !== null ? (int)$row['specific_batch_year'] : null,
				'batch_status' => $row['batch_status'] ?? null,
			];
		}, $rows);
	}

    public function countEnrichedPaginated(array $params): int
    {
        $where = [];
        $bindings = [];

        $from = "FROM programmes p JOIN departments d ON p.department_id = d.department_id";

        if (!empty($params['search'])) {
            $where[] = '(p.programme_code LIKE ? OR p.programme_name LIKE ? OR d.department_code LIKE ? OR d.department_name LIKE ?)';
            $like = '%' . $params['search'] . '%';
            $bindings[] = $like;
            $bindings[] = $like;
            $bindings[] = $like;
            $bindings[] = $like;
        }

        if (isset($params['department_id']) && $params['department_id'] !== '') {
            $where[] = 'p.department_id = ?';
            $bindings[] = (int)$params['department_id'];
        }

        if (isset($params['school_id']) && $params['school_id'] !== '') {
            $where[] = 'd.school_id = ?';
            $bindings[] = (int)$params['school_id'];
        }

        if (isset($params['degree_level']) && $params['degree_level'] !== '') {
            $where[] = 'p.degree_level = ?';
            $bindings[] = $params['degree_level'];
        }

		if (!empty($params['filters']['year'])) {
			$where[] = 'pb.batch_year >= ? - p.duration_years + 1';
			$where[] = 'pb.batch_year <= ?';
			$bindings[] = (int)$params['filters']['year'];
			$bindings[] = (int)$params['filters']['year'];
			$from = "FROM programmes p JOIN programme_batches pb ON pb.programme_id = p.programme_id JOIN departments d ON p.department_id = d.department_id LEFT JOIN schools s ON d.school_id = s.school_id";
		} elseif (!empty($params['filters']['has_batches']) && $params['filters']['has_batches'] === '1') {
			$from = "FROM programmes p JOIN programme_batches pb ON pb.programme_id = p.programme_id JOIN departments d ON p.department_id = d.department_id LEFT JOIN schools s ON d.school_id = s.school_id";
			if (!empty($params['filters']['batch_year_max'])) {
				$where[] = 'pb.batch_year <= ?';
				$bindings[] = (int)$params['filters']['batch_year_max'];
			}
		}

        $whereSql = empty($where) ? '' : ('WHERE ' . implode(' AND ', $where));

        $stmt = $this->db->prepare("SELECT COUNT(*) {$from} {$whereSql}");
        $stmt->execute($bindings);
        return (int)$stmt->fetchColumn();
    }

    public function save(Programme $programme): bool
    {
        if ($programme->getProgrammeId()) {
            $stmt = $this->db->prepare('UPDATE programmes SET department_id = ?, programme_code = ?, programme_name = ?, degree_level = ?, duration_years = ?, direct_weightage = ?, indirect_weightage = ? WHERE programme_id = ?');
            return $stmt->execute([
                $programme->getDepartmentId(),
                $programme->getProgrammeCode(),
                $programme->getProgrammeName(),
                $programme->getDegreeLevel(),
                $programme->getDurationYears(),
                $programme->getDirectWeightage(),
                $programme->getIndirectWeightage(),
                $programme->getProgrammeId(),
            ]);
        }

        $stmt = $this->db->prepare('INSERT INTO programmes (department_id, programme_code, programme_name, degree_level, duration_years, direct_weightage, indirect_weightage) VALUES (?, ?, ?, ?, ?, ?, ?)');
        $ok = $stmt->execute([
            $programme->getDepartmentId(),
            $programme->getProgrammeCode(),
            $programme->getProgrammeName(),
            $programme->getDegreeLevel(),
            $programme->getDurationYears(),
            $programme->getDirectWeightage(),
            $programme->getIndirectWeightage(),
        ]);

        if ($ok) {
            $programme->setProgrammeId($this->db->lastInsertId());
        }

        return $ok;
    }

    public function delete($programmeId): bool
    {
        $stmt = $this->db->prepare('DELETE FROM programmes WHERE programme_id = ?');
        return $stmt->execute([(int)$programmeId]);
    }

    public function codeExists(string $programmeCode, ?int $excludeProgrammeId = null): bool
    {
        $sql = 'SELECT COUNT(*) FROM programmes WHERE programme_code = ?';
        $params = [strtoupper(trim($programmeCode))];

        if ($excludeProgrammeId !== null) {
            $sql .= ' AND programme_id != ?';
            $params[] = $excludeProgrammeId;
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return (int)$stmt->fetchColumn() > 0;
    }

    public function nameExists(string $programmeName, ?int $excludeProgrammeId = null): bool
    {
        $sql = 'SELECT COUNT(*) FROM programmes WHERE programme_name = ?';
        $params = [trim($programmeName)];

        if ($excludeProgrammeId !== null) {
            $sql .= ' AND programme_id != ?';
            $params[] = $excludeProgrammeId;
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return (int)$stmt->fetchColumn() > 0;
    }

	public function getProgrammesWithBatches(int $departmentId): array
	{
		$sql = "
			SELECT
				p.programme_id,
				p.department_id,
				p.programme_code,
				p.programme_name,
				p.degree_level,
				p.duration_years,
				p.created_at,
				pb.batch_id,
				pb.batch_year,
				pb.status AS batch_status
			FROM programmes p
			INNER JOIN programme_batches pb ON pb.programme_id = p.programme_id
			WHERE p.department_id = ?
			ORDER BY p.programme_name, pb.batch_year DESC
		";
		$stmt = $this->db->prepare($sql);
		$stmt->execute([$departmentId]);
		return $stmt->fetchAll(PDO::FETCH_ASSOC);
	}

	public function createBatch(int $programmeId, int $batchYear, string $status = 'upcoming'): int
	{
		$stmt = $this->db->prepare(
			"INSERT IGNORE INTO programme_batches (programme_id, batch_year, status)
			 VALUES (?, ?, ?)"
		);
		$stmt->execute([$programmeId, $batchYear, $status]);
		// Return the batch_id (existing or newly inserted)
		$stmt = $this->db->prepare("SELECT batch_id FROM programme_batches WHERE programme_id = ? AND batch_year = ?");
		$stmt->execute([$programmeId, $batchYear]);
		return (int)$stmt->fetchColumn();
	}

	public function getBatchById(int $batchId): ?array
	{
		$stmt = $this->db->prepare("
			SELECT
				pb.*,
				u.username AS coordinator_name,
				(SELECT COUNT(*) FROM students s WHERE s.batch_id = pb.batch_id) AS student_count
			FROM programme_batches pb
			LEFT JOIN users u ON pb.coordinator_id = u.employee_id
			WHERE pb.batch_id = ?
		");
		$stmt->execute([$batchId]);
		$row = $stmt->fetch(PDO::FETCH_ASSOC);
		return $row ?: null;
	}

	public function getBatchesByProgramme(int $programmeId): array
	{
		$stmt = $this->db->prepare("
			SELECT
				pb.*,
				u.username AS coordinator_name,
				(SELECT COUNT(*) FROM students s WHERE s.batch_id = pb.batch_id) AS student_count
			FROM programme_batches pb
			LEFT JOIN users u ON pb.coordinator_id = u.employee_id
			WHERE pb.programme_id = ?
			ORDER BY pb.batch_year DESC
		");
		$stmt->execute([$programmeId]);
		return $stmt->fetchAll(PDO::FETCH_ASSOC);
	}

	public function updateWeightage(int $programmeId, float $directWeightage, float $indirectWeightage): bool
	{
		$stmt = $this->db->prepare('UPDATE programmes SET direct_weightage = ?, indirect_weightage = ? WHERE programme_id = ?');
		return $stmt->execute([$directWeightage, $indirectWeightage, $programmeId]);
	}

    public function countStudents($programmeId): int
    {
        $stmt = $this->db->prepare('SELECT COUNT(*) FROM students WHERE programme_id = ?');
        $stmt->execute([(int)$programmeId]);
        return (int)$stmt->fetchColumn();
    }

	public function updateBatch(int $batchId, array $data): bool
	{
		$allowed = ['batch_year', 'coordinator_id', 'status', 'start_date', 'end_date'];
		$fields = [];
		$params = [];
		foreach ($allowed as $key) {
			if (array_key_exists($key, $data)) {
				$fields[] = "`$key` = ?";
				$params[] = $data[$key];
			}
		}
		if (empty($fields)) {
			return false;
		}
		$params[] = $batchId;
		$sql = "UPDATE programme_batches SET " . implode(', ', $fields) . " WHERE batch_id = ?";
		$stmt = $this->db->prepare($sql);
		return $stmt->execute($params);
	}

	public function deleteBatch(int $batchId): bool
	{
		$stmt = $this->db->prepare("DELETE FROM programme_batches WHERE batch_id = ?");
		return $stmt->execute([$batchId]);
	}
}
