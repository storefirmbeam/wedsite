<?php
$servername = "sql100.infinityfree.com";  // Example: sql.freemysqlhosting.net
$username = "if0_38470225"; // Example: admin123
$password = "Erode&patty%tuna6";
$dbname = "if0_38470225_wedding_db";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
