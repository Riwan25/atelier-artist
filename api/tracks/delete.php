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

// Check admin permissions
$user = requireAdmin($database);

// Get ID from URL
$track_id = isset($_GET['id']) ? $_GET['id'] : null;

if (!$track_id) {
    http_response_code(400);
    echo json_encode(['message' => 'Missing track ID']);
    exit();
}

try {
    // SQL query to delete track
    $query = "DELETE FROM tracks WHERE id = :id";
    
    // Prepare statement
    $stmt = $database->prepare($query);
    
    // Bind ID
    $stmt->bindParam(':id', $track_id);
    
    // Execute query
    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode([
            'message' => 'Track deleted successfully'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'Unable to delete track']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
