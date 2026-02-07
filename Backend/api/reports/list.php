<?php
require_once '../cors.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $host = 'localhost';
    $dbname = 'portail_stagiaire';
    $username = 'root';
    $password = '';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Récupérer tous les rapports (incluant les brouillons)
    $sql = "SELECT * FROM stage_reports ORDER BY created_at DESC";
    $stmt = $pdo->query($sql);
    $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Formater les données
    foreach ($reports as &$report) {
        // Convertir tags JSON en tableau
        if ($report['tags']) {
            $report['tags'] = json_decode($report['tags'], true);
        } else {
            $report['tags'] = [];
        }
        
        // Ajouter la date au format attendu
        $report['date'] = $report['created_at'];
    }
    
    echo json_encode([
        'success' => true,
        'reports' => $reports
    ], JSON_UNESCAPED_UNICODE);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur de base de données: ' . $e->getMessage()
    ]);
}
?>