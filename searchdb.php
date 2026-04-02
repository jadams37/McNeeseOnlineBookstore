<?php
$pdo = new PDO("pgsql:host=localhost;port=5432;dbname=mcneese_bookstore", "user", "password");

$search = $_GET['search'] ?? '';

$sql = "SELECT * FROM product
        WHERE title ILIKE :search
        OR isbn ILIKE :search
        OR title ILIKE :search
        OR author ILIKE :search
        OR publisher ILIKE :search";
$stmt = $pdo->prepare($sql);

// Use % for partial matching
$stmt->execute(['search' => "%$search%"]);

$results = $stmt->fetchAll();

foreach ($results as $row) {
    echo "<p>" . htmlspecialchars($row['title']) . "</p>";
}
?>