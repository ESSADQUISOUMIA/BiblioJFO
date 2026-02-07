<?php
require_once '../cors.php';
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once __DIR__ . "/../../config/database.php";

try {
    $database = new Database();
    $pdo = $database->getConnection();

    // Récupération de l'userId passé en paramètre GET (utilisateur connecté)
    $currentUserId = isset($_GET['userId']) ? intval($_GET['userId']) : 0;

    if ($currentUserId === 0) {
        throw new Exception("UserId invalide");
    }

    // Vérification du statut de l'utilisateur
    $sqlCheckUser = "SELECT user_type, status FROM users WHERE id = :userId";
    $stmtCheck = $pdo->prepare($sqlCheckUser);
    $stmtCheck->bindParam(":userId", $currentUserId, PDO::PARAM_INT);
    $stmtCheck->execute();
    $user = $stmtCheck->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        throw new Exception("Utilisateur non trouvé");
    }

    // Vérifier si l'utilisateur est approuvé
    if ($user['status'] !== 'APPROVED') {
        echo json_encode([
            "success" => false,
            "message" => "Compte non approuvé",
            "data" => []
        ]);
        exit;
    }

    // MODIFICATION PRINCIPALE : Récupérer toutes les ressources actives
    // Peu importe qui les a créées (admin ou autres)
    $sql = "SELECT 
                r.*,
                u.first_name,
                u.last_name,
                CONCAT(u.first_name, ' ', u.last_name) as author
            FROM resources r
            LEFT JOIN users u ON r.userId = u.id
            WHERE r.is_active = 1
            ORDER BY r.created_at DESC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute();

    $resources = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Formater les données pour correspondre au format attendu
    $formattedResources = array_map(function($resource) {
        return [
            'id' => $resource['id'],
            'userId' => $resource['userId'],
            'title' => $resource['title'],
            'description' => $resource['description'],
            'file_path' => $resource['file_path'],
            'file_name' => $resource['file_name'],
            'original_name' => $resource['original_name'],
            'file_size' => $resource['file_size'],
            'category' => $resource['category'],
            'type' => $resource['type'],
            'downloads' => $resource['downloads'],
            'author' => $resource['author'] ?? 'Administrateur',
            'is_active' => $resource['is_active'],
            'created_at' => $resource['created_at'],
            'updated_at' => $resource['updated_at'],
            'uploadDate' => $resource['created_at']
        ];
    }, $resources);

    echo json_encode([
        "success" => true,
        "data" => $formattedResources,
        "resources" => $formattedResources, // Alias pour compatibilité
        "count" => count($formattedResources)
    ]);
    
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage(),
        "data" => []
    ]);
}