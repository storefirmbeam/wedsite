<?php
require_once 'config.php'; // Database connection & session

header('Content-Type: application/json');

$conn = getDatabaseConnection(); // This returns a mysqli connection

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $guest_id = $_POST['guest_id'] ?? '';

    if (empty($guest_id)) {
        echo json_encode(["valid" => false, "message" => "Guest ID is required."]);
        exit;
    }

    // Validate guest_id (alphanumeric and special characters)
    if (!preg_match('/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};\'\\:"|,.<>\/?]+$/', $guest_id)) {
        echo json_encode(["valid" => false, "message" => "Invalid Guest ID format."]);
        exit;
    }

    // Look up the guest by ID
    $stmt = $conn->prepare("SELECT first_name, last_name, famID FROM guests WHERE guest_id = ?");
    if (!$stmt) {
        echo json_encode(["valid" => false, "message" => "Database error: " . $conn->error]);
        exit;
    }

    $stmt->bind_param("s", $guest_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(["valid" => false, "message" => "Invalid Guest ID."]);
        exit;
    }

    $guest = $result->fetch_assoc();
    $famID = $guest['famID'];

    // Check RSVP status
    $rsvp_stmt = $conn->prepare("SELECT COUNT(*) as rsvp_count FROM rsvps WHERE guest_id = ?");
    $rsvp_stmt->bind_param("s", $guest_id);
    $rsvp_stmt->execute();
    $rsvp_result = $rsvp_stmt->get_result();
    $rsvp_data = $rsvp_result->fetch_assoc();
    $already_rsvped = $rsvp_data['rsvp_count'] > 0;

    // Get all family members + whether they already RSVP'd
    $family_stmt = $conn->prepare("
        SELECT 
            g.guest_id AS id, 
            CONCAT(g.first_name, ' ', g.last_name) AS name,
            EXISTS (
                SELECT 1 FROM rsvps r WHERE r.guest_id = g.guest_id
            ) AS has_rsvped
        FROM guests g
        WHERE g.famID = ?
    ");
    $family_stmt->bind_param("s", $famID);
    $family_stmt->execute();
    $family_result = $family_stmt->get_result();

    $family = [];
    while ($row = $family_result->fetch_assoc()) {
        $family[] = [
            'id' => $row['id'],
            'name' => $row['name'],
            'has_rsvped' => (bool) $row['has_rsvped']  // Convert to boolean
        ];
    }

    // Store session info
    $_SESSION['guestID'] = $guest_id;
    $_SESSION['guestName'] = $guest['first_name'] . ' ' . $guest['last_name'];

    echo json_encode([
        "valid" => true,
        "message" => "Guest ID verified.",
        "first_name" => $guest['first_name'],
        "last_name" => $guest['last_name'],
        "guestID" => $guest_id,
        "unlock_restricted" => true,
        "rsvped" => $already_rsvped,
        "family" => $family
    ]);

    // Close everything
    $stmt->close();
    $rsvp_stmt->close();
    $family_stmt->close();
    $conn->close();
} else {
    echo json_encode(["valid" => false, "message" => "Invalid request method."]);
}
?>
