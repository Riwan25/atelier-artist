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

// Get ID from URL
$album_id = isset($_GET['id']) ? $_GET['id'] : null;

if (!$album_id) {
    http_response_code(400);
    echo json_encode(['message' => 'Missing album ID']);
    exit();
}

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate required fields
if (
    !empty($data->artist_id) &&
    !empty($data->name)
) {
    try {        // SQL query
        $query = "UPDATE albums SET
                artist_id = :artist_id,
                artist_name = (SELECT name FROM artists WHERE id = :artist_id_for_name),
                name = :name,
                description = :description,
                type = :type,
                release_date = :release_date,
                spotify_id = :spotify_id,
                award_id = :award_id,
                award_number = :award_number,
                isSelling = :isSelling,
                cost = :cost
            WHERE id = :id";
        
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
        $cost = isset($data->cost) ? (float)$data->cost : 0.00;
        
        // Bind data
        $stmt->bindParam(':id', $album_id);
        $stmt->bindParam(':artist_id', $artist_id);
        $stmt->bindParam(':artist_id_for_name', $artist_id);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':description', $description);        $stmt->bindParam(':type', $type);
        $stmt->bindParam(':release_date', $release_date);
        $stmt->bindParam(':spotify_id', $spotify_id);
        $stmt->bindParam(':award_id', $award_id);
        $stmt->bindParam(':award_number', $award_number);
        $stmt->bindParam(':isSelling', $isSelling);
        $stmt->bindParam(':cost', $cost);
        
        // Execute query
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode([
                'message' => 'Album updated successfully'
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Unable to update album']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode(['message' => 'Unable to update album. Data is incomplete.']);
}
