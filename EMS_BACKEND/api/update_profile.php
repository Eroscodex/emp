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

if (!$user) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

try {
    $pdo->beginTransaction();
    
    $updates = [];
    $params = [];
    

    if (!empty($data['username'])) {
        $updates[] = "username = ?";
        $params[] = $data['username'];
    }
    
    if (!empty($data['email'])) {
        $updates[] = "email = ?";
        $params[] = $data['email'];
    }
    
    if (!empty($data['full_name'])) {
        $updates[] = "full_name = ?";
        $params[] = $data['full_name'];
    }

    if (!empty($data['current_password']) && !empty($data['new_password'])) {
  
        $stmt = $pdo->prepare("SELECT password FROM users WHERE id = ?");
        $stmt->execute([$user['id']]);
        $userRecord = $stmt->fetch();
        
        if (!password_verify($data['current_password'], $userRecord['password'])) {
            $pdo->rollBack();
            echo json_encode(['success' => false, 'message' => 'Current password is incorrect']);
            exit;
        }
        
        $updates[] = "password = ?";
        $params[] = password_hash($data['new_password'], PASSWORD_DEFAULT);
    }
    
    if (empty($updates)) {
        echo json_encode(['success' => false, 'message' => 'No changes to update']);
        exit;
    }
  
    $params[] = $user['id'];
    
    $sql = "UPDATE users SET " . implode(", ", $updates) . " WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    $stmt = $pdo->prepare("SELECT id, username, email, full_name, role FROM users WHERE id = ?");
    $stmt->execute([$user['id']]);
    $updatedUser = $stmt->fetch();
    
    $pdo->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Profile updated successfully',
        'user' => $updatedUser
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    error_log($e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Failed to update profile: ' . $e->getMessage()
    ]);
}
?>
