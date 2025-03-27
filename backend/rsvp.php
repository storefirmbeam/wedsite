<?php
require_once 'config.php'; // Ensure DB connection and session

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$conn = getDatabaseConnection(); // This returns a mysqli connection

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $attending = $_POST['attending'];
    $message = $_POST['message'] ?? '';
    $attendingGuests = $_POST['attending_guests'] ?? [];

    if (empty($attendingGuests)) {
        echo json_encode(['success' => false, 'message' => 'No guests selected.']);
        exit;
    }

    // Sanitize message (once, for simplicity)
    $safeMessage = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

    // Begin transaction
    $conn->begin_transaction();

    try {
        $stmt = $conn->prepare("
            REPLACE INTO rsvps (guest_id, attending, message)
            VALUES (?, ?, ?)
        ");

        foreach ($attendingGuests as $guestID) {
            $stmt->bind_param("sis", $guestID, $attending, $safeMessage);
            $stmt->execute();
        }

        $stmt->close();
        $conn->commit();

        $_SESSION['rsvpStatus'] = "confirmed";
        echo json_encode(['success' => true, 'message' => 'RSVP submitted successfully!']);
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => 'Error submitting RSVP.']);
    }

    $conn->close();
}
?>
