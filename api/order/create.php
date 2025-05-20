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

// Instantiate order object
$order = new Order($database);

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Check if data is valid
if (!isset($data->items) || empty($data->items)) {
    echo json_encode([
        'message' => 'No order items provided'
    ]);
    exit();
}

// Set order properties
$order->user_id = $userData->id;
$order->total_amount = $data->total_amount;
$order->status = 'pending';
$order->items = $data->items;

// Create order
if ($order->create()) {
    echo json_encode([
        'message' => 'Order created successfully',
        'order_id' => $order->id
    ]);
} else {
    echo json_encode([
        'message' => 'Order creation failed'
    ]);
}
?>
