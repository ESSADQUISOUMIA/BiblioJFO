<?php
require_once '../cors.php';
error_reporting(E_ALL);
ini_set('display_errors', 0);

header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // Connexion à la base de données
    $dbPath = __DIR__ . '/../../config/database.php';
    if (!file_exists($dbPath)) {
        throw new Exception('Fichier de configuration database.php introuvable');
    }
    
    require_once $dbPath;
    
    $database = new Database();
    $pdo = $database->getConnection();

    if (!$pdo) {
        throw new Exception('Connexion à la base de données non établie');
    }

    // Récupérer toutes les ressources
    $stmt = $pdo->query("SELECT * FROM resources ORDER BY created_at DESC");
    $resources = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // ✅ Ajouter l'URL à chaque ressource
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    $baseUrl = $protocol . '://' . $host . '/wert/Backend/uploads/resources/';

    foreach ($resources as &$resource) {
        if (!empty($resource['file_name'])) {
            $resource['url'] = $baseUrl . $resource['file_name'];
        } else {
            $resource['url'] = null;
        }
    }

    echo json_encode([
        "success" => true, 
        "resources" => $resources
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>