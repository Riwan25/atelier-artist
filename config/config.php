<?php
// Configuration de la base de données
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', 'root');
define('DB_NAME', 'atelier-artiste');

// URL de base de l'application
define('BASE_URL', '/atelier/atelier-artiste');

// Connexion à la base de données
function getDbConnection() {
    $conn = new PDO('mysql:host='.DB_HOST.';dbname='.DB_NAME, DB_USER, DB_PASS);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    return $conn;
}