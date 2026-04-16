<?php
/* PHP script to update the results with a set sorted based
   on the selected order method. */
require 'db_connection.php';

$search = $_GET['search'] ?? '';
$sort = $_GET['sort'] ?? 'ascending';
$orderBy = "title ASC";

/* Switches sort value to determine order in query */
switch ($sort) {
    case "descending":
        $orderBy = "title DESC";
        break;
    case "asc-price":
        $orderBy = "price ASC";
        break;
    case "desc-price":
        $orderBy = "price DESC";
        break;
}

$sql = "SELECT * FROM product
        WHERE title ILIKE :search
        OR isbn ILIKE :search
        OR author ILIKE :search
        OR publisher ILIKE :search
        ORDER BY $orderBy";

$stmt = $pdo->prepare($sql);
$stmt->execute(['search' => "%$search%"]);
$results = $stmt->fetchAll();

if(!empty($results)):
    foreach ($results as $row): ?>
        <div class="product-container">
            <img src="">
            <p class="item-name-label"><?php echo htmlspecialchars($row['title']) ?></p>
            <p class="item-info-label"><?php echo htmlspecialchars($row['isbn']) ?></p>
            <p class="item-info-label"><?php echo htmlspecialchars($row['author']) ?></p>
            <p class="item-price-label">$<?php echo htmlspecialchars($row['price']) ?> (<?php echo htmlspecialchars($row['condition']) ?>)</p>
            <div class="item-buttons">
                <button class="cart-button">Add to Cart</button>
                <button class="wishlist-button" id="wishlist"></button>
            </div>
        </div>
    <?php endforeach;
endif;