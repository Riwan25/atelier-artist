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

// Get database connection
$database = getDbConnection();
$user = new User($database);

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Make sure data is not empty
if(
    !empty($data->email) && 
    !empty($data->password)
) {
    // Set user property values
    $user->email = $data->email;
    $user->password = $data->password;
    
    // Check if email already exists
    if($user->getByEmail()) {
        // User already exists
        http_response_code(400);
        echo json_encode(array("message" => "User already exists with this email."));
    } else {
        // Create the user
        if($user->create()) {
            // Set response code - 201 created
            http_response_code(201);
            
            // Send success response
            echo json_encode(array("message" => "User was created."));
        } else {
            // Set response code - 503 service unavailable
            http_response_code(503);
            
            // Send error response
            echo json_encode(array("message" => "Unable to create user."));
        }
    }
} else {
    // Set response code - 400 bad request
    http_response_code(400);
    
    // Tell the user data is incomplete
    echo json_encode(array("message" => "Unable to create user. Data is incomplete."));
}