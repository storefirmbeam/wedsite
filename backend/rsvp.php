<?php
require_once 'config.php';

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$conn = getDatabaseConnection();

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $message = $_POST['message'] ?? '';
    $attendingGuests = $_POST['attending_guests'] ?? [];
    $allGuests = explode(',', $_POST['all_guest_ids'] ?? '');

    // Sanitize message for storage
    $safeMessage = htmlspecialchars(trim($message), ENT_QUOTES, 'UTF-8');

    // Begin transaction
    $conn->begin_transaction();

    try {
        $stmt = $conn->prepare("
            INSERT INTO rsvp (guest_id, attending, message)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE attending = VALUES(attending), message = VALUES(message)
        ");
        
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }
        
        foreach ($allGuests as $guestID) {
            $guestID = trim($guestID); // keep as string
            $attending = in_array($guestID, $attendingGuests) ? 1 : 0;
        
            $stmt->bind_param("sis", $guestID, $attending, $safeMessage);
            $success = $stmt->execute();
        
            if (!$success) {
                throw new Exception("Execute failed: " . $stmt->error);
            }
        }

        $stmt->close();
        $conn->commit();

        $_SESSION['rsvpStatus'] = "confirmed";
        echo json_encode(['success' => true, 'message' => 'RSVP submitted successfully!']);
    } catch (Exception $e) {
        $conn->rollback();
        $errorMessage = "Error submitting RSVP: " . $e->getMessage();
        echo json_encode(['success' => false, 'message' => $errorMessage]);
        error_log("RSVP Error: " . $errorMessage);
    }

    $conn->close();
}
?>
