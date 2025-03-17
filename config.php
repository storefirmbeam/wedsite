<?php
session_start();

// Get the latest modified timestamp of CSS and JS files
$cssVersion = filemtime(__DIR__ . "/styles.css");
$jsVersion = filemtime(__DIR__ . "/scripts.js");

// Use the timestamp as the version number
$version = max($cssVersion, $jsVersion);

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Securely include the database credentials from outside public_html
require_once('/home/u115723261/domains/darbyandcole.site/secure_config/db_config.php');

$servername = DB_HOST;
$username = DB_USER;
$password = DB_PASS;
$dbname = DB_NAME;

// Function to establish and return a database connection
function getDatabaseConnection() {
    global $servername, $username, $password, $dbname;

    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        die(json_encode(["success" => false, "message" => "Database Connection Failed: " . $conn->connect_error]));
    }

    $conn->set_charset("utf8mb4"); // Set charset for security and compatibility
    return $conn;
}

// CORS Headers (Applied Globally)
// header("Access-Control-Allow-Origin: *");
// header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
// header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight request for CORS (This applies to all PHP scripts)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

?>
