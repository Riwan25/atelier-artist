<?php
/**
 * CORS Helper
 * This file contains functions to set up proper CORS headers for API endpoints
 */

/**
 * Set CORS headers for all responses
 */
function setCorsHeaders() {
    // Allow requests from your frontend origin
    header('Access-Control-Allow-Origin: http://localhost:5173');
    
    // Allow credentials (cookies, authorization headers, etc.)
    header('Access-Control-Allow-Credentials: true');
    
    // Allow specific headers including Authorization for JWT
    header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // Allow specific methods
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
}

/**
 * Handle preflight OPTIONS requests
 * This should be called at the beginning of each API file
 */
function handleCorsPreflightRequest() {
    setCorsHeaders();
    
    // If this is a preflight OPTIONS request, respond with 200 OK and exit
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}
