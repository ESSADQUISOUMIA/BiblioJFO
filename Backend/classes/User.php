<?php

class User {
    private $conn;
    private $table_name = "users";

    public $id;
    public $email;
    public $password;
    public $first_name;
    public $last_name;
    public $user_type;
    public $status;
    public $institution;
    public $reason;
    public $google_id;
    public $profile_picture;
    public $phone;           // ← AJOUTÉ
    public $created_at;      // ← AJOUTÉ
    public $updated_at;      // ← AJOUTÉ

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET email=:email, password=:password, first_name=:first_name, 
                      last_name=:last_name, user_type=:user_type, status=:status,
                      institution=:institution, reason=:reason";

        $stmt = $this->conn->prepare($query);

        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->password = password_hash($this->password, PASSWORD_DEFAULT);
        $this->first_name = htmlspecialchars(strip_tags($this->first_name));
        $this->last_name = htmlspecialchars(strip_tags($this->last_name));

        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":password", $this->password);
        $stmt->bindParam(":first_name", $this->first_name);
        $stmt->bindParam(":last_name", $this->last_name);
        $stmt->bindParam(":user_type", $this->user_type);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":institution", $this->institution);
        $stmt->bindParam(":reason", $this->reason);

        return $stmt->execute();
    }

    public function login($email, $password) {
        $query = "SELECT id, email, password, first_name, last_name, user_type, status, 
                         profile_picture, institution, phone 
                  FROM " . $this->table_name . " WHERE email = :email LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $email);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (password_verify($password, $row['password'])) {
                $this->id = $row['id'];
                $this->email = $row['email'];
                $this->first_name = $row['first_name'];
                $this->last_name = $row['last_name'];
                $this->user_type = $row['user_type'];
                $this->status = $row['status'];
                $this->profile_picture = $row['profile_picture'];
                $this->institution = $row['institution'];
                $this->phone = $row['phone'] ?? null;
                return true;
            }
        }
        return false;
    }

    public function loadById($id) {
        $query = "SELECT id, email, password, first_name, last_name, user_type, status, 
                         profile_picture, institution, phone, created_at, updated_at 
                  FROM " . $this->table_name . " WHERE id = :id LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $this->id = $row['id'];
            $this->email = $row['email'];
            $this->password = $row['password'];
            $this->first_name = $row['first_name'];
            $this->last_name = $row['last_name'];
            $this->user_type = $row['user_type'];
            $this->status = $row['status'];
            $this->profile_picture = $row['profile_picture'];
            $this->institution = $row['institution'];
            $this->phone = $row['phone'] ?? null;
            $this->created_at = $row['created_at'] ?? null;
            $this->updated_at = $row['updated_at'] ?? null;
            return true;
        }
        return false;
    }

    public function createFromGoogle($google_data) {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET email=:email, first_name=:first_name, last_name=:last_name, 
                      google_id=:google_id, profile_picture=:profile_picture, 
                      user_type='student', status='PENDING'";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":email", $google_data['email']);
        $stmt->bindParam(":first_name", $google_data['given_name']);
        $stmt->bindParam(":last_name", $google_data['family_name']);
        $stmt->bindParam(":google_id", $google_data['id']);
        $stmt->bindParam(":profile_picture", $google_data['picture']);

        return $stmt->execute();
    }

    public function findByGoogleId($google_id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE google_id = :google_id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":google_id", $google_id);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $this->id = $row['id'];
            $this->email = $row['email'];
            $this->first_name = $row['first_name'];
            $this->last_name = $row['last_name'];
            $this->user_type = $row['user_type'];
            $this->status = $row['status'];
            $this->profile_picture = $row['profile_picture'];
            $this->institution = $row['institution'] ?? null;
            $this->phone = $row['phone'] ?? null;
            return true;
        }
        return false;
    }

    public function getAllUsers() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function updateStatus($user_id, $status) {
        // Liste des statuts valides
        $validStatuses = ['PENDING', 'APPROVED', 'SUSPENDED'];
        if (!in_array($status, $validStatuses)) {
            return false;
        }

        $query = "UPDATE " . $this->table_name . " SET status = :status WHERE id = :id";
        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":status", $status, PDO::PARAM_STR);
        $stmt->bindParam(":id", $user_id, PDO::PARAM_INT);

        return $stmt->execute();
    }

    public function deleteUser($user_id) {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $user_id);
        return $stmt->execute();
    }

    public function update() {
        try {
            $query = "UPDATE " . $this->table_name . " 
                      SET first_name = :first_name,
                          last_name = :last_name,
                          email = :email,
                          phone = :phone,
                          institution = :institution,
                          updated_at = NOW()
                      WHERE id = :id";

            $stmt = $this->conn->prepare($query);

            // Nettoyer les données
            $this->first_name = htmlspecialchars(strip_tags($this->first_name));
            $this->last_name = htmlspecialchars(strip_tags($this->last_name));
            $this->email = htmlspecialchars(strip_tags($this->email));
            $this->phone = htmlspecialchars(strip_tags($this->phone));
            $this->institution = htmlspecialchars(strip_tags($this->institution));

            $stmt->bindParam(':first_name', $this->first_name);
            $stmt->bindParam(':last_name', $this->last_name);
            $stmt->bindParam(':email', $this->email);
            $stmt->bindParam(':phone', $this->phone);
            $stmt->bindParam(':institution', $this->institution);
            $stmt->bindParam(':id', $this->id);

            if ($stmt->execute()) {
                return true;
            }

            error_log("User update failed: " . print_r($stmt->errorInfo(), true));
            return false;

        } catch (PDOException $e) {
            error_log("Error in User::update(): " . $e->getMessage());
            return false;
        }
    }
}

?>