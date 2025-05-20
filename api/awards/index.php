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
    $query = "SELECT * FROM awards ORDER BY name ASC";
    
    // Prepare the statement
    $stmt = $database->prepare($query);
    
    // Execute the query
    $stmt->execute();
    
    // Get row count
    $num = $stmt->rowCount();
    
    // Check if any awards found
    if ($num > 0) {
        // Awards array
        $awards_arr = array();
        $awards_arr['awards'] = array();
        
        // Retrieve and add to array
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            
            $award_item = array(
                'id' => $id,
                'name' => $name,
                'created_at' => $created_at
            );
            
            array_push($awards_arr['awards'], $award_item);
        }
        
        // Set response code - 200 OK
        http_response_code(200);
        
        // Return data
        echo json_encode($awards_arr);
    } else {
        // No awards found
        http_response_code(200);
        
        // Show empty result
        echo json_encode(
            array('awards' => array())
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
