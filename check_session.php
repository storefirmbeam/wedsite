<?php
require_once 'config.php'; // This ensures the session starts correctly

header('Content-Type: application/json');

$response = [
    "guestID" => $_SESSION['guestID'] ?? null,
    "guestName" => $_SESSION['guestName'] ?? null,
    "rsvpStatus" => $_SESSION['rsvpStatus'] ?? null
];

echo json_encode($response);
?>