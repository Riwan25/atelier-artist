<?php
// Include CORS helper
require_once '../helpers/cors_helper.php';

// Set CORS headers and handle preflight requests
handleCorsPreflightRequest();

// Set response content type
header('Content-Type: application/json');

// Include database and required files
include_once '../../config/config.php';

// Get database connection
$database = getDbConnection();

try {
    // Build the SQL query
    $query = "SELECT * FROM artists ORDER BY name ASC";
    
    // Prepare the statement
    $stmt = $database->prepare($query);
    
    // Execute the query
    $stmt->execute();
    
    // Get row count
    $num = $stmt->rowCount();
    
    // Check if any artists found
    if ($num > 0) {
        // Artists array
        $artists_arr = array();
        $artists_arr['artists'] = array();
        
        // Retrieve and add to array
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            
            $artist_item = array(
                'id' => $id,
                'name' => $name,
                'description' => $description,
                'bio_image' => $bio_image,
                'icon_image' => $icon_image,
                'spotify_id' => $spotify_id
            );
            
            array_push($artists_arr['artists'], $artist_item);
        }
        
        // Set response code - 200 OK
        http_response_code(200);
        
        // Return data
        echo json_encode($artists_arr);
    } else {
        // No artists found
        http_response_code(200);
        
        // Show empty result
        echo json_encode(
            array('artists' => array())
        );
    }
} catch(PDOException $e) {
    // Set response code - 500 Internal Server Error
    http_response_code(500);
    
    // Display error message
    echo json_encode(
        array('message' => 'Database Error: ' . $e->getMessage())
    );
}
