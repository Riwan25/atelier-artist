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

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate input data
if (!isset($data->id) || !isset($data->status)) {
    http_response_code(400);
    echo json_encode([
        'message' => 'Missing required parameters: id and status'
    ]);
    exit();
}

// Validate status value
$allowedStatuses = ['pending', 'completed', 'cancelled'];
if (!in_array(strtolower($data->status), $allowedStatuses)) {
    http_response_code(400);
    echo json_encode([
        'message' => 'Invalid status value. Allowed values: pending, completed, cancelled'
    ]);
    exit();
}

try {
    // Update order status
    $query = "UPDATE orders SET status = :status WHERE id = :id";
    $stmt = $database->prepare($query);
    $status = strtolower($data->status);
    $stmt->bindParam(':status', $status);
    $stmt->bindParam(':id', $data->id);
    
    if ($stmt->execute()) {
        // Get the updated order
        $orderQuery = "
            SELECT o.id, o.user_id, o.total_amount, o.status, o.created_at, 
                   u.email as user_email
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.id = :id
        ";
        
        $orderStmt = $database->prepare($orderQuery);
        $orderStmt->bindParam(':id', $data->id);
        $orderStmt->execute();
        
        $order = $orderStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($order) {
            // Ensure total_amount is a numeric value
            $order['total_amount'] = (float)$order['total_amount'];
            
            // Get order items
            $itemsQuery = "
                SELECT oi.id, oi.album_id, oi.quantity, oi.unit_price,
                       a.name as album_name, a.artist_name
                FROM order_items oi
                JOIN albums a ON oi.album_id = a.id
                WHERE oi.order_id = :order_id
            ";
            
            $itemsStmt = $database->prepare($itemsQuery);
            $itemsStmt->bindParam(':order_id', $data->id);
            $itemsStmt->execute();
            
            $items = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Ensure unit_price is a numeric value for each item
            foreach ($items as &$item) {
                $item['unit_price'] = (float)$item['unit_price'];
                $item['quantity'] = (int)$item['quantity'];
            }
            
            // Add items to the order
            $order['items'] = $items;
            
            // Log the status update
            $logDir = '../../logs/';
            $logFile = $logDir . 'order_log.txt';
            
            // Create logs directory if it doesn't exist
            if (!is_dir($logDir)) {
                mkdir($logDir, 0755, true);
            }
            
            $logMessage = date('Y-m-d H:i:s') . " - Order #" . $data->id . " status updated to " . $status . 
                        " by admin User #" . $user->id . "\n";
            file_put_contents($logFile, $logMessage, FILE_APPEND);
            
            // Return success response
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Order status updated successfully',
                'order' => $order
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                'message' => 'Order not found'
            ]);
        }
    } else {
        http_response_code(500);
        echo json_encode([
            'message' => 'Failed to update order status'
        ]);
    }
} catch (Exception $e) {
    // Return error response
    http_response_code(500);
    echo json_encode([
        'message' => 'Failed to update order status',
        'error' => $e->getMessage()
    ]);
}
?>
