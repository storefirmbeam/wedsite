<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Testing verify_guest.php execution...<br>";

if (file_exists("verify_guest.php")) {
    echo "verify_guest.php exists!<br>";
    include "verify_guest.php";
} else {
    echo "verify_guest.php NOT found!<br>";
}
?>
