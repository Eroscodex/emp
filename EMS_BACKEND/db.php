<?php
// Enable error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'employee_management');
define('DB_USER', 'root');
define('DB_PASS', '');

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    error_log("Connection failed: " . $e->getMessage());
    die(json_encode(['success' => false, 'message' => 'Database connection failed']));
}

// Function to sanitize input data
function sanitize_input($data) {
    return htmlspecialchars(strip_tags(trim($data)));
}

function validateToken() {
    global $pdo;

    // Try to get headers in a way that works on all servers
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
    } else {
        $headers = [];
        foreach ($_SERVER as $name => $value) {
            if (substr($name, 0, 5) == 'HTTP_') {
                $key = str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))));
                $headers[$key] = $value;
            }
        }
    }

    // Support both 'Authorization' and 'authorization'
    $authHeader = null;
    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
    } elseif (isset($headers['authorization'])) {
        $authHeader = $headers['authorization'];
    }

    if (!$authHeader) {
        error_log('Authorization header missing');
        throw new Exception('No token provided');
    }

    $token = str_replace('Bearer ', '', $authHeader);
    error_log('Received token: ' . $token);

    $decoded = json_decode(base64_decode($token), true);
    if (!$decoded) {
        error_log('Failed to decode token');
        throw new Exception('Invalid token format');
    }

    if ($decoded['exp'] < time()) {
        error_log('Token expired');
        throw new Exception('Invalid or expired token');
    }

    // Verify user in the database
    $stmt = $pdo->prepare("SELECT is_active FROM users WHERE username = ?");
    $stmt->execute([$decoded['username']]);
    $user = $stmt->fetch();

    if (!$user) {
        error_log('User not found in database');
        throw new Exception('User not found');
    }

    if (!$user['is_active']) {
        error_log('User is inactive');
        throw new Exception('User is inactive');
    }

    error_log('Token validation successful for user: ' . $decoded['username']);
    return $decoded;
}

// Function to log user activity
function logActivity($userId, $action, $entityType = null, $entityId = null, $details = null) {
    global $pdo;
    try {
        $stmt = $pdo->prepare("INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, ip_address) 
                              VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $userId,
            $action,
            $entityType,
            $entityId,
            $details ? json_encode($details) : null,
            $_SERVER['REMOTE_ADDR']
        ]);
    } catch (Exception $e) {
        error_log("Failed to log activity: " . $e->getMessage());
    }
}

// Set response headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
?>