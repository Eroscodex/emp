<?php
require_once __DIR__ . '/../db.php';

try {
    $user = validateToken();
    
    $search = isset($_GET['q']) ? sanitize_input($_GET['q']) : '';
    $department = isset($_GET['department']) ? sanitize_input($_GET['department']) : '';
    $position = isset($_GET['position']) ? sanitize_input($_GET['position']) : '';
    
    $sql = "SELECT e.*, d.name as department_name
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.id
            WHERE 1=1";
    $params = [];
    
    if ($search) {
        $sql .= " AND (e.name LIKE ? OR e.email LIKE ? OR e.position LIKE ?)";
        $searchTerm = "%$search%";
        $params = array_merge($params, [$searchTerm, $searchTerm, $searchTerm]);
    }
    
    if ($department) {
        $sql .= " AND d.id = ?";
        $params[] = $department;
    }
    
    if ($position) {
        $sql .= " AND e.position = ?";
        $params[] = $position;
    }
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $results = $stmt->fetchAll();
    
    foreach ($results as &$result) {
        $result['profile_image_url'] = $result['profile_image'] 
            ? "http://localhost/FINAL%20PROJECT/EMS_BACKEND/uploads/" . $result['profile_image']
            : null;
    }
    
    echo json_encode(['success' => true, 'employees' => $results]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>