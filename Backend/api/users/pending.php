<?php
// Désactiver l'affichage des erreurs pour éviter le HTML dans la réponse JSON
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.cookie_secure', 0);
session_start();

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../classes/User.php';
require_once __DIR__ . '/../cors.php';
// Headers CORS pour Next.js
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Gestion des requêtes OPTIONS (pré-vol CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Vérifier si l'utilisateur est connecté et est admin
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(["success" => false, "error" => "Non authentifié"]);
            exit;
        }

        $database = new Database();
        $db = $database->getConnection();
        $user = new User($db);

        // Vérifier que l'utilisateur connecté est admin
        if (!$user->loadById($_SESSION['user_id']) || strtoupper($user->user_type) !== 'ADMIN') {
            http_response_code(403);
            echo json_encode(["success" => false, "error" => "Accès refusé - Admin requis"]);
            exit;
        }

        // Récupérer tous les utilisateurs
        $query = "SELECT id, email, first_name, last_name, user_type, status, institution, reason, created_at 
                  FROM users 
                  ORDER BY created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Formater les données
        $formattedUsers = array_map(function($user) {
            return [
                'id' => (int)$user['id'],
                'email' => $user['email'],
                'fullName' => $user['first_name'] . ' ' . $user['last_name'],
                'firstName' => $user['first_name'],
                'lastName' => $user['last_name'],
                'userType' => strtolower($user['user_type']),
                'status' => strtoupper($user['status']),
                'institution' => $user['institution'] ?? '',
                'reason' => $user['reason'] ?? '',
                'approved' => $user['status'] === 'APPROVED',
                'createdAt' => $user['created_at'],
            ];
        }, $users);

        echo json_encode([
            "success" => true,
            "users" => $formattedUsers
        ]);
    } catch (Exception $e) {
        error_log("Pending users error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Erreur serveur interne"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Méthode non autorisée"]);
}
?>