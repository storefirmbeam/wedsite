<?php
include 'config.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $guest_id = $_POST['guest_id'];
    $attending = $_POST['attending'];
    $guest_count = $_POST['guest_count'];
    $message = $_POST['message'];

    $sql = "INSERT INTO rsvp (guest_id, attending, guest_count, message) VALUES ('$guest_id', '$attending', '$guest_count', '$message')";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["success" => true, "message" => "RSVP submitted!"]);
    } else {
        echo json_encode(["success" => false, "error" => $conn->error]);
    }

    $conn->close();
}
?>
