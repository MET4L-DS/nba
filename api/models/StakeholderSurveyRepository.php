<?php

class StakeholderSurveyRepository
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function getSurvey(int $programmeId, int $batchYear, string $stakeholderType): ?array
    {
        $stmt = $this->db->prepare(
            'SELECT * FROM stakeholder_surveys 
             WHERE programme_id = ? AND batch_year = ? AND stakeholder_type = ?'
        );
        $stmt->execute([$programmeId, $batchYear, $stakeholderType]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function createSurvey(int $programmeId, int $batchYear, string $stakeholderType, string $title = 'Stakeholder Survey'): int
    {
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

        $stmt = $this->db->prepare(
            'INSERT INTO stakeholder_surveys (programme_id, batch_id, batch_year, stakeholder_type, title) 
             VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([$programmeId, $batchId, $batchYear, $stakeholderType, $title]);
        return (int)$this->db->lastInsertId();
    }

    public function getQuestions(int $surveyId): array
    {
        $stmt = $this->db->prepare(
            'SELECT * FROM stakeholder_survey_questions 
             WHERE survey_id = ? ORDER BY question_number'
        );
        $stmt->execute([$surveyId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function saveQuestions(int $surveyId, array $questions): void
    {
        try {
            $this->db->beginTransaction();

            $stmt = $this->db->prepare('DELETE FROM stakeholder_survey_questions WHERE survey_id = ?');
            $stmt->execute([$surveyId]);

            if (!empty($questions)) {
                $stmt = $this->db->prepare(
                    'INSERT INTO stakeholder_survey_questions (survey_id, question_number, question_text, po_name, mapping_weight) 
                     VALUES (?, ?, ?, ?, ?)'
                );
                foreach ($questions as $q) {
                    $stmt->execute([
                        $surveyId,
                        $q['question_number'],
                        $q['question_text'],
                        $q['po_name'],
                        $q['mapping_weight']
                    ]);
                }
            }

            $this->db->commit();
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function saveResponses(int $surveyId, array $responses): int
    {
        try {
            $this->db->beginTransaction();

            $stmt = $this->db->prepare(
                'INSERT INTO stakeholder_survey_responses 
                 (survey_id, respondent_identifier, respondent_name, qualification, question_id, likert_rating) 
                 VALUES (?, ?, ?, ?, ?, ?) 
                 ON DUPLICATE KEY UPDATE 
                    likert_rating = VALUES(likert_rating), 
                    respondent_name = VALUES(respondent_name), 
                    qualification = VALUES(qualification)'
            );

            $count = 0;
            foreach ($responses as $row) {
                $stmt->execute([
                    $surveyId,
                    $row['respondent_identifier'],
                    $row['respondent_name'],
                    $row['qualification'],
                    $row['question_id'],
                    $row['likert_rating']
                ]);
                $count++;
            }

            $this->db->commit();
            return $count;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function clearResponses(int $surveyId): void
    {
        $stmt = $this->db->prepare('DELETE FROM stakeholder_survey_responses WHERE survey_id = ?');
        $stmt->execute([$surveyId]);
    }

    public function getResponses(int $surveyId): array
    {
        $stmt = $this->db->prepare(
            'SELECT respondent_identifier, respondent_name, qualification, question_id, likert_rating
             FROM stakeholder_survey_responses
             WHERE survey_id = ?
             ORDER BY respondent_identifier, question_id'
        );
        $stmt->execute([$surveyId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getPoAverages(int $programmeId, int $batchYear, ?string $stakeholderType = null): array
    {
        $sql = 'SELECT 
                    q.po_name, 
                    SUM(r.likert_rating * q.mapping_weight) / SUM(q.mapping_weight) as average_rating,
                    COUNT(DISTINCT r.respondent_identifier) as respondent_count
                FROM stakeholder_survey_responses r
                JOIN stakeholder_survey_questions q ON r.question_id = q.question_id
                JOIN stakeholder_surveys s ON r.survey_id = s.survey_id
                WHERE s.programme_id = ? AND s.batch_year = ?';
        
        $params = [$programmeId, $batchYear];
        if ($stakeholderType) {
            $sql .= ' AND s.stakeholder_type = ?';
            $params[] = $stakeholderType;
        }
        $sql .= ' GROUP BY q.po_name';

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getPoAveragesByType(int $programmeId, int $batchYear): array
    {
        $sql = 'SELECT 
                    s.stakeholder_type,
                    q.po_name, 
                    SUM(r.likert_rating * q.mapping_weight) / SUM(q.mapping_weight) as average_rating,
                    COUNT(DISTINCT r.respondent_identifier) as respondent_count
                FROM stakeholder_survey_responses r
                JOIN stakeholder_survey_questions q ON r.question_id = q.question_id
                JOIN stakeholder_surveys s ON r.survey_id = s.survey_id
                WHERE s.programme_id = ? AND s.batch_year = ?
                GROUP BY s.stakeholder_type, q.po_name';

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$programmeId, $batchYear]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getDistinctTypes(int $programmeId, int $batchYear): array
    {
        $stmt = $this->db->prepare(
            'SELECT DISTINCT stakeholder_type 
             FROM stakeholder_surveys 
             WHERE programme_id = ? AND batch_year = ? 
             ORDER BY stakeholder_type'
        );
        $stmt->execute([$programmeId, $batchYear]);
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    public function getByProgrammeBatchGrouped(int $programmeId, int $batchYear, ?string $stakeholderType = null): array
    {
        $sql = 'SELECT 
                    s.stakeholder_type,
                    r.respondent_identifier,
                    MAX(r.respondent_name) as respondent_name,
                    MAX(r.qualification) as qualification,
                    q.po_name,
                    SUM(r.likert_rating * q.mapping_weight) / SUM(q.mapping_weight) as po_rating
                FROM stakeholder_survey_responses r
                JOIN stakeholder_survey_questions q ON r.question_id = q.question_id
                JOIN stakeholder_surveys s ON r.survey_id = s.survey_id
                WHERE s.programme_id = ? AND s.batch_year = ?';

        $params = [$programmeId, $batchYear];
        if ($stakeholderType) {
            $sql .= ' AND s.stakeholder_type = ?';
            $params[] = $stakeholderType;
        }
        $sql .= ' GROUP BY s.stakeholder_type, r.respondent_identifier, q.po_name';

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $grouped = [];
        foreach ($rows as $row) {
            $type = $row['stakeholder_type'];
            $id = $row['respondent_identifier'];

            if (!isset($grouped[$type])) {
                $grouped[$type] = [];
            }
            if (!isset($grouped[$type][$id])) {
                $grouped[$type][$id] = [
                    'respondent_identifier' => $id,
                    'respondent_name' => $row['respondent_name'],
                    'qualification' => $row['qualification'],
                    'ratings' => []
                ];
            }
            $grouped[$type][$id]['ratings'][$row['po_name']] = round((float)$row['po_rating'], 2);
        }

        foreach ($grouped as $type => $respondents) {
            $grouped[$type] = array_values($respondents);
        }

        return $grouped;
    }

    public function mapPoResponses(int $surveyId, array $responses): array
    {
        $questions = $this->getQuestions($surveyId);
        $poToQid = [];
        foreach ($questions as $q) {
            $po = $q['po_name'];
            if (!isset($poToQid[$po])) {
                $poToQid[$po] = (int)$q['question_id'];
            }
        }

        $mapped = [];
        foreach ($responses as $row) {
            if (isset($row['question_id'])) {
                $mapped[] = $row;
                continue;
            }
            $poName = $row['po_name'] ?? null;
            if (!$poName || !isset($poToQid[$poName])) {
                continue;
            }
            $row['question_id'] = $poToQid[$poName];
            unset($row['po_name']);
            $mapped[] = $row;
        }
        return $mapped;
    }

    public function getPoThresholds(int $programmeId, int $batchYear, int $proficiencyThreshold = 4, ?string $stakeholderType = null): array
    {
        $sql = 'SELECT 
                    q.po_name, 
                    COUNT(DISTINCT r.respondent_identifier) as respondent_count,
                    SUM(r.likert_rating >= ?) / COUNT(DISTINCT r.respondent_identifier) * 100 as above_threshold_pct
                FROM stakeholder_survey_responses r
                JOIN stakeholder_survey_questions q ON r.question_id = q.question_id
                JOIN stakeholder_surveys s ON r.survey_id = s.survey_id
                WHERE s.programme_id = ? AND s.batch_year = ?';
        
        $params = [$proficiencyThreshold, $programmeId, $batchYear];
        if ($stakeholderType) {
            $sql .= ' AND s.stakeholder_type = ?';
            $params[] = $stakeholderType;
        }
        $sql .= ' GROUP BY q.po_name';

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getPoThresholdsByType(int $programmeId, int $batchYear, int $proficiencyThreshold = 4): array
    {
        $sql = 'SELECT 
                    s.stakeholder_type,
                    q.po_name, 
                    COUNT(DISTINCT r.respondent_identifier) as respondent_count,
                    SUM(r.likert_rating >= ?) / COUNT(DISTINCT r.respondent_identifier) * 100 as above_threshold_pct
                FROM stakeholder_survey_responses r
                JOIN stakeholder_survey_questions q ON r.question_id = q.question_id
                JOIN stakeholder_surveys s ON r.survey_id = s.survey_id
                WHERE s.programme_id = ? AND s.batch_year = ?
                GROUP BY s.stakeholder_type, q.po_name';

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$proficiencyThreshold, $programmeId, $batchYear]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getConsolidatedMatrix(int $programmeId, int $batchYear): array
    {
        $standardTypes = ['Alumni', 'Graduate Exit', 'Parent', 'Academic Peer', 'Employer'];
        $poList = [];
        for ($i = 1; $i <= 12; $i++) { $poList[] = 'PO' . $i; }
        for ($i = 1; $i <= 3; $i++) { $poList[] = 'PSO' . $i; }

        $byType = $this->getPoAveragesByType($programmeId, $batchYear);

        $typePcts = [];
        foreach ($byType as $row) {
            $po = $row['po_name'];
            $t = $row['stakeholder_type'];
            $avg = (float)$row['average_rating'];
            $pct = $avg > 0 ? ($avg - 1) / 4 * 100 : 0.0;
            $typePcts[$t][$po] = $pct;
        }

        $matrix = [];
        foreach ($standardTypes as $type) {
            $matrix[$type] = [];
            $pctsForType = $typePcts[$type] ?? [];
            foreach ($poList as $po) {
                $pct = $pctsForType[$po] ?? 0.0;
                $matrix[$type][$po] = round($this->pctToAttainmentLevel($pct), 2);
            }
        }

        $averages = [];
        foreach ($poList as $po) {
            $sum = 0.0;
            foreach ($standardTypes as $type) {
                $val = $matrix[$type][$po] ?? 0.0;
                $sum += $val;
            }
            $averages[$po] = round($sum / count($standardTypes), 2);
        }

        return [
            'matrix' => $matrix,
            'averages' => $averages,
            'po_list' => $poList,
        ];
    }

    private function pctToAttainmentLevel(float $percentage): float
    {
        if ($percentage >= 70.0) return 3.0;
        if ($percentage >= 60.0) {
            return 2.0 + ($percentage - 60.0) / 10.0;
        }
        if ($percentage >= 50.0) {
            return 1.0 + ($percentage - 50.0) / 10.0;
        }
        if ($percentage > 0.0) {
            return $percentage / 50.0;
        }
        return 0.0;
    }

    public function deleteByProgrammeBatch(int $programmeId, int $batchYear, ?string $stakeholderType = null): void
    {
        $sql = 'DELETE FROM stakeholder_surveys WHERE programme_id = ? AND batch_year = ?';
        $params = [$programmeId, $batchYear];
        if ($stakeholderType) {
            $sql .= ' AND stakeholder_type = ?';
            $params[] = $stakeholderType;
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
    }
}
