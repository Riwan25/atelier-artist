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
$track_id = isset($_GET['id']) ? $_GET['id'] : null;

if (!$track_id) {
    http_response_code(400);
    echo json_encode(['message' => 'Missing track ID']);
    exit();
}

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate required fields
if (
    !empty($data->artist_id) &&
    !empty($data->name)
) {
    try {
        // Get artist name
        $stmt = $database->prepare("SELECT name FROM artists WHERE id = :artist_id");
        $stmt->bindParam(':artist_id', $data->artist_id);
        $stmt->execute();
        $artist = $stmt->fetch(PDO::FETCH_ASSOC);
        $artist_name = $artist ? $artist['name'] : '';
        
        // Get album name if album_id is provided
        $album_name = '';
        if (!empty($data->album_id)) {
            $stmt = $database->prepare("SELECT name FROM albums WHERE id = :album_id");
            $stmt->bindParam(':album_id', $data->album_id);
            $stmt->execute();
            $album = $stmt->fetch(PDO::FETCH_ASSOC);
            $album_name = $album ? $album['name'] : '';
        }

        // SQL query
        $query = "UPDATE tracks SET
                artist_id = :artist_id,
                artister_name = :artist_name,
                album_id = :album_id,
                album_name = :album_name,
                name = :name,
                description = :description,
                release_date = :release_date,
                feat = :feat,
                spotify_id = :spotify_id,
                award_id = :award_id,
                award_number = :award_number
            WHERE id = :id";
        
        // Prepare statement
        $stmt = $database->prepare($query);
          // Clean and bind data
        $artist_id = htmlspecialchars(strip_tags($data->artist_id));
        $name = htmlspecialchars(strip_tags($data->name));
        $album_id = !empty($data->album_id) ? htmlspecialchars(strip_tags($data->album_id)) : null;
        $description = !empty($data->description) ? htmlspecialchars(strip_tags($data->description)) : null;
        $release_date = !empty($data->release_date) ? $data->release_date : null;
        // Handle feat as a JSON array
        $feat = !empty($data->feat) ? json_encode($data->feat) : null;
        $spotify_id = !empty($data->spotify_id) ? htmlspecialchars(strip_tags($data->spotify_id)) : null;
        $award_id = !empty($data->award_id) ? htmlspecialchars(strip_tags($data->award_id)) : null;
        $award_number = !empty($data->award_number) ? htmlspecialchars(strip_tags($data->award_number)) : null;
        
        // Bind data
        $stmt->bindParam(':id', $track_id);
        $stmt->bindParam(':artist_id', $artist_id);
        $stmt->bindParam(':artist_name', $artist_name);
        $stmt->bindParam(':album_id', $album_id);
        $stmt->bindParam(':album_name', $album_name);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':release_date', $release_date);
        $stmt->bindParam(':feat', $feat);
        $stmt->bindParam(':spotify_id', $spotify_id);
        $stmt->bindParam(':award_id', $award_id);
        $stmt->bindParam(':award_number', $award_number);
        
        // Execute query
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode([
                'message' => 'Track updated successfully'
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Unable to update track']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode(['message' => 'Unable to update track. Data is incomplete.']);
}
