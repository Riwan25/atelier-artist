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

$user = getCurrentUser($database);

// Get posted data
$data = json_decode(file_get_contents("php://input"));

$items = isset($data->items) ? $data->items : [];
$database->beginTransaction();


foreach ($items as $item) {
    if (empty($item->id) || empty($item->quantity)) {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid item data']);
        exit();
    }
    $albumQuery = "SELECT id, artist_id, name, artist_name, cost, isSelling FROM albums WHERE id = :album_id";
    $albumStmt = $database->prepare($albumQuery);
    $albumStmt->bindParam(':album_id', $item->id);
    $albumStmt->execute();

    $album = $albumStmt->fetch(PDO::FETCH_ASSOC);
    // Validate each item
    if (!$album) {
        http_response_code(404);
        echo json_encode(['message' => 'Album not found for ID: ' . $item->id]);
        exit();
    }

    if (!$album['isSelling'] || $album['cost'] <= 0) {
        http_response_code(400);
        echo json_encode(['message' => 'Album with ID ' . $item->id . ' is not available for purchase']);
        exit();
    }
}

try {
    // Calculate total order amount
    $totalAmount = 0;
    foreach ($items as $item) {
        $albumQuery = "SELECT cost FROM albums WHERE id = :album_id";
        $albumStmt = $database->prepare($albumQuery);
        $albumStmt->bindParam(':album_id', $item->id);
        $albumStmt->execute();
        
        $album = $albumStmt->fetch(PDO::FETCH_ASSOC);
        $totalAmount += $album['cost'] * $item->quantity;
    }
      // Create order record
    $createOrderQuery = "INSERT INTO orders (user_id, total_amount, status) VALUES (:user_id, :total_amount, :status)";
    $createOrderStmt = $database->prepare($createOrderQuery);
    $createOrderStmt->bindParam(':user_id', $user->id);
    $createOrderStmt->bindParam(':total_amount', $totalAmount);
    $status = 'pending';
    $createOrderStmt->bindParam(':status', $status);
    
    if (!$createOrderStmt->execute()) {
        throw new Exception("Failed to create order");
    }
    
    $orderId = $database->lastInsertId();
    
    // Create order items records
    foreach ($items as $item) {
        $albumQuery = "SELECT cost FROM albums WHERE id = :album_id";
        $albumStmt = $database->prepare($albumQuery);
        $albumStmt->bindParam(':album_id', $item->id);
        $albumStmt->execute();
        
        $album = $albumStmt->fetch(PDO::FETCH_ASSOC);
        
        $createItemQuery = "INSERT INTO order_items (order_id, album_id, quantity, unit_price) 
                           VALUES (:order_id, :album_id, :quantity, :unit_price)";
        $createItemStmt = $database->prepare($createItemQuery);
        $createItemStmt->bindParam(':order_id', $orderId);
        $createItemStmt->bindParam(':album_id', $item->id);
        $createItemStmt->bindParam(':quantity', $item->quantity);
        $createItemStmt->bindParam(':unit_price', $album['cost']);
        
        if (!$createItemStmt->execute()) {
            throw new Exception("Failed to create order item");
        }
    }
      // Log the order creation
    $logDir = '../../logs/';
    $logFile = $logDir . 'order_log.txt';
    
    // Create logs directory if it doesn't exist
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $logMessage = date('Y-m-d H:i:s') . " - Order #" . $orderId . " created by User #" . $user->id . 
                  " with " . count($items) . " items for a total of $" . $totalAmount . "\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND);
    
    // Commit the transaction
    $database->commit();
      // Return success response with order details
    http_response_code(201); // Created
    echo json_encode([
        'message' => 'Order created successfully',
        'order' => [
            'id' => $orderId,
            'user_id' => $user->id,
            'total_amount' => $totalAmount,
            'status' => $status,
            'created_at' => date('Y-m-d H:i:s')
        ]
    ]);
    
} catch (Exception $e) {
    // Rollback the transaction on error
    $database->rollBack();
    
    // Return error response
    http_response_code(500);
    echo json_encode([
        'message' => 'Failed to create order',
        'error' => $e->getMessage()
    ]);
}
?>

