<?php
include 'config.php';

$sql = "SELECT question, admin_response FROM qa WHERE approved = 1";
$result = $conn->query($sql);

$qna = [];
while ($row = $result->fetch_assoc()) {
    $qna[] = $row;
}

echo json_encode($qna);
$conn->close();
?>
