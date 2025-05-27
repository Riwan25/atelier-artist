<?php
/**
 * Authentication middleware
 * This file should be included at the beginning of API files that require authentication
 */

// Include JWT helper functions
require_once __DIR__ . '/../helpers/jwt_helper.php';

// Extract token from Authorization header
function getBearerToken() {
    $headers = null;
    
    if (isset($_SERVER['Authorization'])) {
        $headers = trim($_SERVER["Authorization"]);
    } else if (isset($_SERVER['HTTP_AUTHORIZATION'])) { // Nginx or fast CGI
        $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
    } elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        // Server-side fix for bug in old Android versions (a nice side-effect of this fix means we don't care about capitalization for Authorization)
        $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
        if (isset($requestHeaders['Authorization'])) {
            $headers = trim($requestHeaders['Authorization']);
        }
    }
    
    // Get the token from header
    if (!empty($headers) && preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
        return $matches[1];
    }
    
    return null;
}

// Check if the user is authenticated via JWT token
function isAuthenticated() {
    $token = getBearerToken();
    if (!$token) {
        return false;
    }
    
    $payload = validateJWT($token);
    return ($payload !== false && isset($payload['user_id']));
}

// Function to require authentication or return error
function requireAuth() {
    if (!isAuthenticated()) {
        // Set response code - 401 Unauthorized
        http_response_code(401);
        
        // Tell the user they are not authorized
        echo json_encode(array("message" => "Unauthorized. Please log in."));
        exit;
    }
    
    return true;
}

// Function to get the current authenticated user ID
function getCurrentUserId() {
    $token = getBearerToken();
    if (!$token) {
        return null;
    }
    
    $payload = validateJWT($token);
    if ($payload && isset($payload['user_id'])) {
        return $payload['user_id'];
    }
    
    return null;
}

// Function to get the JWT payload
function getJWTPayload() {
    $token = getBearerToken();
    if (!$token) {
        return null;
    }
    
    return validateJWT($token);
}

// Function to get current user data
function getCurrentUser($db) {
    $userId = getCurrentUserId();
    // Log user data for debugging
    $logFile = '../../logs/order_log.txt';
    $timestamp = date('Y-m-d H:i:s');
    $logData = $timestamp . " - User ID: " . ($userId ? $userId : 'no user id') . 
            " - IP: " . $_SERVER['REMOTE_ADDR'] . "\n";
    file_put_contents($logFile, $logData, FILE_APPEND);
    if (!$userId) {
        return null;
    }
    
    require_once __DIR__ . '/../models/User.php';
    
    $user = new User($db);
    $user->id = $userId;
    
    if ($user->getById()) {
        return $user;
    }
    
    return null;
}

/**
 * Function to require admin privileges
 * This function will check if the current user is authenticated and has admin role
 * If not, it will return 403 Forbidden and exit
 * 
 * @param PDO $db Database connection
 * @return User The authenticated admin user
 */
function requireAdmin($db) {
    requireAuth();
    
    $user = getCurrentUser($db);
    if (!$user || $user->role !== 'admin') {
        http_response_code(403);
        echo json_encode(['message' => 'Forbidden. Admin access required.']);
        exit();
    }
    
    return $user;
}