<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../db.php';

try {
    $user = validateToken();
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    exit;
}

$requiredFields = ['name', 'email', 'department_id', 'position', 'hire_date', 'salary', 'address'];
foreach ($requiredFields as $field) {
    if (empty($_POST[$field])) {
        echo json_encode(['success' => false, 'message' => "Field '$field' is required."]);
        exit;
    }
}

$name = sanitize_input($_POST['name']);
$email = sanitize_input($_POST['email']);
$phone = isset($_POST['phone']) ? sanitize_input($_POST['phone']) : null;
$department_id = (int)$_POST['department_id'];
$position = sanitize_input($_POST['position']);
$hire_date = sanitize_input($_POST['hire_date']);
$salary = sanitize_input($_POST['salary']);
$address = sanitize_input($_POST['address']);
$status = isset($_POST['status']) ? sanitize_input($_POST['status']) : 'active';

$stmt = $pdo->prepare("SELECT id FROM departments WHERE id = ?");
$stmt->execute([$department_id]);
if ($stmt->rowCount() === 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid department ID']);
    exit;
}

$profile_image = null;
if (isset($_FILES['profile_image']) && $_FILES['profile_image']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = '../uploads/';
    if (!file_exists($uploadDir)) mkdir($uploadDir, 0777, true);

    $filename = uniqid() . '_' . basename($_FILES['profile_image']['name']);
    $uploadPath = $uploadDir . $filename;
    $ext = strtolower(pathinfo($uploadPath, PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'gif'];

    if (!in_array($ext, $allowed)) {
        echo json_encode(['success' => false, 'message' => 'Only JPG, JPEG, PNG, and GIF allowed']);
        exit;
    }

    if (!move_uploaded_file($_FILES['profile_image']['tmp_name'], $uploadPath)) {
        echo json_encode(['success' => false, 'message' => 'Image upload failed']);
        exit;
    }

    $profile_image = $filename;
}

try {
    $stmt = $pdo->prepare("
        INSERT INTO employees (name, email, phone, department_id, position, hire_date, salary, address, profile_image, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$name, $email, $phone, $department_id, $position, $hire_date, $salary, $address, $profile_image, $status]);
    $employee_id = $pdo->lastInsertId();

    $action = 'Added employee';
    $description = "Added $name to department ID $department_id as $position";
    $ip_address = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $stmt = $pdo->prepare("INSERT INTO activity_logs (user_id, action, description, ip_address) VALUES (?, ?, ?, ?)");
    $stmt->execute([$user['id'], $action, $description, $ip_address]);

    echo json_encode(['success' => true, 'message' => 'Employee added successfully', 'employee_id' => $employee_id]);
} catch (Exception $e) {
    http_response_code(500);
    error_log("Add employee error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Failed to add employee']);
}
?>
