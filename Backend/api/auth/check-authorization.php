<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000'); // Plus sécurisé que *
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true'); // Important pour les cookies de session

// Gérer les requêtes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Inclure la configuration de la base de données
require_once(__DIR__ . '/../../config/database.php');

// Récupérer le userId
$input = json_decode(file_get_contents('php://input'), true);
$userId = $input['userId'] ?? $_GET['userId'] ?? $_POST['userId'] ?? null;

if (!$userId) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'authorized' => false,
        'message' => 'userId manquant'
    ]);
    exit;
}

try {
    // Connexion à la base de données
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception("Impossible de se connecter à la base de données");
    }
    
    // Vérifier l'utilisateur dans la table 'users'
    $query = "SELECT id, email, first_name, last_name, user_type, status, institution, profile_picture, created 
              FROM users 
              WHERE id = :userId 
              LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':userId', $userId);
    $stmt->execute();
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        // Vérifier si l'utilisateur est APPROVED ET student
        if ($user['status'] === 'APPROVED' && $user['user_type'] === 'student') {
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'authorized' => true,
                'status' => 'APPROVED', // Garder en MAJUSCULES comme dans la DB
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'first_name' => $user['first_name'],
                    'last_name' => $user['last_name'],
                    'user_type' => $user['user_type'],
                    'status' => $user['status'],
                    'institution' => $user['institution'],
                    'profile_picture' => $user['profile_picture'],
                    'created' => $user['created'],
                    // Propriété calculée pour compatibilité
                    'fullName' => $user['first_name'] . ' ' . $user['last_name']
                ]
            ]);
        } else {
            // Déterminer le message d'erreur
            $message = '';
            if ($user['status'] === 'PENDING') {
                $message = 'Votre compte est en attente d\'approbation';
            } elseif ($user['status'] === 'REJECTED') {
                $message = 'Votre compte a été rejeté';
            } elseif ($user['status'] === 'SUSPENDED') {
                $message = 'Votre compte a été suspendu';
            } elseif ($user['user_type'] !== 'student') {
                $message = 'Accès réservé aux étudiants';
            }
            
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'authorized' => false,
                'status' => $user['status'], // Garder le format original
                'userType' => $user['user_type'],
                'message' => $message
            ]);
        }
    } else {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'authorized' => false,
            'message' => 'Utilisateur non trouvé'
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'authorized' => false,
        'message' => 'Erreur serveur',
        'error' => $e->getMessage()
    ]);
}
?>