<?php
// Include CORS helper
require_once '../helpers/cors_helper.php';

// Set CORS headers and handle preflight requests
handleCorsPreflightRequest();

// Set response content type
header('Content-Type: application/json');

// Include database and required files
include_once '../../config/config.php';
include_once '../middleware/auth.php';

// Get database connection
$database = getDbConnection();

// Check admin permissions
$user = requireAdmin($database);

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate required fields
if (
    !empty($data->artist_id) &&
    !empty($data->name)
) {
    try {        // SQL query
        // First get the artist name
        $artistQuery = "SELECT name FROM artists WHERE id = :artist_id";
        $artistStmt = $database->prepare($artistQuery);
        $artistStmt->bindParam(':artist_id', $data->artist_id);
        $artistStmt->execute();
        $artist = $artistStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$artist) {
            http_response_code(404);
            echo json_encode(['message' => 'Artist not found']);
            exit();
        }
        
        $artistName = $artist['name'];
          // SQL query for album insertion
        $query = "INSERT INTO albums (
                artist_id, 
                artist_name,
                name, 
                description, 
                type, 
                release_date, 
                spotify_id, 
                award_id, 
                award_number,
                isSelling,
                cost
            ) VALUES (
                :artist_id, 
                :artist_name,
                :name, 
                :description, 
                :type, 
                :release_date, 
                :spotify_id, 
                :award_id, 
                :award_number,
                :isSelling,
                :cost
            )";
        
        // Prepare statement
        $stmt = $database->prepare($query);
          // Clean and bind data
        $artist_id = htmlspecialchars(strip_tags($data->artist_id));
        $name = htmlspecialchars(strip_tags($data->name));
        $description = !empty($data->description) ? htmlspecialchars(strip_tags($data->description)) : null;
        $type = !empty($data->type) ? htmlspecialchars(strip_tags($data->type)) : null;
        $release_date = !empty($data->release_date) ? $data->release_date : null;
        $spotify_id = !empty($data->spotify_id) ? htmlspecialchars(strip_tags($data->spotify_id)) : null;
        $award_id = !empty($data->award_id) ? htmlspecialchars(strip_tags($data->award_id)) : null;
        $award_number = !empty($data->award_number) ? htmlspecialchars(strip_tags($data->award_number)) : null;
        $isSelling = isset($data->isSelling) ? (int)$data->isSelling : 0;
        $cost = isset($data->cost) ? (float)$data->cost : 0.00;        // Bind data
        $stmt->bindParam(':artist_id', $artist_id);
        $stmt->bindParam(':artist_name', $artistName);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':type', $type);
        $stmt->bindParam(':release_date', $release_date);
        $stmt->bindParam(':spotify_id', $spotify_id);
        $stmt->bindParam(':award_id', $award_id);
        $stmt->bindParam(':award_number', $award_number);
        $stmt->bindParam(':isSelling', $isSelling);
        $stmt->bindParam(':cost', $cost);
        
        // Execute query
        if ($stmt->execute()) {
            $album_id = $database->lastInsertId();
            
            http_response_code(201);
            echo json_encode([
                'message' => 'Album created successfully',
                'id' => $album_id
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Unable to create album']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode(['message' => 'Unable to create album. Data is incomplete.']);
}
