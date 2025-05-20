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
    $query = "SELECT * FROM tracks";
    
    // Check if artist is specified
    $artist_name = isset($_GET['artist']) ? $_GET['artist'] : null;
    if ($artist_name) {
        $query .= " WHERE artister_name = :artist_name";
    }
    
    // Add sorting
    $query .= " ORDER BY name ASC";
    
    // Prepare the statement
    $stmt = $database->prepare($query);
    
    // Bind parameters if artist specified
    if ($artist_name) {
        $stmt->bindParam(':artist_name', $artist_name);
    }
    
    // Execute the query
    $stmt->execute();
    
    // Get row count
    $num = $stmt->rowCount();
    
    // Check if any tracks found
    if ($num > 0) {
        // Tracks array
        $tracks_arr = array();
        $tracks_arr['tracks'] = array();
        
        // Retrieve and add to array
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            
            $track_item = array(
                'id' => $id,
                'artist_id' => $artist_id,
                'artister_name' => $artister_name,
                'album_id' => $album_id,
                'album_name' => $album_name,
                'name' => $name,
                'description' => $description,
                'release_date' => $release_date,
                'feat' => $feat,
                'spotify_id' => $spotify_id,
                'award_id' => $award_id,
                'award_number' => $award_number
            );
            
            array_push($tracks_arr['tracks'], $track_item);
        }
        
        // Set response code - 200 OK
        http_response_code(200);
        
        // Return data
        echo json_encode($tracks_arr);
    } else {
        // No tracks found
        http_response_code(200);
        
        // Show empty result
        echo json_encode(
            array('tracks' => array())
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
