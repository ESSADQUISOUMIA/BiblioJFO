<?php
require_once '../cors.php';
error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=utf-8');

// CORRIGÉ : Origine spécifique au lieu du wildcard
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true'); // Requis pour les credentials
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Connexion à la base de données
    $host = 'localhost';
    $dbname = 'portail_stagiaire';
    $username = 'root';
    $password = '';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
    // Récupérer les paramètres
    $status = $_GET['status'] ?? null;
    $userId = $_GET['userId'] ?? null;
    
    // Construire la requête SQL
    $sql = "SELECT * FROM stage_reports WHERE 1=1";
    $params = [];
    
    // Filtrer par statut si spécifié
    if ($status) {
        $sql .= " AND status = :status";
        $params[':status'] = $status;
    }
    
    // Filtrer par is_active (rapports actifs uniquement)
    $sql .= " AND is_active = 1";
    
    // Trier par date de création (plus récent en premier)
    $sql .= " ORDER BY created_at DESC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $reports = $stmt->fetchAll();
    
    // Formater les données pour le frontend
    foreach ($reports as &$report) {
        // Convertir tags JSON en tableau
        if (!empty($report['tags'])) {
            $tagsDecoded = json_decode($report['tags'], true);
            $report['tags'] = is_array($tagsDecoded) ? $tagsDecoded : [];
        } else {
            $report['tags'] = [];
        }
        
        // Ajouter la date au format attendu par le frontend
        $report['date'] = $report['created_at'];
        
        // Construire l'URL du fichier
        if (!empty($report['file_name'])) {
            $report['fileUrl'] = "http://localhost/wert/Backend/uploads/reports/" . $report['file_name'];
        }
        
        // Ajouter l'auteur si non présent
        if (empty($report['author'])) {
            $report['author'] = 'Administration';
        }
    }
    
    echo json_encode([
        'success' => true,
        'reports' => $reports,
        'count' => count($reports)
    ], JSON_UNESCAPED_UNICODE);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur de base de données: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>