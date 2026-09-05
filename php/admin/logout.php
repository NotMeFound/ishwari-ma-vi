<?php
declare(strict_types=1);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
$_SESSION['is_admin'] = false;
unset($_SESSION['is_admin']);
session_destroy();

header('Location: login.php');
exit;
