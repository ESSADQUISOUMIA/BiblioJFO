<?php
require_once '../cors.php';
error_reporting(E_ALL);
ini_set('display_errors', 0);

ob_start();

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean();
    http_response_code(200);
    exit();
}

try {
    ob_clean();
    
    // Accepter POST ou PUT
    if (!in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT'])) {
        throw new Exception('Méthode non autorisée');
    }

    // Récupérer les données
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Données JSON invalides');
    }

    $reportId = $input['id'] ?? null;
    $status = $input['status'] ?? null;

    if (empty($reportId) || !is_numeric($reportId)) {
        throw new Exception('ID du rapport invalide ou manquant');
    }

    if (empty($status)) {
        throw new Exception('Le statut est requis');
    }

    // Valider le statut
    $allowedStatuses = ['draft', 'published', 'archived'];
    if (!in_array($status, $allowedStatuses)) {
        throw new Exception('Statut invalide. Valeurs autorisées: ' . implode(', ', $allowedStatuses));
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

    // ✅ CORRIGÉ - Vérifier que le rapport existe
    $stmt = $pdo->prepare("SELECT id FROM stage_reports WHERE id = :id");
    $stmt->execute([':id' => $reportId]);
    $report = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$report) {
        throw new Exception('Rapport introuvable');
    }

    // Mettre à jour le statut (déjà correct)
    $stmt = $pdo->prepare("UPDATE stage_reports SET status = :status, updated_at = NOW() WHERE id = :id");
    
    $success = $stmt->execute([
        ':status' => $status,
        ':id' => $reportId
    ]);

    if (!$success) {
        throw new Exception('Erreur lors de la mise à jour du statut');
    }

    // ✅ CORRIGÉ - Récupérer le rapport mis à jour
    $stmt = $pdo->prepare("SELECT * FROM stage_reports WHERE id = :id");
    $stmt->execute([':id' => $reportId]);
    $updatedReport = $stmt->fetch(PDO::FETCH_ASSOC);

    ob_end_clean();
    
    echo json_encode([
        'success' => true,
        'message' => 'Statut mis à jour avec succès',
        'report' => $updatedReport
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