<?php
require_once 'config.php'; // Database connection & CORS headers applied

$conn = getDatabaseConnection(); // Use centralized function

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $guest_id = $_POST['guest_id'] ?? '';

    if (empty($guest_id)) {
        echo json_encode(["valid" => false, "message" => "Guest ID is required."]);
        exit;
    }

    // Validate guest_id (allow alphanumeric and special characters)
    if (!preg_match('/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};\'\\:"|,.<>\/?]+$/', $guest_id)) {
        echo json_encode(["valid" => false, "message" => "Invalid Guest ID format."]);
        exit;
    }

    $stmt = $conn->prepare("SELECT first_name, last_name FROM guests WHERE guest_id = ?");
    if ($stmt === false) {
        echo json_encode(["valid" => false, "message" => "Database error: " . $conn->error]);
        exit;
    }
    $stmt->bind_param("s", $guest_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $guest = $result->fetch_assoc();

        // Check if Guest ID exists in the rsvp table
        $rsvp_stmt = $conn->prepare("SELECT COUNT(*) as rsvp_count FROM rsvp WHERE guest_id = ?");
        $rsvp_stmt->bind_param("s", $guest_id);
        $rsvp_stmt->execute();
        $rsvp_result = $rsvp_stmt->get_result();
        $rsvp_data = $rsvp_result->fetch_assoc();
        $already_rsvped = $rsvp_data['rsvp_count'] > 0;

        // Store guest session data
        $_SESSION['guestID'] = $guest_id;
        $_SESSION['guestName'] = $guest['first_name'] . ' ' . $guest['last_name'];

        echo json_encode([
            "valid" => true,
            "message" => "Guest ID verified.",
            "first_name" => $guest['first_name'],
            "last_name" => $guest['last_name'],
            "unlock_restricted" => true,
            "rsvped" => $already_rsvped // This tells the front-end if they have RSVP'd already
        ]);

        $rsvp_stmt->close();
    } else {
        echo json_encode(["valid" => false, "message" => "Invalid Guest ID."]);
    }

    $stmt->close();
    $conn->close();
} else {
    echo json_encode(["valid" => false, "message" => "Invalid request method."]);
}
?>
