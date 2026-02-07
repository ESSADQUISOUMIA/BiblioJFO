<?php

class Document {
    private $conn;
    private $table_name = "documents";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAllDocuments($category = null) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE is_active = 1";
        
        if ($category) {
            $query .= " AND category = :category";
        }
        
        $query .= " ORDER BY created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        
        if ($category) {
            $stmt->bindParam(":category", $category);
        }
        
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getDocument($id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = :id AND is_active = 1 LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        return $stmt->fetch();
    }
}
?>
