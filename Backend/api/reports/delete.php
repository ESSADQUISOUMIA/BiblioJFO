<?php
require_once '../cors.php';
error_reporting(E_ALL);
ini_set('display_errors', 0);

ob_start();

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean();
    http_response_code(200);
    exit();
}

try {
    ob_clean();
    
    // Accepter DELETE, GET ou POST
    if (!in_array($_SERVER['REQUEST_METHOD'], ['DELETE', 'GET', 'POST'])) {
        throw new Exception('Méthode non autorisée');
    }

    // Récupérer l'ID du rapport
    $reportId = null;
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE' || $_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $reportId = $input['id'] ?? null;
    } else {
        $reportId = $_GET['id'] ?? null;
    }

    if (empty($reportId) || !is_numeric($reportId)) {
        throw new Exception('ID du rapport invalide ou manquant');
    }

    // Connexion à la base de données
    $dbPath = __DIR__ . '/../../config/database.php';
    if (!file_exists($dbPath)) {
        throw new Exception('Fichier de configuration database.php introuvable');
    }
    
    require_once $dbPath;
    
    $database = new Database();
    $pdo = $database->getConnection();

    if (!$pdo) {
        throw new Exception('Connexion à la base de données non établie');
    }

    // Récupérer les informations du rapport avant suppression
    // CORRECTION : Changé 'reports' en 'stage_reports'
    $stmt = $pdo->prepare("SELECT file_path, file_name FROM stage_reports WHERE id = :id");
    $stmt->execute([':id' => $reportId]);
    $report = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$report) {
        throw new Exception('Rapport introuvable');
    }

    // Supprimer le fichier physique si existe
    $fileDeleted = false;
    if (!empty($report['file_name'])) {
        $uploadDir = __DIR__ . '/../../uploads/reports/';
        $physicalFilePath = $uploadDir . $report['file_name'];
        
        if (file_exists($physicalFilePath)) {
            if (@unlink($physicalFilePath)) {
                $fileDeleted = true;
            }
        }
    }

    // Supprimer le rapport de la base de données
    $stmt = $pdo->prepare("DELETE FROM stage_reports WHERE id = :id");
    $success = $stmt->execute([':id' => $reportId]);

    if (!$success) {
        throw new Exception('Erreur lors de la suppression du rapport');
    }

    ob_end_clean();
    
    echo json_encode([
        'success' => true,
        'message' => 'Rapport supprimé avec succès',
        'file_deleted' => $fileDeleted
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    ob_end_clean();
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

exit();