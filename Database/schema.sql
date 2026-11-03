-- =====================================================================
-- Penetrative Library - rule tests (for the QA section of the paper)
-- Run penetrative_library_database.sql first.
-- HOW TO RUN: in MySQL Workbench, select ONE test block at a time and
-- press the lightning bolt ("Execute selected"). Tests marked
-- EXPECT ERROR are supposed to fail with the message shown.
-- Copy what you really see into the Actual column of Table 10.
-- =====================================================================
USE penetrative_library;

-- ---------- SETUP: four test users and handy variables ----------
INSERT INTO users (username, email, password_hash, password_salt, membership, is_banned) VALUES
('testreader',  'testreader@example.com',  'x', 'x', 'regular', FALSE),
('testregular', 'testregular@example.com', 'x', 'x', 'regular', FALSE),
('testpremium', 'testpremium@example.com', 'x', 'x', 'premium', FALSE),
('testbanned',  'testbanned@example.com',  'x', 'x', 'regular', TRUE);

SET @reader  := (SELECT user_id FROM users WHERE username = 'testreader');
SET @regular := (SELECT user_id FROM users WHERE username = 'testregular');
SET @premium := (SELECT user_id FROM users WHERE username = 'testpremium');
SET @banned  := (SELECT user_id FROM users WHERE username = 'testbanned');
SET @admin   := (SELECT user_id FROM users WHERE username = 'libraryadmin');

SET @b101 := (SELECT book_id FROM books WHERE book_code = 'BK-101');
SET @b102 := (SELECT book_id FROM books WHERE book_code = 'BK-102');
SET @b103 := (SELECT book_id FROM books WHERE book_code = 'BK-103');
SET @b104 := (SELECT book_id FROM books WHERE book_code = 'BK-104');
SET @b105 := (SELECT book_id FROM books WHERE book_code = 'BK-105');
SET @b106 := (SELECT book_id FROM books WHERE book_code = 'BK-106');
SET @p201 := (SELECT book_id FROM books WHERE book_code = 'PBK-201');

-- ---------- T01 Borrow a book ----------
-- EXPECT: one row (borrow_id, due_at = 14 days from now, borrow_fee 10.00)
SELECT available_copies AS before_copies FROM books WHERE book_id = @b101;   -- BK-101 starts at 3
CALL borrow_book(@reader, @b101);
SELECT available_copies AS after_copies FROM books WHERE book_id = @b101;    -- EXPECT 2

-- ---------- T02 Same book twice ----------
-- EXPECT ERROR: This book is already borrowed by this user
CALL borrow_book(@reader, @b101);

-- ---------- T03 Fill the limit (2 more loans) ----------
CALL borrow_book(@reader, @b102);
CALL borrow_book(@reader, @b103);

-- ---------- T04 Fourth active loan ----------
-- EXPECT ERROR: Maximum number of active borrows reached
CALL borrow_book(@reader, @b104);

-- ---------- T05 Premium book as a regular member ----------
-- EXPECT ERROR: Premium membership required
CALL borrow_book(@regular, @p201);

-- ---------- T06 Premium book as a premium member ----------
-- EXPECT: success, due date in 14 days
CALL borrow_book(@premium, @p201);

-- ---------- T07 Banned user ----------
-- EXPECT ERROR: This account is banned
CALL borrow_book(@banned, @b104);

-- ---------- T08 No copies left ----------
UPDATE books SET available_copies = 0 WHERE book_id = @b105;
-- EXPECT ERROR: No available copies
CALL borrow_book(@regular, @b105);
UPDATE books SET available_copies = 1 WHERE book_id = @b105;   -- put it back

-- ---------- T09 Return a book on time ----------
SET @loan101 := (SELECT borrow_id FROM borrows WHERE user_id = @reader AND book_id = @b101 AND returned_at IS NULL);
-- EXPECT: days_late 0, overdue_penalty 0.00
CALL return_borrowed_book(@loan101, @reader);
SELECT available_copies FROM books WHERE book_id = @b101;      -- EXPECT back to 3

-- ---------- T10 Overdue penalty (3 days late, default PHP 10/day) ----------
SET @loan102 := (SELECT borrow_id FROM borrows WHERE user_id = @reader AND book_id = @b102 AND returned_at IS NULL);
UPDATE borrows
SET borrowed_at = DATE_SUB(NOW(), INTERVAL 17 DAY),
    due_at = DATE_SUB(NOW(), INTERVAL 3 DAY)
WHERE borrow_id = @loan102;
SELECT * FROM overdue_loans;                                   -- EXPECT the loan with days_late 3, estimated_penalty 30.00
CALL return_borrowed_book(@loan102, @reader);                  -- EXPECT days_late 3, overdue_penalty 30.00

-- ---------- T11 Rate a book that was not bought ----------
-- EXPECT ERROR: A book must be purchased before it can be rated
INSERT INTO ratings (user_id, book_id, stars) VALUES (@reader, @b106, 5);

-- ---------- T12 Checkout the cart ----------
INSERT INTO cart_items (user_id, book_id, quantity) VALUES (@reader, @b106, 2);
-- EXPECT: purchase_id and total_amount 560.00 (2 x 280.00)
CALL checkout_cart(@reader, 'gcash');
SELECT COUNT(*) AS cart_rows_left FROM cart_items WHERE user_id = @reader;   -- EXPECT 0

-- ---------- T13 Rate after buying ----------
SELECT average_rating, rating_count FROM books WHERE book_id = @b106;        -- before: 4.40, 1
INSERT INTO ratings (user_id, book_id, stars) VALUES (@reader, @b106, 5);
SELECT average_rating, rating_count FROM books WHERE book_id = @b106;        -- EXPECT 4.70, 2

-- ---------- T14 Change the rating ----------
UPDATE ratings SET stars = 3 WHERE user_id = @reader AND book_id = @b106;
SELECT average_rating, rating_count FROM books WHERE book_id = @b106;        -- EXPECT 3.70, 2

-- ---------- T15 Move a rating to another purchased book ----------
INSERT INTO cart_items (user_id, book_id, quantity) VALUES (@reader, @b107, 1);
CALL checkout_cart(@reader, 'gcash');
UPDATE ratings SET book_id = @b107 WHERE user_id = @reader AND book_id = @b106;
SELECT average_rating, rating_count FROM books WHERE book_id = @b106;
-- EXPECT: average_rating 4.40, rating_count 1
SELECT average_rating, rating_count FROM books WHERE book_id = @b107;
-- EXPECT: average_rating 4.60, rating_count 2

-- ---------- T16 Friend request to yourself ----------
-- EXPECT ERROR: You cannot send a friend request to yourself
INSERT INTO friendships (requester_user_id, addressee_user_id) VALUES (@reader, @reader);

-- ---------- T17 Premium: activate, activate again, cancel ----------
CALL activate_premium(@regular, 'gcash', 'TEST-1');
SELECT membership FROM users WHERE user_id = @regular;                       -- EXPECT premium
-- EXPECT ERROR: Premium membership is already active
CALL activate_premium(@regular, 'gcash', 'TEST-2');
CALL cancel_premium(@regular);
SELECT membership FROM users WHERE user_id = @regular;                       -- EXPECT regular

-- ---------- T18 Delete a protected account ----------
-- EXPECT ERROR: Protected accounts cannot be deleted
CALL delete_user_account(@admin);

-- ---------- T19 Author application approved by staff ----------
INSERT INTO author_applications (user_id, pen_name, biography) VALUES (@regular, 'Test Pen', 'Test bio');
SET @app := LAST_INSERT_ID();
UPDATE users SET author_status = 'pending' WHERE user_id = @regular;
CALL review_author_application(@app, @admin, 'approved', 'Looks good');
SELECT author_status, pen_name FROM users WHERE user_id = @regular;          -- EXPECT approved, Test Pen
-- EXPECT ERROR: Application was already reviewed
CALL review_author_application(@app, @admin, 'approved', 'again');

-- ---------- T20 Audit trail ----------
SELECT action, details FROM audit_logs ORDER BY audit_id;                    -- EXPECT rows for loans, returns, purchase, premium...

-- ---------- CLEANUP (run last) ----------
-- Gives the copies back and removes the test users and their records.
CALL delete_user_account(@reader);
CALL delete_user_account(@regular);
CALL delete_user_account(@premium);
CALL delete_user_account(@banned);
UPDATE books SET available_copies = 3 WHERE book_id = @b101;


-- =====================================================================
-- Penetrative Library - database script (revised to match the front end)
-- Requires MySQL 8.0.16 or newer (CHECK constraints are enforced).
-- WARNING: this script DROPS and recreates the penetrative_library
-- database. Do not run it on a database that has real data.
-- Run the whole file at once (Workbench: lightning bolt button, or
-- "mysql -u root -p < penetrative_library_database.sql").
-- =====================================================================

DROP DATABASE IF EXISTS penetrative_library;

CREATE DATABASE penetrative_library
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE penetrative_library;

-- ---------------------------------------------------------------------
-- SETTINGS (values the front end treats as rules: fee, days, limits)
-- ---------------------------------------------------------------------
CREATE TABLE library_settings (
    setting_key VARCHAR(50) PRIMARY KEY,
    setting_value VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- ACCOUNTS
-- ---------------------------------------------------------------------
CREATE TABLE users (
    user_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(40) NOT NULL,
    email VARCHAR(254) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    password_salt VARCHAR(255) NOT NULL,
    role ENUM('user','author','librarian','admin') NOT NULL DEFAULT 'user',
    membership ENUM('regular','premium') NOT NULL DEFAULT 'regular',
    author_status ENUM('none','pending','approved','rejected') NOT NULL DEFAULT 'none',
    pen_name VARCHAR(40),
    author_bio VARCHAR(300),
    avatar MEDIUMTEXT,
    is_banned BOOLEAN NOT NULL DEFAULT FALSE,
    is_protected BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_users_username (username),
    UNIQUE KEY uq_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_membership (membership)
) ENGINE=InnoDB;

CREATE TABLE user_preferences (
    user_id BIGINT UNSIGNED PRIMARY KEY,
    theme VARCHAR(30) NOT NULL DEFAULT 'default',
    notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    compact_cards BOOLEAN NOT NULL DEFAULT FALSE,
    extra_preferences JSON,
    CONSTRAINT fk_preferences_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE account_recovery_tokens (
    recovery_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_recovery_token_hash (token_hash),
    CONSTRAINT fk_recovery_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_recovery_expiry (expires_at)
) ENGINE=InnoDB;

CREATE TABLE author_applications (
    application_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    pen_name VARCHAR(40) NOT NULL,
    biography VARCHAR(300),
    application_status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    reviewed_by BIGINT UNSIGNED,
    reviewed_at DATETIME,
    review_note TEXT,
    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_author_app_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_author_app_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_author_app_status (application_status)
) ENGINE=InnoDB;

CREATE TABLE premium_memberships (
    membership_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 99.00,
    started_at DATETIME NOT NULL,
    expires_at DATETIME NOT NULL,
    status ENUM('active','expired','cancelled','pending') NOT NULL DEFAULT 'pending',
    payment_reference VARCHAR(150),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_premium_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_premium_dates CHECK (expires_at > started_at),
    INDEX idx_premium_user_status (user_id, status),
    INDEX idx_premium_expiry (expires_at)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- CATALOG
-- ---------------------------------------------------------------------
CREATE TABLE books (
    book_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    book_code VARCHAR(30) NOT NULL,
    title VARCHAR(255) NOT NULL,
    author_name VARCHAR(150) NOT NULL,
    author_user_id BIGINT UNSIGNED,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    publication_year SMALLINT UNSIGNED,
    edition VARCHAR(50),
    total_copies INT UNSIGNED NOT NULL DEFAULT 0,
    available_copies INT UNSIGNED NOT NULL DEFAULT 0,
    shelf VARCHAR(50),
    book_condition VARCHAR(50),
    description TEXT,
    cover_image MEDIUMTEXT,
    is_premium BOOLEAN NOT NULL DEFAULT FALSE,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    base_rating DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    base_rating_count INT UNSIGNED NOT NULL DEFAULT 0,
    rating_count INT UNSIGNED NOT NULL DEFAULT 0,
    average_rating DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    latest_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_books_code (book_code),
    INDEX idx_books_title (title),
    INDEX idx_books_author (author_name),
    INDEX idx_books_category (category),
    INDEX idx_books_year (publication_year),
    INDEX idx_books_premium (is_premium),
    INDEX idx_books_latest (latest_date),
    CONSTRAINT fk_books_author_user FOREIGN KEY (author_user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT chk_books_copies CHECK (available_copies <= total_copies),
    CONSTRAINT chk_books_price CHECK (price >= 0),
    CONSTRAINT chk_books_rating CHECK (average_rating BETWEEN 0 AND 5),
    CONSTRAINT chk_books_base_rating CHECK (base_rating BETWEEN 0 AND 5)
) ENGINE=InnoDB;

CREATE TABLE book_pages (
    page_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    book_id BIGINT UNSIGNED NOT NULL,
    page_number INT UNSIGNED NOT NULL,
    page_content LONGTEXT NOT NULL,
    UNIQUE KEY uq_book_page (book_id, page_number),
    CONSTRAINT fk_book_pages_book FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Extra pictures an author can add (the front end allows up to 3)
CREATE TABLE book_gallery_images (
    image_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    book_id BIGINT UNSIGNED NOT NULL,
    sort_order TINYINT UNSIGNED NOT NULL,
    image_data MEDIUMTEXT NOT NULL,
    UNIQUE KEY uq_gallery_order (book_id, sort_order),
    CONSTRAINT fk_gallery_book FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE,
    CONSTRAINT chk_gallery_order CHECK (sort_order BETWEEN 1 AND 3)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- TRANSACTIONS
-- ---------------------------------------------------------------------
CREATE TABLE borrows (
    borrow_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    book_id BIGINT UNSIGNED NOT NULL,
    borrowed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    due_at DATETIME NOT NULL,
    returned_at DATETIME,
    borrow_fee DECIMAL(10,2) NOT NULL DEFAULT 10.00,
    overdue_days INT UNSIGNED NOT NULL DEFAULT 0,
    overdue_penalty DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status ENUM('borrowed','returned','overdue','lost') NOT NULL DEFAULT 'borrowed',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_borrows_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_borrows_book FOREIGN KEY (book_id) REFERENCES books(book_id),
    CONSTRAINT chk_borrows_dates CHECK (due_at > borrowed_at),
    INDEX idx_borrows_user_status (user_id, status),
    INDEX idx_borrows_due (due_at),
    INDEX idx_borrows_book (book_id)
) ENGINE=InnoDB;

-- user_id can become NULL when an account is deleted, so sales history is kept
CREATE TABLE purchases (
    purchase_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED,
    purchased_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    payment_method ENUM('gcash','maya','bank','cash','other') NOT NULL DEFAULT 'gcash',
    payment_status ENUM('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
    payment_reference VARCHAR(150),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_purchases_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_purchases_user_date (user_id, purchased_at),
    INDEX idx_purchases_payment_status (payment_status)
) ENGINE=InnoDB;

CREATE TABLE purchase_items (
    purchase_item_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    purchase_id BIGINT UNSIGNED NOT NULL,
    book_id BIGINT UNSIGNED NOT NULL,
    quantity INT UNSIGNED NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    line_total DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_purchase_items_purchase FOREIGN KEY (purchase_id) REFERENCES purchases(purchase_id) ON DELETE CASCADE,
    CONSTRAINT fk_purchase_items_book FOREIGN KEY (book_id) REFERENCES books(book_id),
    INDEX idx_purchase_items_book (book_id),
    CONSTRAINT chk_purchase_quantity CHECK (quantity > 0),
    CONSTRAINT chk_purchase_line_total CHECK (line_total = quantity * unit_price)
) ENGINE=InnoDB;

CREATE TABLE cart_items (
    cart_item_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    book_id BIGINT UNSIGNED NOT NULL,
    quantity INT UNSIGNED NOT NULL DEFAULT 1,
    added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_cart_user_book (user_id, book_id),
    CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_book FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE,
    CONSTRAINT chk_cart_quantity CHECK (quantity > 0)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- READER ACTIVITY
-- ---------------------------------------------------------------------
CREATE TABLE favorites (
    user_id BIGINT UNSIGNED NOT NULL,
    book_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, book_id),
    CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_favorites_book FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE recently_viewed (
    user_id BIGINT UNSIGNED NOT NULL,
    book_id BIGINT UNSIGNED NOT NULL,
    viewed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, book_id),
    INDEX idx_recent_user_time (user_id, viewed_at),
    CONSTRAINT fk_recent_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_recent_book FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Remembers the page where the reader stopped (the reader saves this)
CREATE TABLE reading_progress (
    user_id BIGINT UNSIGNED NOT NULL,
    book_id BIGINT UNSIGNED NOT NULL,
    current_page INT UNSIGNED NOT NULL DEFAULT 1,
    total_pages INT UNSIGNED NOT NULL DEFAULT 1,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, book_id),
    CONSTRAINT fk_progress_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_progress_book FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE,
    CONSTRAINT chk_progress_pages CHECK (current_page >= 1 AND current_page <= total_pages)
) ENGINE=InnoDB;

CREATE TABLE ratings (
    rating_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    book_id BIGINT UNSIGNED NOT NULL,
    stars TINYINT UNSIGNED NOT NULL,
    review_text TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_rating_user_book (user_id, book_id),
    CONSTRAINT fk_ratings_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_ratings_book FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE,
    CONSTRAINT chk_rating_stars CHECK (stars BETWEEN 1 AND 5)
) ENGINE=InnoDB;

CREATE TABLE book_reports (
    report_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    reporter_user_id BIGINT UNSIGNED NOT NULL,
    book_id BIGINT UNSIGNED NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('pending','reviewing','resolved','dismissed') NOT NULL DEFAULT 'pending',
    reviewed_by BIGINT UNSIGNED,
    reviewed_at DATETIME,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_reports_book FOREIGN KEY (book_id) REFERENCES books(book_id),
    CONSTRAINT fk_reports_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_reports_status (status)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- COMMUNICATION
-- ---------------------------------------------------------------------
CREATE TABLE notifications (
    notification_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_notifications_user_read (user_id, is_read, created_at)
) ENGINE=InnoDB;

-- NOTE: MySQL does not allow a CHECK on a column that has an ON DELETE
-- CASCADE foreign key, so "no self friend request" and "no duplicate
-- pair" are enforced by the triggers further down instead.
CREATE TABLE friendships (
    friendship_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    requester_user_id BIGINT UNSIGNED NOT NULL,
    addressee_user_id BIGINT UNSIGNED NOT NULL,
    status ENUM('pending','accepted','blocked') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_friendship_pair (requester_user_id, addressee_user_id),
    CONSTRAINT fk_friend_requester FOREIGN KEY (requester_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_friend_addressee FOREIGN KEY (addressee_user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE private_conversations (
    conversation_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_one_id BIGINT UNSIGNED NOT NULL,
    user_two_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_private_pair (user_one_id, user_two_id),
    CONSTRAINT fk_conversation_user_one FOREIGN KEY (user_one_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_conversation_user_two FOREIGN KEY (user_two_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE private_messages (
    message_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT UNSIGNED NOT NULL,
    sender_user_id BIGINT UNSIGNED NOT NULL,
    message_text TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_private_message_conversation FOREIGN KEY (conversation_id) REFERENCES private_conversations(conversation_id) ON DELETE CASCADE,
    CONSTRAINT fk_private_message_sender FOREIGN KEY (sender_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_private_messages_conversation_time (conversation_id, sent_at)
) ENGINE=InnoDB;

CREATE TABLE support_conversations (
    support_conversation_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    issue_type ENUM('borrow','order','premium','account','author','book','other') DEFAULT 'other',
    reference_code VARCHAR(100),
    needs_human BOOLEAN NOT NULL DEFAULT FALSE,
    admin_unread_count INT UNSIGNED NOT NULL DEFAULT 0,
    user_unread_count INT UNSIGNED NOT NULL DEFAULT 0,
    status ENUM('open','waiting','closed') NOT NULL DEFAULT 'open',
    last_away_notice_at DATETIME,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_support_conversation_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_support_status_updated (status, updated_at)
) ENGINE=InnoDB;

CREATE TABLE support_messages (
    support_message_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    support_conversation_id BIGINT UNSIGNED NOT NULL,
    sender_user_id BIGINT UNSIGNED,
    sender_type ENUM('user','admin','bot') NOT NULL,
    message_text TEXT NOT NULL,
    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_support_message_conversation FOREIGN KEY (support_conversation_id) REFERENCES support_conversations(support_conversation_id) ON DELETE CASCADE,
    CONSTRAINT fk_support_message_sender FOREIGN KEY (sender_user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_support_messages_time (support_conversation_id, sent_at)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- MONITORING
-- ---------------------------------------------------------------------
CREATE TABLE audit_logs (
    audit_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    actor_user_id BIGINT UNSIGNED,
    action VARCHAR(150) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_actor FOREIGN KEY (actor_user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_audit_created (created_at),
    INDEX idx_audit_actor (actor_user_id)
) ENGINE=InnoDB;

-- =====================================================================
-- VIEWS
-- =====================================================================
CREATE VIEW active_borrows AS
SELECT
    br.borrow_id,
    br.user_id,
    u.username,
    br.book_id,
    b.book_code,
    b.title,
    br.borrowed_at,
    br.due_at,
    br.borrow_fee,
    CASE
        WHEN br.returned_at IS NOT NULL THEN 'returned'
        WHEN DATE(br.due_at) < CURDATE() THEN 'overdue'
        ELSE 'borrowed'
    END AS current_status
FROM borrows br
JOIN users u ON u.user_id = br.user_id
JOIN books b ON b.book_id = br.book_id
WHERE br.returned_at IS NULL;

CREATE VIEW overdue_loans AS
SELECT
    br.borrow_id,
    u.username,
    u.email,
    b.book_code,
    b.title,
    br.due_at,
    DATEDIFF(CURDATE(), DATE(br.due_at)) AS days_late,
    DATEDIFF(CURDATE(), DATE(br.due_at)) * CAST(s.setting_value AS DECIMAL(10,2)) AS estimated_penalty
FROM borrows br
JOIN users u ON u.user_id = br.user_id
JOIN books b ON b.book_id = br.book_id
JOIN library_settings s ON s.setting_key = 'penalty_per_day'
WHERE br.returned_at IS NULL
  AND DATE(br.due_at) < CURDATE();

CREATE VIEW library_sales_summary AS
SELECT
    DATE(p.purchased_at) AS sale_date,
    COUNT(DISTINCT p.purchase_id) AS transaction_count,
    SUM(pi.quantity) AS books_sold,
    SUM(pi.line_total) AS gross_sales
FROM purchases p
JOIN purchase_items pi ON pi.purchase_id = p.purchase_id
WHERE p.payment_status = 'paid'
GROUP BY DATE(p.purchased_at);

-- The admin dashboard counts book sales, borrow fees and premium payments
CREATE VIEW library_revenue_summary AS
SELECT DATE(p.purchased_at) AS revenue_date,
       'book_sales' AS revenue_source,
       COUNT(*) AS transactions,
       SUM(p.total_amount) AS revenue
FROM purchases p
WHERE p.payment_status = 'paid'
GROUP BY DATE(p.purchased_at)
UNION ALL
SELECT DATE(br.borrowed_at),
       'borrow_fees',
       COUNT(*),
       SUM(br.borrow_fee)
FROM borrows br
GROUP BY DATE(br.borrowed_at)
UNION ALL
SELECT DATE(pm.started_at),
       'premium_memberships',
       COUNT(*),
       SUM(pm.price)
FROM premium_memberships pm
WHERE pm.status IN ('active','expired','cancelled')
GROUP BY DATE(pm.started_at);

-- =====================================================================
-- STORED PROCEDURES AND TRIGGERS
-- =====================================================================
DELIMITER $$

-- Recomputes a book's rating. The seeded catalog rating counts as
-- base_rating_count votes (1), exactly like the front end formula.
CREATE PROCEDURE refresh_book_rating(IN p_book_id BIGINT UNSIGNED)
BEGIN
    DECLARE v_count INT UNSIGNED DEFAULT 0;
    DECLARE v_sum INT UNSIGNED DEFAULT 0;

    SELECT COUNT(*), COALESCE(SUM(stars), 0)
    INTO v_count, v_sum
    FROM ratings
    WHERE book_id = p_book_id;

    UPDATE books
    SET rating_count = base_rating_count + v_count,
        average_rating = IF(base_rating_count + v_count = 0, 0,
            ROUND((base_rating * base_rating_count + v_sum) / (base_rating_count + v_count), 2))
    WHERE book_id = p_book_id;
END$$

-- Rule: max active borrows, 14 days, fee, premium, banned, copies
CREATE PROCEDURE borrow_book(
    IN p_user_id BIGINT UNSIGNED,
    IN p_book_id BIGINT UNSIGNED
)
BEGIN
    DECLARE v_title VARCHAR(255);
    DECLARE v_available INT UNSIGNED;
    DECLARE v_is_premium BOOLEAN;
    DECLARE v_membership VARCHAR(20);
    DECLARE v_role VARCHAR(20);
    DECLARE v_banned BOOLEAN;
    DECLARE v_active_count INT DEFAULT 0;
    DECLARE v_existing_count INT DEFAULT 0;
    DECLARE v_max_borrows INT DEFAULT 3;
    DECLARE v_days INT DEFAULT 14;
    DECLARE v_fee DECIMAL(10,2) DEFAULT 10.00;
    DECLARE v_due DATETIME;
    DECLARE v_borrow_id BIGINT UNSIGNED;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    SELECT CAST(setting_value AS UNSIGNED) INTO v_max_borrows
    FROM library_settings WHERE setting_key = 'max_active_borrows';
    SELECT CAST(setting_value AS UNSIGNED) INTO v_days
    FROM library_settings WHERE setting_key = 'borrow_days';
    SELECT CAST(setting_value AS DECIMAL(10,2)) INTO v_fee
    FROM library_settings WHERE setting_key = 'borrow_fee';

    START TRANSACTION;

    SELECT title, available_copies, is_premium
    INTO v_title, v_available, v_is_premium
    FROM books
    WHERE book_id = p_book_id AND is_published = TRUE
    FOR UPDATE;

    SELECT membership, role, is_banned
    INTO v_membership, v_role, v_banned
    FROM users
    WHERE user_id = p_user_id
    FOR UPDATE;

    SELECT COUNT(*) INTO v_active_count
    FROM borrows
    WHERE user_id = p_user_id AND returned_at IS NULL;

    SELECT COUNT(*) INTO v_existing_count
    FROM borrows
    WHERE user_id = p_user_id AND book_id = p_book_id AND returned_at IS NULL;

    IF v_available IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Book not found or not published';
    ELSEIF v_membership IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User not found';
    ELSEIF v_banned = TRUE THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'This account is banned';
    ELSEIF v_available < 1 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No available copies';
    ELSEIF v_active_count >= v_max_borrows THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Maximum number of active borrows reached';
    ELSEIF v_existing_count > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'This book is already borrowed by this user';
    ELSEIF v_is_premium = TRUE AND v_membership <> 'premium' AND v_role <> 'admin' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Premium membership required';
    ELSE
        SET v_due = DATE_ADD(NOW(), INTERVAL v_days DAY);

        INSERT INTO borrows (user_id, book_id, borrowed_at, due_at, borrow_fee, status)
        VALUES (p_user_id, p_book_id, NOW(), v_due, v_fee, 'borrowed');
        SET v_borrow_id = LAST_INSERT_ID();

        UPDATE books
        SET available_copies = available_copies - 1
        WHERE book_id = p_book_id;

        INSERT INTO notifications (user_id, title, message)
        VALUES (p_user_id, 'Book Borrowed',
                CONCAT('You borrowed "', v_title, '". Fee: PHP ', v_fee, '. Due date: ', DATE(v_due)));

        INSERT INTO audit_logs (actor_user_id, action, details)
        VALUES (p_user_id, 'Loan started',
                CONCAT(v_title, '; due ', DATE(v_due), '; fee PHP ', v_fee));

        COMMIT;

        SELECT v_borrow_id AS borrow_id, v_due AS due_at, v_fee AS borrow_fee;
    END IF;
END$$

-- p_user_id = NULL means a librarian/admin is returning the book for the member
CREATE PROCEDURE return_borrowed_book(
    IN p_borrow_id BIGINT UNSIGNED,
    IN p_user_id BIGINT UNSIGNED
)
BEGIN
    DECLARE v_book_id BIGINT UNSIGNED;
    DECLARE v_borrower BIGINT UNSIGNED;
    DECLARE v_returned_at DATETIME;
    DECLARE v_due DATETIME;
    DECLARE v_title VARCHAR(255);
    DECLARE v_rate DECIMAL(10,2) DEFAULT 10.00;
    DECLARE v_days_late INT DEFAULT 0;
    DECLARE v_penalty DECIMAL(10,2) DEFAULT 0.00;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    SELECT CAST(setting_value AS DECIMAL(10,2)) INTO v_rate
    FROM library_settings WHERE setting_key = 'penalty_per_day';

    START TRANSACTION;

    SELECT br.book_id, br.user_id, br.returned_at, br.due_at, b.title
    INTO v_book_id, v_borrower, v_returned_at, v_due, v_title
    FROM borrows br
    JOIN books b ON b.book_id = br.book_id
    WHERE br.borrow_id = p_borrow_id
      AND (p_user_id IS NULL OR br.user_id = p_user_id)
    FOR UPDATE;

    IF v_book_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Borrow record not found';
    ELSEIF v_returned_at IS NOT NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Book has already been returned';
    ELSE
        SET v_days_late = GREATEST(0, DATEDIFF(CURDATE(), DATE(v_due)));
        SET v_penalty = v_days_late * v_rate;

        UPDATE borrows
        SET returned_at = NOW(),
            status = 'returned',
            overdue_days = v_days_late,
            overdue_penalty = v_penalty
        WHERE borrow_id = p_borrow_id;

        UPDATE books
        SET available_copies = LEAST(total_copies, available_copies + 1)
        WHERE book_id = v_book_id;

        INSERT INTO notifications (user_id, title, message)
        VALUES (v_borrower, 'Book Returned',
                CONCAT('You returned "', v_title, '". Days late: ', v_days_late,
                       '. Estimated penalty: PHP ', v_penalty));

        INSERT INTO audit_logs (actor_user_id, action, details)
        VALUES (p_user_id, 'Loan returned',
                CONCAT(v_title, '; ', v_days_late, ' day(s) late; penalty PHP ', v_penalty));

        COMMIT;

        SELECT v_days_late AS days_late, v_penalty AS overdue_penalty;
    END IF;
END$$

-- Turns the user's cart into a paid purchase (demo payment) and clears the cart
CREATE PROCEDURE checkout_cart(
    IN p_user_id BIGINT UNSIGNED,
    IN p_method VARCHAR(20)
)
BEGIN
    DECLARE v_user_ok INT DEFAULT 0;
    DECLARE v_items INT DEFAULT 0;
    DECLARE v_purchase_id BIGINT UNSIGNED;
    DECLARE v_total DECIMAL(12,2) DEFAULT 0.00;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_method NOT IN ('gcash','maya','bank','cash','other') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid payment method';
    END IF;

    START TRANSACTION;

    SELECT COUNT(*) INTO v_user_ok
    FROM users WHERE user_id = p_user_id AND is_banned = FALSE;

    SELECT COUNT(*) INTO v_items
    FROM cart_items WHERE user_id = p_user_id;

    IF v_user_ok = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User not found or banned';
    ELSEIF v_items = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cart is empty';
    ELSE
        INSERT INTO purchases (user_id, total_amount, payment_method, payment_status, payment_reference)
        VALUES (p_user_id, 0, p_method, 'paid',
                CONCAT('DEMO-', UPPER(p_method), '-', UNIX_TIMESTAMP()));
        SET v_purchase_id = LAST_INSERT_ID();

        INSERT INTO purchase_items (purchase_id, book_id, quantity, unit_price, line_total)
        SELECT v_purchase_id, ci.book_id, ci.quantity, b.price, ci.quantity * b.price
        FROM cart_items ci
        JOIN books b ON b.book_id = ci.book_id
        WHERE ci.user_id = p_user_id AND b.is_published = TRUE;

        SET v_items = ROW_COUNT();

        IF v_items = 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No purchasable books in the cart';
        END IF;

        SELECT COALESCE(SUM(line_total), 0) INTO v_total
        FROM purchase_items WHERE purchase_id = v_purchase_id;

        UPDATE purchases SET total_amount = v_total WHERE purchase_id = v_purchase_id;

        DELETE FROM cart_items WHERE user_id = p_user_id;

        INSERT INTO notifications (user_id, title, message)
        VALUES (p_user_id, 'Checkout Complete',
                CONCAT('Purchased items totaling PHP ', v_total, '.'));

        INSERT INTO audit_logs (actor_user_id, action, details)
        VALUES (p_user_id, 'Purchase transaction',
                CONCAT(v_items, ' title(s), PHP ', v_total, ' via ', UPPER(p_method), ' (demo).'));

        COMMIT;

        SELECT v_purchase_id AS purchase_id, v_total AS total_amount;
    END IF;
END$$

CREATE PROCEDURE activate_premium(
    IN p_user_id BIGINT UNSIGNED,
    IN p_method VARCHAR(20),
    IN p_reference VARCHAR(100)
)
BEGIN
    DECLARE v_user_ok INT DEFAULT 0;
    DECLARE v_active INT DEFAULT 0;
    DECLARE v_price DECIMAL(10,2) DEFAULT 99.00;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_method NOT IN ('gcash','maya','bank') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid payment method';
    END IF;

    SELECT CAST(setting_value AS DECIMAL(10,2)) INTO v_price
    FROM library_settings WHERE setting_key = 'premium_monthly_price';

    START TRANSACTION;

    SELECT COUNT(*) INTO v_user_ok
    FROM users WHERE user_id = p_user_id AND is_banned = FALSE FOR UPDATE;

    SELECT COUNT(*) INTO v_active
    FROM premium_memberships
    WHERE user_id = p_user_id AND status = 'active' AND expires_at > NOW();

    IF v_user_ok = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User not found or banned';
    ELSEIF v_active > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Premium membership is already active';
    ELSE
        INSERT INTO premium_memberships (user_id, price, started_at, expires_at, status, payment_reference)
        VALUES (p_user_id, v_price, NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH), 'active',
                CONCAT(UPPER(p_method), ':', COALESCE(p_reference, 'DEMO')));

        UPDATE users SET membership = 'premium' WHERE user_id = p_user_id;

        INSERT INTO notifications (user_id, title, message)
        VALUES (p_user_id, 'Premium Membership Activated',
                'Welcome to Premium! Demo payment recorded. No real payment was processed.');

        INSERT INTO audit_logs (actor_user_id, action, details)
        VALUES (p_user_id, 'Premium membership activated',
                CONCAT('PHP ', v_price, ' via ', UPPER(p_method), ' (demo transaction).'));

        COMMIT;
    END IF;
END$$

CREATE PROCEDURE cancel_premium(IN p_user_id BIGINT UNSIGNED)
BEGIN
    DECLARE v_rows INT DEFAULT 0;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    UPDATE premium_memberships
    SET status = 'cancelled'
    WHERE user_id = p_user_id AND status = 'active';

    SET v_rows = ROW_COUNT();

    IF v_rows = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No active premium membership found';
    ELSE
        UPDATE users SET membership = 'regular' WHERE user_id = p_user_id;

        INSERT INTO notifications (user_id, title, message)
        VALUES (p_user_id, 'Subscription Canceled',
                'Your Premium membership has been canceled. You are now a Regular member.');

        INSERT INTO audit_logs (actor_user_id, action, details)
        VALUES (p_user_id, 'Premium membership canceled', 'Changed to regular membership.');

        COMMIT;
    END IF;
END$$

-- Run this daily (manually or with a MySQL event) to end expired memberships
CREATE PROCEDURE expire_premium_memberships()
BEGIN
    UPDATE users u
    JOIN premium_memberships pm ON pm.user_id = u.user_id
    SET u.membership = 'regular'
    WHERE pm.status = 'active' AND pm.expires_at <= NOW();

    UPDATE premium_memberships
    SET status = 'expired'
    WHERE status = 'active' AND expires_at <= NOW();

    SELECT ROW_COUNT() AS memberships_expired;
END$$

CREATE PROCEDURE review_author_application(
    IN p_application_id BIGINT UNSIGNED,
    IN p_reviewer_id BIGINT UNSIGNED,
    IN p_decision VARCHAR(10),
    IN p_note TEXT
)
BEGIN
    DECLARE v_reviewer_ok INT DEFAULT 0;
    DECLARE v_user BIGINT UNSIGNED;
    DECLARE v_pen VARCHAR(40);
    DECLARE v_bio VARCHAR(300);
    DECLARE v_status VARCHAR(20);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_decision NOT IN ('approved','rejected') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Decision must be approved or rejected';
    END IF;

    START TRANSACTION;

    SELECT COUNT(*) INTO v_reviewer_ok
    FROM users
    WHERE user_id = p_reviewer_id AND role IN ('admin','librarian') AND is_banned = FALSE;

    SELECT user_id, pen_name, biography, application_status
    INTO v_user, v_pen, v_bio, v_status
    FROM author_applications
    WHERE application_id = p_application_id
    FOR UPDATE;

    IF v_reviewer_ok = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Only staff can review author applications';
    ELSEIF v_user IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Application not found';
    ELSEIF v_status <> 'pending' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Application was already reviewed';
    ELSE
        UPDATE author_applications
        SET application_status = p_decision,
            reviewed_by = p_reviewer_id,
            reviewed_at = NOW(),
            review_note = p_note
        WHERE application_id = p_application_id;

        IF p_decision = 'approved' THEN
            UPDATE users
            SET author_status = 'approved', pen_name = v_pen, author_bio = v_bio
            WHERE user_id = v_user;
        ELSE
            UPDATE users SET author_status = 'rejected' WHERE user_id = v_user;
        END IF;

        INSERT INTO notifications (user_id, title, message)
        VALUES (v_user, 'Author Application',
                CONCAT('Your author application was ', p_decision, '.'));

        INSERT INTO audit_logs (actor_user_id, action, details)
        VALUES (p_reviewer_id, 'Author application reviewed',
                CONCAT('Application ', p_application_id, ' ', p_decision, '.'));

        COMMIT;
    END IF;
END$$

-- Staff or the book's own author can delete. Books with loan, purchase or
-- report history are unpublished instead, so old records stay valid.
CREATE PROCEDURE delete_book(
    IN p_book_id BIGINT UNSIGNED,
    IN p_actor_id BIGINT UNSIGNED
)
BEGIN
    DECLARE v_title VARCHAR(255);
    DECLARE v_author_id BIGINT UNSIGNED;
    DECLARE v_is_staff INT DEFAULT 0;
    DECLARE v_active INT DEFAULT 0;
    DECLARE v_history INT DEFAULT 0;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT title, author_user_id
    INTO v_title, v_author_id
    FROM books
    WHERE book_id = p_book_id
    FOR UPDATE;

    SELECT COUNT(*) INTO v_is_staff
    FROM users
    WHERE user_id = p_actor_id AND role IN ('admin','librarian') AND is_banned = FALSE;

    SELECT COUNT(*) INTO v_active
    FROM borrows WHERE book_id = p_book_id AND returned_at IS NULL;

    SELECT (SELECT COUNT(*) FROM borrows WHERE book_id = p_book_id)
         + (SELECT COUNT(*) FROM purchase_items WHERE book_id = p_book_id)
         + (SELECT COUNT(*) FROM book_reports WHERE book_id = p_book_id)
    INTO v_history;

    IF v_title IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Book not found';
    ELSEIF v_is_staff = 0 AND (v_author_id IS NULL OR v_author_id <> p_actor_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'You are not allowed to delete this book';
    ELSEIF v_active > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'This book is currently borrowed';
    ELSE
        DELETE FROM cart_items WHERE book_id = p_book_id;

        IF v_history > 0 THEN
            DELETE FROM favorites WHERE book_id = p_book_id;
            DELETE FROM recently_viewed WHERE book_id = p_book_id;
            UPDATE books SET is_published = FALSE WHERE book_id = p_book_id;
        ELSE
            DELETE FROM books WHERE book_id = p_book_id;
        END IF;

        INSERT INTO audit_logs (actor_user_id, action, details)
        VALUES (p_actor_id, 'Deleted book', CONCAT(v_title, ' (id ', p_book_id, ').'));

        COMMIT;

        SELECT IF(v_history > 0, 'unpublished', 'deleted') AS result;
    END IF;
END$$

-- Protected (built-in) accounts cannot be deleted. Active loans give their
-- copies back to the shelf first, and ratings are removed with DELETE so
-- the rating triggers run (cascade deletes do not fire triggers).
CREATE PROCEDURE delete_user_account(IN p_user_id BIGINT UNSIGNED)
BEGIN
    DECLARE v_username VARCHAR(40);
    DECLARE v_protected BOOLEAN;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT username, is_protected
    INTO v_username, v_protected
    FROM users
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF v_username IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User not found';
    ELSEIF v_protected = TRUE THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Protected accounts cannot be deleted';
    ELSE
        UPDATE books b
        JOIN borrows br ON br.book_id = b.book_id
        SET b.available_copies = LEAST(b.total_copies, b.available_copies + 1)
        WHERE br.user_id = p_user_id AND br.returned_at IS NULL;

        DELETE FROM ratings WHERE user_id = p_user_id;

        INSERT INTO audit_logs (actor_user_id, action, details)
        VALUES (NULL, 'Account deleted', CONCAT('Username: ', v_username));

        DELETE FROM users WHERE user_id = p_user_id;

        COMMIT;
    END IF;
END$$

-- ---------------------------------------------------------------------
-- TRIGGERS
-- ---------------------------------------------------------------------
CREATE TRIGGER trg_rating_requires_purchase
BEFORE INSERT ON ratings
FOR EACH ROW
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM purchase_items pi
        JOIN purchases p ON p.purchase_id = pi.purchase_id
        WHERE p.user_id = NEW.user_id
          AND pi.book_id = NEW.book_id
          AND p.payment_status = 'paid'
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'A book must be purchased before it can be rated';
    END IF;
END$$

CREATE TRIGGER trg_rating_update_requires_purchase
BEFORE UPDATE ON ratings
FOR EACH ROW
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM purchase_items pi
        JOIN purchases p ON p.purchase_id = pi.purchase_id
        WHERE p.user_id = NEW.user_id
          AND pi.book_id = NEW.book_id
          AND p.payment_status = 'paid'
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'A book must be purchased before it can be rated';
    END IF;
END$$

CREATE TRIGGER trg_rating_after_insert
AFTER INSERT ON ratings
FOR EACH ROW
BEGIN
    CALL refresh_book_rating(NEW.book_id);
END$$

CREATE TRIGGER trg_rating_after_update
AFTER UPDATE ON ratings
FOR EACH ROW
BEGIN
    IF OLD.book_id <> NEW.book_id THEN
        CALL refresh_book_rating(OLD.book_id);
    END IF;

    CALL refresh_book_rating(NEW.book_id);
END$$

CREATE TRIGGER trg_rating_after_delete
AFTER DELETE ON ratings
FOR EACH ROW
BEGIN
    CALL refresh_book_rating(OLD.book_id);
END$$

CREATE TRIGGER trg_friendship_validate
BEFORE INSERT ON friendships
FOR EACH ROW
BEGIN
    IF NEW.requester_user_id = NEW.addressee_user_id THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'You cannot send a friend request to yourself';
    END IF;

    IF EXISTS (
        SELECT 1 FROM friendships
        WHERE requester_user_id = NEW.addressee_user_id
          AND addressee_user_id = NEW.requester_user_id
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'A friendship record already exists for these users';
    END IF;
END$$

CREATE TRIGGER trg_conversation_validate
BEFORE INSERT ON private_conversations
FOR EACH ROW
BEGIN
    IF NEW.user_one_id >= NEW.user_two_id THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'user_one_id must be smaller than user_two_id';
    END IF;
END$$

DELIMITER ;

-- =====================================================================
-- SEED DATA
-- =====================================================================
INSERT INTO library_settings (setting_key, setting_value, description) VALUES
('max_active_borrows', '3', 'Maximum number of books a member can borrow at once'),
('borrow_days', '14', 'Days before a borrowed book is due'),
('borrow_fee', '10.00', 'Fee per borrowed book (PHP)'),
('penalty_per_day', '10.00', 'Overdue penalty per day late (PHP); admin can change it'),
('premium_monthly_price', '99.00', 'Premium membership price per month (PHP)');

-- Starter admin account. Temporary password: Admin_2026#
-- (PBKDF2-SHA256, 100000 iterations, same method as the front end.)
-- CHANGE THIS PASSWORD after the first login.
INSERT INTO users (username, email, password_hash, password_salt, role, membership, is_protected)
VALUES ('libraryadmin', 'admin@penetrativelibrary.local', '620f4094ff16024609aee0cc7ce0e57cf12ccbb2632794ce4e2fde63b39e3d32', '0e767db7bf9779931699928339baa7da', 'admin', 'premium', TRUE);

INSERT INTO user_preferences (user_id) SELECT user_id FROM users WHERE username = 'libraryadmin';

-- 25 catalog books copied from defaultBooks in script.js
INSERT INTO books
(book_code, title, author_name, category, price, publication_year, edition, total_copies, available_copies, shelf, book_condition, description, base_rating, base_rating_count, rating_count, average_rating, latest_date, cover_image, is_premium)
VALUES
('BK-101','Clean Codings','Robert B. Stark','Programming',450.00,2024,'2nd',5,3,'A-12','Good','A handbook of agile software craftsmanship.',4.70,1,1,4.70,'2024-10-05','images/clean-codings.jpg',FALSE),
('BK-102','The C Programming Language','Xean M. Verutacio','Programming',300.00,2013,'1st',4,2,'A-08','Fair','Classic introduction to C.',4.50,1,1,4.50,'2013-03-03','images/the-c-programming-language.jpg',FALSE),
('BK-103','Introduction to Java Programming','Y. Daniel Liang','Programming',250.00,2022,'12th',6,5,'A-15','Excellent','Comprehensive Java textbook.',4.30,1,1,4.30,'2026-10-17','images/introduction-to-java-programming.jpg',FALSE),
('BK-104','Python Crash Course','Eric Banner','Programming',250.00,2023,'3rd',8,6,'A-03','Good','Hands-on Python projects.',4.80,1,1,4.80,'2026-10-17','images/python-crash-course.jpg',FALSE),
('BK-105','Eloquent Web Design','Herbert T. Pherbhert','Programming',250.00,2021,'1st',3,1,'B-07','Good','Modern web design principles.',4.10,1,1,4.10,'2026-10-17','images/eloquent-web-design.jpg',FALSE),
('BK-106','Computer Organization and Design','Robert B. Stark','Computer Engineering',280.00,2020,'5th',4,3,'C-01','Good','Hardware/software interface.',4.40,1,1,4.40,'2026-10-17','images/computer-organization-and-design.jpg',FALSE),
('BK-107','Computer Architecture','Bruce Banter','Computer Engineering',270.00,2019,'2nd',3,2,'C-04','Fair','Quantitative architecture.',4.20,1,1,4.20,'2026-10-17','images/computer-architecture.jpg',FALSE),
('BK-108','Digital Design','Dixon Nixon','Computer Engineering',260.00,2021,'1st',5,4,'C-09','Excellent','Digital logic fundamentals.',4.00,1,1,4.00,'2026-10-17','images/digital-design.jpg',FALSE),
('BK-109','Electronics Circuits','Krey Thos','Computer Engineering',240.00,2018,'3rd',4,2,'C-11','Good','Electronic circuit analysis.',3.90,1,1,3.90,'2026-10-17','images/electronics-circuits.jpg',FALSE),
('BK-110','Embedded System','Kirk Cobain','Computer Engineering',290.00,2022,'1st',3,3,'C-14','Excellent','Embedded systems design.',4.30,1,1,4.30,'2026-10-17','images/embedded-system.jpg',FALSE),
('BK-111','Computer Networking','Steve Nash','Networking',320.00,2021,'8th',5,3,'D-02','Good','Top-down networking approach.',4.60,1,1,4.60,'2026-10-17','images/computer-networking.jpg',FALSE),
('BK-112','Network Communication','Kwah Liti','Networking',230.00,2020,'2nd',4,4,'D-05','Good','Network protocols.',4.00,1,1,4.00,'2026-10-17','images/network-communication.jpg',FALSE),
('BK-113','Introduction to Internet','LeBrown Jeims','Networking',200.00,2019,'1st',6,5,'D-08','Fair','Internet basics.',3.80,1,1,3.80,'2026-10-17','images/introduction-to-internet.jpg',FALSE),
('BK-114','Data Networking','Halt and Others','Networking',250.00,2022,'1st',3,1,'D-12','Good','Data communication concepts.',4.10,1,1,4.10,'2026-10-17','images/data-networking.jpg',FALSE),
('BK-115','TCP/IP Illustrated','Walter Black','Networking',310.00,2018,'2nd',4,2,'D-15','Good','TCP/IP protocol suite.',4.50,1,1,4.50,'2026-10-17','images/tcp-ip-illustrated.jpg',FALSE),
('BK-116','Security Engineering','Robert B. Stark','Cybersecurity',350.00,2020,'3rd',3,2,'E-01','Excellent','Building secure systems.',4.70,1,1,4.70,'2026-10-17','images/security-engineering.jpg',FALSE),
('BK-117','Hacking: The Art of Exploitation','Jonathan Klied','Cybersecurity',280.00,2019,'2nd',4,1,'E-04','Good','Hands-on hacking techniques.',4.40,1,1,4.40,'2026-10-17','images/hacking-the-art-of-exploitation.jpg',FALSE),
('BK-118','Blue Team Handbook','Anna Klied','Cybersecurity',260.00,2021,'1st',5,4,'E-07','Excellent','Incident response guide.',4.20,1,1,4.20,'2026-10-17','images/blue-team-handbook.jpg',FALSE),
('BK-119','Threat Modeling','Frank Einstein','Cybersecurity',240.00,2022,'1st',3,3,'E-10','Good','Security threat modeling.',4.00,1,1,4.00,'2026-10-17','images/threat-modeling.jpg',FALSE),
('BK-120','Introduction to Cryptography','Alfred Camel','Cybersecurity',270.00,2020,'2nd',4,2,'E-13','Good','Cryptography fundamentals.',4.30,1,1,4.30,'2026-10-17','images/introduction-to-cryptography.jpg',FALSE),
('BK-121','Hands-On Machine Learning','Seiy Antis','AI and Data Science',380.00,2022,'3rd',5,3,'F-02','Excellent','Practical ML with Python.',4.80,1,1,4.80,'2026-10-17','images/hands-on-machine-learning.jpg',FALSE),
('BK-122','Deep Learning','Magnus Nakamura','AI and Data Science',400.00,2021,'1st',3,1,'F-05','Good','Deep learning introduction.',4.60,1,1,4.60,'2026-10-17','images/deep-learning.jpg',FALSE),
('BK-123','Artificial Intelligence: A Modern Approach','Robert B. Stark','AI and Data Science',420.00,2020,'4th',4,2,'F-08','Excellent','The definitive AI textbook.',4.90,1,1,4.90,'2026-10-17','images/artificial-intelligence-a-modern-approach.jpg',FALSE),
('BK-124','Python for Machine Learning','Hadji Glitch','AI and Data Science',290.00,2023,'2nd',6,5,'F-11','Good','ML projects with Python.',4.40,1,1,4.40,'2026-10-17','images/python-for-machine-learning.jpg',FALSE),
('BK-125','Data Science from Scratch','Kirk Cobain','AI and Data Science',310.00,2019,'2nd',4,3,'F-14','Good','Data science fundamentals.',4.50,1,1,4.50,'2026-10-17','images/data-science-from-scratch.jpg',FALSE);

-- 75 premium books (same formulas as the front end)
INSERT INTO books
(book_code, title, author_name, category, price, publication_year, edition, total_copies, available_copies, shelf, book_condition, description, base_rating, base_rating_count, rating_count, average_rating, latest_date, cover_image, is_premium)
VALUES
('PBK-201','Advanced Programming Masterclass Vol. 1','Robert B. Stark','Programming',510.00,2025,'VIP 1st',5,5,'VIP-1','Pristine','Exclusive VIP Premium book covering expert-level concepts in Programming.',5.00,1,1,5.00,'2026-10-17','images/premium-book-001.jpg',TRUE),
('PBK-202','Advanced Computer Engineering Masterclass Vol. 2','Xean M. Verutacio','Computer Engineering',520.00,2025,'VIP 1st',5,5,'VIP-2','Pristine','Exclusive VIP Premium book covering expert-level concepts in Computer Engineering.',5.00,1,1,5.00,'2026-10-17','images/premium-book-002.jpg',TRUE),
('PBK-203','Advanced Networking Masterclass Vol. 3','Y. Daniel Liang','Networking',530.00,2025,'VIP 1st',5,5,'VIP-3','Pristine','Exclusive VIP Premium book covering expert-level concepts in Networking.',5.00,1,1,5.00,'2026-10-17','images/premium-book-003.jpg',TRUE),
('PBK-204','Advanced Cybersecurity Masterclass Vol. 4','Eric Banner','Cybersecurity',540.00,2025,'VIP 1st',5,5,'VIP-4','Pristine','Exclusive VIP Premium book covering expert-level concepts in Cybersecurity.',5.00,1,1,5.00,'2026-10-17','images/premium-book-004.jpg',TRUE),
('PBK-205','Advanced AI and Data Science Masterclass Vol. 5','Herbert T. Pherbhert','AI and Data Science',550.00,2025,'VIP 1st',5,5,'VIP-5','Pristine','Exclusive VIP Premium book covering expert-level concepts in AI and Data Science.',5.00,1,1,5.00,'2026-10-17','images/premium-book-005.jpg',TRUE),
('PBK-206','Advanced Programming Masterclass Vol. 6','Steve Nash','Programming',560.00,2025,'VIP 1st',5,5,'VIP-6','Pristine','Exclusive VIP Premium book covering expert-level concepts in Programming.',5.00,1,1,5.00,'2026-10-17','images/premium-book-006.jpg',TRUE),
('PBK-207','Advanced Computer Engineering Masterclass Vol. 7','Jonathan Klied','Computer Engineering',570.00,2025,'VIP 1st',5,5,'VIP-7','Pristine','Exclusive VIP Premium book covering expert-level concepts in Computer Engineering.',5.00,1,1,5.00,'2026-10-17','images/premium-book-007.jpg',TRUE),
('PBK-208','Advanced Networking Masterclass Vol. 8','Seiy Antis','Networking',580.00,2025,'VIP 1st',5,5,'VIP-8','Pristine','Exclusive VIP Premium book covering expert-level concepts in Networking.',5.00,1,1,5.00,'2026-10-17','images/premium-book-008.jpg',TRUE),
('PBK-209','Advanced Cybersecurity Masterclass Vol. 9','Magnus Nakamura','Cybersecurity',590.00,2025,'VIP 1st',5,5,'VIP-9','Pristine','Exclusive VIP Premium book covering expert-level concepts in Cybersecurity.',5.00,1,1,5.00,'2026-10-17','images/premium-book-009.jpg',TRUE),
('PBK-210','Advanced AI and Data Science Masterclass Vol. 10','Robert B. Stark','AI and Data Science',600.00,2025,'VIP 1st',5,5,'VIP-10','Pristine','Exclusive VIP Premium book covering expert-level concepts in AI and Data Science.',5.00,1,1,5.00,'2026-10-17','images/premium-book-010.jpg',TRUE),
('PBK-211','Advanced Programming Masterclass Vol. 11','Xean M. Verutacio','Programming',610.00,2025,'VIP 1st',5,5,'VIP-11','Pristine','Exclusive VIP Premium book covering expert-level concepts in Programming.',5.00,1,1,5.00,'2026-10-17','images/premium-book-011.jpg',TRUE),
('PBK-212','Advanced Computer Engineering Masterclass Vol. 12','Y. Daniel Liang','Computer Engineering',620.00,2025,'VIP 1st',5,5,'VIP-12','Pristine','Exclusive VIP Premium book covering expert-level concepts in Computer Engineering.',5.00,1,1,5.00,'2026-10-17','images/premium-book-012.jpg',TRUE),
('PBK-213','Advanced Networking Masterclass Vol. 13','Eric Banner','Networking',630.00,2025,'VIP 1st',5,5,'VIP-13','Pristine','Exclusive VIP Premium book covering expert-level concepts in Networking.',5.00,1,1,5.00,'2026-10-17','images/premium-book-013.jpg',TRUE),
('PBK-214','Advanced Cybersecurity Masterclass Vol. 14','Herbert T. Pherbhert','Cybersecurity',640.00,2025,'VIP 1st',5,5,'VIP-14','Pristine','Exclusive VIP Premium book covering expert-level concepts in Cybersecurity.',5.00,1,1,5.00,'2026-10-17','images/premium-book-014.jpg',TRUE),
('PBK-215','Advanced AI and Data Science Masterclass Vol. 15','Steve Nash','AI and Data Science',650.00,2025,'VIP 1st',5,5,'VIP-15','Pristine','Exclusive VIP Premium book covering expert-level concepts in AI and Data Science.',5.00,1,1,5.00,'2026-10-17','images/premium-book-015.jpg',TRUE),
('PBK-216','Advanced Programming Masterclass Vol. 16','Jonathan Klied','Programming',660.00,2025,'VIP 1st',5,5,'VIP-16','Pristine','Exclusive VIP Premium book covering expert-level concepts in Programming.',5.00,1,1,5.00,'2026-10-17','images/premium-book-016.jpg',TRUE),
('PBK-217','Advanced Computer Engineering Masterclass Vol. 17','Seiy Antis','Computer Engineering',670.00,2025,'VIP 1st',5,5,'VIP-17','Pristine','Exclusive VIP Premium book covering expert-level concepts in Computer Engineering.',5.00,1,1,5.00,'2026-10-17','images/premium-book-017.jpg',TRUE),
('PBK-218','Advanced Networking Masterclass Vol. 18','Magnus Nakamura','Networking',680.00,2025,'VIP 1st',5,5,'VIP-18','Pristine','Exclusive VIP Premium book covering expert-level concepts in Networking.',5.00,1,1,5.00,'2026-10-17','images/premium-book-018.jpg',TRUE),
('PBK-219','Advanced Cybersecurity Masterclass Vol. 19','Robert B. Stark','Cybersecurity',690.00,2025,'VIP 1st',5,5,'VIP-19','Pristine','Exclusive VIP Premium book covering expert-level concepts in Cybersecurity.',5.00,1,1,5.00,'2026-10-17','images/premium-book-019.jpg',TRUE),
('PBK-220','Advanced AI and Data Science Masterclass Vol. 20','Xean M. Verutacio','AI and Data Science',700.00,2025,'VIP 1st',5,5,'VIP-20','Pristine','Exclusive VIP Premium book covering expert-level concepts in AI and Data Science.',5.00,1,1,5.00,'2026-10-17','images/premium-book-020.jpg',TRUE),
('PBK-221','Advanced Programming Masterclass Vol. 21','Y. Daniel Liang','Programming',710.00,2025,'VIP 1st',5,5,'VIP-21','Pristine','Exclusive VIP Premium book covering expert-level concepts in Programming.',5.00,1,1,5.00,'2026-10-17','images/premium-book-021.jpg',TRUE),
('PBK-222','Advanced Computer Engineering Masterclass Vol. 22','Eric Banner','Computer Engineering',720.00,2025,'VIP 1st',5,5,'VIP-22','Pristine','Exclusive VIP Premium book covering expert-level concepts in Computer Engineering.',5.00,1,1,5.00,'2026-10-17','images/premium-book-022.jpg',TRUE),
('PBK-223','Advanced Networking Masterclass Vol. 23','Herbert T. Pherbhert','Networking',730.00,2025,'VIP 1st',5,5,'VIP-23','Pristine','Exclusive VIP Premium book covering expert-level concepts in Networking.',5.00,1,1,5.00,'2026-10-17','images/premium-book-023.jpg',TRUE),
('PBK-224','Advanced Cybersecurity Masterclass Vol. 24','Steve Nash','Cybersecurity',740.00,2025,'VIP 1st',5,5,'VIP-24','Pristine','Exclusive VIP Premium book covering expert-level concepts in Cybersecurity.',5.00,1,1,5.00,'2026-10-17','images/premium-book-024.jpg',TRUE),
('PBK-225','Advanced AI and Data Science Masterclass Vol. 25','Jonathan Klied','AI and Data Science',750.00,2025,'VIP 1st',5,5,'VIP-25','Pristine','Exclusive VIP Premium book covering expert-level concepts in AI and Data Science.',5.00,1,1,5.00,'2026-10-17','images/premium-book-025.jpg',TRUE),
('PBK-226','Advanced Programming Masterclass Vol. 26','Seiy Antis','Programming',760.00,2025,'VIP 1st',5,5,'VIP-26','Pristine','Exclusive VIP Premium book covering expert-level concepts in Programming.',5.00,1,1,5.00,'2026-10-17','images/premium-book-026.jpg',TRUE),
('PBK-227','Advanced Computer Engineering Masterclass Vol. 27','Magnus Nakamura','Computer Engineering',770.00,2025,'VIP 1st',5,5,'VIP-27','Pristine','Exclusive VIP Premium book covering expert-level concepts in Computer Engineering.',5.00,1,1,5.00,'2026-10-17','images/premium-book-027.jpg',TRUE),
('PBK-228','Advanced Networking Masterclass Vol. 28','Robert B. Stark','Networking',780.00,2025,'VIP 1st',5,5,'VIP-28','Pristine','Exclusive VIP Premium book covering expert-level concepts in Networking.',5.00,1,1,5.00,'2026-10-17','images/premium-book-028.jpg',TRUE),
('PBK-229','Advanced Cybersecurity Masterclass Vol. 29','Xean M. Verutacio','Cybersecurity',790.00,2025,'VIP 1st',5,5,'VIP-29','Pristine','Exclusive VIP Premium book covering expert-level concepts in Cybersecurity.',5.00,1,1,5.00,'2026-10-17','images/premium-book-029.jpg',TRUE),
('PBK-230','Advanced AI and Data Science Masterclass Vol. 30','Y. Daniel Liang','AI and Data Science',800.00,2025,'VIP 1st',5,5,'VIP-30','Pristine','Exclusive VIP Premium book covering expert-level concepts in AI and Data Science.',5.00,1,1,5.00,'2026-10-17','images/premium-book-030.jpg',TRUE),
('PBK-231','Advanced Programming Masterclass Vol. 31','Eric Banner','Programming',810.00,2025,'VIP 1st',5,5,'VIP-31','Pristine','Exclusive VIP Premium book covering expert-level concepts in Programming.',5.00,1,1,5.00,'2026-10-17','images/premium-book-031.jpg',TRUE),
('PBK-232','Advanced Computer Engineering Masterclass Vol. 32','Herbert T. Pherbhert','Computer Engineering',820.00,2025,'VIP 1st',5,5,'VIP-32','Pristine','Exclusive VIP Premium book covering expert-level concepts in Computer Engineering.',5.00,1,1,5.00,'2026-10-17','images/premium-book-032.jpg',TRUE),
('PBK-233','Advanced Networking Masterclass Vol. 33','Steve Nash','Networking',830.00,2025,'VIP 1st',5,5,'VIP-33','Pristine','Exclusive VIP Premium book covering expert-level concepts in Networking.',5.00,1,1,5.00,'2026-10-17','images/premium-book-033.jpg',TRUE),
('PBK-234','Advanced Cybersecurity Masterclass Vol. 34','Jonathan Klied','Cybersecurity',840.00,2025,'VIP 1st',5,5,'VIP-34','Pristine','Exclusive VIP Premium book covering expert-level concepts in Cybersecurity.',5.00,1,1,5.00,'2026-10-17','images/premium-book-034.jpg',TRUE),
('PBK-235','Advanced AI and Data Science Masterclass Vol. 35','Seiy Antis','AI and Data Science',850.00,2025,'VIP 1st',5,5,'VIP-35','Pristine','Exclusive VIP Premium book covering expert-level concepts in AI and Data Science.',5.00,1,1,5.00,'2026-10-17','images/premium-book-035.jpg',TRUE),
('PBK-236','Advanced Programming Masterclass Vol. 36','Magnus Nakamura','Programming',860.00,2025,'VIP 1st',5,5,'VIP-36','Pristine','Exclusive VIP Premium book covering expert-level concepts in Programming.',5.00,1,1,5.00,'2026-10-17','images/premium-book-036.jpg',TRUE),
('PBK-237','Advanced Computer Engineering Masterclass Vol. 37','Robert B. Stark','Computer Engineering',870.00,2025,'VIP 1st',5,5,'VIP-37','Pristine','Exclusive VIP Premium book covering expert-level concepts in Computer Engineering.',5.00,1,1,5.00,'2026-10-17','images/premium-book-037.jpg',TRUE),
('PBK-238','Advanced Networking Masterclass Vol. 38','Xean M. Verutacio','Networking',880.00,2025,'VIP 1st',5,5,'VIP-38','Pristine','Exclusive VIP Premium book covering expert-level concepts in Networking.',5.00,1,1,5.00,'2026-10-17','images/premium-book-038.jpg',TRUE),
('PBK-239','Advanced Cybersecurity Masterclass Vol. 39','Y. Daniel Liang','Cybersecurity',890.00,2025,'VIP 1st',5,5,'VIP-39','Pristine','Exclusive VIP Premium book covering expert-level concepts in Cybersecurity.',5.00,1,1,5.00,'2026-10-17','images/premium-book-039.jpg',TRUE),
('PBK-240','Advanced AI and Data Science Masterclass Vol. 40','Eric Banner','AI and Data Science',900.00,2025,'VIP 1st',5,5,'VIP-40','Pristine','Exclusive VIP Premium book covering expert-level concepts in AI and Data Science.',5.00,1,1,5.00,'2026-10-17','images/premium-book-040.jpg',TRUE),
('PBK-241','Advanced Programming Masterclass Vol. 41','Herbert T. Pherbhert','Programming',910.00,2025,'VIP 1st',5,5,'VIP-41','Pristine','Exclusive VIP Premium book covering expert-level concepts in Programming.',5.00,1,1,5.00,'2026-10-17','images/premium-book-041.jpg',TRUE),
('PBK-242','Advanced Computer Engineering Masterclass Vol. 42','Steve Nash','Computer Engineering',920.00,2025,'VIP 1st',5,5,'VIP-42','Pristine','Exclusive VIP Premium book covering expert-level concepts in Computer Engineering.',5.00,1,1,5.00,'2026-10-17','images/premium-book-042.jpg',TRUE),
('PBK-243','Advanced Networking Masterclass Vol. 43','Jonathan Klied','Networking',930.00,2025,'VIP 1st',5,5,'VIP-43','Pristine','Exclusive VIP Premium book covering expert-level concepts in Networking.',5.00,1,1,5.00,'2026-10-17','images/premium-book-043.jpg',TRUE),
('PBK-244','Advanced Cybersecurity Masterclass Vol. 44','Seiy Antis','Cybersecurity',940.00,2025,'VIP 1st',5,5,'VIP-44','Pristine','Exclusive VIP Premium book covering expert-level concepts in Cybersecurity.',5.00,1,1,5.00,'2026-10-17','images/premium-book-044.jpg',TRUE),
('PBK-245','Advanced AI and Data Science Masterclass Vol. 45','Magnus Nakamura','AI and Data Science',950.00,2025,'VIP 1st',5,5,'VIP-45','Pristine','Exclusive VIP Premium book covering expert-level concepts in AI and Data Science.',5.00,1,1,5.00,'2026-10-17','images/premium-book-045.jpg',TRUE),
('PBK-246','Advanced Programming Masterclass Vol. 46','Robert B. Stark','Programming',960.00,2025,'VIP 1st',5,5,'VIP-46','Pristine','Exclusive VIP Premium book covering expert-level concepts in Programming.',5.00,1,1,5.00,'2026-10-17','images/premium-book-046.jpg',TRUE),
('PBK-247','Advanced Computer Engineering Masterclass Vol. 47','Xean M. Verutacio','Computer Engineering',970.00,2025,'VIP 1st',5,5,'VIP-47','Pristine','Exclusive VIP Premium book covering expert-level concepts in Computer Engineering.',5.00,1,1,5.00,'2026-10-17','images/premium-book-047.jpg',TRUE),
('PBK-248','Advanced Networking Masterclass Vol. 48','Y. Daniel Liang','Networking',980.00,2025,'VIP 1st',5,5,'VIP-48','Pristine','Exclusive VIP Premium book covering expert-level concepts in Networking.',5.00,1,1,5.00,'2026-10-17','images/premium-book-048.jpg',TRUE),
('PBK-249','Advanced Cybersecurity Masterclass Vol. 49','Eric Banner','Cybersecurity',990.00,2025,'VIP 1st',5,5,'VIP-49','Pristine','Exclusive VIP Premium book covering expert-level concepts in Cybersecurity.',5.00,1,1,5.00,'2026-10-17','images/premium-book-049.jpg',TRUE),
('PBK-250','Advanced AI and Data Science Masterclass Vol. 50','Herbert T. Pherbhert','AI and Data Science',1000.00,2025,'VIP 1st',5,5,'VIP-50','Pristine','Exclusive VIP Premium book covering expert-level concepts in AI and Data Science.',5.00,1,1,5.00,'2026-10-17','images/premium-book-050.jpg',TRUE),
('PBK-251','Advanced Programming Masterclass Vol. 51','Steve Nash','Programming',1010.00,2025,'VIP 1st',5,5,'VIP-51','Pristine','Exclusive VIP Premium book covering expert-level concepts in Programming.',5.00,1,1,5.00,'2026-10-17','images/premium-book-051.jpg',TRUE),
('PBK-252','Advanced Computer Engineering Masterclass Vol. 52','Jonathan Klied','Computer Engineering',1020.00,2025,'VIP 1st',5,5,'VIP-52','Pristine','Exclusive VIP Premium book covering expert-level concepts in Computer Engineering.',5.00,1,1,5.00,'2026-10-17','images/premium-book-052.jpg',TRUE),
('PBK-253','Advanced Networking Masterclass Vol. 53','Seiy Antis','Networking',1030.00,2025,'VIP 1st',5,5,'VIP-53','Pristine','Exclusive VIP Premium book covering expert-level concepts in Networking.',5.00,1,1,5.00,'2026-10-17','images/premium-book-053.jpg',TRUE),
('PBK-254','Advanced Cybersecurity Masterclass Vol. 54','Magnus Nakamura','Cybersecurity',1040.00,2025,'VIP 1st',5,5,'VIP-54','Pristine','Exclusive VIP Premium book covering expert-level concepts in Cybersecurity.',5.00,1,1,5.00,'2026-10-17','images/premium-book-054.jpg',TRUE),
('PBK-255','Advanced AI and Data Science Masterclass Vol. 55','Robert B. Stark','AI and Data Science',1050.00,2025,'VIP 1st',5,5,'VIP-55','Pristine','Exclusive VIP Premium book covering expert-level concepts in AI and Data Science.',5.00,1,1,5.00,'2026-10-17','images/premium-book-055.jpg',TRUE),
('PBK-256','Advanced Programming Masterclass Vol. 56','Xean M. Verutacio','Programming',1060.00,2025,'VIP 1st',5,5,'VIP-56','Pristine','Exclusive VIP Premium book covering expert-level concepts in Programming.',5.00,1,1,5.00,'2026-10-17','images/premium-book-056.jpg',TRUE),
('PBK-257','Advanced Computer Engineering Masterclass Vol. 57','Y. Daniel Liang','Computer Engineering',1070.00,2025,'VIP 1st',5,5,'VIP-57','Pristine','Exclusive VIP Premium book covering expert-level concepts in Computer Engineering.',5.00,1,1,5.00,'2026-10-17','images/premium-book-057.jpg',TRUE),
('PBK-258','Advanced Networking Masterclass Vol. 58','Eric Banner','Networking',1080.00,2025,'VIP 1st',5,5,'VIP-58','Pristine','Exclusive VIP Premium book covering expert-level concepts in Networking.',5.00,1,1,5.00,'2026-10-17','images/premium-book-058.jpg',TRUE),
('PBK-259','Advanced Cybersecurity Masterclass Vol. 59','Herbert T. Pherbhert','Cybersecurity',1090.00,2025,'VIP 1st',5,5,'VIP-59','Pristine','Exclusive VIP Premium book covering expert-level concepts in Cybersecurity.',5.00,1,1,5.00,'2026-10-17','images/premium-book-059.jpg',TRUE),
('PBK-260','Advanced AI and Data Science Masterclass Vol. 60','Steve Nash','AI and Data Science',1100.00,2025,'VIP 1st',5,5,'VIP-60','Pristine','Exclusive VIP Premium book covering expert-level concepts in AI and Data Science.',5.00,1,1,5.00,'2026-10-17','images/premium-book-060.jpg',TRUE),
('PBK-261','Advanced Programming Masterclass Vol. 61','Jonathan Klied','Programming',1110.00,2025,'VIP 1st',5,5,'VIP-61','Pristine','Exclusive VIP Premium book covering expert-level concepts in Programming.',5.00,1,1,5.00,'2026-10-17','images/premium-book-061.jpg',TRUE),
('PBK-262','Advanced Computer Engineering Masterclass Vol. 62','Seiy Antis','Computer Engineering',1120.00,2025,'VIP 1st',5,5,'VIP-62','Pristine','Exclusive VIP Premium book covering expert-level concepts in Computer Engineering.',5.00,1,1,5.00,'2026-10-17','images/premium-book-062.jpg',TRUE),
('PBK-263','Advanced Networking Masterclass Vol. 63','Magnus Nakamura','Networking',1130.00,2025,'VIP 1st',5,5,'VIP-63','Pristine','Exclusive VIP Premium book covering expert-level concepts in Networking.',5.00,1,1,5.00,'2026-10-17','images/premium-book-063.jpg',TRUE),
('PBK-264','Advanced Cybersecurity Masterclass Vol. 64','Robert B. Stark','Cybersecurity',1140.00,2025,'VIP 1st',5,5,'VIP-64','Pristine','Exclusive VIP Premium book covering expert-level concepts in Cybersecurity.',5.00,1,1,5.00,'2026-10-17','images/premium-book-064.jpg',TRUE),
('PBK-265','Advanced AI and Data Science Masterclass Vol. 65','Xean M. Verutacio','AI and Data Science',1150.00,2025,'VIP 1st',5,5,'VIP-65','Pristine','Exclusive VIP Premium book covering expert-level concepts in AI and Data Science.',5.00,1,1,5.00,'2026-10-17','images/premium-book-065.jpg',TRUE),
('PBK-266','Advanced Programming Masterclass Vol. 66','Y. Daniel Liang','Programming',1160.00,2025,'VIP 1st',5,5,'VIP-66','Pristine','Exclusive VIP Premium book covering expert-level concepts in Programming.',5.00,1,1,5.00,'2026-10-17','images/premium-book-066.jpg',TRUE),
('PBK-267','Advanced Computer Engineering Masterclass Vol. 67','Eric Banner','Computer Engineering',1170.00,2025,'VIP 1st',5,5,'VIP-67','Pristine','Exclusive VIP Premium book covering expert-level concepts in Computer Engineering.',5.00,1,1,5.00,'2026-10-17','images/premium-book-067.jpg',TRUE),
('PBK-268','Advanced Networking Masterclass Vol. 68','Herbert T. Pherbhert','Networking',1180.00,2025,'VIP 1st',5,5,'VIP-68','Pristine','Exclusive VIP Premium book covering expert-level concepts in Networking.',5.00,1,1,5.00,'2026-10-17','images/premium-book-068.jpg',TRUE),
('PBK-269','Advanced Cybersecurity Masterclass Vol. 69','Steve Nash','Cybersecurity',1190.00,2025,'VIP 1st',5,5,'VIP-69','Pristine','Exclusive VIP Premium book covering expert-level concepts in Cybersecurity.',5.00,1,1,5.00,'2026-10-17','images/premium-book-069.jpg',TRUE),
('PBK-270','Advanced AI and Data Science Masterclass Vol. 70','Jonathan Klied','AI and Data Science',1200.00,2025,'VIP 1st',5,5,'VIP-70','Pristine','Exclusive VIP Premium book covering expert-level concepts in AI and Data Science.',5.00,1,1,5.00,'2026-10-17','images/premium-book-070.jpg',TRUE),
('PBK-271','Advanced Programming Masterclass Vol. 71','Seiy Antis','Programming',1210.00,2025,'VIP 1st',5,5,'VIP-71','Pristine','Exclusive VIP Premium book covering expert-level concepts in Programming.',5.00,1,1,5.00,'2026-10-17','images/premium-book-071.jpg',TRUE),
('PBK-272','Advanced Computer Engineering Masterclass Vol. 72','Magnus Nakamura','Computer Engineering',1220.00,2025,'VIP 1st',5,5,'VIP-72','Pristine','Exclusive VIP Premium book covering expert-level concepts in Computer Engineering.',5.00,1,1,5.00,'2026-10-17','images/premium-book-072.jpg',TRUE),
('PBK-273','Advanced Networking Masterclass Vol. 73','Robert B. Stark','Networking',1230.00,2025,'VIP 1st',5,5,'VIP-73','Pristine','Exclusive VIP Premium book covering expert-level concepts in Networking.',5.00,1,1,5.00,'2026-10-17','images/premium-book-073.jpg',TRUE),
('PBK-274','Advanced Cybersecurity Masterclass Vol. 74','Xean M. Verutacio','Cybersecurity',1240.00,2025,'VIP 1st',5,5,'VIP-74','Pristine','Exclusive VIP Premium book covering expert-level concepts in Cybersecurity.',5.00,1,1,5.00,'2026-10-17','images/premium-book-074.jpg',TRUE),
('PBK-275','Advanced AI and Data Science Masterclass Vol. 75','Y. Daniel Liang','AI and Data Science',1250.00,2025,'VIP 1st',5,5,'VIP-75','Pristine','Exclusive VIP Premium book covering expert-level concepts in AI and Data Science.',5.00,1,1,5.00,'2026-10-17','images/premium-book-075.jpg',TRUE);


-- =====================================================================
-- DATABASE USER USED BY THE BACKEND (least privilege)
-- =====================================================================
CREATE USER IF NOT EXISTS 'library_app'@'localhost' IDENTIFIED BY 'CHANGE_THIS_TO_A_LONG_RANDOM_PASSWORD';
GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE ON penetrative_library.* TO 'library_app'@'localhost';
FLUSH PRIVILEGES;