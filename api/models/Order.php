<?php
class Order {
    private $conn;
    private $table = 'orders';
    private $items_table = 'order_items';

    // Order properties
    public $id;
    public $user_id;
    public $total_amount;
    public $status;
    public $created_at;
    public $items = [];

    // Constructor with DB
    public function __construct($db) {
        $this->conn = $db;
    }

    // Create order
    public function create() {
        // Create order
        $query = "INSERT INTO " . $this->table . " 
                  (user_id, total_amount, status) 
                  VALUES (:user_id, :total_amount, :status)";

        $stmt = $this->conn->prepare($query);

        // Clean data
        $this->user_id = htmlspecialchars(strip_tags($this->user_id));
        $this->total_amount = htmlspecialchars(strip_tags($this->total_amount));
        $this->status = htmlspecialchars(strip_tags($this->status));

        // Bind data
        $stmt->bindParam(':user_id', $this->user_id);
        $stmt->bindParam(':total_amount', $this->total_amount);
        $stmt->bindParam(':status', $this->status);

        // Execute query
        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return $this->addOrderItems();
        }

        // Print error if something goes wrong
        printf("Error: %s.\n", $stmt->error);

        return false;
    }

    // Add order items
    private function addOrderItems() {
        // If no items, return true (order created without items)
        if(empty($this->items)) {
            return true;
        }

        $success = true;

        foreach($this->items as $item) {
            $query = "INSERT INTO " . $this->items_table . " 
                      (order_id, album_id, quantity, unit_price) 
                      VALUES (:order_id, :album_id, :quantity, :unit_price)";
            
            $stmt = $this->conn->prepare($query);

            // Bind data
            $stmt->bindParam(':order_id', $this->id);
            $stmt->bindParam(':album_id', $item['id']);
            $stmt->bindParam(':quantity', $item['quantity']);
            $stmt->bindParam(':unit_price', $item['cost']);

            // Execute query
            if(!$stmt->execute()) {
                $success = false;
                break;
            }
        }

        return $success;
    }

    // Get orders for a user
    public function getUserOrders() {
        $query = "SELECT 
                  o.id, o.total_amount, o.status, o.created_at
                  FROM " . $this->table . " o
                  WHERE o.user_id = :user_id
                  ORDER BY o.created_at DESC";

        $stmt = $this->conn->prepare($query);

        // Bind data
        $stmt->bindParam(':user_id', $this->user_id);

        // Execute query
        $stmt->execute();

        return $stmt;
    }

    // Get order details by ID
    public function read_single() {
        // Get order details
        $query = "SELECT 
                  o.id, o.user_id, o.total_amount, o.status, o.created_at
                  FROM " . $this->table . " o
                  WHERE o.id = :id";

        $stmt = $this->conn->prepare($query);

        // Bind ID
        $stmt->bindParam(':id', $this->id);

        // Execute query
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if($row) {
            // Set properties
            $this->id = $row['id'];
            $this->user_id = $row['user_id'];
            $this->total_amount = $row['total_amount'];
            $this->status = $row['status'];
            $this->created_at = $row['created_at'];

            // Get order items
            $this->getOrderItems();

            return true;
        }

        return false;
    }

    // Get order items
    private function getOrderItems() {
        $query = "SELECT 
                  oi.id, oi.album_id, oi.quantity, oi.unit_price,
                  a.name, a.artist_name
                  FROM " . $this->items_table . " oi
                  JOIN albums a ON oi.album_id = a.id
                  WHERE oi.order_id = :order_id";

        $stmt = $this->conn->prepare($query);

        // Bind order ID
        $stmt->bindParam(':order_id', $this->id);

        // Execute query
        $stmt->execute();

        // Fetch all items
        $this->items = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Update order status
    public function update_status() {
        $query = "UPDATE " . $this->table . "
                  SET status = :status
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        // Clean data
        $this->status = htmlspecialchars(strip_tags($this->status));
        $this->id = htmlspecialchars(strip_tags($this->id));

        // Bind data
        $stmt->bindParam(':status', $this->status);
        $stmt->bindParam(':id', $this->id);

        // Execute query
        if($stmt->execute()) {
            return true;
        }

        // Print error if something goes wrong
        printf("Error: %s.\n", $stmt->error);

        return false;
    }

    // Get all orders (admin)
    public function read() {
        $query = "SELECT 
                  o.id, o.user_id, o.total_amount, o.status, o.created_at,
                  u.email as user_email
                  FROM " . $this->table . " o
                  JOIN users u ON o.user_id = u.id
                  ORDER BY o.created_at DESC";

        $stmt = $this->conn->prepare($query);

        // Execute query
        $stmt->execute();

        return $stmt;
    }
}
?>
