<?php
// Désactiver l'affichage des erreurs pour éviter le HTML dans la réponse JSON
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.cookie_secure', 0);
session_start();
require_once(__DIR__ . '/../../config/database.php');
require_once(__DIR__ . '/../../classes/User.php');

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
        // Vérifier si l'utilisateur est connecté via session
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(["success" => false, "error" => "Utilisateur non connecté"]);
            exit;
        }

        $database = new Database();
        $db = $database->getConnection();
        $user = new User($db);

        // Charger les infos utilisateur depuis la DB
        if ($user->loadById($_SESSION['user_id'])) {
            echo json_encode([
                "success" => true,
                "user" => [
                    "id" => $user->id,
                    "email" => $user->email,
                    "fullName" => $user->first_name . " " . $user->last_name,
                    "userType" => strtoupper($user->user_type),
                    "status" => $user->status,
                    "profilePicture" => $user->profile_picture
                ]
            ]);
        } else {
            http_response_code(404);
            echo json_encode(["success" => false, "error" => "Utilisateur introuvable"]);
        }
    } catch (Exception $e) {
        error_log("Me.php error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Erreur serveur interne: " . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Méthode non autorisée"]);
}
