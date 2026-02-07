<?php
// Désactiver l'affichage des erreurs en production
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.cookie_secure', 0);
session_start();

// Headers CORS - AVANT toute autre sortie
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Gérer les requêtes OPTIONS (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// LOG DE DÉBOGAGE
error_log("=== DEBUG UPDATE-STATUS.PHP ===");
error_log("REQUEST_METHOD: " . $_SERVER['REQUEST_METHOD']);
error_log("RAW INPUT: " . file_get_contents('php://input'));

// Vérifier que c'est bien une requête POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Méthode non autorisée. Utilisez POST.'
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

    // Récupérer les données JSON du body
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    // Vérifier que les données sont valides
    if (!$data || !isset($data['user_id']) || !isset($data['status'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false, 
            'error' => 'Données manquantes: user_id et status sont requis',
            'received' => $data
        ]);
        exit;
    }
    
    $userId = (int)$data['user_id'];
    $status = strtoupper(trim($data['status']));
    $rejectionReason = isset($data['reason']) ? trim($data['reason']) : null;
    
    // Valider le statut (basé sur votre ENUM)
    $validStatuses = ['PENDING', 'APPROVED', 'SUSPENDED'];
    if (!in_array($status, $validStatuses)) {
        http_response_code(400);
        echo json_encode([
            'success' => false, 
            'error' => 'Statut invalide. Utilisez: PENDING, APPROVED ou SUSPENDED',
            'received_status' => $status
        ]);
        exit;
    }
    
    // Vérifier que l'utilisateur existe
    $checkStmt = $db->prepare("SELECT id, email, first_name, last_name FROM users WHERE id = ?");
    $checkStmt->execute([$userId]);
    $existingUser = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$existingUser) {
        http_response_code(404);
        echo json_encode([
            'success' => false, 
            'error' => 'Utilisateur non trouvé',
            'user_id' => $userId
        ]);
        exit;
    }
    
    // 🔧 FIX CRITIQUE: Utiliser 'reason' au lieu de 'rejection_reason'
    if ($rejectionReason) {
        $stmt = $db->prepare("
            UPDATE users 
            SET status = ?, reason = ?, updated_at = NOW() 
            WHERE id = ?
        ");
        $result = $stmt->execute([$status, $rejectionReason, $userId]);
    } else {
        $stmt = $db->prepare("
            UPDATE users 
            SET status = ?, reason = NULL, updated_at = NOW() 
            WHERE id = ?
        ");
        $result = $stmt->execute([$status, $userId]);
    }
    
    // Vérifier que la mise à jour a réussi
    if (!$result) {
        throw new PDOException("Échec de la mise à jour du statut utilisateur");
    }
    
    $rowsAffected = $stmt->rowCount();
    
    if ($rowsAffected === 0) {
        error_log("Warning: No rows updated for user_id: " . $userId . " (statut probablement déjà identique)");
    }
    
    error_log("✅ User status updated successfully - ID: $userId, Status: $status, Rows affected: $rowsAffected");
    
    // Réponse de succès
    $responseData = [
        'success' => true,
        'message' => "Statut mis à jour avec succès",
        'data' => [
            'user_id' => $userId,
            'email' => $existingUser['email'],
            'name' => $existingUser['first_name'] . ' ' . $existingUser['last_name'],
            'status' => $status,
            'rows_affected' => $rowsAffected
        ]
    ];
    
    if ($rejectionReason) {
        $responseData['data']['reason'] = $rejectionReason;
    }
    
    echo json_encode($responseData);
    
} catch (PDOException $e) {
    error_log("❌ Database error in update-status.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur de base de données',
        'message' => $e->getMessage() // En dev seulement - retirer en production
    ]);
} catch (Exception $e) {
    error_log("❌ Error in update-status.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur serveur interne',
        'message' => $e->getMessage() // En dev seulement - retirer en production
    ]);
}
?>