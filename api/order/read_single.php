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

$database = getDbConnection();

// Check if the request is using a valid auth token
$userData = getCurrentUser($database);
if (!$userData) {
    echo json_encode([
        'message' => 'Unauthorized access'
    ]);
    exit();
}

// Check if ID is set in URL
if (!isset($_GET['id'])) {
    echo json_encode([
        'message' => 'Missing order ID'
    ]);
    exit();
}

// Instantiate order object
$order = new Order($database);
$order->id = $_GET['id'];

// Get order details
if ($order->read_single()) {
    // Check if the order belongs to the user or if the user is an admin
    if ($order->user_id == $userData->id || $userData->role === 'admin') {
        $order_arr = array(
            'id' => $order->id,
            'user_id' => $order->user_id,
            'total_amount' => $order->total_amount,
            'status' => $order->status,
            'created_at' => $order->created_at,
            'items' => $order->items
        );
        
        // Turn to JSON & output
        echo json_encode($order_arr);
    } else {
        echo json_encode([
            'message' => 'Unauthorized access to this order'
        ]);
    }
} else {
    echo json_encode([
        'message' => 'Order not found'
    ]);
}
?>
