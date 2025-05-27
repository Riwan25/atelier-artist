<?php
// Include CORS helper
require_once '../helpers/cors_helper.php';

// Set CORS headers and handle preflight requests
handleCorsPreflightRequest();

// Set response content type
header('Content-Type: application/json');

// Include database and required files
include_once '../../config/config.php';
include_once '../middleware/auth.php';

// Get database connection
$database = getDbConnection();

// Check if the user is authenticated
if (requireAuth() === false) {
    return;
}

// Get the current user
$user = getCurrentUser($database);

// Check if the user is an admin
if (!$user || $user->role !== 'admin') {
    http_response_code(403);
    echo json_encode([
        'message' => 'Access denied. Admin privileges required.'
    ]);
    exit();
}

try {    // Query to get all orders with user information
    $orderQuery = "
        SELECT o.id, o.user_id, o.total_amount, o.status, o.created_at, 
               u.email as user_email
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
    ";
    
    $orderStmt = $database->prepare($orderQuery);
    $orderStmt->execute();
    
    $orders = [];
      while ($order = $orderStmt->fetch(PDO::FETCH_ASSOC)) {
        // Ensure total_amount is a numeric value
        $order['total_amount'] = (float)$order['total_amount'];
        
        // Get order items for each order
        $itemsQuery = "
            SELECT oi.id, oi.album_id, oi.quantity, oi.unit_price,
                   a.name as album_name, a.artist_name
            FROM order_items oi
            JOIN albums a ON oi.album_id = a.id
            WHERE oi.order_id = :order_id
        ";
        
        $itemsStmt = $database->prepare($itemsQuery);
        $itemsStmt->bindParam(':order_id', $order['id']);        $itemsStmt->execute();
        
        $items = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Ensure unit_price is a numeric value for each item
        foreach ($items as &$item) {
            $item['unit_price'] = (float)$item['unit_price'];
            $item['quantity'] = (int)$item['quantity'];
        }
        
        // Add items to the order
        $order['items'] = $items;
        $orders[] = $order;
    }
    
    // Return success response with orders
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'orders' => $orders
    ]);
    
} catch (Exception $e) {
    // Return error response
    http_response_code(500);
    echo json_encode([
        'message' => 'Failed to retrieve orders',
        'error' => $e->getMessage()
    ]);
}
?>