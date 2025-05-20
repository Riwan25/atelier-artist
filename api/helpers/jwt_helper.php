<?php
/**
 * JWT Helper Functions
 * This file contains utility functions for working with JWT tokens
 */

// Include JWT configuration
require_once __DIR__ . '/../../config/jwt_config.php';

/**
 * Generate a JWT token
 * @param array $payload The data to include in the token
 * @return string The JWT token
 */
function generateJWT($payload) {
    $issuedAt = time();
    $expiresAt = $issuedAt + JWT_EXPIRY;
    
    // Token header
    $header = [
        'alg' => JWT_ALGORITHM,
        'typ' => 'JWT'
    ];
    
    // Token payload
    $tokenPayload = array_merge(
        [
            'iat' => $issuedAt,      // Issued at
            'exp' => $expiresAt,     // Expires at
            'iss' => JWT_ISSUER,     // Issuer
            'aud' => JWT_AUDIENCE,   // Audience
        ],
        $payload
    );
    
    // Encode Header
    $base64UrlHeader = base64UrlEncode(json_encode($header));
    
    // Encode Payload
    $base64UrlPayload = base64UrlEncode(json_encode($tokenPayload));
    
    // Create Signature Hash
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
    
    // Encode Signature to Base64Url String
    $base64UrlSignature = base64UrlEncode($signature);
    
    // Create JWT
    $jwt = $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    
    return $jwt;
}

/**
 * Validate and decode a JWT token
 * @param string $token The JWT token to validate
 * @return array|false The decoded payload if valid, false if invalid
 */
function validateJWT($token) {
    // Split token parts
    $tokenParts = explode('.', $token);
    
    // Check if token has three parts
    if (count($tokenParts) != 3) {
        return false;
    }
    
    $header = base64UrlDecode($tokenParts[0]);
    $payload = base64UrlDecode($tokenParts[1]);
    $signature = $tokenParts[2];
    
    // Verify signature
    $base64UrlHeader = $tokenParts[0];
    $base64UrlPayload = $tokenParts[1];
    $expectedSignature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
    $expectedBase64UrlSignature = base64UrlEncode($expectedSignature);
    
    if ($signature !== $expectedBase64UrlSignature) {
        return false;
    }
    
    // Decode payload
    $decodedPayload = json_decode($payload, true);
    
    // Check if token is expired
    if (isset($decodedPayload['exp']) && $decodedPayload['exp'] < time()) {
        return false;
    }
    
    return $decodedPayload;
}

/**
 * Base64Url encode
 * @param string $data The data to encode
 * @return string The encoded data
 */
function base64UrlEncode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

/**
 * Base64Url decode
 * @param string $data The data to decode
 * @return string The decoded data
 */
function base64UrlDecode($data) {
    $padding = strlen($data) % 4;
    if ($padding > 0) {
        $data .= str_repeat('=', 4 - $padding);
    }
    return base64_decode(strtr($data, '-_', '+/'));
}
