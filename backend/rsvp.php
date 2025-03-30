<?php
require_once 'config.php';

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$conn = getDatabaseConnection(); // mysqli connection

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $message = $_POST['message'] ?? '';
    $attendingGuests = $_POST['attending_guests'] ?? [];
    $allGuests = explode(',', $_POST['all_guest_ids'] ?? '');

    // Sanitize message
    $safeMessage = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

    // Begin transaction
    $conn->begin_transaction();

    try {
        $stmt = $conn->prepare("
            INSERT INTO rsvp (guest_id, attending, message)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE attending = VALUES(attending), message = VALUES(message)
        ");

        foreach ($allGuests as $guestID) {
            $attending = in_array($guestID, $attendingGuests) ? 1 : 0;
            $stmt->bind_param("iis", $guestID, $attending, $safeMessage);
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