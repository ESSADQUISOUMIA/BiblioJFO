<?php
require_once '../cors.php';
error_reporting(E_ALL);
ini_set('display_errors', 0);

ob_start();

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean();
    http_response_code(200);
    exit();
}

try {
    ob_clean();
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Méthode non autorisée');
    }

    if (empty($_POST['title'])) {
        throw new Exception('Le titre est requis');
    }

    if (!isset($_FILES['file'])) {
        throw new Exception('Aucun fichier reçu');
    }

    if ($_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        $errorMessages = [
            UPLOAD_ERR_INI_SIZE => 'Le fichier dépasse upload_max_filesize',
            UPLOAD_ERR_FORM_SIZE => 'Le fichier dépasse MAX_FILE_SIZE',
            UPLOAD_ERR_PARTIAL => 'Le fichier n\'a été que partiellement uploadé',
            UPLOAD_ERR_NO_FILE => 'Aucun fichier n\'a été uploadé',
            UPLOAD_ERR_NO_TMP_DIR => 'Dossier temporaire manquant',
            UPLOAD_ERR_CANT_WRITE => 'Échec de l\'écriture sur le disque',
            UPLOAD_ERR_EXTENSION => 'Une extension PHP a arrêté l\'upload',
        ];
        
        $error = $_FILES['file']['error'];
        $message = $errorMessages[$error] ?? 'Erreur inconnue: ' . $error;
        throw new Exception($message);
    }

    $uploadDir = __DIR__ . '/../../uploads/resources/';
    
    if (!is_dir($uploadDir)) {
        if (!mkdir($uploadDir, 0755, true)) {
            throw new Exception('Impossible de créer le dossier uploads/resources/');
        }
    }

    if (!is_writable($uploadDir)) {
        throw new Exception('Le dossier uploads n\'est pas accessible en écriture');
    }

    $originalName = $_FILES['file']['name'];
    $fileExtension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    $allowedExtensions = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'mp4', 'mp3', 'jpg', 'jpeg', 'png'];
    
    if (!in_array($fileExtension, $allowedExtensions)) {
        throw new Exception('Type de fichier non autorisé: ' . $fileExtension);
    }

    $fileName = uniqid() . '_' . time() . '.' . $fileExtension;
    $filePath = $uploadDir . $fileName;

    if (!move_uploaded_file($_FILES['file']['tmp_name'], $filePath)) {
        throw new Exception('Impossible de déplacer le fichier uploadé');
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

    // Préparer les données
    $title = trim($_POST['title']);
    $description = isset($_POST['description']) ? trim($_POST['description']) : '';
    $category = $_POST['category'] ?? 'autres';
    $type = $_POST['type'] ?? 'document';
    $filePathDB = '/wert/Backend/uploads/resources/' . $fileName;
    $fileSize = $_FILES['file']['size'];
    $author = 'Administration'; // Exemple : à récupérer depuis la session si besoin

    // Insertion
    $stmt = $pdo->prepare("
        INSERT INTO resources 
        (title, description, category, type, file_path, file_name, original_name, file_size, author, is_active, created_at) 
        VALUES 
        (:title, :description, :category, :type, :file_path, :file_name, :original_name, :file_size, :author, 1, NOW())
    ");
    
    $success = $stmt->execute([
        ':title' => $title,
        ':description' => $description,
        ':category' => $category,
        ':type' => $type,
        ':file_path' => $filePathDB,
        ':file_name' => $fileName,
        ':original_name' => $originalName,
        ':file_size' => $fileSize,
        ':author' => $author
    ]);

    if (!$success) {
        throw new Exception('Erreur lors de l\'insertion en base de données');
    }

    $resourceId = $pdo->lastInsertId();

    // Récupérer la ressource créée
    $stmt = $pdo->prepare("SELECT * FROM resources WHERE id = :id");
    $stmt->execute([':id' => $resourceId]);
    $resource = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$resource) {
        throw new Exception('Ressource créée mais impossible de la récupérer');
    }

    // ✅ Ajouter l'URL publique
    $baseUrl = "http://localhost/wert/Backend/uploads/resources/";
    if (!empty($resource['file_name'])) {
        $resource['url'] = $baseUrl . $resource['file_name'];
    } else {
        $resource['url'] = null;
    }

    ob_end_clean();
    
    echo json_encode([
        'success' => true,
        'resource' => $resource,
        'message' => 'Ressource ajoutée avec succès'
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    // Supprimer le fichier en cas d'erreur
    if (isset($filePath) && file_exists($filePath)) {
        @unlink($filePath);
    }
    
    ob_end_clean();
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

exit();
