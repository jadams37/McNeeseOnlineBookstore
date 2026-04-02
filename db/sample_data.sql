-- Insert sample categories
INSERT INTO category (name) VALUES
('Books'),
('Rentals'),
('Apparel'),
('Electronics'),
('Supplies')
ON CONFLICT (name) DO NOTHING;

-- Insert sample products
INSERT INTO product (sku, isbn, title, author, publisher, edition, category_id, condition, price, quantity_in_stock, is_active) VALUES
-- Books
('BK001', '978-0-123456-78-9', 'Introduction to Computer Science', 'John Doe', 'Tech Press', '1st', (SELECT category_id FROM category WHERE name = 'Books'), 'new', 89.99, 50, true),
('BK002', '978-0-987654-32-1', 'Calculus I', 'Jane Smith', 'Math Publishers', '2nd', (SELECT category_id FROM category WHERE name = 'Books'), 'new', 120.00, 30, true),
('BK003', '978-1-234567-89-0', 'Biology 101', 'Dr. Green', 'Science Books', '3rd', (SELECT category_id FROM category WHERE name = 'Books'), 'used', 75.50, 20, true),
('BK004', '978-0-111111-11-1', 'English Literature', 'Prof. Words', 'Literary Press', '1st', (SELECT category_id FROM category WHERE name = 'Books'), 'new', 65.00, 40, true),

-- Rentals
('RN001', '978-0-222222-22-2', 'Advanced Physics', 'Dr. Quantum', 'Physics Inc', '4th', (SELECT category_id FROM category WHERE name = 'Rentals'), 'rental', 45.00, 15, true),
('RN002', '978-0-333333-33-3', 'Chemistry Lab Manual', 'Lab Master', 'Chem Corp', '2nd', (SELECT category_id FROM category WHERE name = 'Rentals'), 'rental', 35.00, 25, true),

-- Apparel
('AP001', NULL, 'McNeese University Hoodie', NULL, 'Campus Store', NULL, (SELECT category_id FROM category WHERE name = 'Apparel'), 'new', 49.99, 100, true),
('AP002', NULL, 'McNeese Baseball Cap', NULL, 'Campus Store', NULL, (SELECT category_id FROM category WHERE name = 'Apparel'), 'new', 24.99, 75, true),

-- Electronics
('EL001', NULL, 'Scientific Calculator', 'Texas Instruments', 'TI', 'TI-84 Plus', (SELECT category_id FROM category WHERE name = 'Electronics'), 'new', 129.99, 20, true),
('EL002', NULL, 'Wireless Headphones', 'AudioTech', 'AudioTech', 'Model X1', (SELECT category_id FROM category WHERE name = 'Electronics'), 'new', 89.99, 30, true),

-- Supplies
('SP001', NULL, 'Blue Pens (Pack of 12)', 'Office Depot', 'Office Depot', NULL, (SELECT category_id FROM category WHERE name = 'Supplies'), 'new', 5.99, 200, true),
('SP002', NULL, 'Notebook (100 pages)', 'Staples', 'Staples', NULL, (SELECT category_id FROM category WHERE name = 'Supplies'), 'new', 3.49, 150, true)
ON CONFLICT (sku) DO NOTHING;