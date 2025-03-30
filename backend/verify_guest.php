<?php
require_once 'config.php'; // Database connection & session

// ini_set('display_errors', 1);
// error_reporting(E_ALL);

header('Content-Type: application/json');

$conn = getDatabaseConnection(); // This returns a mysqli connection

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $famID = $_POST['fam_id'] ?? '';

    if (empty($famID)) {
        echo json_encode(["valid" => false, "message" => "Family ID is required."]);
        exit;
    }

    // Validate guest_id (alphanumeric and special characters)
    if (!preg_match('/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};\'\\:"|,.<>\/?]+$/', $famID)) {
        echo json_encode(["valid" => false, "message" => "Invalid ID format."]);
        exit;
    }

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
            'has_rsvped' => (bool) $row['has_rsvped']
        ];
    }
    
    if (empty($family)) {
        echo json_encode(["valid" => false, "message" => "No guests found for this Family ID."]);
        exit;
    }
    
    // Pick the first guest as the representative
    $rep = $family[0];
    
    // Check if that person RSVP'd already
    $rsvp_stmt = $conn->prepare("SELECT COUNT(*) as rsvp_count FROM rsvps WHERE guest_id = ?");
    $rsvp_stmt->bind_param("s", $rep['id']);
    $rsvp_stmt->execute();
    $rsvp_result = $rsvp_stmt->get_result();
    $rsvp_data = $rsvp_result->fetch_assoc();
    $already_rsvped = $rsvp_data['rsvp_count'] > 0;

    $all_rsvped = true;
    foreach ($family as $member) {
        if (!$member['has_rsvped']) {
            $all_rsvped = false;
            break;
        }
    }

    // Store session info
    $_SESSION['guestID'] = $rep['id'];
    $_SESSION['guestName'] = $rep['name'];

    echo json_encode([
        "valid" => true,
        "message" => "Guest ID verified.",
        "first_name" => explode(' ', $rep['name'])[0],
        "last_name" => explode(' ', $rep['name'])[1] ?? '',
        "guestID" => $rep['id'],
        "unlock_restricted" => true,
        "rsvped" => $already_rsvped,
        "all_rsvped" => $all_rsvped,
        "family" => $family
    ]);

    // Close everything
    $rsvp_stmt->close();
    $family_stmt->close();
    $conn->close();
} else {
    echo json_encode(["valid" => false, "message" => "Invalid request method."]);
}