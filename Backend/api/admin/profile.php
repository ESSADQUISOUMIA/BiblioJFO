<?php
// Configuration des erreurs
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Configuration de session
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.cookie_secure', 0);
session_start();

// Headers CORS - CRITIQUE: Avant toute sortie
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Gérer OPTIONS (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Vérifier que c'est une requête GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Méthode non autorisée. Utilisez GET.'
    ]);
    exit();
}

// Inclure les fichiers nécessaires
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../classes/User.php';

try {
    // Vérifier l'authentification
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode([
            'success' => false, 
            'error' => 'Non authentifié'
        ]);
        exit;
    }

    $database = new Database();
    $db = $database->getConnection();
    $user = new User($db);

    // Charger l'utilisateur
    if (!$user->loadById($_SESSION['user_id'])) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Utilisateur non trouvé'
        ]);
        exit;
    }

    // Vérifier que c'est un admin
    if (strtoupper($user->user_type) !== 'ADMIN') {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'error' => 'Accès refusé - Admin requis'
        ]);
        exit;
    }

    // Construire l'URL complète pour la photo de profil
    $profilePictureUrl = null;
    if ($user->profile_picture) {
        $profilePictureUrl = 'http://localhost/wert/Backend/' . $user->profile_picture;
    }

    // Retourner les informations du profil admin
    echo json_encode([
        'success' => true,
        'data' => [
            'id' => $user->id,
            'email' => $user->email,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'user_type' => $user->user_type,
            'status' => $user->status,
            'profile_picture' => $profilePictureUrl,
            'phone' => $user->phone ?? '',
            'institution' => $user->institution,
            'created_at' => $user->created_at
        ]
    ]);

} catch (Exception $e) {
    error_log("Error in admin/profile.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur serveur interne',
        'message' => $e->getMessage()
    ]);
}
?>