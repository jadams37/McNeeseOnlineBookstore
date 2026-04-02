<?php
$host = "localhost";
$port = "5432";
$db = "mcneese_bookstore";
$user = "user";
$password = "password";

try {
    $pdo = new PDO("pgsql:host=$host;port=$port;dbname=$db", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    //echo "Connected Successfully";
}

catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
?>