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

// Make sure email and password are not empty
if(!empty($data->email) && !empty($data->password)) {
    // Set user email
    $user->email = $data->email;
    
    // Get user by email
    if($user->getByEmail()) {
        // Check if password matches
        if(password_verify($data->password, $user->password)) {
            // Include JWT helper
            require_once '../helpers/jwt_helper.php';
            
            // Generate JWT token
            $payload = [
                'user_id' => $user->id,
                'email' => $user->email,
                'role' => $user->role
            ];
            
            $token = generateJWT($payload);
            
            // Set response code - 200 OK
            http_response_code(200);
            // Return user data and token
            echo json_encode(array(
                "message" => "Login successful.",
                "token" => $token,
                "user" => array(
                    "id" => $user->id,
                    "email" => $user->email,
                    "role" => $user->role
                )
            ));
        } else {
            // Password doesn't match
            http_response_code(401);
            echo json_encode(array("message" => "Login failed. Incorrect password."));
        }
    } else {
        // User doesn't exist
        http_response_code(401);
        echo json_encode(array("message" => "Login failed. User not found."));
    }
} else {
    // Data is incomplete
    http_response_code(400);
    echo json_encode(array("message" => "Login failed. Data is incomplete."));
}