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
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Gérer OPTIONS (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Vérifier que c'est une requête POST
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
        echo json_encode([
            'success' => false, 
            'error' => 'Non authentifié'
        ]);
        exit;
    }

    // Vérifier qu'un fichier a été uploadé
    if (!isset($_FILES['profilePicture']) || $_FILES['profilePicture']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Aucun fichier uploadé ou erreur lors de l\'upload'
        ]);
        exit;
    }

    $file = $_FILES['profilePicture'];

    // Validation du fichier
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $maxSize = 5 * 1024 * 1024; // 5MB

    if (!in_array($file['type'], $allowedTypes)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Type de fichier non autorisé. Utilisez JPG, PNG, GIF ou WebP.'
        ]);
        exit;
    }

    if ($file['size'] > $maxSize) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Le fichier est trop volumineux. Taille maximale: 5MB'
        ]);
        exit;
    }

    // Créer le dossier uploads s'il n'existe pas
    $uploadDir = __DIR__ . '/../../uploads/profile_pictures/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    // Générer un nom de fichier unique
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'profile_' . $_SESSION['user_id'] . '_' . time() . '.' . $extension;
    $uploadPath = $uploadDir . $filename;

    // Déplacer le fichier uploadé
    if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Erreur lors de la sauvegarde du fichier'
        ]);
        exit;
    }

    // Mettre à jour la base de données
    $database = new Database();
    $db = $database->getConnection();
    $user = new User($db);

    if (!$user->loadById($_SESSION['user_id'])) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Utilisateur non trouvé'
        ]);
        exit;
    }

    // Supprimer l'ancienne photo si elle existe
    if ($user->profile_picture && file_exists(__DIR__ . '/../../' . $user->profile_picture)) {
        unlink(__DIR__ . '/../../' . $user->profile_picture);
    }

    // Mettre à jour le chemin de la photo dans la base de données
    $relativePath = 'uploads/profile_pictures/' . $filename;
    $query = "UPDATE users SET profile_picture = :profile_picture WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':profile_picture', $relativePath);
    $stmt->bindParam(':id', $_SESSION['user_id']);

    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Photo de profil mise à jour avec succès',
            'imageUrl' => 'http://localhost/wert/Backend/' . $relativePath
        ]);
    } else {
        // Supprimer le fichier uploadé en cas d'erreur
        unlink($uploadPath);
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Erreur lors de la mise à jour de la base de données'
        ]);
    }

} catch (Exception $e) {
    error_log("Error in admin/profile-picture.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur serveur interne',
        'message' => $e->getMessage()
    ]);
}
?>