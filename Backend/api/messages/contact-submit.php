<?php
require_once 'session.php';
require_once __DIR__ . '/../cors.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $subject = trim($input['subject'] ?? '');
    $message = trim($input['message'] ?? '');
    
    // Validation
    if (empty($subject) || strlen($subject) < 3) {
        throw new Exception('Le sujet doit contenir au moins 3 caractères');
    }
    
    if (empty($message) || strlen($message) < 10) {
        throw new Exception('Le message doit contenir au moins 10 caractères');
    }
    
    // Connexion DB
    $host = 'localhost';
    $dbname = 'portail_stagiaire';
    $username = 'root';
    $password = '';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Utiliser user_id de la session OU créer utilisateur anonyme
    $user_id = $_SESSION['user_id'] ?? null;
    
    if ($user_id === null) {
        // Chercher ou créer l'utilisateur anonyme
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = 'anonymous@visitor.com' LIMIT 1");
        $stmt->execute();
        $anonymousUser = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$anonymousUser) {
            $stmt = $pdo->prepare("
                INSERT INTO users (email, first_name, last_name, user_type, status) 
                VALUES ('anonymous@visitor.com', 'Visiteur', 'Anonyme', 'student', 'APPROVED')
            ");
            $stmt->execute();
            $user_id = $pdo->lastInsertId();
        } else {
            $user_id = $anonymousUser['id'];
        }
    }
    
    // Insérer le message
    $stmt = $pdo->prepare("
        INSERT INTO messages (user_id, subject, message, status, created_at) 
        VALUES (?, ?, ?, 'unread', NOW())
    ");
    
    $stmt->execute([$user_id, $subject, $message]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Votre message a été envoyé avec succès ! Nous vous répondrons bientôt.'
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>