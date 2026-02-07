<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Sessions and cookies
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.cookie_secure', 0); // set to 1 for HTTPS
session_start();

require_once(__DIR__ . '/../../config/database.php');
require_once(__DIR__ . '/../../classes/User.php');

// CORS headers for Next.js frontend
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Méthode non autorisée (POST requis)"]);
    exit;
}

try {
    // Accept either JSON or multipart/form-data
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    $isJson = stripos($contentType, 'application/json') !== false;

    if ($isJson) {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true) ?: [];
        $email = filter_var($data['email'] ?? '', FILTER_SANITIZE_EMAIL);
        $password = (string)($data['password'] ?? '');
        $first_name = trim((string)($data['firstName'] ?? ''));
        $last_name = trim((string)($data['lastName'] ?? ''));
        $user_type = strtolower(trim((string)($data['userType'] ?? '')));
        $institution = trim((string)($data['institution'] ?? ''));
        $reason = trim((string)($data['reason'] ?? ''));
    } else {
        $email = filter_var($_POST['email'] ?? '', FILTER_SANITIZE_EMAIL);
        $password = (string)($_POST['password'] ?? '');
        $first_name = trim((string)($_POST['first_name'] ?? ''));
        $last_name = trim((string)($_POST['last_name'] ?? ''));
        $user_type = strtolower(trim((string)($_POST['user_type'] ?? '')));
        $institution = trim((string)($_POST['institution'] ?? ''));
        $reason = trim((string)($_POST['reason'] ?? ''));
    }

    // Validation
    if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Email invalide"]);
        exit;
    }

    if (strlen($password) < 6) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Mot de passe trop court (min 6 caractères)"]);
        exit;
    }

    if ($first_name === '' || $last_name === '') {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Prénom et nom requis"]);
        exit;
    }

    $allowedTypes = ['student','teacher','researcher','other','admin'];
    if ($user_type === '' || !in_array($user_type, $allowedTypes, true)) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Type d'utilisateur invalide"]);
        exit;
    }

    $database = new Database();
    $db = $database->getConnection();
    $user = new User($db);

    // Prepare user entity
    $user->email = $email;
    $user->password = $password; // hashed in create()
    $user->first_name = $first_name;
    $user->last_name = $last_name;
    $user->user_type = $user_type; // stored as given; mapping can be adjusted
    $user->status = 'PENDING';
    $user->institution = $institution;
    $user->reason = $reason;

    // Attempt create
    if ($user->create()) {
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => "Inscription réussie. Votre demande sera examinée par un administrateur.",
        ]);
        exit;
    }

    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Impossible de créer le compte']);
} catch (Exception $e) {
    error_log('Register error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erreur serveur interne']);
}
?>


