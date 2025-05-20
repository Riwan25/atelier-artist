<?php
// Include CORS helper
require_once '../helpers/cors_helper.php';

// Set CORS headers and handle preflight requests
handleCorsPreflightRequest();

// Set response content type
header('Content-Type: application/json');

// Include database and user model
include_once '../../config/config.php';
include_once '../models/User.php';
include_once '../middleware/auth.php';

// Require authentication
requireAuth();

// Get database connection
$database = getDbConnection();

// Get current user
$user = getCurrentUser($database);

if ($user) {
    // Set response code - 200 OK
    http_response_code(200);
    
    // Return user data
    echo json_encode(array(
        "id" => $user->id,
        "email" => $user->email,
        "created_at" => $user->created_at
    ));
} else {
    // Set response code - 404 Not found
    http_response_code(404);
    
    // Tell the user that the user was not found
    echo json_encode(array("message" => "User not found."));
}