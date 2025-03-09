<?php
session_start();
require 'config.php'; // Database connection & CORS headers applied

$conn = getDatabaseConnection(); // Use centralized function

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $guest_id = $_SESSION['guestID'];
    $attending = $_POST["attending"] ?? '';
    $guest_count = $_POST["guest_count"] ?? '';
    $message = $_POST["message"] ?? '';

    // Validate attending (should be 0 or 1)
    if (!in_array($attending, ['0', '1'])) {
        echo json_encode(["success" => false, "message" => "Invalid value for attending."]);
        exit;
    }

    // Validate guest_count (should be a non-negative integer)
    if (!filter_var($guest_count, FILTER_VALIDATE_INT, ["options" => ["min_range" => 0]])) {
        echo json_encode(["success" => false, "message" => "Invalid guest count."]);
        exit;
    }

    // Sanitize message (allow basic HTML)
    $message = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

    // Check if the guest has already RSVP'd
    $stmt = $conn->prepare("SELECT * FROM rsvps WHERE guest_id = ?");
    $stmt->bind_param("s", $guest_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        echo json_encode(["message" => "You have already RSVP'd. No modifications allowed."]);
    } else {
        $stmt = $conn->prepare("INSERT INTO rsvps (guest_id, attending, guest_count, message) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("siis", $guest_id, $attending, $guest_count, $message);

        if ($stmt->execute()) {
            $_SESSION['rsvpStatus'] = "confirmed";
            echo json_encode(["success" => true, "message" => "RSVP Submitted Successfully!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
        }
    }

    $stmt->close();
}

$conn->close();
?>
