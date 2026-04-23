<?php
/* PHP script to update the results with a set sorted based
   on the selected order method. Also supports filtering by
   product category and condition. */
require 'db_connection.php';

$search = $_GET['search'] ?? '';
$sort = $_GET['sort'] ?? 'ascending';
$orderBy = "title ASC";
$type = $_GET['type'] ?? '';
$condition = $_GET['condition'] ?? '';

$sql = "SELECT * FROM product
        JOIN category ON product.category_id = category.category_id
        WHERE (
            title ILIKE :search
            OR isbn ILIKE :search
            OR author ILIKE :search
            OR publisher ILIKE :search
        )";

$params = ['search' => "%$search%"];

if(!empty($type)) {
    $types = explode(',', $type);

    $placeholders = [];

    foreach($types as $index => $t) {
        $key = "type$index";
        $placeholders[] = ":$key";
        $params[$key] = $t;
    }

    $sql .= " AND category.name IN (" . implode(',', $placeholders) . ")";
}

if(!empty($condition)) {
    $conditions = explode(',', $condition);

    $placeholders = [];

    foreach($conditions as $index => $t) {
        $key = "condition$index";
        $placeholders[] = ":$key";
        $params[$key] = $t;
    }

    $sql .= " AND condition IN (" . implode(',', $placeholders) . ")";
}

/* Switches sort value to determine order in query */
switch($sort) {
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

$sql .= " ORDER BY $orderBy";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);

$results = $stmt->fetchAll();

if(!empty($results)):
    foreach($results as $row): ?>
        <div class="product-container">
            <img src="">
            <?php if (!empty($row['title'])): ?>
                <p class="item-name-label"><?php echo htmlspecialchars($row['title']) ?></p>
            <?php
            else:
                echo "<p class='item-name-label'>PRODUCT_TITLE</p>";
            endif; ?>
            <?php if (!empty($row['isbn'])): ?>
                <p class="item-info-label"><?php echo htmlspecialchars($row['isbn']) ?></p>
            <?php endif; ?>
            <?php if (!empty($row['author'])): ?>
                <p class="item-info-label"><?php echo htmlspecialchars($row['author']) ?></p>
            <?php endif; ?>
            <?php if (!empty($row['price']) && !empty($row['condition'])): ?>
                <p class="item-price-label">$<?php echo htmlspecialchars($row['price']) ?> (<?php echo htmlspecialchars($row['condition']) ?>)</p>
            <?php
            else:
                echo "<p class='item-price-label'>PRODUCT_PRICE</p>";
            endif; ?>
            <div class="item-buttons">
                <button class="cart-button">Add to Cart</button>
            </div>
        </div>
    <?php endforeach;
else:
    echo "<p>No Results Found</p>";
endif;