<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
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
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        if (isset($_GET['id'])) {
            $stmt = $pdo->prepare("
                SELECT e.*, d.name AS department_name
                FROM employees e
                LEFT JOIN departments d ON e.department_id = d.id
                WHERE e.id = ?
            ");
            $stmt->execute([$_GET['id']]);
            $employee = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($employee) {
                echo json_encode(['success' => true, 'employee' => $employee]);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Employee not found']);
            }
            exit;
        }

        $search = isset($_GET['q']) ? '%' . sanitize_input($_GET['q']) . '%' : '%';

        $stmt = $pdo->prepare("
            SELECT e.id, e.name, e.email, e.phone, e.department_id, e.position, e.hire_date, e.salary, e.address, e.profile_image, e.status, e.created_at, e.updated_at, d.name AS department_name
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.id
            WHERE e.name LIKE ? OR e.email LIKE ? OR e.position LIKE ?
            ORDER BY e.id ASC
        ");
        $stmt->execute([$search, $search, $search]);
        $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($employees as &$employee) {
            $employee['profile_image_url'] = $employee['profile_image']
                ? "http://localhost/FINAL%20PROJECT/EMS_BACKEND/uploads/" . $employee['profile_image']
                : null;
        }

        echo json_encode(['success' => true, 'employees' => $employees]);
    } catch (Exception $e) {
        http_response_code(500);
        error_log("Failed to fetch employees: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Failed to fetch employees', 'error' => $e->getMessage()]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
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

        $stmt = $pdo->prepare("
            INSERT INTO employees (name, email, phone, department_id, position, hire_date, salary, address, profile_image, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$name, $email, $phone, $department_id, $position, $hire_date, $salary, $address, $profile_image, $status]);

        echo json_encode(['success' => true, 'message' => 'Employee added successfully']);
    } catch (Exception $e) {
        http_response_code(500);
        error_log("Add employee error: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Failed to add employee']);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $employee_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

    try {
        $stmt = $pdo->prepare("DELETE FROM employees WHERE id = ?");
        $stmt->execute([$employee_id]);

        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Employee deleted successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Employee not found']);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
?>
