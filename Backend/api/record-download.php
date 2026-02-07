<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
require_once __DIR__ . '/../cors.php';
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Vérifier que c'est une requête POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Méthode non autorisée');
    }
    
    // Récupérer les données
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Données JSON invalides');
    }
    
    $userId = $input['userId'] ?? null;
    $itemId = $input['itemId'] ?? null;
    $itemType = $input['itemType'] ?? null; // 'report' ou 'resource'
    
    if (empty($userId) || empty($itemId) || empty($itemType)) {
        throw new Exception('Paramètres manquants');
    }
    
    // Connexion à la base de données
    $host = 'localhost';
    $dbname = 'portail_stagiaire';
    $username = 'root';
    $password = '';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Incrémenter le compteur de téléchargements
    if ($itemType === 'resource') {
        // Incrémenter downloads dans la table resources
        $stmt = $pdo->prepare("UPDATE resources SET downloads = downloads + 1 WHERE id = :id");
        $stmt->execute([':id' => $itemId]);
        
        // Optionnel : Enregistrer dans une table de logs
        $stmt = $pdo->prepare("
            INSERT INTO download_logs (user_id, resource_id, download_date) 
            VALUES (:user_id, :resource_id, NOW())
        ");
        
        try {
            $stmt->execute([
                ':user_id' => $userId,
                ':resource_id' => $itemId
            ]);
        } catch (PDOException $e) {
            // Table download_logs n'existe peut-être pas, ignorer l'erreur
        }
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Téléchargement enregistré'
    ], JSON_UNESCAPED_UNICODE);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur de base de données: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>