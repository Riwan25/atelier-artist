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

// Check if order ID and status are provided
if (!isset($data->id) || !isset($data->status) || 
    !in_array($data->status, ['pending', 'completed', 'cancelled'])) {
    echo json_encode([
        'message' => 'Missing required fields or invalid status'
    ]);
    exit();
}

// Set order properties
$order->id = $data->id;
$order->status = $data->status;

// Update order status
if ($order->update_status()) {
    echo json_encode([
        'message' => 'Order status updated successfully'
    ]);
} else {
    echo json_encode([
        'message' => 'Order status update failed'
    ]);
}
?>
