<?php
// API endpoint to get all albums by an artist
require_once '../../config/config.php';
// Include CORS helper
require_once '../helpers/cors_helper.php';

// Set CORS headers and handle preflight requests
handleCorsPreflightRequest();

// Set response content type
header('Content-Type: application/json');

// Handle only GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'Only GET method is allowed']);
    exit;
}

// Get artist parameter from query string
$artistName = isset($_GET['artist']) ? $_GET['artist'] : null;
$albumId = isset($_GET['album_id']) ? $_GET['album_id'] : null;

try {
    $conn = getDbConnection();

    if ($albumId) {        // Query to get a specific album by ID
        $stmt = $conn->prepare("
            SELECT a.*, art.name as artist_name, art.id as artist_id
            FROM albums a
            JOIN artists art ON a.artist_id = art.id
            WHERE a.id = ?
        ");
        $stmt->execute([$albumId]);
        
        $album = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$album) {
            http_response_code(404);
            echo json_encode(['error' => 'Album not found']);
            exit;
        }
        
        // Get tracks for this album
        $trackStmt = $conn->prepare("
            SELECT * 
            FROM tracks 
            WHERE album_id = ? 
            ORDER BY id ASC
        ");
        $trackStmt->execute([$album['id']]);
        $tracks = [];
        
        while ($track = $trackStmt->fetch(PDO::FETCH_ASSOC)) {
            // Convert JSON feat string back to array
            if ($track['feat']) {
                $track['feat'] = json_decode($track['feat']);
            } else {
                $track['feat'] = [];
            }
            $tracks[] = $track;
        }
        
        $album['tracks'] = $tracks;
        $album['track_count'] = count($tracks);
        
        echo json_encode(['album' => $album]);
        exit;
    } else if ($artistName) {        // Query to get all albums for a specific artist
        // First get artist info
        $artistStmt = $conn->prepare("
            SELECT * FROM artists WHERE name = ?
        ");
        $artistStmt->execute([$artistName]);
        $artist = $artistStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$artist) {
            http_response_code(404);
            echo json_encode(['error' => 'Artist not found']);
            exit;
        }
        
        $stmt = $conn->prepare("
            SELECT a.*, art.name as artist_name, art.id as artist_id
            FROM albums a
            JOIN artists art ON a.artist_id = art.id
            WHERE art.name = ?
            ORDER BY a.release_date DESC
        ");
        $stmt->execute([$artistName]);
        
        $albums = [];
        while ($album = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Get tracks for this album
            $trackStmt = $conn->prepare("
                SELECT * 
                FROM tracks 
                WHERE album_id = ? 
                ORDER BY id ASC
            ");
            $trackStmt->execute([$album['id']]);
            $tracks = [];
            
            while ($track = $trackStmt->fetch(PDO::FETCH_ASSOC)) {
                // Convert JSON feat string back to array
                if ($track['feat']) {
                    $track['feat'] = json_decode($track['feat']);
                } else {
                    $track['feat'] = [];
                }
                $tracks[] = $track;
            }
            
            $album['tracks'] = $tracks;
            $album['track_count'] = count($tracks);
            $albums[] = $album;
        }
        
        if (empty($albums)) {
            http_response_code(404);
            echo json_encode(['error' => 'No albums found for this artist']);
        } else {
            // Add albums to the artist object
            $artist['albums'] = $albums;
            echo json_encode($artist);
        }
    } else {        // No artist specified, return all albums grouped by artist
        $stmt = $conn->prepare("
            SELECT a.*, art.name as artist_name, art.id as artist_id
            FROM albums a
            JOIN artists art ON a.artist_id = art.id
            ORDER BY art.name, a.release_date DESC
        ");
        $stmt->execute();
        
        $albums = [];
        while ($album = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Get tracks for this album
            $trackStmt = $conn->prepare("
                SELECT * 
                FROM tracks 
                WHERE album_id = ? 
                ORDER BY id ASC
            ");
            $trackStmt->execute([$album['id']]);
            $tracks = [];
            
            while ($track = $trackStmt->fetch(PDO::FETCH_ASSOC)) {
                // Convert JSON feat string back to array
                if ($track['feat']) {
                    $track['feat'] = json_decode($track['feat']);
                } else {
                    $track['feat'] = [];
                }
                $tracks[] = $track;
            }
            
            $album['tracks'] = $tracks;
            $album['track_count'] = count($tracks);
            $albums[] = $album;
        }
        
        echo json_encode(['albums' => $albums]);
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}