-- Insert sample categories
INSERT INTO category (name) VALUES
('Books'),
('Rentals'),
('Apparel'),
('Electronics'),
('Supplies')
ON CONFLICT (name) DO NOTHING;

-- Insert sample products
INSERT INTO product (sku, isbn, title, author, publisher, edition, category_id, condition, price, quantity_in_stock, image_path, is_active) VALUES
-- Books (20 items)
('BK001', '978-0-123456-78-9', 'Introduction to Computer Science', 'John Doe', 'Tech Press', '1st', (SELECT category_id FROM category WHERE name = 'Books'), 'new', 89.99, 50, 'images/introcomputerscience.jpg', true),
('BK002', '978-0-987654-32-1', 'Calculus I', 'Jane Smith', 'Math Publishers', '2nd', (SELECT category_id FROM category WHERE name = 'Books'), 'new', 120.00, 30, 'images/calculus1.jpg', true),
('BK003', '978-1-234567-89-0', 'Biology 101', 'Dr. Green', 'Science Books', '3rd', (SELECT category_id FROM category WHERE name = 'Books'), 'used', 75.50, 20, 'images/biology.jpg', true),
('BK004', '978-0-111111-11-1', 'English Literature', 'Prof. Words', 'Literary Press', '1st', (SELECT category_id FROM category WHERE name = 'Books'), 'new', 65.00, 40, 'images/englishliterature.jpg', true),
('BK005', '978-0-444444-44-4', 'American History', 'Dr. Past', 'History House', '5th', (SELECT category_id FROM category WHERE name = 'Books'), 'new', 95.00, 35, 'images/americanhistory.jpg', true),
('BK006', '978-0-555555-55-5', 'Organic Chemistry', 'Dr. Molecule', 'Chem Books', '2nd', (SELECT category_id FROM category WHERE name = 'Books'), 'new', 145.00, 25, 'images/organicchemistry.jpg', true),
('BK007', '978-0-666666-66-6', 'Psychology 101', 'Dr. Mind', 'Psych Press', '3rd', (SELECT category_id FROM category WHERE name = 'Books'), 'used', 68.99, 30, 'images/intropsychology.jpg', true),
('BK008', '978-0-777777-77-7', 'Introduction to Statistics', 'Prof. Numbers', 'Math World', '1st', (SELECT category_id FROM category WHERE name = 'Books'), 'new', 99.99, 40, 'images/introstatistics.jpg', true),
('BK009', '978-0-888888-88-8', 'World Geography', 'Dr. Maps', 'Globe Publishing', '4th', (SELECT category_id FROM category WHERE name = 'Books'), 'new', 79.99, 45, 'images/worldgeography.jpg', true),
('BK010', '978-0-999999-99-9', 'Business Management', 'Prof. Boss', 'Business Books', '2nd', (SELECT category_id FROM category WHERE name = 'Books'), 'new', 110.00, 28, 'images/businessmanagement.jpg', true),
('BK011', '978-1-111111-11-2', 'Microeconomics', 'Dr. Money', 'Econ Press', '6th', (SELECT category_id FROM category WHERE name = 'Books'), 'used', 89.50, 22, 'images/microeconomics.jpg', true),
('BK012', '978-1-222222-22-3', 'Art History', 'Prof. Canvas', 'Art Books', '1st', (SELECT category_id FROM category WHERE name = 'Books'), 'new', 72.00, 35, 'images/arthistory.jpg', true),
('BK013', '978-1-333333-33-4', 'Philosophy 101', 'Dr. Think', 'Wisdom Press', '3rd', (SELECT category_id FROM category WHERE name = 'Books'), 'new', 64.99, 38, 'images/philosophy.jpg', true),
('BK014', '978-1-444444-44-5', 'Spanish I', 'Prof. Hola', 'Language Learning', '2nd', (SELECT category_id FROM category WHERE name = 'Books'), 'new', 85.00, 42, 'images/spanish1.jpg', true),
('BK015', '978-1-555555-55-6', 'Environmental Science', 'Dr. Earth', 'Green Books', '4th', (SELECT category_id FROM category WHERE name = 'Books'), 'new', 98.00, 30, 'images/environmentalscience.jpg', true),
('BK016', '978-1-666666-66-7', 'Public Speaking', 'Prof. Voice', 'Speech Press', '1st', (SELECT category_id FROM category WHERE name = 'Books'), 'used', 55.99, 25, 'images/publicspeaking.jpg', true),
('BK017', '978-1-777777-77-8', 'Anatomy and Physiology', 'Dr. Body', 'Medical Books', '7th', (SELECT category_id FROM category WHERE name = 'Books'), 'new', 165.00, 20, 'images/anatomy.jpg', true),
('BK018', '978-1-888888-88-9', 'Criminal Justice', 'Prof. Law', 'Legal Press', '3rd', (SELECT category_id FROM category WHERE name = 'Books'), 'new', 92.50, 32, 'images/criminaljustice.jpg', true),
('BK019', '978-1-999999-99-0', 'Nutrition Science', 'Dr. Health', 'Health Books', '2nd', (SELECT category_id FROM category WHERE name = 'Books'), 'new', 81.00, 28, 'images/nutrition.jpg', true),
('BK020', '978-2-111111-11-3', 'Data Structures and Algorithms', 'Prof. Code', 'CS Publishing', '1st', (SELECT category_id FROM category WHERE name = 'Books'), 'new', 105.00, 35, 'images/datastructures.jpg', true),

-- Rentals (10 items)
('RN001', '978-0-222222-22-2', 'Advanced Physics', 'Dr. Quantum', 'Physics Inc', '4th', (SELECT category_id FROM category WHERE name = 'Rentals'), 'rental', 45.00, 15, 'images/physics.jpg', true),
('RN002', '978-0-333333-33-3', 'Chemistry Lab Manual', 'Lab Master', 'Chem Corp', '2nd', (SELECT category_id FROM category WHERE name = 'Rentals'), 'rental', 35.00, 25, 'images/chemistrylabmanual.jpg', true),
('RN003', '978-2-222222-22-4', 'Calculus II', 'Dr. Derivative', 'Math Co', '3rd', (SELECT category_id FROM category WHERE name = 'Rentals'), 'rental', 50.00, 18, 'images/calculus2.jpg', true),
('RN004', '978-2-333333-33-5', 'Engineering Mechanics', 'Prof. Build', 'Engineering Press', '5th', (SELECT category_id FROM category WHERE name = 'Rentals'), 'rental', 55.00, 12, 'images/engineeringmechanics.jpg', true),
('RN005', '978-2-444444-44-6', 'Accounting Principles', 'CPA Master', 'Finance Books', '11th', (SELECT category_id FROM category WHERE name = 'Rentals'), 'rental', 48.00, 20, 'images/accounting.png', true),
('RN006', '978-2-555555-55-7', 'Marketing Strategy', 'Dr. Brand', 'Marketing Inc', '4th', (SELECT category_id FROM category WHERE name = 'Rentals'), 'rental', 42.00, 16, 'images/marketingstrategy.jpg', true),
('RN007', '978-2-666666-66-8', 'Microbiology', 'Dr. Germ', 'Bio Press', '8th', (SELECT category_id FROM category WHERE name = 'Rentals'), 'rental', 52.00, 14, 'images/microbiology.jpg', true),
('RN008', '978-2-777777-77-9', 'Linear Algebra', 'Prof. Matrix', 'Math Books', '2nd', (SELECT category_id FROM category WHERE name = 'Rentals'), 'rental', 46.00, 22, 'images/linearalgebra.jpg', true),
('RN009', '978-2-888888-88-0', 'Introduction to Sociology', 'Dr. Society', 'Social Press', '6th', (SELECT category_id FROM category WHERE name = 'Rentals'), 'rental', 38.00, 19, 'images/introsociology.jpg', true),
('RN010', '978-2-999999-99-1', 'Constitutional Law', 'Prof. Justice', 'Law Books', '4th', (SELECT category_id FROM category WHERE name = 'Rentals'), 'rental', 49.00, 13, 'images/constitutionallaw.jpg', true),

-- Apparel (8 items)
('AP001', NULL, 'McNeese University Hoodie', NULL, 'Campus Store', NULL, (SELECT category_id FROM category WHERE name = 'Apparel'), 'new', 49.99, 100, 'images/hoodie.jpg', true),
('AP002', NULL, 'McNeese Baseball Cap', NULL, 'Campus Store', NULL, (SELECT category_id FROM category WHERE name = 'Apparel'), 'new', 24.99, 75, 'images/baseballhat.jpg', true),
('AP003', NULL, 'McNeese T-Shirt Blue', NULL, 'Campus Store', NULL, (SELECT category_id FROM category WHERE name = 'Apparel'), 'new', 19.99, 120, 'images/tshirtblue.jpg', true),
('AP004', NULL, 'McNeese T-Shirt Yellow', NULL, 'Campus Store', NULL, (SELECT category_id FROM category WHERE name = 'Apparel'), 'new', 19.99, 110, 'images/tshirtyellow.jpg', true),
('AP005', NULL, 'McNeese Sweatpants', NULL, 'Campus Store', NULL, (SELECT category_id FROM category WHERE name = 'Apparel'), 'new', 39.99, 85, 'images/sweatpants.jpg', true),
('AP006', NULL, 'McNeese Zip-Up Jacket', NULL, 'Campus Store', NULL, (SELECT category_id FROM category WHERE name = 'Apparel'), 'new', 64.99, 60, 'images/zipjacket.jpg', true),
('AP007', NULL, 'McNeese Backpack', NULL, 'Campus Gear', NULL, (SELECT category_id FROM category WHERE name = 'Apparel'), 'new', 44.99, 70, 'images/backpack.jpg', true),
('AP008', NULL, 'McNeese Lanyard', NULL, 'Campus Store', NULL, (SELECT category_id FROM category WHERE name = 'Apparel'), 'new', 6.99, 200, 'images/lanyard.jpg', true),

-- Electronics (6 items)
('EL001', NULL, 'Scientific Calculator', 'Texas Instruments', 'TI', 'TI-84 Plus', (SELECT category_id FROM category WHERE name = 'Electronics'), 'new', 129.99, 20, 'images/scientificcalculator.jpg', true),
('EL002', NULL, 'Wireless Headphones', 'AudioTech', 'AudioTech', 'Model X1', (SELECT category_id FROM category WHERE name = 'Electronics'), 'new', 89.99, 30, 'images/headphones.jpg', true),
('EL003', NULL, 'USB Flash Drive 32GB', 'SanDisk', 'SanDisk', 'Ultra', (SELECT category_id FROM category WHERE name = 'Electronics'), 'new', 14.99, 150, 'images/usb.jpg', true),
('EL004', NULL, 'Laptop Stand', 'ErgoTech', 'ErgoTech', 'Pro', (SELECT category_id FROM category WHERE name = 'Electronics'), 'new', 34.99, 45, 'images/laptopstand.jpg', true),
('EL005', NULL, 'Wireless Mouse', 'Logitech', 'Logitech', 'M185', (SELECT category_id FROM category WHERE name = 'Electronics'), 'new', 19.99, 80, 'images/mouse.jpg', true),
('EL006', NULL, 'Portable Charger', 'Anker', 'Anker', 'PowerCore 10000', (SELECT category_id FROM category WHERE name = 'Electronics'), 'new', 29.99, 65, 'images/portablecharger.jpg', true),

-- Supplies (6 items)
('SP001', NULL, 'Blue Pens (Pack of 12)', 'BIC', 'BIC', NULL, (SELECT category_id FROM category WHERE name = 'Supplies'), 'new', 5.99, 200, 'images/bluepens.jpg', true),
('SP002', NULL, 'Notebook (100 pages)', 'Mead', 'Mead', NULL, (SELECT category_id FROM category WHERE name = 'Supplies'), 'new', 3.49, 150, 'images/notebook.jpg', true),
('SP003', NULL, 'Highlighter Set (4 colors)', 'Sharpie', 'Sharpie', NULL, (SELECT category_id FROM category WHERE name = 'Supplies'), 'new', 6.99, 180, 'images/highlighters.jpg', true),
('SP004', NULL, 'Binder 3-Ring 2 inch', 'Avery', 'Avery', NULL, (SELECT category_id FROM category WHERE name = 'Supplies'), 'new', 8.99, 95, 'images/3ringbinder.jpg', true),
('SP005', NULL, 'Index Cards (500 pack)', 'Oxford', 'Oxford', NULL, (SELECT category_id FROM category WHERE name = 'Supplies'), 'new', 4.99, 125, 'images/indexcards.jpg', true),
('SP006', NULL, 'Scientific Graphing Paper', 'Roaring Spring', 'Roaring Spring', NULL, (SELECT category_id FROM category WHERE name = 'Supplies'), 'new', 7.49, 110, 'images/graphpaper.jpg', true)
ON CONFLICT (sku) DO NOTHING;