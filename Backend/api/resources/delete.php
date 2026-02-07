<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(["success" => true]);
    exit;
}

try {
    // Inclure la classe Database
    require_once(__DIR__ . "/../../config/database.php");

    // Récupérer l'ID
    $resourceId = $_GET['id'] ?? '';

    if (empty($resourceId)) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "ID manquant"]);
        exit;
    }

    // Créer une instance de Database et obtenir la connexion
    $database = new Database();
    $pdo = $database->getConnection();

    if (!$pdo) {
        throw new Exception("Impossible de se connecter à la base de données");
    }

    // Vérifier que la ressource existe
    $checkStmt = $pdo->prepare("SELECT id FROM resources WHERE id = ?");
    $checkStmt->execute([$resourceId]);
    
    if (!$checkStmt->fetch()) {
        http_response_code(404);
        echo json_encode(["success" => false, "error" => "Ressource introuvable avec l'ID: " . $resourceId]);
        exit;
    }

    // Supprimer de la DB
    $stmt = $pdo->prepare("DELETE FROM resources WHERE id = ?");
    $stmt->execute([$resourceId]);

    echo json_encode([
        "success" => true, 
        "message" => "Ressource supprimée avec succès"
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "error" => "Erreur de base de données: " . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "error" => $e->getMessage()
    ]);
}