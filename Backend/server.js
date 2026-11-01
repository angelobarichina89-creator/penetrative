require('dotenv').config();
const express = require('express');
const db = require('./db');

const app = express();
app.use(express.json());

app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS solution');
    res.json({ success: true, message: 'Database connected successfully!', result: rows[0].solution });
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// ==========================================
// 1. VIEW & SEARCH/FILTER BOOKS (Kasama ang Availability)
// ==========================================
app.get('/api/books', async (req, res) => {
    try {
        const { search, category, status, is_premium } = req.query;
        let query = 'SELECT * FROM v_book_catalog WHERE 1=1';
        let params = [];

        if (search) {
            query += ' AND (title LIKE ? OR author_name LIKE ? OR code LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }
        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }
        if (is_premium !== undefined) {
            query += ' AND is_premium = ?';
            params.push(is_premium);
        }

        const [books] = await db.query(query, params);
        res.json({ success: true, data: books });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ==========================================
// 2. ADD BOOK (Admin / Approved Author)
// ==========================================
app.post('/api/books', async (req, res) => {
    try {
        const { code, title, author_name, uploaded_by, category_id, price, publication_year, edition, copies_total, shelf, book_condition, description, cover_image, is_premium } = req.body;
        
        const query = `INSERT INTO books (code, title, author_name, uploaded_by, category_id, price, publication_year, edition, copies_total, copies_available, shelf, book_condition, description, cover_image, is_premium) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const [result] = await db.query(query, [
            code, title, author_name, uploaded_by || null, category_id, price || 0.00, 
            publication_year || null, edition || '1st', copies_total || 3, copies_total || 3, 
            shelf || 'A-01', book_condition || 'Good', description || '', 
            cover_image || 'images/no-cover.jpg', is_premium || 0
        ]);

        res.status(201).json({ success: true, message: 'Book added successfully', bookId: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ==========================================
// 3. EDIT BOOK
// ==========================================
app.put('/api/books/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, author_name, price, copies_total, description, book_condition, shelf } = req.body;

        const query = `UPDATE books SET title = ?, author_name = ?, price = ?, copies_total = ?, description = ?, book_condition = ?, shelf = ? WHERE id = ?`;
        await db.query(query, [title, author_name, price, copies_total, description, book_condition, shelf, id]);

        res.json({ success: true, message: 'Book updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ==========================================
// 4. DELETE BOOK
// ==========================================
app.delete('/api/books/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM books WHERE id = ?', [id]);
        res.json({ success: true, message: 'Book deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ==========================================
// 5. REGISTER STUDENTS / USERS
// ==========================================
app.post('/api/users/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        const query = `INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)`;
        const [result] = await db.query(query, [username, email || null, password_hash, role || 'member']);

        res.status(201).json({ success: true, message: 'User registered successfully', userId: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ==========================================
// 6. BORROW BOOK (May Trigger check sa Max 3 books & Availability)
// ==========================================
app.post('/api/borrows', async (req, res) => {
    try {
        const { user_id, book_id, due_date, borrow_fee } = req.body;

        const query = `INSERT INTO borrows (user_id, book_id, due_date, borrow_fee) VALUES (?, ?, ?, ?)`;
        const [result] = await db.query(query, [user_id, book_id, due_date, borrow_fee || 10.00]);

        res.status(201).json({ success: true, message: 'Book borrowed successfully', borrowId: result.insertId });
    } catch (err) {
        // Huhulihin nito ang SQL trigger error kung lumagpas sa 3 books o walang kopya
        res.status(400).json({ success: false, message: err.message });
    }
});

// ==========================================
// 7. RETURN BOOK
// ==========================================
app.put('/api/borrows/:id/return', async (req, res) => {
    try {
        const { id } = req.params;
        const query = `UPDATE borrows SET returned_on = CURDATE() WHERE id = ? AND returned_on IS NULL`;
        const [result] = await db.query(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(400).json({ success: false, message: 'Loan not found or already returned' });
        }

        res.json({ success: true, message: 'Book returned successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ==========================================
// 8. ADMIN DASHBOARD & OVERDUE DETECTION
// ==========================================
app.get('/api/admin/stats', async (req, res) => {
    try {
        const [stats] = await db.query('SELECT * FROM v_library_stats');
        const [overdueLoans] = await db.query('SELECT * FROM v_loans WHERE status = "Overdue"');
        
        res.json({
            success: true,
            stats: stats[0],
            overdueLoans
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ==========================================
// 9. AI LIBRARY ASSISTANT / BOOK RECOMMENDATION
// ==========================================
app.post('/api/ai/recommend', async (req, res) => {
    try {
        const { keyword, category } = req.body;
        let query = 'SELECT title, author_name, category, description, rating_avg FROM books WHERE 1=1';
        let params = [];

        if (category) {
            query += ' AND category_id = (SELECT id FROM categories WHERE name = ?)';
            params.push(category);
        }
        if (keyword) {
            query += ' AND (title LIKE ? OR description LIKE ?)';
            params.push(`%${keyword}%`, `%${keyword}%`);
        }

        query += ' ORDER BY rating_avg DESC LIMIT 5';
        const [recommendations] = await db.query(query, params);

        res.json({
            success: true,
            assistantMessage: `Narito ang ilang rekomendasyon ng aklat na aking nakita para sa iyong hinahanap:`,
            recommendations
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ==========================================
// 10. DARK MODE / THEME PREFERENCE SAVING
// ==========================================
app.put('/api/users/:id/theme', async (req, res) => {
    try {
        const { id } = req.params;
        const { theme } = req.body; // e.g., 'dark', 'light', 'galaxy', etc.

        await db.query('UPDATE users SET theme = ? WHERE id = ?', [theme, id]);
        res.json({ success: true, message: 'Theme preference saved successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Library Backend server is running on port ${PORT}`);
});