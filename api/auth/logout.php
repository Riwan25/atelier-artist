<?php
// Include CORS helper
require_once '../helpers/cors_helper.php';

// Set CORS headers and handle preflight requests
handleCorsPreflightRequest();

// Set response content type
header('Content-Type: application/json');

// Include authentication middleware
require_once '../middleware/auth.php';

// With JWT, the token is managed client-side, so the server doesn't need to do anything
// special for logout. The client should simply delete the token.

// However, we can send back a successful response to confirm the action

// Set response code - 200 OK
http_response_code(200);

// Send success message
echo json_encode(array(
    "message" => "Logged out successfully. Please remove the token from your local storage."
));