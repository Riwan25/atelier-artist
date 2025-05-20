<?php
require_once 'config.php';

try {
    // Connect to MySQL (without database)
    $conn = new PDO('mysql:host='.DB_HOST, DB_USER, DB_PASS);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create database if it doesn't exist
    $conn->exec("CREATE DATABASE IF NOT EXISTS `".DB_NAME."` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    
    // Switch to the database
    $conn->exec("USE `".DB_NAME."`");
      // Create users table
    $conn->exec("CREATE TABLE IF NOT EXISTS `users` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `email` varchar(100) NOT NULL UNIQUE,
        `password` varchar(255) NOT NULL,
        `role` enum('user','admin') NOT NULL DEFAULT 'user',
        `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    
    // Create awards table
    $conn->exec("CREATE TABLE IF NOT EXISTS `awards` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `name` varchar(100) NOT NULL,
        `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    
    // Create artists table
    $conn->exec("CREATE TABLE IF NOT EXISTS `artists` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `name` varchar(100) NOT NULL,
        `description` text,
        `bio_image` varchar(255),
        `icon_image` varchar(255),
        `spotify_id` varchar(100),
        `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
      // Create albums table
    $conn->exec("CREATE TABLE IF NOT EXISTS `albums` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `artist_id` int(11) NOT NULL,
        `artist_name` varchar(100) NOT NULL,
        `name` varchar(100) NOT NULL,
        `description` text,
        `type` varchar(50),
        `release_date` date,
        `spotify_id` varchar(100),
        `award_id` int(11),
        `award_number` int(11),
        `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        `isSelling` tinyint(1) NOT NULL DEFAULT 0,
        `cost` decimal(10,2) NOT NULL DEFAULT 0.00,
        PRIMARY KEY (`id`),
        FOREIGN KEY (`artist_id`) REFERENCES `artists`(`id`) ON DELETE CASCADE,
        FOREIGN KEY (`award_id`) REFERENCES `awards`(`id`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");    // Create tracks table
    $conn->exec("CREATE TABLE IF NOT EXISTS `tracks` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `artist_id` int(11) NOT NULL,
        `artister_name` varchar(100) NOT NULL,
        `album_id` int(11),
        `album_name` varchar(100) NOT NULL,
        `name` varchar(100) NOT NULL,
        `description` text,
        `release_date` date,
        `feat` text,
        `spotify_id` varchar(100),
        `award_id` int(11),
        `award_number` int(11),
        `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`),
        FOREIGN KEY (`artist_id`) REFERENCES `artists`(`id`) ON DELETE CASCADE,
        FOREIGN KEY (`album_id`) REFERENCES `albums`(`id`) ON DELETE SET NULL,
        FOREIGN KEY (`award_id`) REFERENCES `awards`(`id`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    
    // Create orders table
    $conn->exec("CREATE TABLE IF NOT EXISTS `orders` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `user_id` int(11) NOT NULL,
        `total_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
        `status` enum('pending','completed','cancelled') NOT NULL DEFAULT 'pending',
        `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`),
        FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    
    // Create order items table
    $conn->exec("CREATE TABLE IF NOT EXISTS `order_items` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `order_id` int(11) NOT NULL,
        `album_id` int(11) NOT NULL,
        `quantity` int(11) NOT NULL DEFAULT 1,
        `unit_price` decimal(10,2) NOT NULL DEFAULT 0.00,
        PRIMARY KEY (`id`),
        FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
        FOREIGN KEY (`album_id`) REFERENCES `albums`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    
    echo "Setup completed successfully!";
} catch(PDOException $e) {
    echo "Setup failed: " . $e->getMessage();
}

// Import data from data.json file
$dataFilePath = __DIR__ . '/data.json';
if (file_exists($dataFilePath)) {
    $jsonData = file_get_contents($dataFilePath);
    $data = json_decode($jsonData, true);
    
    if ($data) {
        // Insert awards
        if (!empty($data['Awards'])) {
            foreach ($data['Awards'] as $award) {
                // Check if award already exists
                $stmt = $conn->prepare("SELECT id FROM awards WHERE id = ?");
                $stmt->execute([$award['id']]);
                $existingAward = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if (!$existingAward) {
                    // Insert new award
                    $stmt = $conn->prepare("INSERT INTO awards (id, name) VALUES (?, ?)");
                    $stmt->execute([
                        $award['id'],
                        $award['name']
                    ]);
                }
            }
        }
        
        // Insert artists
        if (!empty($data['artists'])) {
            foreach ($data['artists'] as $artist) {
                // Check if artist already exists
                $stmt = $conn->prepare("SELECT id FROM artists WHERE name = ?");
                $stmt->execute([$artist['name']]);
                $existingArtist = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($existingArtist) {
                    $artistId = $existingArtist['id'];
                } else {
                    // Insert new artist
                    $stmt = $conn->prepare("INSERT INTO artists (name, description, bio_image, icon_image, spotify_id) 
                                        VALUES (?, ?, ?, ?, ?)");
                    $stmt->execute([
                        $artist['name'], 
                        $artist['description'] ?? null, 
                        $artist['bio_image'] ?? null, 
                        $artist['icon_image'] ?? null,
                        $artist['spotify_id'] ?? null
                    ]);
                    $artistId = $conn->lastInsertId();
                }
                
                // Insert albums for this artist
                if (!empty($data['albums'])) {
                    foreach ($data['albums'] as $album) {
                        if ($album['artist_name'] === $artist['name']) {
                            // Check if album already exists
                            $stmt = $conn->prepare("SELECT id FROM albums WHERE artist_id = ? AND name = ?");
                            $stmt->execute([$artistId, $album['name']]);
                            $existingAlbum = $stmt->fetch(PDO::FETCH_ASSOC);
                            
                            if ($existingAlbum) {
                                $albumId = $existingAlbum['id'];
                            } else {
                                // Insert new album
                                $stmt = $conn->prepare("INSERT INTO albums (artist_id, artist_name, name, description, type, release_date, spotify_id, award_id, award_number) 
                                                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
                                $stmt->execute([
                                    $artistId, 
                                    $album['artist_name'],
                                    $album['name'], 
                                    $album['description'] ?? null, 
                                    $album['type'] ?? null,
                                    $album['release_date'] ?? null,
                                    $album['spotify_id'] ?? null,
                                    $album['award_id'] ?? null,
                                    $album['award_number'] ?? null
                                ]);
                                $albumId = $conn->lastInsertId();
                            }
                            
                            // Insert tracks for this album
                            if (!empty($data['tracks'])) {
                                foreach ($data['tracks'] as $track) {
                                    if ($track['album_name'] === $album['name'] && $track['artister_name'] === $artist['name']) {
                                        // Check if track already exists
                                        $stmt = $conn->prepare("SELECT id FROM tracks WHERE artist_id = ? AND album_id = ? AND name = ?");
                                        $stmt->execute([$artistId, $albumId, $track['name']]);
                                        $existingTrack = $stmt->fetch(PDO::FETCH_ASSOC);
                                        
                                        if (!$existingTrack) {
                                            // Convert feat array to JSON string
                                            $featJson = !empty($track['feat']) ? json_encode($track['feat']) : null;
                                              // Insert new track
                                            $stmt = $conn->prepare("INSERT INTO tracks (artist_id, artister_name, album_id, album_name, name, description, release_date, feat, spotify_id, award_id, award_number) 
                                                              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                                            $stmt->execute([
                                                $artistId,
                                                $track['artister_name'],
                                                $albumId,
                                                $track['album_name'],
                                                $track['name'],
                                                $track['description'] ?? null,
                                                $track['release_date'] ?? null,
                                                $featJson,
                                                $track['spotify_id'] ?? null,
                                                $track['award_id'] ?? null,
                                                $track['award_number'] ?? null
                                            ]);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        echo "<br>Data from data.json has been imported successfully!";
    } else {
        echo "<br>Failed to decode data from data.json";
    }
} else {
    echo "<br>data.json file not found";
}
?>
