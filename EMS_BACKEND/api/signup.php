<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../db.php';

$data = json_decode(file_get_contents("php://input"), true);
error_log("Signup attempt with data: " . print_r($data, true));

if (!isset($data['username']) || !isset($data['password']) || !isset($data['email'])) {
    error_log("Signup failed: Missing required fields");
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

$username = sanitize_input($data['username']);
$email = sanitize_input($data['email']);
$password = $data['password'];
$full_name = isset($data['full_name']) ? sanitize_input($data['full_name']) : $username;
$role = isset($data['role']) ? sanitize_input($data['role']) : 'employee';
if (!in_array($role, ['admin', 'hr', 'employee'])) {
    $role = 'employee';
}

if (strlen($password) < 6) {
    error_log("Signup failed: Password too short");
    echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters long']);
    exit;
}

try {
    error_log("Checking for existing username and email");
    
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = ?");
    $stmt->execute([$username]);
    if ($stmt->fetchColumn() > 0) {
        error_log("Signup failed: Username already exists - " . $username);
        echo json_encode(['success' => false, 'message' => 'Username already exists']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetchColumn() > 0) {
        error_log("Signup failed: Email already exists - " . $email);
        echo json_encode(['success' => false, 'message' => 'Email already exists']);
        exit;
    }

    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO users (username, password, email, full_name, role, is_active) VALUES (?, ?, ?, ?, ?, true)");
    $stmt->execute([$username, $hashedPassword, $email, $full_name, $role]);

    error_log("User created successfully: " . $username);
    echo json_encode(['success' => true, 'message' => 'Registration successful']);

} catch (PDOException $e) {
    error_log("Signup error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Registration failed. Please try again.']);
}
?>