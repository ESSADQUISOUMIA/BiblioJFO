<?php
header('Access-Control-Allow-Origin: http://localhost:3000');
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';
// Gestion des pré-requêtes CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    $host = 'localhost';
    $dbname = 'portail_stagiaire';
    $username = 'root';
    $password = '';

    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Récupérer les données envoyées en JSON
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data || !isset($data['name'], $data['email'], $data['subject'], $data['message'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Données invalides'
        ]);
        exit;
    }

    // Sauvegarder dans la table "messages"
    $stmt = $pdo->prepare("
        INSERT INTO messages (user_id, subject, message, status, created_at, updated_at) 
        VALUES (NULL, :subject, :message, 'unread', NOW(), NOW())
    ");
    $stmt->execute([
        ':subject' => $data['subject'],
        ':message' => $data['message']
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Message enregistré avec succès'
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur de base de données',
        'details' => $e->getMessage()
    ]);
}
