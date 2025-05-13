<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../db.php';

// Only validate token for non-OPTIONS requests
try {
    $user = validateToken();
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    exit;
}

// Allow admin and HR
if (!isset($user['role']) || !in_array($user['role'], ['admin', 'hr'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Access restricted to admin and HR only']);
    exit;
}

try {
    // Get total employees count
    $stmt = $pdo->query("SELECT COUNT(*) AS total FROM employees");
    $totalEmployees = $stmt->fetchColumn();

    // Get recent hires (last 30 days)
    $stmt = $pdo->query("
        SELECT e.id, e.name, e.hire_date, d.name AS department, e.position
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE e.hire_date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
        ORDER BY e.hire_date DESC
    ");
    $recentHires = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get department counts
    $stmt = $pdo->query("
        SELECT d.name AS department, COUNT(e.id) AS count
        FROM departments d
        LEFT JOIN employees e ON e.department_id = d.id
        GROUP BY d.id
        ORDER BY d.name
    ");
    $departmentCounts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get activity logs
    $stmt = $pdo->query("
        SELECT al.action, al.description, al.created_at, u.username AS user_name
        FROM activity_logs al
        LEFT JOIN users u ON al.user_id = u.id
        ORDER BY al.created_at DESC
        LIMIT 5
    ");
    $activityLogs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'stats' => [
            'totalEmployees' => (int)($totalEmployees ?? 0),
            'recentHires' => $recentHires,
            'departmentCounts' => $departmentCounts,
            'activityLogs' => $activityLogs
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
