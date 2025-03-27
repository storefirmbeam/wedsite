<?php
require_once 'config.php'; // Ensure DB connection and config

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$pdo = getDatabaseConnection(); // Must return PDO
if (!($pdo instanceof PDO)) {
    throw new Exception("Database connection must be a PDO instance.");
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $attending = $_POST['attending'];
    $message = $_POST['message'] ?? '';
    $attendingGuests = $_POST['attending_guests'] ?? [];

    if (empty($attendingGuests)) {
        echo json_encode(['success' => false, 'message' => 'No guests selected.']);
        exit;
    }

    try {
        if (!$pdo->beginTransaction()) {
            throw new Exception("Failed to start transaction.");
        }

        foreach ($attendingGuests as $guestID) {
            $safeMessage = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

            $stmt = $pdo->prepare("
                REPLACE INTO rsvps (guest_id, attending, message)
                VALUES (:guest_id, :attending, :message)
            ");
            $stmt->execute([
                'guest_id' => $guestID,
                'attending' => $attending,
                'message' => $safeMessage
            ]);
        }

        $pdo->commit();
        $_SESSION['rsvpStatus'] = "confirmed";
        echo json_encode(['success' => true, 'message' => 'RSVP submitted successfully!']);
    } catch (PDOException $e) {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}
?>
