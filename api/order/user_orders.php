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
$order->user_id = $userData->id;

// Get orders
$result = $order->getUserOrders();
$num = $result->rowCount();

// Check if any orders
if ($num > 0) {
    // Orders array
    $orders_arr = array();
    $orders_arr['data'] = array();

    while($row = $result->fetch(PDO::FETCH_ASSOC)) {
        extract($row);

        $order_item = array(
            'id' => $id,
            'total_amount' => $total_amount,
            'status' => $status,
            'created_at' => $created_at
        );

        // Get order items
        $temp_order = new Order($db);
        $temp_order->id = $id;
        $temp_order->read_single();
        $order_item['items'] = $temp_order->items;

        // Push to "data"
        array_push($orders_arr['data'], $order_item);
    }

    // Turn to JSON & output
    echo json_encode($orders_arr);
} else {
    // No Orders
    echo json_encode(
        array('message' => 'No orders found')
    );
}
?>
