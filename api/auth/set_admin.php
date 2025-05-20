<?php
// This file is for testing purposes only - it allows setting a user as admin
// In production, you would have a proper admin management interface

// Include CORS helper
require_once '../helpers/cors_helper.php';

// Set CORS headers and handle preflight requests
handleCorsPreflightRequest();

// Set response content type
header('Content-Type: application/json');

// Include database and user model
include_once '../../config/config.php';

// Get database connection
$database = getDbConnection();

// Check if email parameter is provided
$email = isset($_GET['email']) ? $_GET['email'] : null;

if (!$email) {
    http_response_code(400);
    echo json_encode(['message' => 'Email parameter is required']);
    exit();
}

try {
    // Update user role to admin
    $query = "UPDATE users SET role = 'admin' WHERE email = :email";
    $stmt = $database->prepare($query);
    $stmt->bindParam(':email', $email);
    
    if ($stmt->execute()) {
        $rowCount = $stmt->rowCount();
        
        if ($rowCount > 0) {
            http_response_code(200);
            echo json_encode(['message' => "User $email has been set as admin"]);
        } else {
            http_response_code(404);
            echo json_encode(['message' => "User with email $email not found"]);
        }
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'Failed to update user role']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Database error: ' . $e->getMessage()]);
}
