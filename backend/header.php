<?php 
require_once 'config.php'; // Ensure config.php is properly included
?>
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Darby & Cole's Wedding</title>
    
        <!-- Stylesheets -->
        <link rel="stylesheet" href="styles.css?v=<?php echo htmlspecialchars($version, ENT_QUOTES, 'UTF-8'); ?>">
        <?php echo "<!-- CSS Version: " . htmlspecialchars($version, ENT_QUOTES, 'UTF-8') . " -->"; ?>
    
        <!-- JavaScript -->
        <script src="scripts.js?v=<?php echo htmlspecialchars($version, ENT_QUOTES, 'UTF-8'); ?>" defer></script>
    
        <!-- Google Fonts -->
        <link href="https://fonts.googleapis.com/css2?family=Monsieur+La+Doulaise&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display+SC&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display&display=swap" rel="stylesheet">
    </head>