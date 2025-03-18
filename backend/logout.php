<?php
require_once 'config.php'; // Database connection & CORS headers applied
session_destroy();
echo json_encode(["success" => true]);
?>