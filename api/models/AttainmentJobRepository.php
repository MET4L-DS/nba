<?php

class AttainmentJobRepository
{
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    public function createJob(int $offeringId): int
    {
        // Cancel any pending jobs for this offering
        $stmt = $this->db->prepare("
            UPDATE attainment_jobs 
            SET status = 'failed', error_message = 'Cancelled by new job request' 
            WHERE offering_id = ? AND status IN ('pending', 'processing')
        ");
        $stmt->execute([$offeringId]);

        // Create new job
        $stmt = $this->db->prepare("
            INSERT INTO attainment_jobs (offering_id, status)
            VALUES (?, 'pending')
        ");
        $stmt->execute([$offeringId]);
        return (int)$this->db->lastInsertId();
    }

    public function updateStatus(int $jobId, string $status, ?string $errorMessage = null): void
    {
        $stmt = $this->db->prepare("
            UPDATE attainment_jobs
            SET status = ?, error_message = ?
            WHERE job_id = ?
        ");
        $stmt->execute([$status, $errorMessage, $jobId]);
    }

    public function getPendingJobs(int $limit = 10): array
    {
        $stmt = $this->db->prepare("
            SELECT job_id, offering_id 
            FROM attainment_jobs 
            WHERE status = 'pending' 
            ORDER BY created_at ASC 
            LIMIT ?
        ");
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getLatestJobStatus(int $offeringId): ?array
    {
        $stmt = $this->db->prepare("
            SELECT job_id, status, error_message, updated_at 
            FROM attainment_jobs 
            WHERE offering_id = ? 
            ORDER BY created_at DESC 
            LIMIT 1
        ");
        $stmt->execute([$offeringId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }
}
