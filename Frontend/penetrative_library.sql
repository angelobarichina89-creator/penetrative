CREATE DATABASE IF NOT EXISTS penetrative_library
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_ai_ci;

USE penetrative_library;
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS users (
    id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    username            VARCHAR(40)     NOT NULL,
    email               VARCHAR(255)    NULL,
    password_hash       VARCHAR(255)    NOT NULL,
    role                ENUM('member','librarian','admin') NOT NULL DEFAULT 'member',
    membership          ENUM('regular','premium')          NOT NULL DEFAULT 'regular',
    is_banned           TINYINT(1)      NOT NULL DEFAULT 0,
    avatar              VARCHAR(500)    NULL,
    theme               VARCHAR(20)     NOT NULL DEFAULT 'dark',
    email_notifications TINYINT(1)      NOT NULL DEFAULT 1,
    compact_cards       TINYINT(1)      NOT NULL DEFAULT 0,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_username (username),
    UNIQUE KEY uq_users_email (email),
    KEY idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS author_profiles (
    user_id      BIGINT UNSIGNED NOT NULL,
    pen_name     VARCHAR(40)     NOT NULL,
    bio          VARCHAR(300)    NOT NULL DEFAULT '',
    status       ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    applied_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_by  BIGINT UNSIGNED NULL,
    reviewed_at  DATETIME        NULL,
    notice_seen  TINYINT(1)      NOT NULL DEFAULT 1,
    PRIMARY KEY (user_id),
    UNIQUE KEY uq_author_pen_name (pen_name),
    KEY idx_author_status (status),
    CONSTRAINT fk_author_user     FOREIGN KEY (user_id)     REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_author_reviewer FOREIGN KEY (reviewed_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS categories (
    id    SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name  VARCHAR(40)       NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_categories_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS books (
    id               BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT,
    code             VARCHAR(20)       NOT NULL,
    title            VARCHAR(150)      NOT NULL,
    author_name      VARCHAR(80)       NOT NULL,
    uploaded_by      BIGINT UNSIGNED   NULL,
    category_id      SMALLINT UNSIGNED NOT NULL,
    price            DECIMAL(10,2)     NOT NULL DEFAULT 0.00,
    publication_year SMALLINT UNSIGNED NULL,
    edition          VARCHAR(20)       NOT NULL DEFAULT '1st',
    copies_total     SMALLINT UNSIGNED NOT NULL DEFAULT 3,
    copies_available SMALLINT UNSIGNED NOT NULL DEFAULT 3,
    shelf            VARCHAR(20)       NOT NULL DEFAULT 'A-01',
    book_condition   ENUM('Pristine','Excellent','Good','Fair') NOT NULL DEFAULT 'Good',
    description      TEXT              NULL,
    rating_avg       DECIMAL(2,1)      NOT NULL DEFAULT 0.0,
    rating_votes     INT UNSIGNED      NOT NULL DEFAULT 0,
    cover_image      VARCHAR(500)      NOT NULL DEFAULT 'images/no-cover.jpg',
    is_premium       TINYINT(1)        NOT NULL DEFAULT 0,
    added_on         DATE              NOT NULL DEFAULT (CURRENT_DATE),
    created_at       DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_books_code (code),
    KEY idx_books_category (category_id),
    KEY idx_books_premium (is_premium),
    KEY idx_books_uploaded_by (uploaded_by),
    KEY idx_books_year (publication_year),
    FULLTEXT KEY ft_books_search (title, author_name),
    CONSTRAINT fk_books_category FOREIGN KEY (category_id) REFERENCES categories (id),
    CONSTRAINT fk_books_uploader FOREIGN KEY (uploaded_by) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT chk_books_copies  CHECK (copies_available <= copies_total),
    CONSTRAINT chk_books_price   CHECK (price >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS book_images (
    id         BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
    book_id    BIGINT UNSIGNED  NOT NULL,
    image_url  VARCHAR(500)     NOT NULL,
    sort_order TINYINT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    KEY idx_book_images_book (book_id, sort_order),
    CONSTRAINT fk_book_images_book FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS borrows (
    id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id      BIGINT UNSIGNED NOT NULL,
    book_id      BIGINT UNSIGNED NOT NULL,
    borrowed_on  DATE            NOT NULL DEFAULT (CURRENT_DATE),
    due_date     DATE            NOT NULL,
    returned_on  DATE            NULL,
    borrow_fee   DECIMAL(8,2)    NOT NULL DEFAULT 10.00,
    active_key   TINYINT GENERATED ALWAYS AS (IF(returned_on IS NULL, 1, NULL)) STORED,
    PRIMARY KEY (id),
    UNIQUE KEY uq_one_active_loan (user_id, book_id, active_key),
    KEY idx_borrows_user (user_id, returned_on),
    KEY idx_borrows_book (book_id),
    KEY idx_borrows_due (due_date),
    CONSTRAINT fk_borrows_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_borrows_book FOREIGN KEY (book_id) REFERENCES books (id),
    CONSTRAINT chk_borrows_dates CHECK (due_date >= borrowed_on)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS cart_items (
    user_id   BIGINT UNSIGNED   NOT NULL,
    book_id   BIGINT UNSIGNED   NOT NULL,
    quantity  SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    added_at  DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, book_id),
    CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_book FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE,
    CONSTRAINT chk_cart_qty CHECK (quantity > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS favorites (
    user_id    BIGINT UNSIGNED NOT NULL,
    book_id    BIGINT UNSIGNED NOT NULL,
    created_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, book_id),
    CONSTRAINT fk_fav_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_fav_book FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS recently_viewed (
    user_id   BIGINT UNSIGNED NOT NULL,
    book_id   BIGINT UNSIGNED NOT NULL,
    viewed_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, book_id),
    KEY idx_recent_user_time (user_id, viewed_at),
    CONSTRAINT fk_recent_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_recent_book FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS book_ratings (
    user_id    BIGINT UNSIGNED  NOT NULL,
    book_id    BIGINT UNSIGNED  NOT NULL,
    stars      TINYINT UNSIGNED NOT NULL,
    created_at DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, book_id),
    KEY idx_ratings_book (book_id),
    CONSTRAINT fk_rating_user  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_rating_book  FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE,
    CONSTRAINT chk_rating_stars CHECK (stars BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS orders (
    id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id      BIGINT UNSIGNED NULL,
    total_amount DECIMAL(12,2)   NOT NULL,
    status       ENUM('paid','cancelled','refunded') NOT NULL DEFAULT 'paid',
    created_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_orders_user (user_id, created_at),
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS order_items (
    id             BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT,
    order_id       BIGINT UNSIGNED   NOT NULL,
    book_id        BIGINT UNSIGNED   NULL,
    title_snapshot VARCHAR(150)      NOT NULL,
    unit_price     DECIMAL(10,2)     NOT NULL,
    quantity       SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    KEY idx_order_items_order (order_id),
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_book  FOREIGN KEY (book_id)  REFERENCES books (id)  ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS subscriptions (
    id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id     BIGINT UNSIGNED NOT NULL,
    price       DECIMAL(8,2)    NOT NULL DEFAULT 99.00,
    status      ENUM('active','canceled','expired') NOT NULL DEFAULT 'active',
    started_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ends_at     DATETIME        NULL,
    canceled_at DATETIME        NULL,
    PRIMARY KEY (id),
    KEY idx_subs_user (user_id, status),
    CONSTRAINT fk_subs_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS transactions (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id         BIGINT UNSIGNED NULL,
    type            ENUM('purchase','borrow_fee','premium') NOT NULL,
    amount          DECIMAL(12,2)   NOT NULL,
    order_id        BIGINT UNSIGNED NULL,
    borrow_id       BIGINT UNSIGNED NULL,
    subscription_id BIGINT UNSIGNED NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_tx_created (created_at),
    KEY idx_tx_user (user_id),
    CONSTRAINT fk_tx_user  FOREIGN KEY (user_id)         REFERENCES users (id)         ON DELETE SET NULL,
    CONSTRAINT fk_tx_order FOREIGN KEY (order_id)        REFERENCES orders (id)        ON DELETE SET NULL,
    CONSTRAINT fk_tx_borrow FOREIGN KEY (borrow_id)      REFERENCES borrows (id)       ON DELETE SET NULL,
    CONSTRAINT fk_tx_sub   FOREIGN KEY (subscription_id) REFERENCES subscriptions (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS reports (
    id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    reporter_id    BIGINT UNSIGNED NOT NULL,
    target_type    ENUM('book','author','user','other') NOT NULL DEFAULT 'book',
    book_id        BIGINT UNSIGNED NULL,
    target_user_id BIGINT UNSIGNED NULL,
    reason         TEXT            NOT NULL,
    status         ENUM('open','reviewed','dismissed') NOT NULL DEFAULT 'open',
    created_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    handled_by     BIGINT UNSIGNED NULL,
    handled_at     DATETIME        NULL,
    PRIMARY KEY (id),
    KEY idx_reports_status (status, created_at),
    CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter_id)    REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_reports_book     FOREIGN KEY (book_id)        REFERENCES books (id) ON DELETE CASCADE,
    CONSTRAINT fk_reports_target   FOREIGN KEY (target_user_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT fk_reports_handler  FOREIGN KEY (handled_by)     REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS notifications (
    id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id    BIGINT UNSIGNED NOT NULL,
    title      VARCHAR(120)    NOT NULL,
    message    VARCHAR(500)    NOT NULL,
    is_read    TINYINT(1)      NOT NULL DEFAULT 0,
    created_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_notif_user (user_id, is_read, created_at),
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS friend_requests (
    id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    from_user_id BIGINT UNSIGNED NOT NULL,
    to_user_id   BIGINT UNSIGNED NOT NULL,
    status       ENUM('pending','accepted','declined') NOT NULL DEFAULT 'pending',
    created_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    responded_at DATETIME        NULL,
    PRIMARY KEY (id),
    KEY idx_fr_to (to_user_id, status),
    KEY idx_fr_from (from_user_id, status),
    CONSTRAINT fk_fr_from FOREIGN KEY (from_user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_fr_to   FOREIGN KEY (to_user_id)   REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS friendships (
    user_a_id  BIGINT UNSIGNED NOT NULL,
    user_b_id  BIGINT UNSIGNED NOT NULL,
    created_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_a_id, user_b_id),
    KEY idx_friend_b (user_b_id),
    CONSTRAINT fk_friend_a FOREIGN KEY (user_a_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_friend_b FOREIGN KEY (user_b_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS direct_messages (
    id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    sender_id    BIGINT UNSIGNED NOT NULL,
    recipient_id BIGINT UNSIGNED NOT NULL,
    body         VARCHAR(500)    NOT NULL,
    created_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at      DATETIME        NULL,
    PRIMARY KEY (id),
    KEY idx_dm_pair (sender_id, recipient_id, created_at),
    KEY idx_dm_inbox (recipient_id, read_at),
    CONSTRAINT fk_dm_sender    FOREIGN KEY (sender_id)    REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_dm_recipient FOREIGN KEY (recipient_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS support_conversations (
    id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id            BIGINT UNSIGNED NOT NULL,
    needs_human        TINYINT(1)      NOT NULL DEFAULT 0,
    last_away_notice_at DATETIME       NULL,
    created_at         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_support_user (user_id),
    KEY idx_support_updated (needs_human, updated_at),
    CONSTRAINT fk_support_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS support_messages (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    conversation_id BIGINT UNSIGNED NOT NULL,
    sender_type     ENUM('user','admin','bot') NOT NULL,
    sender_id       BIGINT UNSIGNED NULL,
    body            VARCHAR(2000)   NOT NULL,
    issue_type      ENUM('borrow','order','premium','account','author','book','other') NULL,
    reference       VARCHAR(40)     NULL,
    is_read         TINYINT(1)      NOT NULL DEFAULT 0,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_support_msgs (conversation_id, created_at),
    KEY idx_support_unread (conversation_id, sender_type, is_read),
    CONSTRAINT fk_smsg_conversation FOREIGN KEY (conversation_id) REFERENCES support_conversations (id) ON DELETE CASCADE,
    CONSTRAINT fk_smsg_sender       FOREIGN KEY (sender_id)       REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS staff_presence (
    user_id      BIGINT UNSIGNED NOT NULL,
    status_pref  ENUM('online','away') NOT NULL DEFAULT 'online',
    last_seen_at DATETIME        NULL,
    PRIMARY KEY (user_id),
    CONSTRAINT fk_presence_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS support_quick_options (
    id         SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    code       VARCHAR(30)       NOT NULL,
    label      VARCHAR(80)       NOT NULL,
    keywords   JSON              NOT NULL,
    reply      TEXT              NOT NULL,
    flag_human TINYINT(1)        NOT NULL DEFAULT 0,
    sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    is_active  TINYINT(1)        NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    UNIQUE KEY uq_quick_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS support_canned_replies (
    id         SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    body       VARCHAR(500)      NOT NULL,
    sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY uq_canned_body (body)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS faq_items (
    id         SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    question   VARCHAR(200)      NOT NULL,
    answer     TEXT              NOT NULL,
    sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    is_active  TINYINT(1)        NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    UNIQUE KEY uq_faq_question (question)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TRIGGER IF EXISTS trg_borrows_before_insert;
DROP TRIGGER IF EXISTS trg_borrows_after_insert;
DROP TRIGGER IF EXISTS trg_borrows_after_update;
DROP TRIGGER IF EXISTS trg_ratings_after_insert;
DROP TRIGGER IF EXISTS trg_friend_requests_before_insert;
DROP TRIGGER IF EXISTS trg_friendships_before_insert;
DROP TRIGGER IF EXISTS trg_dm_before_insert;
DROP PROCEDURE IF EXISTS sp_checkout;
DROP PROCEDURE IF EXISTS sp_upgrade_premium;
DROP PROCEDURE IF EXISTS sp_cancel_premium;
DROP PROCEDURE IF EXISTS sp_delete_account;

DELIMITER $$

CREATE TRIGGER trg_borrows_before_insert
BEFORE INSERT ON borrows
FOR EACH ROW
BEGIN
    DECLARE v_active INT DEFAULT 0;
    DECLARE v_book_premium TINYINT DEFAULT 0;
    DECLARE v_membership VARCHAR(10) DEFAULT 'regular';

    SELECT COUNT(*) INTO v_active
      FROM borrows
     WHERE user_id = NEW.user_id AND returned_on IS NULL;

    IF v_active >= 3 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Max 3 books allowed';
    END IF;

    SELECT is_premium INTO v_book_premium FROM books WHERE id = NEW.book_id;
    SELECT membership INTO v_membership FROM users WHERE id = NEW.user_id;

    IF v_book_premium = 1 AND v_membership <> 'premium' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'This is a Premium book. Upgrade to Premium to borrow it';
    END IF;
END$$

CREATE TRIGGER trg_borrows_after_insert
AFTER INSERT ON borrows
FOR EACH ROW
BEGIN
    UPDATE books
       SET copies_available = copies_available - 1
     WHERE id = NEW.book_id AND copies_available > 0;

    IF ROW_COUNT() = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Unavailable';
    END IF;

    IF NEW.borrow_fee > 0 THEN
        INSERT INTO transactions (user_id, type, amount, borrow_id)
        VALUES (NEW.user_id, 'borrow_fee', NEW.borrow_fee, NEW.id);
    END IF;
END$$

CREATE TRIGGER trg_borrows_after_update
AFTER UPDATE ON borrows
FOR EACH ROW
BEGIN
    IF OLD.returned_on IS NULL AND NEW.returned_on IS NOT NULL THEN
        UPDATE books
           SET copies_available = LEAST(copies_total, copies_available + 1)
         WHERE id = NEW.book_id;
    END IF;
END$$

CREATE TRIGGER trg_ratings_after_insert
AFTER INSERT ON book_ratings
FOR EACH ROW
BEGIN
    UPDATE books
       SET rating_avg   = ROUND((rating_avg * rating_votes + NEW.stars) / (rating_votes + 1), 1),
           rating_votes = rating_votes + 1
     WHERE id = NEW.book_id;
END$$

CREATE TRIGGER trg_friend_requests_before_insert
BEFORE INSERT ON friend_requests
FOR EACH ROW
BEGIN
    IF NEW.from_user_id = NEW.to_user_id THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'You can''t add yourself';
    END IF;
END$$

CREATE TRIGGER trg_friendships_before_insert
BEFORE INSERT ON friendships
FOR EACH ROW
BEGIN
    DECLARE v_tmp BIGINT UNSIGNED;

    IF NEW.user_a_id = NEW.user_b_id THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'You can''t be friends with yourself';
    END IF;

    IF NEW.user_a_id > NEW.user_b_id THEN
        SET v_tmp = NEW.user_a_id;
        SET NEW.user_a_id = NEW.user_b_id;
        SET NEW.user_b_id = v_tmp;
    END IF;
END$$

CREATE TRIGGER trg_dm_before_insert
BEFORE INSERT ON direct_messages
FOR EACH ROW
BEGIN
    IF NEW.sender_id = NEW.recipient_id THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'You can''t message yourself';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM friendships
         WHERE user_a_id = LEAST(NEW.sender_id, NEW.recipient_id)
           AND user_b_id = GREATEST(NEW.sender_id, NEW.recipient_id)
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'You can only chat with friends';
    END IF;
END$$

CREATE PROCEDURE sp_checkout(IN p_user_id BIGINT UNSIGNED, OUT p_order_id BIGINT UNSIGNED)
BEGIN
    DECLARE v_total DECIMAL(12,2) DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    IF NOT EXISTS (SELECT 1 FROM cart_items WHERE user_id = p_user_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cart empty';
    END IF;

    SELECT COALESCE(SUM(b.price * c.quantity), 0) INTO v_total
      FROM cart_items c
      JOIN books b ON b.id = c.book_id
     WHERE c.user_id = p_user_id;

    INSERT INTO orders (user_id, total_amount) VALUES (p_user_id, v_total);
    SET p_order_id = LAST_INSERT_ID();

    INSERT INTO order_items (order_id, book_id, title_snapshot, unit_price, quantity)
    SELECT p_order_id, b.id, b.title, b.price, c.quantity
      FROM cart_items c
      JOIN books b ON b.id = c.book_id
     WHERE c.user_id = p_user_id;

    INSERT INTO transactions (user_id, type, amount, order_id)
    VALUES (p_user_id, 'purchase', v_total, p_order_id);

    INSERT INTO notifications (user_id, title, message)
    VALUES (p_user_id, 'Checkout Complete', CONCAT('Purchased items totaling PHP ', FORMAT(v_total, 2), '.'));

    DELETE FROM cart_items WHERE user_id = p_user_id;

    COMMIT;
END$$

CREATE PROCEDURE sp_upgrade_premium(IN p_user_id BIGINT UNSIGNED)
BEGIN
    DECLARE v_membership VARCHAR(10);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT membership INTO v_membership FROM users WHERE id = p_user_id;

    IF v_membership = 'premium' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Already a Premium member';
    END IF;

    INSERT INTO subscriptions (user_id, price, status, started_at, ends_at)
    VALUES (p_user_id, 99.00, 'active', NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH));

    INSERT INTO transactions (user_id, type, amount, subscription_id)
    VALUES (p_user_id, 'premium', 99.00, LAST_INSERT_ID());

    UPDATE users SET membership = 'premium' WHERE id = p_user_id;

    INSERT INTO notifications (user_id, title, message)
    VALUES (p_user_id, 'Premium Membership Activated!', 'Welcome to VIP Premium! You now have access to all the exclusive premium books.');

    COMMIT;
END$$

CREATE PROCEDURE sp_cancel_premium(IN p_user_id BIGINT UNSIGNED)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    UPDATE subscriptions
       SET status = 'canceled', canceled_at = NOW()
     WHERE user_id = p_user_id AND status = 'active';

    UPDATE users SET membership = 'regular' WHERE id = p_user_id;

    INSERT INTO notifications (user_id, title, message)
    VALUES (p_user_id, 'Subscription Canceled', 'Your Premium membership has been canceled. You are now a Regular member.');

    COMMIT;
END$$

CREATE PROCEDURE sp_delete_account(IN p_user_id BIGINT UNSIGNED)
BEGIN
    DECLARE v_role VARCHAR(10);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT role INTO v_role FROM users WHERE id = p_user_id FOR UPDATE;

    IF v_role IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Account not found';
    END IF;

    IF v_role = 'admin' AND (SELECT COUNT(*) FROM users WHERE role = 'admin') <= 1 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'The last admin account cannot be deleted';
    END IF;

    UPDATE borrows
       SET returned_on = CURDATE()
     WHERE user_id = p_user_id AND returned_on IS NULL;

    DELETE FROM users WHERE id = p_user_id;

    COMMIT;
END$$

DELIMITER ;

CREATE OR REPLACE VIEW v_book_catalog AS
SELECT b.id, b.code, b.title, b.author_name, c.name AS category, b.price,
       b.publication_year, b.edition, b.copies_total, b.copies_available,
       IF(b.copies_available > 0, 'Available', 'Borrowed') AS status,
       b.shelf, b.book_condition, b.description, b.rating_avg, b.rating_votes,
       b.cover_image, b.is_premium, b.uploaded_by, b.added_on
  FROM books b
  JOIN categories c ON c.id = b.category_id;

CREATE OR REPLACE VIEW v_loans AS
SELECT br.id, br.user_id, u.username, br.book_id, b.code AS book_code, b.title,
       br.borrowed_on, br.due_date, br.returned_on, br.borrow_fee,
       CASE
           WHEN br.returned_on IS NOT NULL THEN 'Returned'
           WHEN br.due_date < CURDATE()    THEN 'Overdue'
           ELSE 'Borrowed'
       END AS status
  FROM borrows br
  JOIN users u ON u.id = br.user_id
  JOIN books b ON b.id = br.book_id;

CREATE OR REPLACE VIEW v_library_stats AS
SELECT
    (SELECT COUNT(*) FROM books)                                              AS total_titles,
    (SELECT COALESCE(SUM(copies_total), 0) FROM books)                        AS total_copies,
    (SELECT COALESCE(SUM(copies_available), 0) FROM books)                    AS available_copies,
    (SELECT COUNT(*) FROM users)                                              AS accounts,
    (SELECT COUNT(*) FROM borrows WHERE returned_on IS NULL)                  AS active_loans,
    (SELECT COUNT(*) FROM borrows WHERE returned_on IS NULL AND due_date < CURDATE()) AS overdue_loans,
    (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE DATE(created_at) = CURDATE()) AS today_sales,
    (SELECT COALESCE(SUM(amount), 0) FROM transactions
      WHERE created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01'))                 AS month_sales;

CREATE OR REPLACE VIEW v_support_inbox AS
SELECT sc.id AS conversation_id, sc.user_id, u.username, sc.needs_human, sc.updated_at,
       (SELECT COUNT(*) FROM support_messages m
         WHERE m.conversation_id = sc.id AND m.sender_type = 'user' AND m.is_read = 0)               AS admin_unread,
       (SELECT COUNT(*) FROM support_messages m
         WHERE m.conversation_id = sc.id AND m.sender_type IN ('admin','bot') AND m.is_read = 0)     AS user_unread,
       (SELECT m.body FROM support_messages m
         WHERE m.conversation_id = sc.id ORDER BY m.id DESC LIMIT 1)                                 AS last_message
  FROM support_conversations sc
  JOIN users u ON u.id = sc.user_id;

INSERT INTO users (username, password_hash, role) VALUES
    ('admin',    '!!SET-A-REAL-HASH-BEFORE-USE!!', 'admin'),
    ('woopiiee', '!!SET-A-REAL-HASH-BEFORE-USE!!', 'admin')
ON DUPLICATE KEY UPDATE username = username;

INSERT INTO staff_presence (user_id, status_pref)
SELECT id, 'online' FROM users WHERE role IN ('admin','librarian')
ON DUPLICATE KEY UPDATE user_id = user_id;
INSERT INTO categories (name) VALUES
    ('Programming'),
    ('Computer Engineering'),
    ('Networking'),
    ('Cybersecurity'),
    ('AI and Data Science')
ON DUPLICATE KEY UPDATE name = name;
INSERT INTO books
    (code, title, author_name, category_id, price, publication_year, edition,
     copies_total, copies_available, shelf, book_condition, description,
     rating_avg, rating_votes, cover_image, is_premium, added_on)
VALUES
    ('BK-101', 'Clean Codings', 'Robert B. Stark', (SELECT id FROM categories WHERE name = 'Programming'), 450.00, 2024, '2nd', 5, 3, 'A-12', 'Good', 'A handbook of agile software craftsmanship.', 4.7, 1, 'images/clean-code.jpg', 0, '2024-10-05'),
    ('BK-102', 'The C Programming Language', 'Xean M. Verutacio', (SELECT id FROM categories WHERE name = 'Programming'), 300.00, 2013, '1st', 4, 2, 'A-08', 'Fair', 'Classic introduction to C.', 4.5, 1, 'images/c-programming.jpg', 0, '2013-03-03'),
    ('BK-103', 'Introduction to Java Programming', 'Y. Daniel Liang', (SELECT id FROM categories WHERE name = 'Programming'), 250.00, 2022, '12th', 6, 5, 'A-15', 'Excellent', 'Comprehensive Java textbook.', 4.3, 1, 'images/java-programming.jpg', 0, '2026-10-17'),
    ('BK-104', 'Python Crash Course', 'Eric Banner', (SELECT id FROM categories WHERE name = 'Programming'), 250.00, 2023, '3rd', 8, 6, 'A-03', 'Good', 'Hands-on Python projects.', 4.8, 1, 'images/python-crash-course.jpg', 0, '2026-10-17'),
    ('BK-105', 'Eloquent Web Design', 'Herbert T. Pherbhert', (SELECT id FROM categories WHERE name = 'Programming'), 250.00, 2021, '1st', 3, 1, 'B-07', 'Good', 'Modern web design principles.', 4.1, 1, 'images/eloquent-web-design.jpg', 0, '2026-10-17'),
    ('BK-106', 'Computer Organization and Design', 'Robert B. Stark', (SELECT id FROM categories WHERE name = 'Computer Engineering'), 280.00, 2020, '5th', 4, 3, 'C-01', 'Good', 'Hardware/software interface.', 4.4, 1, 'images/computer-org.jpg', 0, '2026-10-17'),
    ('BK-107', 'Computer Architecture', 'Bruce Banter', (SELECT id FROM categories WHERE name = 'Computer Engineering'), 270.00, 2019, '2nd', 3, 2, 'C-04', 'Fair', 'Quantitative architecture.', 4.2, 1, 'images/engineering-architecure.jpg', 0, '2026-10-17'),
    ('BK-108', 'Digital Design', 'Dixon Nixon', (SELECT id FROM categories WHERE name = 'Computer Engineering'), 260.00, 2021, '1st', 5, 4, 'C-09', 'Excellent', 'Digital logic fundamentals.', 4.0, 1, 'images/digital-design.jpg', 0, '2026-10-17'),
    ('BK-109', 'Electronics Circuits', 'Krey Thos', (SELECT id FROM categories WHERE name = 'Computer Engineering'), 240.00, 2018, '3rd', 4, 2, 'C-11', 'Good', 'Electronic circuit analysis.', 3.9, 1, 'images/electronics-circuits.jpg', 0, '2026-10-17'),
    ('BK-110', 'Embedded System', 'Kirk Cobain', (SELECT id FROM categories WHERE name = 'Computer Engineering'), 290.00, 2022, '1st', 3, 3, 'C-14', 'Excellent', 'Embedded systems design.', 4.3, 1, 'images/embedded-system.jpg', 0, '2026-10-17'),
    ('BK-111', 'Computer Networking', 'Steve Nash', (SELECT id FROM categories WHERE name = 'Networking'), 320.00, 2021, '8th', 5, 3, 'D-02', 'Good', 'Top-down networking approach.', 4.6, 1, 'images/computer-networking.jpg', 0, '2026-10-17'),
    ('BK-112', 'Network Communication', 'Kwah Liti', (SELECT id FROM categories WHERE name = 'Networking'), 230.00, 2020, '2nd', 4, 4, 'D-05', 'Good', 'Network protocols.', 4.0, 1, 'images/network-communication.jpg', 0, '2026-10-17'),
    ('BK-113', 'Introduction to Internet', 'LeBrown Jeims', (SELECT id FROM categories WHERE name = 'Networking'), 200.00, 2019, '1st', 6, 5, 'D-08', 'Fair', 'Internet basics.', 3.8, 1, 'images/introduction-internet.jpg', 0, '2026-10-17'),
    ('BK-114', 'Data Networking', 'Halt and Others', (SELECT id FROM categories WHERE name = 'Networking'), 250.00, 2022, '1st', 3, 1, 'D-12', 'Good', 'Data communication concepts.', 4.1, 1, 'images/data-networking.jpg', 0, '2026-10-17'),
    ('BK-115', 'TCP/IP Illustrated', 'Walter Black', (SELECT id FROM categories WHERE name = 'Networking'), 310.00, 2018, '2nd', 4, 2, 'D-15', 'Good', 'TCP/IP protocol suite.', 4.5, 1, 'images/tcp-ip.jpg', 0, '2026-10-17'),
    ('BK-116', 'Security Engineering', 'Robert B. Stark', (SELECT id FROM categories WHERE name = 'Cybersecurity'), 350.00, 2020, '3rd', 3, 2, 'E-01', 'Excellent', 'Building secure systems.', 4.7, 1, 'images/security-eng.jpg', 0, '2026-10-17'),
    ('BK-117', 'Hacking: The Art of Exploitation', 'Jonathan Klied', (SELECT id FROM categories WHERE name = 'Cybersecurity'), 280.00, 2019, '2nd', 4, 1, 'E-04', 'Good', 'Hands-on hacking techniques.', 4.4, 1, 'images/hacking-art.jpg', 0, '2026-10-17'),
    ('BK-118', 'Blue Team Handbook', 'Anna Klied', (SELECT id FROM categories WHERE name = 'Cybersecurity'), 260.00, 2021, '1st', 5, 4, 'E-07', 'Excellent', 'Incident response guide.', 4.2, 1, 'images/blue-team.jpg', 0, '2026-10-17'),
    ('BK-119', 'Threat Modeling', 'Frank Einstein', (SELECT id FROM categories WHERE name = 'Cybersecurity'), 240.00, 2022, '1st', 3, 3, 'E-10', 'Good', 'Security threat modeling.', 4.0, 1, 'images/threat-security.jpg', 0, '2026-10-17'),
    ('BK-120', 'Introduction to Cryptography', 'Alfred Camel', (SELECT id FROM categories WHERE name = 'Cybersecurity'), 270.00, 2020, '2nd', 4, 2, 'E-13', 'Good', 'Cryptography fundamentals.', 4.3, 1, 'images/crypto-malware.jpg', 0, '2026-10-17'),
    ('BK-121', 'Hands-On Machine Learning', 'Seiy Antis', (SELECT id FROM categories WHERE name = 'AI and Data Science'), 380.00, 2022, '3rd', 5, 3, 'F-02', 'Excellent', 'Practical ML with Python.', 4.8, 1, 'images/machine-learning.jpg', 0, '2026-10-17'),
    ('BK-122', 'Deep Learning', 'Magnus Nakamura', (SELECT id FROM categories WHERE name = 'AI and Data Science'), 400.00, 2021, '1st', 3, 1, 'F-05', 'Good', 'Deep learning introduction.', 4.6, 1, 'images/deep-learning.jpg', 0, '2026-10-17'),
    ('BK-123', 'Artificial Intelligence: A Modern Approach', 'Robert B. Stark', (SELECT id FROM categories WHERE name = 'AI and Data Science'), 420.00, 2020, '4th', 4, 2, 'F-08', 'Excellent', 'The definitive AI textbook.', 4.9, 1, 'images/modern-approach.jpg', 0, '2026-10-17'),
    ('BK-124', 'Python for Machine Learning', 'Hadji Glitch', (SELECT id FROM categories WHERE name = 'AI and Data Science'), 290.00, 2023, '2nd', 6, 5, 'F-11', 'Good', 'ML projects with Python.', 4.4, 1, 'images/python-learning.jpg', 0, '2026-10-17'),
    ('BK-125', 'Data Science from Scratch', 'Kirk Cobain', (SELECT id FROM categories WHERE name = 'AI and Data Science'), 310.00, 2019, '2nd', 4, 3, 'F-14', 'Good', 'Data science fundamentals.', 4.5, 1, 'images/data-science-scratch.jpg', 0, '2026-10-17'),
    ('PBK-201', 'Advanced Programming Masterclass Vol. 1', 'Robert B. Stark', (SELECT id FROM categories WHERE name = 'Programming'), 510.00, 2025, 'VIP 1st', 5, 5, 'VIP-1', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Programming.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-202', 'Advanced Computer Engineering Masterclass Vol. 2', 'Xean M. Verutacio', (SELECT id FROM categories WHERE name = 'Computer Engineering'), 520.00, 2025, 'VIP 1st', 5, 5, 'VIP-2', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Computer Engineering.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-203', 'Advanced Networking Masterclass Vol. 3', 'Y. Daniel Liang', (SELECT id FROM categories WHERE name = 'Networking'), 530.00, 2025, 'VIP 1st', 5, 5, 'VIP-3', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Networking.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-204', 'Advanced Cybersecurity Masterclass Vol. 4', 'Eric Banner', (SELECT id FROM categories WHERE name = 'Cybersecurity'), 540.00, 2025, 'VIP 1st', 5, 5, 'VIP-4', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Cybersecurity.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-205', 'Advanced AI and Data Science Masterclass Vol. 5', 'Herbert T. Pherbhert', (SELECT id FROM categories WHERE name = 'AI and Data Science'), 550.00, 2025, 'VIP 1st', 5, 5, 'VIP-5', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in AI and Data Science.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-206', 'Advanced Programming Masterclass Vol. 6', 'Steve Nash', (SELECT id FROM categories WHERE name = 'Programming'), 560.00, 2025, 'VIP 1st', 5, 5, 'VIP-6', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Programming.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-207', 'Advanced Computer Engineering Masterclass Vol. 7', 'Jonathan Klied', (SELECT id FROM categories WHERE name = 'Computer Engineering'), 570.00, 2025, 'VIP 1st', 5, 5, 'VIP-7', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Computer Engineering.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-208', 'Advanced Networking Masterclass Vol. 8', 'Seiy Antis', (SELECT id FROM categories WHERE name = 'Networking'), 580.00, 2025, 'VIP 1st', 5, 5, 'VIP-8', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Networking.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-209', 'Advanced Cybersecurity Masterclass Vol. 9', 'Magnus Nakamura', (SELECT id FROM categories WHERE name = 'Cybersecurity'), 590.00, 2025, 'VIP 1st', 5, 5, 'VIP-9', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Cybersecurity.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-210', 'Advanced AI and Data Science Masterclass Vol. 10', 'Robert B. Stark', (SELECT id FROM categories WHERE name = 'AI and Data Science'), 600.00, 2025, 'VIP 1st', 5, 5, 'VIP-10', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in AI and Data Science.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-211', 'Advanced Programming Masterclass Vol. 11', 'Xean M. Verutacio', (SELECT id FROM categories WHERE name = 'Programming'), 610.00, 2025, 'VIP 1st', 5, 5, 'VIP-11', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Programming.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-212', 'Advanced Computer Engineering Masterclass Vol. 12', 'Y. Daniel Liang', (SELECT id FROM categories WHERE name = 'Computer Engineering'), 620.00, 2025, 'VIP 1st', 5, 5, 'VIP-12', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Computer Engineering.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-213', 'Advanced Networking Masterclass Vol. 13', 'Eric Banner', (SELECT id FROM categories WHERE name = 'Networking'), 630.00, 2025, 'VIP 1st', 5, 5, 'VIP-13', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Networking.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-214', 'Advanced Cybersecurity Masterclass Vol. 14', 'Herbert T. Pherbhert', (SELECT id FROM categories WHERE name = 'Cybersecurity'), 640.00, 2025, 'VIP 1st', 5, 5, 'VIP-14', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Cybersecurity.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-215', 'Advanced AI and Data Science Masterclass Vol. 15', 'Steve Nash', (SELECT id FROM categories WHERE name = 'AI and Data Science'), 650.00, 2025, 'VIP 1st', 5, 5, 'VIP-15', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in AI and Data Science.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-216', 'Advanced Programming Masterclass Vol. 16', 'Jonathan Klied', (SELECT id FROM categories WHERE name = 'Programming'), 660.00, 2025, 'VIP 1st', 5, 5, 'VIP-16', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Programming.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-217', 'Advanced Computer Engineering Masterclass Vol. 17', 'Seiy Antis', (SELECT id FROM categories WHERE name = 'Computer Engineering'), 670.00, 2025, 'VIP 1st', 5, 5, 'VIP-17', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Computer Engineering.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-218', 'Advanced Networking Masterclass Vol. 18', 'Magnus Nakamura', (SELECT id FROM categories WHERE name = 'Networking'), 680.00, 2025, 'VIP 1st', 5, 5, 'VIP-18', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Networking.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-219', 'Advanced Cybersecurity Masterclass Vol. 19', 'Robert B. Stark', (SELECT id FROM categories WHERE name = 'Cybersecurity'), 690.00, 2025, 'VIP 1st', 5, 5, 'VIP-19', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Cybersecurity.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-220', 'Advanced AI and Data Science Masterclass Vol. 20', 'Xean M. Verutacio', (SELECT id FROM categories WHERE name = 'AI and Data Science'), 700.00, 2025, 'VIP 1st', 5, 5, 'VIP-20', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in AI and Data Science.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-221', 'Advanced Programming Masterclass Vol. 21', 'Y. Daniel Liang', (SELECT id FROM categories WHERE name = 'Programming'), 710.00, 2025, 'VIP 1st', 5, 5, 'VIP-21', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Programming.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-222', 'Advanced Computer Engineering Masterclass Vol. 22', 'Eric Banner', (SELECT id FROM categories WHERE name = 'Computer Engineering'), 720.00, 2025, 'VIP 1st', 5, 5, 'VIP-22', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Computer Engineering.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-223', 'Advanced Networking Masterclass Vol. 23', 'Herbert T. Pherbhert', (SELECT id FROM categories WHERE name = 'Networking'), 730.00, 2025, 'VIP 1st', 5, 5, 'VIP-23', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Networking.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-224', 'Advanced Cybersecurity Masterclass Vol. 24', 'Steve Nash', (SELECT id FROM categories WHERE name = 'Cybersecurity'), 740.00, 2025, 'VIP 1st', 5, 5, 'VIP-24', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Cybersecurity.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-225', 'Advanced AI and Data Science Masterclass Vol. 25', 'Jonathan Klied', (SELECT id FROM categories WHERE name = 'AI and Data Science'), 750.00, 2025, 'VIP 1st', 5, 5, 'VIP-25', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in AI and Data Science.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-226', 'Advanced Programming Masterclass Vol. 26', 'Seiy Antis', (SELECT id FROM categories WHERE name = 'Programming'), 760.00, 2025, 'VIP 1st', 5, 5, 'VIP-26', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Programming.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-227', 'Advanced Computer Engineering Masterclass Vol. 27', 'Magnus Nakamura', (SELECT id FROM categories WHERE name = 'Computer Engineering'), 770.00, 2025, 'VIP 1st', 5, 5, 'VIP-27', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Computer Engineering.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-228', 'Advanced Networking Masterclass Vol. 28', 'Robert B. Stark', (SELECT id FROM categories WHERE name = 'Networking'), 780.00, 2025, 'VIP 1st', 5, 5, 'VIP-28', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Networking.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-229', 'Advanced Cybersecurity Masterclass Vol. 29', 'Xean M. Verutacio', (SELECT id FROM categories WHERE name = 'Cybersecurity'), 790.00, 2025, 'VIP 1st', 5, 5, 'VIP-29', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Cybersecurity.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-230', 'Advanced AI and Data Science Masterclass Vol. 30', 'Y. Daniel Liang', (SELECT id FROM categories WHERE name = 'AI and Data Science'), 800.00, 2025, 'VIP 1st', 5, 5, 'VIP-30', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in AI and Data Science.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-231', 'Advanced Programming Masterclass Vol. 31', 'Eric Banner', (SELECT id FROM categories WHERE name = 'Programming'), 810.00, 2025, 'VIP 1st', 5, 5, 'VIP-31', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Programming.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-232', 'Advanced Computer Engineering Masterclass Vol. 32', 'Herbert T. Pherbhert', (SELECT id FROM categories WHERE name = 'Computer Engineering'), 820.00, 2025, 'VIP 1st', 5, 5, 'VIP-32', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Computer Engineering.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-233', 'Advanced Networking Masterclass Vol. 33', 'Steve Nash', (SELECT id FROM categories WHERE name = 'Networking'), 830.00, 2025, 'VIP 1st', 5, 5, 'VIP-33', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Networking.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-234', 'Advanced Cybersecurity Masterclass Vol. 34', 'Jonathan Klied', (SELECT id FROM categories WHERE name = 'Cybersecurity'), 840.00, 2025, 'VIP 1st', 5, 5, 'VIP-34', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Cybersecurity.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-235', 'Advanced AI and Data Science Masterclass Vol. 35', 'Seiy Antis', (SELECT id FROM categories WHERE name = 'AI and Data Science'), 850.00, 2025, 'VIP 1st', 5, 5, 'VIP-35', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in AI and Data Science.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-236', 'Advanced Programming Masterclass Vol. 36', 'Magnus Nakamura', (SELECT id FROM categories WHERE name = 'Programming'), 860.00, 2025, 'VIP 1st', 5, 5, 'VIP-36', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Programming.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-237', 'Advanced Computer Engineering Masterclass Vol. 37', 'Robert B. Stark', (SELECT id FROM categories WHERE name = 'Computer Engineering'), 870.00, 2025, 'VIP 1st', 5, 5, 'VIP-37', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Computer Engineering.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-238', 'Advanced Networking Masterclass Vol. 38', 'Xean M. Verutacio', (SELECT id FROM categories WHERE name = 'Networking'), 880.00, 2025, 'VIP 1st', 5, 5, 'VIP-38', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Networking.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-239', 'Advanced Cybersecurity Masterclass Vol. 39', 'Y. Daniel Liang', (SELECT id FROM categories WHERE name = 'Cybersecurity'), 890.00, 2025, 'VIP 1st', 5, 5, 'VIP-39', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Cybersecurity.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-240', 'Advanced AI and Data Science Masterclass Vol. 40', 'Eric Banner', (SELECT id FROM categories WHERE name = 'AI and Data Science'), 900.00, 2025, 'VIP 1st', 5, 5, 'VIP-40', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in AI and Data Science.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-241', 'Advanced Programming Masterclass Vol. 41', 'Herbert T. Pherbhert', (SELECT id FROM categories WHERE name = 'Programming'), 910.00, 2025, 'VIP 1st', 5, 5, 'VIP-41', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Programming.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-242', 'Advanced Computer Engineering Masterclass Vol. 42', 'Steve Nash', (SELECT id FROM categories WHERE name = 'Computer Engineering'), 920.00, 2025, 'VIP 1st', 5, 5, 'VIP-42', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Computer Engineering.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-243', 'Advanced Networking Masterclass Vol. 43', 'Jonathan Klied', (SELECT id FROM categories WHERE name = 'Networking'), 930.00, 2025, 'VIP 1st', 5, 5, 'VIP-43', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Networking.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-244', 'Advanced Cybersecurity Masterclass Vol. 44', 'Seiy Antis', (SELECT id FROM categories WHERE name = 'Cybersecurity'), 940.00, 2025, 'VIP 1st', 5, 5, 'VIP-44', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Cybersecurity.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-245', 'Advanced AI and Data Science Masterclass Vol. 45', 'Magnus Nakamura', (SELECT id FROM categories WHERE name = 'AI and Data Science'), 950.00, 2025, 'VIP 1st', 5, 5, 'VIP-45', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in AI and Data Science.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-246', 'Advanced Programming Masterclass Vol. 46', 'Robert B. Stark', (SELECT id FROM categories WHERE name = 'Programming'), 960.00, 2025, 'VIP 1st', 5, 5, 'VIP-46', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Programming.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-247', 'Advanced Computer Engineering Masterclass Vol. 47', 'Xean M. Verutacio', (SELECT id FROM categories WHERE name = 'Computer Engineering'), 970.00, 2025, 'VIP 1st', 5, 5, 'VIP-47', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Computer Engineering.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-248', 'Advanced Networking Masterclass Vol. 48', 'Y. Daniel Liang', (SELECT id FROM categories WHERE name = 'Networking'), 980.00, 2025, 'VIP 1st', 5, 5, 'VIP-48', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Networking.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-249', 'Advanced Cybersecurity Masterclass Vol. 49', 'Eric Banner', (SELECT id FROM categories WHERE name = 'Cybersecurity'), 990.00, 2025, 'VIP 1st', 5, 5, 'VIP-49', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Cybersecurity.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-250', 'Advanced AI and Data Science Masterclass Vol. 50', 'Herbert T. Pherbhert', (SELECT id FROM categories WHERE name = 'AI and Data Science'), 1000.00, 2025, 'VIP 1st', 5, 5, 'VIP-50', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in AI and Data Science.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-251', 'Advanced Programming Masterclass Vol. 51', 'Steve Nash', (SELECT id FROM categories WHERE name = 'Programming'), 1010.00, 2025, 'VIP 1st', 5, 5, 'VIP-51', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Programming.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-252', 'Advanced Computer Engineering Masterclass Vol. 52', 'Jonathan Klied', (SELECT id FROM categories WHERE name = 'Computer Engineering'), 1020.00, 2025, 'VIP 1st', 5, 5, 'VIP-52', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Computer Engineering.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-253', 'Advanced Networking Masterclass Vol. 53', 'Seiy Antis', (SELECT id FROM categories WHERE name = 'Networking'), 1030.00, 2025, 'VIP 1st', 5, 5, 'VIP-53', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Networking.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-254', 'Advanced Cybersecurity Masterclass Vol. 54', 'Magnus Nakamura', (SELECT id FROM categories WHERE name = 'Cybersecurity'), 1040.00, 2025, 'VIP 1st', 5, 5, 'VIP-54', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Cybersecurity.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-255', 'Advanced AI and Data Science Masterclass Vol. 55', 'Robert B. Stark', (SELECT id FROM categories WHERE name = 'AI and Data Science'), 1050.00, 2025, 'VIP 1st', 5, 5, 'VIP-55', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in AI and Data Science.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-256', 'Advanced Programming Masterclass Vol. 56', 'Xean M. Verutacio', (SELECT id FROM categories WHERE name = 'Programming'), 1060.00, 2025, 'VIP 1st', 5, 5, 'VIP-56', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Programming.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-257', 'Advanced Computer Engineering Masterclass Vol. 57', 'Y. Daniel Liang', (SELECT id FROM categories WHERE name = 'Computer Engineering'), 1070.00, 2025, 'VIP 1st', 5, 5, 'VIP-57', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Computer Engineering.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-258', 'Advanced Networking Masterclass Vol. 58', 'Eric Banner', (SELECT id FROM categories WHERE name = 'Networking'), 1080.00, 2025, 'VIP 1st', 5, 5, 'VIP-58', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Networking.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-259', 'Advanced Cybersecurity Masterclass Vol. 59', 'Herbert T. Pherbhert', (SELECT id FROM categories WHERE name = 'Cybersecurity'), 1090.00, 2025, 'VIP 1st', 5, 5, 'VIP-59', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Cybersecurity.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-260', 'Advanced AI and Data Science Masterclass Vol. 60', 'Steve Nash', (SELECT id FROM categories WHERE name = 'AI and Data Science'), 1100.00, 2025, 'VIP 1st', 5, 5, 'VIP-60', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in AI and Data Science.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-261', 'Advanced Programming Masterclass Vol. 61', 'Jonathan Klied', (SELECT id FROM categories WHERE name = 'Programming'), 1110.00, 2025, 'VIP 1st', 5, 5, 'VIP-61', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Programming.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-262', 'Advanced Computer Engineering Masterclass Vol. 62', 'Seiy Antis', (SELECT id FROM categories WHERE name = 'Computer Engineering'), 1120.00, 2025, 'VIP 1st', 5, 5, 'VIP-62', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Computer Engineering.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-263', 'Advanced Networking Masterclass Vol. 63', 'Magnus Nakamura', (SELECT id FROM categories WHERE name = 'Networking'), 1130.00, 2025, 'VIP 1st', 5, 5, 'VIP-63', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Networking.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-264', 'Advanced Cybersecurity Masterclass Vol. 64', 'Robert B. Stark', (SELECT id FROM categories WHERE name = 'Cybersecurity'), 1140.00, 2025, 'VIP 1st', 5, 5, 'VIP-64', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Cybersecurity.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-265', 'Advanced AI and Data Science Masterclass Vol. 65', 'Xean M. Verutacio', (SELECT id FROM categories WHERE name = 'AI and Data Science'), 1150.00, 2025, 'VIP 1st', 5, 5, 'VIP-65', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in AI and Data Science.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-266', 'Advanced Programming Masterclass Vol. 66', 'Y. Daniel Liang', (SELECT id FROM categories WHERE name = 'Programming'), 1160.00, 2025, 'VIP 1st', 5, 5, 'VIP-66', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Programming.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-267', 'Advanced Computer Engineering Masterclass Vol. 67', 'Eric Banner', (SELECT id FROM categories WHERE name = 'Computer Engineering'), 1170.00, 2025, 'VIP 1st', 5, 5, 'VIP-67', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Computer Engineering.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-268', 'Advanced Networking Masterclass Vol. 68', 'Herbert T. Pherbhert', (SELECT id FROM categories WHERE name = 'Networking'), 1180.00, 2025, 'VIP 1st', 5, 5, 'VIP-68', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Networking.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-269', 'Advanced Cybersecurity Masterclass Vol. 69', 'Steve Nash', (SELECT id FROM categories WHERE name = 'Cybersecurity'), 1190.00, 2025, 'VIP 1st', 5, 5, 'VIP-69', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Cybersecurity.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-270', 'Advanced AI and Data Science Masterclass Vol. 70', 'Jonathan Klied', (SELECT id FROM categories WHERE name = 'AI and Data Science'), 1200.00, 2025, 'VIP 1st', 5, 5, 'VIP-70', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in AI and Data Science.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-271', 'Advanced Programming Masterclass Vol. 71', 'Seiy Antis', (SELECT id FROM categories WHERE name = 'Programming'), 1210.00, 2025, 'VIP 1st', 5, 5, 'VIP-71', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Programming.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-272', 'Advanced Computer Engineering Masterclass Vol. 72', 'Magnus Nakamura', (SELECT id FROM categories WHERE name = 'Computer Engineering'), 1220.00, 2025, 'VIP 1st', 5, 5, 'VIP-72', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Computer Engineering.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-273', 'Advanced Networking Masterclass Vol. 73', 'Robert B. Stark', (SELECT id FROM categories WHERE name = 'Networking'), 1230.00, 2025, 'VIP 1st', 5, 5, 'VIP-73', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Networking.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-274', 'Advanced Cybersecurity Masterclass Vol. 74', 'Xean M. Verutacio', (SELECT id FROM categories WHERE name = 'Cybersecurity'), 1240.00, 2025, 'VIP 1st', 5, 5, 'VIP-74', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in Cybersecurity.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17'),
    ('PBK-275', 'Advanced AI and Data Science Masterclass Vol. 75', 'Y. Daniel Liang', (SELECT id FROM categories WHERE name = 'AI and Data Science'), 1250.00, 2025, 'VIP 1st', 5, 5, 'VIP-75', 'Pristine', 'Exclusive VIP Premium book covering expert-level concepts in AI and Data Science.', 5.0, 1, 'images/no-cover.jpg', 1, '2026-10-17')
ON DUPLICATE KEY UPDATE code = code;
INSERT INTO support_quick_options (code, label, keywords, reply, flag_human, sort_order) VALUES
    ('return', 'My return wasn''t accepted', '["return", "returned", "giving back", "give back"]', 'I''m sorry about that! Open the Borrow page and check "My Borrowed Books". If the book is still listed, press Return again. A successful return moves it to your History as Returned and shows a confirmation.

Still stuck? Choose "Talk to a person" and send the Book ID so the admin can check it when they''re back.', 0, 1),
    ('borrow', 'I can''t borrow a book', '["borrow", "can''t borrow", "cannot borrow", "unavailable"]', 'You can borrow up to 3 books at a time, for 14 days, with a ₱10 borrow fee per book.

A borrow can be blocked if you already have 3 books, the book has no available copies, you already borrowed that title, or it''s a Premium book and you''re not a Premium member.', 0, 2),
    ('premium', 'Premium membership help', '["premium", "vip", "subscription", "upgrade", "cancel"]', 'Premium is ₱99/month and unlocks all the exclusive Premium books.

To upgrade: Profile → ✨ Upgrade to Premium.
To cancel: Profile → Cancel Subscription.', 0, 3),
    ('checkout', 'Problem with my cart or purchase', '["cart", "checkout", "buy", "purchase", "payment", "pay"]', 'To buy a book, tap the 🛒 button on it, review your Cart, then press Checkout. If checkout says the cart is empty, add the book again. If you were charged wrongly, choose "Talk to a person" and tell us what you bought.', 0, 4),
    ('report', 'How do I report a book?', '["report", "damaged", "wrong info", "inappropriate"]', 'Tap the ⚑ Report button on the book card, type the reason, then press Submit Report. The library team will look into it.', 0, 5),
    ('password', 'Password or account problem', '["password", "login", "log in", "account", "username", "banned"]', 'You can change your password in Settings → Security (you''ll need your current password). You can also change your username and email in Settings.

If you''re locked out or the account was banned by mistake, choose "Talk to a person" and include your username.', 0, 6),
    ('author', 'How do I become an author?', '["author", "publish", "upload", "write a book"]', 'Go to Settings → Author Status and press Apply as Author (new members can also pick "Apply as Author" when signing up). Once an admin approves you, a 📤 My Books page appears in your menu where you can upload books and pictures.', 0, 7),
    ('contact', 'Contact info', '["contact", "phone", "email", "number", "call"]', '📞 0912 629 0432
📧 gigachinchin@gmail.com', 0, 8),
    ('human', 'Talk to a person', '["admin", "human", "person", "agent", "staff", "someone"]', 'Okay! I''ve flagged your chat for the admin. Please type your message below with as many details as you can (like the Book ID or what happened). They''ll reply here as soon as they''re back.', 1, 9)
ON DUPLICATE KEY UPDATE code = code;
INSERT INTO support_canned_replies (body, sort_order) VALUES
    ('Hi! Thanks for reaching out. How can I help?', 1),
    ('Could you send me the Book ID and what happened?', 2),
    ('All fixed! Please check again and let me know. 😊', 3),
    ('Thanks for your patience, we''re looking into it.', 4)
ON DUPLICATE KEY UPDATE body = body;
INSERT INTO faq_items (question, answer, sort_order) VALUES
    ('My return wasn''t accepted', 'Open Borrow → My Borrowed Books and press Return again. A successful return moves the book to History.', 1),
    ('Why can''t I borrow a book?', 'You can hold 3 books at once. Premium books need Premium membership, and a title with no available copies can''t be borrowed.', 2),
    ('How do I become an author?', 'Settings → Author Status → Apply as Author. When an admin approves you, you''re taken straight to My Books.', 3),
    ('How do I upgrade or cancel Premium?', 'Profile → Upgrade to Premium (₱99/mo). To stop, use Cancel Subscription on your Profile.', 4),
    ('I forgot or want to change my password', 'Settings → Security lets you set a new password with your current one. If you''re locked out, chat with support.', 5)
ON DUPLICATE KEY UPDATE question = question;
