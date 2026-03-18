<?php
require_once __DIR__ . '/api/config/DatabaseConfig.php';
require_once __DIR__ . '/api/models/AuditLogRepository.php';

try {
    $dbConfig = new DatabaseConfig();
    $db = $dbConfig->getConnection();
    echo "DB connected.\n";

    $repo = new AuditLogRepository($db);
    $res = $repo->create(9000001, 'UPDATE', 'User', '3001', ['old' => 'val'], ['new' => 'val'], '127.0.0.1');

    echo "Result: ";
    var_dump($res);

    $stmt = $db->query("SELECT * FROM audit_logs");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Rows: \n";
    print_r($rows);

} catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
}
