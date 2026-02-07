<?php
require_once(__DIR__ . '/../../config/database.php');
require_once __DIR__ . '/../cors.php';
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");



if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'admin') {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Non autorisé']);
    exit;
}

try {
    $database = new Database();
    $pdo = $database->getConnection();

    $stmt = $pdo->prepare("
        SELECT 
            m.id,
            m.user_id AS userId,
            m.subject,
            m.message,
            m.status,
            m.admin_reply AS adminReply,
            m.created_at AS createdAt,
            m.updated_at AS updatedAt,
            u.first_name AS firstName,
            u.last_name AS lastName,
            u.email,
            u.user_type AS userType,
            CONCAT(u.first_name, ' ', u.last_name) AS name,
            CASE WHEN m.status != 'unread' THEN 1 ELSE 0 END AS `read`
        FROM messages m
        LEFT JOIN users u ON m.user_id = u.id
        ORDER BY m.created_at DESC
    ");
    $stmt->execute();
    $messages = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'messages' => $messages,
        'total' => count($messages)
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
