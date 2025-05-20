<?php
class User {
    private $conn;
    private $table = 'users';
      // User properties
    public $id;
    public $email;
    public $password;
    public $role;
    public $created_at;
    
    // Constructor with DB connection
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Create a new user
    public function create() {
        // Hash password
        $this->password = password_hash($this->password, PASSWORD_BCRYPT);
        
        // SQL query
        $query = "INSERT INTO " . $this->table . " 
                  SET email = :email, 
                      password = :password";
        
        // Prepare statement
        $stmt = $this->conn->prepare($query);
        
        // Clean data
        $this->email = htmlspecialchars(strip_tags($this->email));

        // Bind data
        $stmt->bindParam(':email', $this->email);
        $stmt->bindParam(':password', $this->password);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        // Print error if something goes wrong
        printf("Error: %s.\n", $stmt->error);
        
        return false;
    }
      // Get user by email
    public function getByEmail() {
        // SQL query
        $query = "SELECT id, email, password, role, created_at 
                  FROM " . $this->table . " 
                  WHERE email = :email 
                  LIMIT 0,1";
        
        // Prepare statement
        $stmt = $this->conn->prepare($query);
        
        // Bind email
        $stmt->bindParam(':email', $this->email);
        
        // Execute query
        $stmt->execute();
        
        // Get row count
        $num = $stmt->rowCount();
        
        // If user exists, assign values to object properties for easy access
        if($num > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
              $this->id = $row['id'];
            $this->email = $row['email'];
            $this->password = $row['password'];
            $this->role = $row['role'];
            $this->created_at = $row['created_at'];
            
            return true;
        }
        
        return false;
    }    // Get user by ID
    public function getById() {
        // SQL query
        $query = "SELECT email, role, created_at 
                  FROM " . $this->table . " 
                  WHERE id = :id 
                  LIMIT 0,1";
        
        // Prepare statement
        $stmt = $this->conn->prepare($query);
        
        // Bind ID
        $stmt->bindParam(':id', $this->id);
        
        // Execute query
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->email = $row['email'];
            $this->role = $row['role']; // Added this line to set the role property
            $this->created_at = $row['created_at'];
            return true;
        }
        
        return false;
    }
}