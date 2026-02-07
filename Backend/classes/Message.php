<?php

class Message {
    private $conn;
    private $table_name = "messages";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create($user_id, $subject, $message) {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET user_id=:user_id, subject=:subject, message=:message";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->bindParam(":subject", htmlspecialchars(strip_tags($subject)));
        $stmt->bindParam(":message", htmlspecialchars(strip_tags($message)));

        return $stmt->execute();
    }

    public function getAllMessages() {
        $query = "SELECT m.*, u.first_name, u.last_name, u.email 
                  FROM " . $this->table_name . " m 
                  JOIN users u ON m.user_id = u.id 
                  ORDER BY m.created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function updateStatus($message_id, $status) {
        $query = "UPDATE " . $this->table_name . " SET status = :status WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":id", $message_id);
        return $stmt->execute();
    }

    public function reply($message_id, $reply) {
        $query = "UPDATE " . $this->table_name . " 
                  SET admin_reply = :reply, status = 'replied' 
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":reply", htmlspecialchars(strip_tags($reply)));
        $stmt->bindParam(":id", $message_id);
        return $stmt->execute();
    }

    public function delete($message_id) {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $message_id);
        return $stmt->execute();
    }
}
?>
