<?php
$host = "localhost";
$port = "5432";
$db = "mcneese_bookstore";
$user = "postgres";
$password = "password";

try {
    $pdo = new PDO("pgsql:host=$host;port=$port;dbname=$dbname", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "Connected successfully!";
}

catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
?>