<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

// Configuration session sécurisée
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.cookie_secure', 0); // Mettre 1 en production HTTPS
ini_set('session.use_strict_mode', 1);
session_start();

require_once(__DIR__ . '/../../config/database.php');
require_once(__DIR__ . '/../../classes/User.php');

// Headers CORS
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Preflight CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// 🔒 RATE LIMITING - Protection force brute
function checkRateLimit($email) {
    $max_attempts = 5;
    $lockout_time = 900; // 15 minutes
    
    $key = 'login_attempts_' . md5($email);
    
    if (!isset($_SESSION[$key])) {
        $_SESSION[$key] = ['count' => 0, 'time' => time()];
    }
    
    $attempts = &$_SESSION[$key];
    
    // Réinitialiser après la période de blocage
    if (time() - $attempts['time'] > $lockout_time) {
        $attempts = ['count' => 0, 'time' => time()];
    }
    
    // Vérifier si bloqué
    if ($attempts['count'] >= $max_attempts) {
        $remaining = $lockout_time - (time() - $attempts['time']);
        return [
            'allowed' => false,
            'remaining' => ceil($remaining / 60)
        ];
    }
    
    return ['allowed' => true];
}

function incrementFailedAttempts($email) {
    $key = 'login_attempts_' . md5($email);
    if (!isset($_SESSION[$key])) {
        $_SESSION[$key] = ['count' => 0, 'time' => time()];
    }
    $_SESSION[$key]['count']++;
    $_SESSION[$key]['time'] = time();
}

function resetFailedAttempts($email) {
    $key = 'login_attempts_' . md5($email);
    unset($_SESSION[$key]);
}

// 🔐 Sauvegarder le token "remember me" en base
function saveRememberToken($db, $userId, $token) {
    $hashedToken = password_hash($token, PASSWORD_DEFAULT);
    $expiry = date('Y-m-d H:i:s', time() + (30 * 24 * 3600));
    
    $query = "INSERT INTO remember_tokens (user_id, token_hash, expires_at, created_at) 
              VALUES (:user_id, :token, :expires, NOW())
              ON DUPLICATE KEY UPDATE 
              token_hash = :token, expires_at = :expires, created_at = NOW()";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $userId);
    $stmt->bindParam(':token', $hashedToken);
    $stmt->bindParam(':expires', $expiry);
    
    return $stmt->execute();
}

// ============== TRAITEMENT LOGIN ==============
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawData = file_get_contents("php://input");
    $data = json_decode($rawData, true);

    // Validation des entrées
    $email = filter_var($data['email'] ?? '', FILTER_SANITIZE_EMAIL);
    $password = trim($data['password'] ?? '');
    $remember = !empty($data['remember']);

    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode([
            "success" => false, 
            "error" => "Email et mot de passe requis"
        ]);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode([
            "success" => false, 
            "error" => "Format d'email invalide"
        ]);
        exit;
    }

    if (strlen($password) < 6) {
        http_response_code(400);
        echo json_encode([
            "success" => false, 
            "error" => "Mot de passe trop court (min 6 caractères)"
        ]);
        exit;
    }

    // 🔒 Vérifier le rate limiting
    $rateLimitCheck = checkRateLimit($email);
    if (!$rateLimitCheck['allowed']) {
        http_response_code(429);
        echo json_encode([
            "success" => false,
            "error" => "Trop de tentatives. Réessayez dans " . $rateLimitCheck['remaining'] . " minutes",
            "remainingMinutes" => $rateLimitCheck['remaining']
        ]);
        exit;
    }

    try {
        $database = new Database();
        $db = $database->getConnection();
        $user = new User($db);

        if ($user->login($email, $password)) {
            // ✅ LOGIN RÉUSSI
            
            // Régénérer l'ID de session (protection fixation)
            session_regenerate_id(true);
            
            // Réinitialiser les tentatives échouées
            resetFailedAttempts($email);
            
            $_SESSION['user_id'] = $user->id;
    $_SESSION['user_email'] = $user->email;
    $_SESSION['user_type'] = $user->user_type; // ← AJOUT CRUCIAL
    $_SESSION['user_name'] = trim($user->first_name . " " . $user->last_name); // ← AJOUT
    $_SESSION['user_status'] = $user->status; // ← AJOUT
    $_SESSION['profile_picture'] = $user->profile_picture; // ← AJOUT
    $_SESSION['last_activity'] = time();

            // 🍪 Gestion "Remember Me"
            if ($remember) {
                $token = bin2hex(random_bytes(32));
                
                // Sauvegarder en base de données
                saveRememberToken($db, $user->id, $token);
                
                // Envoyer le cookie
                setcookie(
                    'remember_token',
                    $token,
                    [
                        'expires' => time() + (30 * 24 * 3600),
                        'path' => '/',
                        'domain' => '',
                        'secure' => false, // true en production HTTPS
                        'httponly' => true,
                        'samesite' => 'Lax'
                    ]
                );
            }

            // Log de connexion réussie
            error_log("Login réussi pour: " . $email . " depuis IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));

    echo json_encode([
        "success" => true,
        "user" => [
            "id" => $user->id,
            "email" => $user->email,
            "fullName" => trim($user->first_name . " " . $user->last_name),
            "userType" => strtoupper($user->user_type),
            "status" => $user->status,
            "profilePicture" => $user->profile_picture
        ]
    ]);
            
        } else {
            // ❌ LOGIN ÉCHOUÉ
            incrementFailedAttempts($email);
            
            // Log de tentative échouée
            error_log("Tentative de connexion échouée pour: " . $email . " depuis IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
            
            http_response_code(401);
            echo json_encode([
                "success" => false, 
                "error" => "Identifiants invalides"
            ]);
        }
        
    } catch (Exception $e) {
        error_log("Erreur login: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            "success" => false, 
            "error" => "Erreur serveur interne"
        ]);
    }
    
} else {
    http_response_code(405);
    echo json_encode([
        "success" => false, 
        "error" => "Méthode non autorisée (utilisez POST)"
    ]);
}