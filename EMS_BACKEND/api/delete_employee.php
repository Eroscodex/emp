<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../db.php';

$user = validateToken();

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$employee_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

try {
    $pdo->beginTransaction();

    // Get employee details for logging
    $stmt = $pdo->prepare("SELECT name FROM employees WHERE id = ?");
    $stmt->execute([$employee_id]);
    $employee = $stmt->fetch();

    // Delete employee
    $stmt = $pdo->prepare("DELETE FROM employees WHERE id = ?");
    $stmt->execute([$employee_id]);

    if ($stmt->rowCount() > 0) {
        // Log activity
        $stmt = $pdo->prepare("INSERT INTO activity_logs (user_id, action, ip_address) VALUES (?, ?, ?)");
        $stmt->execute([$user['id'], "Deleted employee: " . $employee['name'], $_SERVER['REMOTE_ADDR']]);

        $pdo->commit();
        echo json_encode(['success' => true, 'message' => 'Employee deleted successfully']);
    } else {
        throw new Exception('Employee not found');
    }
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>