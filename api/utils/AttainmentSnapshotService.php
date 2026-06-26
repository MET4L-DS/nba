<?php

require_once __DIR__ . '/../models/AttainmentSnapshotRepository.php';
require_once __DIR__ . '/../models/AttainmentScaleRepository.php';
require_once __DIR__ . '/../models/CoPoRepository.php';
require_once __DIR__ . '/../models/CourseOfferingRepository.php';
require_once __DIR__ . '/../models/CourseSurveyRepository.php';
require_once __DIR__ . '/../models/StakeholderSurveyRepository.php';

class AttainmentSnapshotService
{
    private $db;
    private $snapshotRepository;
    private $scaleRepository;
    private $coPoRepository;
    private $offeringRepository;
    private ?CourseSurveyRepository $surveyRepository;

    public function __construct(
        $db,
        AttainmentSnapshotRepository $snapshotRepository,
        AttainmentScaleRepository $scaleRepository,
        CoPoRepository $coPoRepository,
        CourseOfferingRepository $offeringRepository,
        ?CourseSurveyRepository $surveyRepository = null
    ) {
        $this->db = $db;
        $this->snapshotRepository = $snapshotRepository;
        $this->scaleRepository = $scaleRepository;
        $this->coPoRepository = $coPoRepository;
        $this->offeringRepository = $offeringRepository;
        $this->surveyRepository = $surveyRepository;
    }

    public function calculatePreview($offeringId, ?int $programmeId = null, ?bool $isRepeater = null): array
    {
        return $this->buildSnapshotPayload((int)$offeringId, $programmeId, $isRepeater);
    }

    public function calculateAndPersist($offeringId): array
    {
        // First, clear existing snapshots
        $this->snapshotRepository->clearByOfferingId($offeringId);

        $allPayloads = [];

        // 1. Calculate overall (programme_id = null, is_repeater = null)
        $overallPayload = $this->buildSnapshotPayload((int)$offeringId, null, null);
        $this->snapshotRepository->saveCoAttainments($offeringId, $overallPayload['co_attainment']);
        $this->snapshotRepository->savePoAttainments($offeringId, $overallPayload['po_attainment']);
        $allPayloads[] = $overallPayload;

        // 2. Fetch all unique combinations of programme_id and is_repeater
        $stmt = $this->db->prepare(
            "SELECT DISTINCT s.programme_id, e.is_repeater
             FROM enrollments e
             JOIN students s ON s.roll_no = e.student_rollno
             WHERE e.offering_id = ? AND e.enrollment_status != 'Dropped'"
        );
        $stmt->execute([$offeringId]);
        $cohorts = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Calculate and save for each combination
        foreach ($cohorts as $cohort) {
            $progId = (int)$cohort['programme_id'];
            $isRepeater = (bool)$cohort['is_repeater'];
            
            $payload = $this->buildSnapshotPayload((int)$offeringId, $progId, $isRepeater);
            $this->snapshotRepository->saveCoAttainments($offeringId, $payload['co_attainment']);
            $this->snapshotRepository->savePoAttainments($offeringId, $payload['po_attainment']);
            $allPayloads[] = $payload;
        }

        // Return overall payload as primary response for backward compatibility
        return $overallPayload;
    }

    public function clearSnapshots($offeringId): void
    {
        $this->snapshotRepository->clearByOfferingId((int)$offeringId);
    }

    private function buildSnapshotPayload(int $offeringId, ?int $programmeId = null, ?bool $isRepeater = null): array
    {
        $offering = $this->offeringRepository->findById($offeringId);
        if (!$offering) {
            throw new Exception('Course offering not found');
        }

        $coThreshold = (float)$offering->getCoThreshold();
        $passingThreshold = (float)$offering->getPassingThreshold();
        $thresholds = $this->scaleRepository->getByOfferingId($offeringId);
        usort($thresholds, function ($a, $b) {
            return $b->min_percentage <=> $a->min_percentage;
        });

        if (empty($thresholds)) {
            $thresholds = [
                new AttainmentScale(0, $offeringId, 3, 70.0),
                new AttainmentScale(0, $offeringId, 2, 60.0),
                new AttainmentScale(0, $offeringId, 1, 50.0),
            ];
        }

        $coMaxMarks = $this->getCoMaxMarks($offeringId);
        $studentPercentages = $this->getStudentPercentages($offeringId, $coMaxMarks, $programmeId, $isRepeater);
        $presentStudents = count($studentPercentages);

        // --- DIRECT CO ATTAINMENT (existing logic) ---
        $directCoAttainment = [];
        $directCoLevels = [];

        for ($coNumber = 1; $coNumber <= 6; $coNumber++) {
            $attainmentPercentage = 0.0;

            if ($presentStudents > 0 && ($coMaxMarks[$coNumber] ?? 0) > 0) {
                $aboveThreshold = 0;
                foreach ($studentPercentages as $studentCoPercentages) {
                    $percentage = round((float)($studentCoPercentages[$coNumber] ?? 0), 2);
                    if ($percentage >= $coThreshold) {
                        $aboveThreshold++;
                    }
                }

                $attainmentPercentage = round(($aboveThreshold / $presentStudents) * 100, 2);
            }

            $attainmentLevel = round($this->resolveAttainmentLevel($attainmentPercentage, $thresholds), 2);
            $directCoLevels[$coNumber] = $attainmentLevel;
            $directCoAttainment[] = [
                'co_number' => $coNumber,
                'co_name' => 'CO' . $coNumber,
                'programme_id' => $programmeId,
                'is_repeater' => $isRepeater === null ? null : ($isRepeater ? 1 : 0),
                'attainment_percentage' => $attainmentPercentage,
                'attainment_level' => $attainmentLevel,
            ];
        }

        // --- INDIRECT CO ATTAINMENT (from course exit surveys) ---
        $indirectCoAttainment = [];
        $indirectCoLevels = [];
        $hasSurveyData = false;

        if ($this->surveyRepository && $this->surveyRepository->hasResponses($offeringId)) {
            $hasSurveyData = true;
            $coAverages = $this->surveyRepository->getCoAverages($offeringId);
            $avgByCo = [];
            foreach ($coAverages as $avg) {
                $avgByCo[(int)$avg['co_number']] = (float)$avg['average_rating'];
            }

            for ($coNumber = 1; $coNumber <= 6; $coNumber++) {
                // Convert Likert 1-5 scale to percentage: (avg - 1) / 4 * 100
                $avgRating = $avgByCo[$coNumber] ?? 0;
                $indirectPct = $avgRating > 0 ? round(($avgRating - 1) / 4 * 100, 2) : 0.0;
                $indirectLevel = round($this->resolveAttainmentLevel($indirectPct, $thresholds), 2);

                $indirectCoLevels[$coNumber] = $indirectLevel;
                $indirectCoAttainment[] = [
                    'co_number' => $coNumber,
                    'co_name' => 'CO' . $coNumber,
                    'programme_id' => $programmeId,
                    'is_repeater' => $isRepeater === null ? null : ($isRepeater ? 1 : 0),
                    'indirect_attainment_percentage' => $indirectPct,
                    'indirect_attainment_level' => $indirectLevel,
                ];
            }
        }

        // --- BLENDED (FINAL) CO ATTAINMENT ---
        $directWeightage = (float)($offering->getDirectWeightage() ?? 80.0);
        $indirectWeightage = (float)($offering->getIndirectWeightage() ?? 20.0);

        $finalCoAttainment = [];
        $finalCoLevels = [];

        for ($coNumber = 1; $coNumber <= 6; $coNumber++) {
            $directPct = $directCoAttainment[$coNumber - 1]['attainment_percentage'];
            $directLevel = $directCoLevels[$coNumber];

            if ($hasSurveyData && isset($indirectCoLevels[$coNumber]) && $indirectCoLevels[$coNumber] > 0) {
                $indirectPct = $indirectCoAttainment[$coNumber - 1]['indirect_attainment_percentage'];
                $indirectLevel = $indirectCoLevels[$coNumber];

                $finalPct = round(
                    ($directPct * $directWeightage / 100) + ($indirectPct * $indirectWeightage / 100),
                    2
                );
                $finalLevel = round($this->resolveAttainmentLevel($finalPct, $thresholds), 2);

                $finalCoAttainment[] = [
                    'co_number' => $coNumber,
                    'co_name' => 'CO' . $coNumber,
                    'programme_id' => $programmeId,
                    'is_repeater' => $isRepeater === null ? null : ($isRepeater ? 1 : 0),
                    'attainment_percentage' => $directPct,
                    'attainment_level' => $directLevel,
                    'indirect_attainment_percentage' => $indirectPct,
                    'indirect_attainment_level' => $indirectLevel,
                    'final_attainment_percentage' => $finalPct,
                    'final_attainment_level' => $finalLevel,
                ];
            } else {
                // No survey data — final = direct
                $finalCoAttainment[] = [
                    'co_number' => $coNumber,
                    'co_name' => 'CO' . $coNumber,
                    'programme_id' => $programmeId,
                    'is_repeater' => $isRepeater === null ? null : ($isRepeater ? 1 : 0),
                    'attainment_percentage' => $directPct,
                    'attainment_level' => $directLevel,
                    'indirect_attainment_percentage' => null,
                    'indirect_attainment_level' => null,
                    'final_attainment_percentage' => $directPct,
                    'final_attainment_level' => $directLevel,
                ];
            }

            // Always store the achievement level used for PO computation
            // If blended, use final; otherwise use direct
            $finalCoLevels[$coNumber] = $hasSurveyData && ($indirectCoLevels[$coNumber] ?? 0) > 0
                ? ($finalCoAttainment[$coNumber - 1]['final_attainment_level'] ?? $directLevel)
                : $directLevel;
        }

        // --- PO ATTAINMENT ---
        // Direct PO (from direct CO levels)
        $directPoAttainment = $this->computePoAttainment($offeringId, $directCoLevels, count($thresholds));
        // Final PO (from final CO levels)
        $finalPoAttainment = $this->computePoAttainment($offeringId, $finalCoLevels, count($thresholds));

        // Merge: keep backward-compatible attainment_value = final, add direct/indirect
        $poLookup = [];
        foreach ($directPoAttainment as $po) {
            $poLookup[$po['po_name']] = [
                'direct_attainment_value' => $po['attainment_value'],
            ];
        }
        foreach ($finalPoAttainment as $po) {
            if (isset($poLookup[$po['po_name']])) {
                $poLookup[$po['po_name']]['final_attainment_value'] = $po['attainment_value'];
            }
        }

        $mergedPo = [];
        ksort($poLookup);
        foreach ($poLookup as $poName => $values) {
            $directVal = $values['direct_attainment_value'];
            $finalVal = $values['final_attainment_value'];
            $indirectVal = $finalVal !== null && $directVal !== null
                ? round($finalVal - $directVal, 2)
                : null;

            $mergedPo[] = [
                'po_name' => $poName,
                'programme_id' => $programmeId,
                'is_repeater' => $isRepeater === null ? null : ($isRepeater ? 1 : 0),
                'attainment_value' => $finalVal ?? $directVal,
                'direct_attainment_value' => $directVal,
                'indirect_attainment_value' => $indirectVal,
                'final_attainment_value' => $finalVal ?? $directVal,
            ];
        }

        return [
            'offering_id' => $offeringId,
            'co_threshold' => $coThreshold,
            'passing_threshold' => $passingThreshold,
            'present_students' => $presentStudents,
            'attainment_thresholds' => array_map(function ($scale) {
                return [
                    'id' => $scale->id,
                    'level' => $scale->level,
                    'percentage' => (float)$scale->min_percentage,
                ];
            }, $thresholds),
            'co_attainment' => $finalCoAttainment,
            'po_attainment' => $mergedPo,
        ];
    }

    /**
     * Calculate indirect CO attainment from survey data (preview, no persist).
     */
    public function calculateIndirectCoAttainment(int $offeringId): array
    {
        if (!$this->surveyRepository || !$this->surveyRepository->hasResponses($offeringId)) {
            return [];
        }

        $thresholds = $this->scaleRepository->getByOfferingId($offeringId);
        usort($thresholds, function ($a, $b) {
            return $b->min_percentage <=> $a->min_percentage;
        });

        if (empty($thresholds)) {
            $thresholds = [
                new AttainmentScale(0, $offeringId, 3, 70.0),
                new AttainmentScale(0, $offeringId, 2, 60.0),
                new AttainmentScale(0, $offeringId, 1, 50.0),
            ];
        }

        $averages = $this->surveyRepository->getCoAverages($offeringId);
        $results = [];

        for ($co = 1; $co <= 6; $co++) {
            $avg = 0;
            $count = 0;
            foreach ($averages as $a) {
                if ((int)$a['co_number'] === $co) {
                    $avg = (float)$a['average_rating'];
                    $count = (int)$a['respondent_count'];
                    break;
                }
            }

            $pct = $avg > 0 ? round(($avg - 1) / 4 * 100, 2) : 0.0;
            $level = round($this->resolveAttainmentLevel($pct, $thresholds), 2);

            $results[] = [
                'co_number' => $co,
                'co_name' => 'CO' . $co,
                'average_rating' => $avg,
                'respondent_count' => $count,
                'attainment_percentage' => $pct,
                'attainment_level' => $level,
            ];
        }

        return $results;
    }

    private function getCoMaxMarks(int $offeringId): array
    {
        $stmt = $this->db->prepare(
            'SELECT q.co AS co_number, SUM(q.max_marks) AS max_marks
             FROM tests t
             JOIN questions q ON q.test_id = t.test_id
             WHERE t.offering_id = ?
             GROUP BY q.co'
        );
        $stmt->execute([$offeringId]);

        $result = [1 => 0.0, 2 => 0.0, 3 => 0.0, 4 => 0.0, 5 => 0.0, 6 => 0.0];
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $result[(int)$row['co_number']] = round((float)$row['max_marks'], 2);
        }

        return $result;
    }

    private function getStudentPercentages(int $offeringId, array $coMaxMarks, ?int $programmeId = null, ?bool $isRepeater = null): array
    {
        $query = "SELECT e.student_rollno
                  FROM enrollments e
                  JOIN students s ON s.roll_no = e.student_rollno
                  WHERE e.offering_id = ? AND e.enrollment_status != 'Dropped'";
        
        $params = [$offeringId];

        if ($programmeId !== null) {
            $query .= " AND s.programme_id = ?";
            $params[] = $programmeId;
        }

        if ($isRepeater !== null) {
            $query .= " AND e.is_repeater = ?";
            $params[] = $isRepeater ? 1 : 0;
        }

        $studentsStmt = $this->db->prepare($query);
        $studentsStmt->execute($params);
        $students = $studentsStmt->fetchAll(PDO::FETCH_COLUMN);

        $percentages = [];
        foreach ($students as $rollNo) {
            $percentages[$rollNo] = [1 => 0.0, 2 => 0.0, 3 => 0.0, 4 => 0.0, 5 => 0.0, 6 => 0.0];
        }

        if (empty($students)) {
            return $percentages;
        }

        // Create placeholders for student rollnos
        $inQuery = implode(',', array_fill(0, count($students), '?'));
        
        // Use IN clause to get marks only for the students in this cohort
        $marksStmt = $this->db->prepare(
            "SELECT m.student_roll_no, m.co_number, SUM(m.marks_obtained) AS total_marks
             FROM marks m
             JOIN tests t ON t.test_id = m.test_id
             WHERE t.offering_id = ? AND m.student_roll_no IN ($inQuery)
             GROUP BY m.student_roll_no, m.co_number"
        );
        
        $marksParams = array_merge([$offeringId], $students);
        $marksStmt->execute($marksParams);

        foreach ($marksStmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $rollNo = $row['student_roll_no'];
            $coNumber = (int)$row['co_number'];
            $maxMarks = (float)($coMaxMarks[$coNumber] ?? 0);
            $obtained = (float)$row['total_marks'];

            if (!isset($percentages[$rollNo]) || $maxMarks <= 0) {
                continue;
            }

            $percentages[$rollNo][$coNumber] = round(($obtained / $maxMarks) * 100, 2);
        }

        return $percentages;
    }

    private function resolveAttainmentLevel(float $percentage, array $thresholds): float
    {
        if (empty($thresholds)) {
            return 0.0;
        }

        if ($percentage >= (float)$thresholds[0]->min_percentage) {
            return (float)count($thresholds);
        }

        for ($i = 1; $i < count($thresholds); $i++) {
            $current = (float)$thresholds[$i]->min_percentage;
            if ($percentage >= $current) {
                $baseLevel = count($thresholds) - $i;
                $next = (float)$thresholds[$i - 1]->min_percentage;
                $diff = $next - $current;

                if ($diff == 0.0) {
                    return (float)$baseLevel;
                }

                return $baseLevel + (($percentage - $current) / $diff);
            }
        }

        return 0.0;
    }

    /**
     * Calculate and persist programme-level batch attainment.
     * Blends course-level direct PO attainment with stakeholder survey
     * indirect PO attainment using the programme's configured weightage.
     * Upserts results into programme_batch_attainments.
     */
    public function calculateProgrammeBatchAttainment(int $programmeId, int $batchYear): array
    {
        // 1. Get programme weightage
        $progStmt = $this->db->prepare(
            'SELECT direct_weightage, indirect_weightage FROM programmes WHERE programme_id = ?'
        );
        $progStmt->execute([$programmeId]);
        $progRow = $progStmt->fetch(PDO::FETCH_ASSOC);
        $directWeightage = $progRow ? (float)$progRow['direct_weightage'] : 80.0;
        $indirectWeightage = $progRow ? (float)$progRow['indirect_weightage'] : 20.0;

        // 2. Get course-level direct PO attainment (weighted average based on CO-PO mapping values)
        $courseStmt = $this->db->prepare(
            "SELECT
                opa.po_name,
                ROUND(SUM(COALESCE(opa.direct_attainment_value, opa.attainment_value) * map.avg_val) / SUM(map.avg_val), 2) AS direct_attainment
             FROM offering_po_attainment_snapshots opa
             JOIN (
                 SELECT offering_id, po_name, AVG(value) AS avg_val
                 FROM co_po_mapping
                 WHERE value > 0
                 GROUP BY offering_id, po_name
             ) map ON opa.offering_id = map.offering_id AND opa.po_name = map.po_name
             WHERE opa.programme_id = ?
               AND (opa.is_repeater IS NULL OR opa.is_repeater = FALSE)
               AND EXISTS (
                 SELECT 1
                 FROM enrollments e
                 JOIN students s ON s.roll_no = e.student_rollno
                 WHERE e.offering_id = opa.offering_id
                   AND e.enrollment_status != 'Dropped'
                   AND e.is_repeater = FALSE
                   AND s.programme_id = ?
                   AND s.batch_year = ?
             )
             GROUP BY opa.po_name
             ORDER BY opa.po_name ASC"
        );
        $courseStmt->execute([$programmeId, $programmeId, $batchYear]);
        $courseRows = $courseStmt->fetchAll(PDO::FETCH_ASSOC);

        // Direct lookup: po_name => direct_attainment
        $directByPo = [];
        foreach ($courseRows as $row) {
            $directByPo[$row['po_name']] = (float)$row['direct_attainment'];
        }

        // 3. Get per-type PO attainment levels via stakeholder_survey_repo
        $repo = new StakeholderSurveyRepository($this->db);
        $byType = $repo->getPoAveragesByType($programmeId, $batchYear);

        // 4. Use default thresholds for Likert->level conversion
        $defaultThresholds = [
            new AttainmentScale(0, 0, 3, 70.0),
            new AttainmentScale(0, 0, 2, 60.0),
            new AttainmentScale(0, 0, 1, 50.0),
        ];

        // Build per-type attainment level lookup: [po_name => [type => level, ...]]
        $typeLevels = [];
        foreach ($byType as $row) {
            $po = $row['po_name'];
            $t = $row['stakeholder_type'];
            $avg = (float)$row['average_rating'];
            $pct = $avg > 0 ? ($avg - 1) / 4 * 100 : 0.0;
            $typeLevels[$po][$t] = $this->resolveAttainmentLevel($pct, $defaultThresholds);
        }

        // Consolidated = mean of per-type attainment levels (not mean of percentages)
        $stakeholderByPo = [];
        foreach ($typeLevels as $po => $levelsByType) {
            $stakeholderByPo[$po] = round(array_sum($levelsByType) / count($levelsByType), 2);
        }

        // 5. Build canonical PO list
        $poList = [];
        for ($i = 1; $i <= 12; $i++) { $poList[] = 'PO' . $i; }
        for ($i = 1; $i <= 3; $i++) { $poList[] = 'PSO' . $i; }

        // Resolve or create batch_id from programme_batches to maintain database integrity
        $batchStmt = $this->db->prepare(
            'SELECT batch_id FROM programme_batches WHERE programme_id = ? AND batch_year = ?'
        );
        $batchStmt->execute([$programmeId, $batchYear]);
        $batchId = $batchStmt->fetchColumn();

        if (!$batchId) {
            $createStmt = $this->db->prepare(
                'INSERT IGNORE INTO programme_batches (programme_id, batch_year, status) VALUES (?, ?, ?)'
            );
            $createStmt->execute([$programmeId, $batchYear, 'active']);
            $batchStmt->execute([$programmeId, $batchYear]);
            $batchId = $batchStmt->fetchColumn();
        }
        $batchId = $batchId ? (int)$batchId : null;

        $this->db->beginTransaction();

        // Preserve existing targets before deleting (inside transaction with FOR UPDATE to prevent race condition)
        $targetStmt = $this->db->prepare(
            'SELECT po_name, target FROM programme_batch_attainments WHERE programme_id = ? AND batch_year = ? FOR UPDATE'
        );
        $targetStmt->execute([$programmeId, $batchYear]);
        $existingTargets = [];
        foreach ($targetStmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $existingTargets[$row['po_name']] = (float)$row['target'];
        }

        // Delete stale rows for this programme/batch
        $deleteStmt = $this->db->prepare(
            'DELETE FROM programme_batch_attainments WHERE programme_id = ? AND batch_year = ?'
        );
        $deleteStmt->execute([$programmeId, $batchYear]);

        // Upsert all 15 PO rows deterministically
        $insertStmt = $this->db->prepare(
            'INSERT INTO programme_batch_attainments
                (programme_id, batch_id, batch_year, po_name, direct_attainment, indirect_attainment, final_attainment, target)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );

        $results = [];
        foreach ($poList as $poName) {
            $directVal = $directByPo[$poName] ?? 0.0;

            // Skip zero rows when no course data exists
            if (empty($directByPo)) {
                continue;
            }

            $indirectLevel = $stakeholderByPo[$poName] ?? 0.0;
            $finalVal = round(
                ($directVal * $directWeightage / 100) + ($indirectLevel * $indirectWeightage / 100),
                2
            );

            $results[] = [
                'po_name' => $poName,
                'direct_attainment' => $directVal,
                'indirect_attainment' => $indirectLevel,
                'final_attainment' => $finalVal,
            ];

            $insertStmt->execute([
                $programmeId,
                $batchId,
                $batchYear,
                $poName,
                $directVal,
                $indirectLevel,
                $finalVal,
                $existingTargets[$poName] ?? 0.0,
            ]);
        }

        $this->db->commit();

        return $results;
    }

    private function computePoAttainment(int $offeringId, array $coLevels, int $attainmentPointsScale): array
    {
        $rows = $this->coPoRepository->getMatrix($offeringId);
        $sumByPo = [];
        $countByPo = [];

        foreach ($rows as $row) {
            $poName = $row['po_name'];
            $mappingValue = (int)$row['value'];
            $coNumber = (int)substr($row['co_name'], 2);

            if ($mappingValue <= 0 || $attainmentPointsScale <= 0) {
                continue;
            }

            $value = ((float)($coLevels[$coNumber] ?? 0) * $mappingValue) / $attainmentPointsScale;
            $sumByPo[$poName] = ($sumByPo[$poName] ?? 0) + $value;
            $countByPo[$poName] = ($countByPo[$poName] ?? 0) + 1;
        }

        $poAttainment = [];
        ksort($countByPo);
        foreach ($countByPo as $poName => $count) {
            $poAttainment[] = [
                'po_name' => $poName,
                'attainment_value' => $count > 0 ? round($sumByPo[$poName] / $count, 2) : 0.0,
            ];
        }

        return $poAttainment;
    }
}
