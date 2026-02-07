<?php
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$path = $_GET['path'] ?? '';

if (empty($path)) {
    http_response_code(400);
    echo json_encode(['error' => 'No path provided']);
    exit;
}

// Chemin de base du backend
$basePath = dirname(dirname(__DIR__)); // Remonte de api/uploads/ vers Backend/
$fullPath = $basePath . '/' . $path;

// Sécurité : vérifier que le chemin ne sort pas du dossier uploads
$realBase = realpath($basePath . '/uploads');
$realPath = realpath($fullPath);

if (!$realPath || strpos($realPath, $realBase) !== 0) {
    http_response_code(403);
    echo json_encode(['error' => 'Invalid path']);
    exit;
}

if (!file_exists($fullPath)) {
    http_response_code(404);
    echo json_encode(['error' => 'File not found', 'path' => $fullPath]);
    exit;
}

$mimeType = mime_content_type($fullPath);
header('Content-Type: ' . $mimeType);
header('Content-Length: ' . filesize($fullPath));
readfile($fullPath);