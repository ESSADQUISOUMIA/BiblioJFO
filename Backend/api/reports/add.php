<?php
require_once '../cors.php';
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

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
    
    // Validation des données
    if (empty($_POST['title'])) {
        throw new Exception("Le titre est obligatoire");
    }
    
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        throw new Exception("Erreur lors du téléchargement du fichier");
    }
    
    $file = $_FILES['file'];
    
    // Validation du fichier
    $allowedTypes = ['application/pdf'];
    $maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!in_array($file['type'], $allowedTypes)) {
        throw new Exception("Seuls les fichiers PDF sont autorisés");
    }
    
    if ($file['size'] > $maxSize) {
        throw new Exception("Le fichier est trop volumineux (max 10MB)");
    }
    
    // Créer le dossier uploads s'il n'existe pas
    $uploadDir = '../../uploads/reports/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    
    // Générer un nom de fichier unique
    $fileExtension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $fileName = uniqid('report_') . '_' . time() . '.' . $fileExtension;
    $filePath = $uploadDir . $fileName;
    
    // Déplacer le fichier
    if (!move_uploaded_file($file['tmp_name'], $filePath)) {
        throw new Exception("Erreur lors de l'enregistrement du fichier");
    }
    
    // Préparer les données
    $title = trim($_POST['title']);
    $description = isset($_POST['description']) && !empty(trim($_POST['description'])) 
        ? trim($_POST['description']) 
        : null;
    $type = isset($_POST['type']) ? $_POST['type'] : 'initiation';
    $author = 'Administration';
    $status = 'draft';
    $is_active = 1;
    
    // Gérer les tags - IMPORTANT : Convertir en JSON valide
    $tags = null;
    if (isset($_POST['tags']) && !empty(trim($_POST['tags']))) {
        $tagsArray = array_filter(
            array_map('trim', explode(',', trim($_POST['tags']))),
            function($tag) { return !empty($tag); }
        );
        // Convertir en JSON pour respecter la contrainte LONGTEXT/JSON
        $tags = json_encode($tagsArray, JSON_UNESCAPED_UNICODE);
    }
    
    // Insérer dans la base de données
    $sql = "INSERT INTO stage_reports 
            (title, description, file_path, file_name, original_name, file_size, type, status, author, tags, is_active) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $title,
        $description,
        $filePath,
        $fileName,
        $file['name'],
        $file['size'],
        $type,
        $status,
        $author,
        $tags,
        $is_active
    ]);
    
    // Récupérer l'ID du rapport inséré
    $reportId = $pdo->lastInsertId();
    
    // Récupérer le rapport complet
    $stmt = $pdo->prepare("SELECT * FROM stage_reports WHERE id = ?");
    $stmt->execute([$reportId]);
    $report = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Convertir les tags JSON en tableau pour le frontend
    if ($report['tags']) {
        $report['tags'] = json_decode($report['tags'], true);
    } else {
        $report['tags'] = [];
    }
    
    // Formater la date
    $report['date'] = $report['created_at'];
    
    echo json_encode([
        'success' => true,
        'message' => 'Rapport ajouté avec succès',
        'Report' => $report
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