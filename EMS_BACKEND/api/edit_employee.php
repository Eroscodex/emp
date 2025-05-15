<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once __DIR__ . '/../db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    $user = validateToken();
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

if (!isset($_POST['id']) || empty($_POST['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Employee ID is required']);
    exit;
}

try {
    $pdo->beginTransaction();

    $id = (int)$_POST['id'];
    $name = sanitize_input($_POST['name']);
    $email = sanitize_input($_POST['email']);
    $phone = sanitize_input($_POST['phone']);
    $department_id = (int)$_POST['department_id'];
    $position = sanitize_input($_POST['position']);
    $hire_date = sanitize_input($_POST['hire_date']);
    $salary = sanitize_input($_POST['salary']);
    $address = sanitize_input($_POST['address']);
    $status = sanitize_input($_POST['status']);

    $stmt = $pdo->prepare("SELECT id FROM departments WHERE id = ?");
    $stmt->execute([$department_id]);
    if ($stmt->rowCount() === 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid department ID']);
        exit;
    }

    $sql = "UPDATE employees SET 
            name = ?, email = ?, phone = ?, department_id = ?, 
            position = ?, hire_date = ?, salary = ?, address = ?, status = ?";
    $params = [$name, $email, $phone, $department_id, $position, $hire_date, $salary, $address, $status];

    if (isset($_FILES['profile_image']) && $_FILES['profile_image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = '../uploads/';
        $filename = uniqid() . '_' . basename($_FILES['profile_image']['name']);
        $uploadFile = $uploadDir . $filename;

        if (move_uploaded_file($_FILES['profile_image']['tmp_name'], $uploadFile)) {
            $sql .= ", profile_image = ?";
            $params[] = $filename;
        }
    }

    $sql .= " WHERE id = ?";
    $params[] = $id;

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    $description = "Updated $name (ID: $id) in department ID $department_id as $position";
    $ip_address = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $stmt = $pdo->prepare("INSERT INTO activity_logs (user_id, action, description, ip_address) VALUES (?, ?, ?, ?)");
    $stmt->execute([$user['id'], 'Updated employee', $description, $ip_address]);

    $pdo->commit();

    echo json_encode(['success' => true, 'message' => 'Employee updated successfully']);
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    error_log("Edit employee error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>