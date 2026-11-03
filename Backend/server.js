const crypto = require('crypto');
const path = require('path');
const { spawn } = require('child_process');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./db');

const app = express();
const PORT = Number(process.env.PORT || 5000);
const TOKEN_TTL_SECONDS = Number(process.env.TOKEN_TTL_SECONDS || 604800);
const FINE_PER_DAY = Number(process.env.FINE_PER_DAY || 10);
const TOKEN_SECRET = process.env.AUTH_TOKEN_SECRET || crypto.randomBytes(32).toString('hex');
const USER_COLUMNS = `id, username, email, role, membership, avatar, theme,
    email_notifications, compact_cards, created_at, updated_at`;

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
}
if (!Number.isInteger(TOKEN_TTL_SECONDS) || TOKEN_TTL_SECONDS < 60) {
    throw new Error('TOKEN_TTL_SECONDS must be an integer of at least 60.');
}
if (!Number.isFinite(FINE_PER_DAY) || FINE_PER_DAY < 0) {
    throw new Error('FINE_PER_DAY must be a non-negative number.');
}
if (TOKEN_SECRET.length < 32) {
    throw new Error('AUTH_TOKEN_SECRET must contain at least 32 characters.');
}
if (!process.env.AUTH_TOKEN_SECRET) {
    console.warn('AUTH_TOKEN_SECRET is unset. Login tokens will be invalidated when the server restarts.');
}

app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use((req, res, next) => {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) req.body = {};
    next();
});

class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

function route(handler) {
    return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function requiredText(value, label, maxLength) {
    if (typeof value !== 'string' || !value.trim() || value.trim().length > maxLength) {
        throw new HttpError(400, `${label} is required and must be at most ${maxLength} characters.`);
    }
    return value.trim();
}

function positiveId(value, label = 'id') {
    if (!/^[1-9]\d*$/.test(String(value))) {
        throw new HttpError(400, `${label} must be a positive integer.`);
    }
    return String(value);
}

function booleanValue(value, label) {
    if ([true, 1, '1', 'true'].includes(value)) return 1;
    if ([false, 0, '0', 'false'].includes(value)) return 0;
    throw new HttpError(400, `${label} must be a boolean.`);
}

function validDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function signToken(userId) {
    const payload = Buffer.from(JSON.stringify({
        sub: String(userId),
        exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS
    })).toString('base64url');
    const signature = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
    return `${payload}.${signature}`;
}

function verifyToken(token) {
    if (typeof token !== 'string') return null;
    const [payload, signature, extra] = token.split('.');
    if (!payload || !signature || extra) return null;
    const expected = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest();
    const actual = Buffer.from(signature, 'base64url');
    if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return null;
    try {
        const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
        if (!claims.sub || !Number.isInteger(claims.exp) || claims.exp <= Date.now() / 1000) return null;
        return { id: String(claims.sub) };
    } catch {
        return null;
    }
}

function authenticate(req, res, next) {
    const match = /^Bearer\s+(.+)$/i.exec(req.get('authorization') || '');
    const claims = match && verifyToken(match[1]);
    if (!claims) return res.status(401).json({ success: false, message: 'A valid bearer token is required.' });

    db.execute('SELECT id, role, is_banned FROM users WHERE id = ?', [claims.id])
        .then(([users]) => {
            if (!users.length) return res.status(401).json({ success: false, message: 'Account no longer exists.' });
            if (users[0].is_banned) return res.status(403).json({ success: false, message: 'This account is suspended.' });
            req.user = { id: String(users[0].id), role: users[0].role };
            next();
        })
        .catch(next);
}

function allowRoles(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'You do not have permission to do that.' });
        }
        next();
    };
}

function requireBookManager(req, res, next) {
    if (['admin', 'librarian'].includes(req.user.role)) return next();
    db.execute('SELECT status FROM author_profiles WHERE user_id = ?', [req.user.id])
        .then(([profiles]) => {
            if (!profiles.length || profiles[0].status !== 'approved') {
                return res.status(403).json({ success: false, message: 'An approved author profile or staff role is required.' });
            }
            next();
        })
        .catch(next);
}

function canManageBook(user, book) {
    return ['admin', 'librarian'].includes(user.role) || String(book.uploaded_by) === user.id;
}

const TINYFISH_WORKER = String.raw`
import json
import os
import sys
from tinyfish import TinyFish

try:
    request = json.load(sys.stdin)
    if not os.getenv("TINYFISH_API_KEY"):
        print(json.dumps({"error": "missing_api_key"}))
        raise SystemExit(0)
    client = TinyFish(api_key=os.environ["TINYFISH_API_KEY"], timeout=30, max_retries=1)
    response = client.search.query(
        request["query"],
        purpose=request["purpose"],
        location="US",
        language="en",
    )
    results = []
    for item in response.results[:8]:
        title = item.title.strip()[:300] if isinstance(item.title, str) else ""
        url = item.url.strip()[:2000] if isinstance(item.url, str) else ""
        if not title or not url.startswith(("https://", "http://")):
            continue
        results.append({
            "title": title,
            "url": url,
            "site_name": item.site_name.strip()[:200] if isinstance(item.site_name, str) else "",
            "snippet": item.snippet.strip()[:1000] if isinstance(item.snippet, str) else "",
        })
    print(json.dumps({"results": results}))
except Exception as error:
    name = type(error).__name__
    if name in {"AuthenticationError", "RateLimitError", "APIConnectionError", "APIStatusError"}:
        print(json.dumps({"error": name, "status": getattr(error, "status_code", None)}))
    else:
        print(json.dumps({"error": "sdk_error"}))
`;

function tinyFishSearch(query, purpose) {
    if (!process.env.TINYFISH_API_KEY) {
        return Promise.reject(new HttpError(503, 'TinyFish is not configured. Set TINYFISH_API_KEY in Backend/.env.'));
    }

    return new Promise((resolve, reject) => {
        const python = process.env.TINYFISH_PYTHON || (process.platform === 'win32' ? 'python' : 'python3');
        const child = spawn(python, ['-c', TINYFISH_WORKER], {
            env: process.env,
            stdio: ['pipe', 'pipe', 'pipe'],
            windowsHide: true
        });
        let stdout = '';
        let stderr = '';
        let settled = false;
        const timeout = setTimeout(() => {
            child.kill();
            finish(new HttpError(504, 'TinyFish search timed out.'));
        }, 35000);

        function finish(error, result) {
            if (settled) return;
            settled = true;
            clearTimeout(timeout);
            if (error) reject(error);
            else resolve(result);
        }

        child.stdout.setEncoding('utf8');
        child.stderr.setEncoding('utf8');
        child.stdout.on('data', (chunk) => {
            stdout += chunk;
            if (stdout.length > 256 * 1024) {
                child.kill();
                finish(new HttpError(502, 'TinyFish returned too much data.'));
            }
        });
        child.stderr.on('data', (chunk) => {
            stderr += chunk.slice(0, 4096);
        });
        child.on('error', (error) => {
            console.error('Could not start the TinyFish Python SDK:', error.message);
            finish(new HttpError(503, 'Python and the TinyFish SDK must be installed to use AI search.'));
        });
        child.on('close', (code) => {
            if (settled) return;
            let result;
            try {
                result = JSON.parse(stdout.trim());
            } catch {
                console.error('TinyFish worker failed:', stderr || `exit code ${code}`);
                return finish(new HttpError(502, 'TinyFish returned an invalid response.'));
            }

            if (result.error === 'missing_api_key') {
                return finish(new HttpError(503, 'Set TINYFISH_API_KEY in Backend/.env.'));
            }
            if (result.error === 'AuthenticationError') {
                return finish(new HttpError(401, 'TinyFish rejected TINYFISH_API_KEY.'));
            }
            if (result.error === 'RateLimitError') {
                return finish(new HttpError(429, 'TinyFish is rate limited. Try again later.'));
            }
            if (result.error === 'APIConnectionError') {
                return finish(new HttpError(503, 'Could not connect to TinyFish.'));
            }
            if (result.error === 'APIStatusError' && [402, 403].includes(result.status)) {
                return finish(new HttpError(502, 'TinyFish account access or credits are insufficient.'));
            }
            if (result.error || code !== 0 || !Array.isArray(result.results)) {
                console.error('TinyFish worker failed:', stderr || `exit code ${code}`);
                return finish(new HttpError(502, 'TinyFish could not complete the search.'));
            }
            finish(null, result.results);
        });

        child.stdin.on('error', () => {});
        child.stdin.end(JSON.stringify({ query, purpose }));
    });
}

app.get('/api', (req, res) => {
    res.json({ success: true, message: 'Library API is running.' });
});

app.get('/api/test-db', route(async (req, res) => {
    await db.query('SELECT 1');
    res.json({ success: true, message: 'Database connected successfully.' });
}));

app.post(['/api/auth/register', '/api/users/register'], route(async (req, res) => {
    const username = requiredText(req.body.username, 'username', 40);
    const email = requiredText(req.body.email, 'email', 255).toLowerCase();
    const password = requiredText(req.body.password, 'password', 128);
    if (!/^[A-Za-z][A-Za-z0-9_]{2,39}$/.test(username)) {
        throw new HttpError(400, 'Username must start with a letter and contain 3-40 letters, numbers, or underscores.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'A valid email is required.');
    if (password.length < 8 || !/^[A-Za-z0-9_@#?!-]+$/.test(password)) {
        throw new HttpError(400, 'Password must be 8+ characters and use only letters, numbers, _ @ - # ? !.');
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const passwordHash = await bcrypt.hash(password, 10);
        const [result] = await connection.execute(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, passwordHash]
        );
        if (req.body.signupType === 'author') {
            const penName = requiredText(req.body.pen_name, 'pen_name', 40);
            const bio = typeof req.body.bio === 'string' ? req.body.bio.trim().slice(0, 300) : '';
            await connection.execute(
                'INSERT INTO author_profiles (user_id, pen_name, bio) VALUES (?, ?, ?)',
                [result.insertId, penName, bio]
            );
        }
        const [users] = await connection.execute(
            `SELECT ${USER_COLUMNS} FROM users WHERE id = ?`,
            [result.insertId]
        );
        await connection.commit();
        res.status(201).json({ success: true, data: users[0], token: signToken(users[0].id) });
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}));

app.post(['/api/auth/login', '/api/users/login'], route(async (req, res) => {
    const username = requiredText(req.body.username, 'username', 40);
    const password = requiredText(req.body.password, 'password', 128);
    const [users] = await db.execute(
        `SELECT ${USER_COLUMNS}, password_hash, is_banned
         FROM users WHERE username = ? LIMIT 1`,
        [username]
    );
    if (!users.length || users[0].is_banned ||
        !(await bcrypt.compare(password, users[0].password_hash))) {
        throw new HttpError(401, 'Invalid username or password.');
    }
    const { password_hash, is_banned, ...user } = users[0];
    res.json({ success: true, data: user, token: signToken(user.id) });
}));

app.get('/api/users/me', authenticate, route(async (req, res) => {
    const [users] = await db.execute(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?`, [req.user.id]);
    if (!users.length) throw new HttpError(404, 'User not found.');
    res.json({ success: true, data: users[0] });
}));

app.put('/api/users/me', authenticate, route(async (req, res) => {
    const allowed = ['username', 'email', 'avatar', 'theme', 'email_notifications', 'compact_cards'];
    const updates = [];
    const params = [];
    for (const field of allowed) {
        if (!Object.prototype.hasOwnProperty.call(req.body, field)) continue;
        let value = req.body[field];
        if (['username', 'email', 'theme'].includes(field)) {
            value = requiredText(value, field, field === 'email' ? 255 : field === 'username' ? 40 : 20);
        }
        if (field === 'username' && !/^[A-Za-z][A-Za-z0-9_]{2,39}$/.test(value)) {
            throw new HttpError(400, 'Invalid username.');
        }
        if (field === 'email') {
            value = value.toLowerCase();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new HttpError(400, 'A valid email is required.');
        }
        if (field === 'avatar' && value !== null) value = requiredText(value, field, 500);
        if (field === 'email_notifications' || field === 'compact_cards') value = booleanValue(value, field);
        updates.push(`${field} = ?`);
        params.push(value);
    }
    if (!updates.length) throw new HttpError(400, 'No profile fields were provided.');
    await db.execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, [...params, req.user.id]);
    const [users] = await db.execute(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?`, [req.user.id]);
    res.json({ success: true, data: users[0] });
}));

app.put('/api/users/me/password', authenticate, route(async (req, res) => {
    const current = requiredText(req.body.current_password, 'current_password', 128);
    const password = requiredText(req.body.new_password, 'new_password', 128);
    if (password.length < 8 || !/^[A-Za-z0-9_@#?!-]+$/.test(password)) {
        throw new HttpError(400, 'Password must be 8+ characters and use only letters, numbers, _ @ - # ? !.');
    }
    const [users] = await db.execute('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    if (!users.length || !(await bcrypt.compare(current, users[0].password_hash))) {
        throw new HttpError(400, 'Current password is incorrect.');
    }
    await db.execute('UPDATE users SET password_hash = ? WHERE id = ?', [
        await bcrypt.hash(password, 10), req.user.id
    ]);
    res.json({ success: true, message: 'Password updated.' });
}));

app.get('/api/users', authenticate, allowRoles('admin', 'librarian'), route(async (req, res) => {
    const [users] = await db.query(`SELECT ${USER_COLUMNS}, is_banned FROM users ORDER BY created_at DESC`);
    res.json({ success: true, data: users });
}));

app.get('/api/users/:id', authenticate, route(async (req, res) => {
    const id = positiveId(req.params.id, 'user id');
    if (id !== req.user.id && !['admin', 'librarian'].includes(req.user.role)) {
        throw new HttpError(403, 'You cannot view another member’s profile.');
    }
    const [users] = await db.execute(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?`, [id]);
    if (!users.length) throw new HttpError(404, 'User not found.');
    res.json({ success: true, data: users[0] });
}));

app.put('/api/users/:id', authenticate, allowRoles('admin'), route(async (req, res) => {
    const id = positiveId(req.params.id, 'user id');
    const [existing] = await db.execute('SELECT id FROM users WHERE id = ?', [id]);
    if (!existing.length) throw new HttpError(404, 'User not found.');
    const updates = [];
    const params = [];
    for (const [field, values] of Object.entries({
        role: ['member', 'librarian', 'admin'],
        membership: ['regular', 'premium']
    })) {
        if (!Object.prototype.hasOwnProperty.call(req.body, field)) continue;
        if (!values.includes(req.body[field])) throw new HttpError(400, `Invalid ${field}.`);
        updates.push(`${field} = ?`);
        params.push(req.body[field]);
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'is_banned')) {
        updates.push('is_banned = ?');
        params.push(booleanValue(req.body.is_banned, 'is_banned'));
    }
    if (!updates.length) throw new HttpError(400, 'No user fields were provided.');
    await db.execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, [...params, id]);
    res.json({ success: true, message: 'User updated.' });
}));

app.delete('/api/users/:id', authenticate, allowRoles('admin'), route(async (req, res) => {
    const id = positiveId(req.params.id, 'user id');
    if (id === req.user.id) throw new HttpError(400, 'Use another administrator to delete this account.');
    await db.execute('CALL sp_delete_account(?)', [id]);
    res.json({ success: true, message: 'User deleted.' });
}));

app.get('/api/categories', route(async (req, res) => {
    const [rows] = await db.query('SELECT id, name FROM categories ORDER BY name');
    res.json({ success: true, data: rows });
}));

app.post('/api/categories', authenticate, allowRoles('admin', 'librarian'), route(async (req, res) => {
    const name = requiredText(req.body.name, 'name', 40);
    const [result] = await db.execute('INSERT INTO categories (name) VALUES (?)', [name]);
    res.status(201).json({ success: true, data: { id: result.insertId, name } });
}));

app.put('/api/categories/:id', authenticate, allowRoles('admin', 'librarian'), route(async (req, res) => {
    const id = positiveId(req.params.id, 'category id');
    const name = requiredText(req.body.name, 'name', 40);
    const [result] = await db.execute('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
    if (!result.affectedRows) throw new HttpError(404, 'Category not found.');
    res.json({ success: true, message: 'Category updated.' });
}));

app.delete('/api/categories/:id', authenticate, allowRoles('admin'), route(async (req, res) => {
    const id = positiveId(req.params.id, 'category id');
    const [result] = await db.execute('DELETE FROM categories WHERE id = ?', [id]);
    if (!result.affectedRows) throw new HttpError(404, 'Category not found.');
    res.json({ success: true, message: 'Category deleted.' });
}));

app.get('/api/books', route(async (req, res) => {
    const { search, category, status, is_premium: isPremium } = req.query;
    const sort = String(req.query.sort || 'title').toLowerCase();
    const sortColumns = { title: 'b.title', author: 'b.author_name', year: 'b.publication_year', rating: 'b.rating_avg' };
    if (!sortColumns[sort]) throw new HttpError(400, 'sort must be title, author, year, or rating.');
    const filters = [];
    const params = [];
    if (search) {
        const term = `%${String(search).trim()}%`;
        filters.push('(b.title LIKE ? OR b.author_name LIKE ? OR b.code LIKE ? OR b.description LIKE ?)');
        params.push(term, term, term, term);
    }
    if (category) {
        filters.push('c.name = ?');
        params.push(String(category));
    }
    if (status === 'available') filters.push('b.copies_available > 0');
    else if (status === 'borrowed') filters.push('b.copies_available < b.copies_total');
    else if (status && status !== 'all') throw new HttpError(400, 'status must be available, borrowed, or all.');
    if (isPremium !== undefined) {
        filters.push('b.is_premium = ?');
        params.push(booleanValue(isPremium, 'is_premium'));
    }
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 50, 1), 100);
    const offset = Math.max(Number.parseInt(req.query.offset, 10) || 0, 0);
    const direction = ['year', 'rating'].includes(sort) ? 'DESC' : 'ASC';
    const [books] = await db.execute(
        `SELECT b.*, c.name AS category
         FROM books b JOIN categories c ON c.id = b.category_id
         ${filters.length ? `WHERE ${filters.join(' AND ')}` : ''}
         ORDER BY ${sortColumns[sort]} ${direction}, b.id
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
    );
    res.json({ success: true, data: books, pagination: { limit, offset } });
}));

app.get('/api/books/:id', route(async (req, res) => {
    const id = positiveId(req.params.id, 'book id');
    const [books] = await db.execute(
        `SELECT b.*, c.name AS category
         FROM books b JOIN categories c ON c.id = b.category_id
         WHERE b.id = ?`,
        [id]
    );
    if (!books.length) throw new HttpError(404, 'Book not found.');
    res.json({ success: true, data: books[0] });
}));

app.post('/api/books', authenticate, requireBookManager, route(async (req, res) => {
    const body = req.body;
    const code = requiredText(body.code, 'code', 20);
    const title = requiredText(body.title, 'title', 150);
    const authorName = requiredText(body.author_name, 'author_name', 80);
    const categoryId = positiveId(body.category_id, 'category_id');
    const total = Number(body.copies_total ?? 3);
    const available = Number(body.copies_available ?? total);
    const price = Number(body.price ?? 0);
    const condition = body.book_condition || 'Good';
    if (!Number.isInteger(total) || total < 0 || !Number.isInteger(available) || available < 0 || available > total) {
        throw new HttpError(400, 'Invalid total or available copy count.');
    }
    if (!Number.isFinite(price) || price < 0) throw new HttpError(400, 'price must be non-negative.');
    if (body.publication_year != null &&
        (!Number.isInteger(Number(body.publication_year)) || Number(body.publication_year) < 0 || Number(body.publication_year) > 65535)) {
        throw new HttpError(400, 'publication_year must be a valid year.');
    }
    if (!['Pristine', 'Excellent', 'Good', 'Fair'].includes(condition)) {
        throw new HttpError(400, 'Invalid book_condition.');
    }
    const premium = body.is_premium === undefined ? 0 : booleanValue(body.is_premium, 'is_premium');
    const [categories] = await db.execute('SELECT id FROM categories WHERE id = ?', [categoryId]);
    if (!categories.length) throw new HttpError(400, 'Category not found.');
    const [result] = await db.execute(
        `INSERT INTO books
         (code, title, author_name, uploaded_by, category_id, price, publication_year,
          edition, copies_total, copies_available, shelf, book_condition, description,
          cover_image, is_premium)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            code, title, authorName, req.user.id, categoryId, price, body.publication_year || null,
            body.edition || '1st', total, available, body.shelf || 'A-01', condition,
            typeof body.description === 'string' ? body.description : '',
            body.cover_image || 'images/no-cover.jpg', premium
        ]
    );
    res.status(201).json({ success: true, data: { id: result.insertId }, message: 'Book created.' });
}));

app.put('/api/books/:id', authenticate, requireBookManager, route(async (req, res) => {
    const id = positiveId(req.params.id, 'book id');
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [rows] = await connection.execute(
            'SELECT uploaded_by, copies_total, copies_available FROM books WHERE id = ? FOR UPDATE',
            [id]
        );
        if (!rows.length) throw new HttpError(404, 'Book not found.');
        const book = rows[0];
        if (!canManageBook(req.user, book)) throw new HttpError(403, 'You can only edit books you uploaded.');
        const fields = {
            code: 20, title: 150, author_name: 80, edition: 20, shelf: 20, cover_image: 500
        };
        const numericFields = ['category_id', 'price', 'publication_year', 'is_premium'];
        const allowed = [...Object.keys(fields), ...numericFields, 'book_condition', 'description'];
        const updates = [];
        const params = [];
        for (const field of allowed) {
            if (!Object.prototype.hasOwnProperty.call(req.body, field)) continue;
            let value = req.body[field];
            if (fields[field]) value = requiredText(value, field, fields[field]);
            if (field === 'category_id') {
                value = positiveId(value, field);
                const [categories] = await connection.execute('SELECT id FROM categories WHERE id = ?', [value]);
                if (!categories.length) throw new HttpError(400, 'Category not found.');
            }
            if (field === 'price' && (!Number.isFinite(Number(value)) || Number(value) < 0)) {
                throw new HttpError(400, 'price must be non-negative.');
            }
            if (field === 'publication_year' && value != null &&
                (!Number.isInteger(Number(value)) || Number(value) < 0 || Number(value) > 65535)) {
                throw new HttpError(400, 'publication_year must be a valid year.');
            }
            if (field === 'is_premium') value = booleanValue(value, field);
            if (field === 'book_condition' && !['Pristine', 'Excellent', 'Good', 'Fair'].includes(value)) {
                throw new HttpError(400, 'Invalid book_condition.');
            }
            updates.push(`${field} = ?`);
            params.push(value);
        }
        if (Object.prototype.hasOwnProperty.call(req.body, 'copies_total')) {
            const total = Number(req.body.copies_total);
            const borrowed = Number(book.copies_total) - Number(book.copies_available);
            if (!Number.isInteger(total) || total < borrowed || total > 65535) {
                throw new HttpError(400, 'copies_total cannot be less than the number of copies currently borrowed.');
            }
            updates.push('copies_total = ?', 'copies_available = ?');
            params.push(total, total - borrowed);
        }
        if (!updates.length) throw new HttpError(400, 'No book fields were provided.');
        await connection.execute(`UPDATE books SET ${updates.join(', ')} WHERE id = ?`, [...params, id]);
        await connection.commit();
        res.json({ success: true, message: 'Book updated.' });
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}));

app.delete('/api/books/:id', authenticate, requireBookManager, route(async (req, res) => {
    const id = positiveId(req.params.id, 'book id');
    const [books] = await db.execute('SELECT uploaded_by FROM books WHERE id = ?', [id]);
    if (!books.length) throw new HttpError(404, 'Book not found.');
    if (!canManageBook(req.user, books[0])) throw new HttpError(403, 'You can only delete books you uploaded.');
    const [result] = await db.execute('DELETE FROM books WHERE id = ?', [id]);
    if (!result.affectedRows) throw new HttpError(404, 'Book not found.');
    res.json({ success: true, message: 'Book deleted.' });
}));

app.get('/api/authors', route(async (req, res) => {
    const [authors] = await db.query(
        `SELECT b.author_name AS name, COUNT(b.id) AS book_count,
                ROUND(AVG(b.rating_avg), 1) AS average_rating,
                GROUP_CONCAT(DISTINCT c.name ORDER BY c.name SEPARATOR ', ') AS categories
         FROM books b JOIN categories c ON c.id = b.category_id
         GROUP BY b.author_name ORDER BY b.author_name`
    );
    res.json({ success: true, data: authors });
}));

app.get('/api/authors/applications', authenticate, allowRoles('admin', 'librarian'), route(async (req, res) => {
    const [applications] = await db.query(
        `SELECT ap.user_id, u.username, u.email, ap.pen_name, ap.bio, ap.status, ap.applied_at
         FROM author_profiles ap JOIN users u ON u.id = ap.user_id ORDER BY ap.applied_at DESC`
    );
    res.json({ success: true, data: applications });
}));

app.put('/api/authors/me', authenticate, route(async (req, res) => {
    const penName = requiredText(req.body.pen_name, 'pen_name', 40);
    const bio = typeof req.body.bio === 'string' ? req.body.bio.trim().slice(0, 300) : '';
    await db.execute(
        `INSERT INTO author_profiles (user_id, pen_name, bio, status)
         VALUES (?, ?, ?, 'pending')
         ON DUPLICATE KEY UPDATE pen_name = VALUES(pen_name), bio = VALUES(bio), status = 'pending'`,
        [req.user.id, penName, bio]
    );
    res.status(201).json({ success: true, message: 'Author application submitted.' });
}));

app.patch('/api/authors/:userId', authenticate, allowRoles('admin', 'librarian'), route(async (req, res) => {
    const userId = positiveId(req.params.userId, 'user id');
    if (!['pending', 'approved', 'rejected'].includes(req.body.status)) {
        throw new HttpError(400, 'Invalid author application status.');
    }
    const [result] = await db.execute(
        `UPDATE author_profiles
         SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP
         WHERE user_id = ?`,
        [req.body.status, req.user.id, userId]
    );
    if (!result.affectedRows) throw new HttpError(404, 'Author application not found.');
    res.json({ success: true, message: 'Author application updated.' });
}));

app.delete('/api/authors/:userId', authenticate, route(async (req, res) => {
    const userId = positiveId(req.params.userId, 'user id');
    if (userId !== req.user.id && !['admin', 'librarian'].includes(req.user.role)) {
        throw new HttpError(403, 'You cannot delete another member’s author profile.');
    }
    const [result] = await db.execute('DELETE FROM author_profiles WHERE user_id = ?', [userId]);
    if (!result.affectedRows) throw new HttpError(404, 'Author profile not found.');
    res.json({ success: true, message: 'Author profile deleted.' });
}));

app.get('/api/borrows', authenticate, route(async (req, res) => {
    const staff = ['admin', 'librarian'].includes(req.user.role);
    const userId = staff && req.query.user_id ? positiveId(req.query.user_id, 'user_id') : req.user.id;
    const [borrows] = await db.execute(
        `SELECT br.*, b.title, b.code, b.author_name, u.username,
                GREATEST(DATEDIFF(COALESCE(br.returned_on, CURRENT_DATE), br.due_date), 0) AS days_late,
                GREATEST(DATEDIFF(COALESCE(br.returned_on, CURRENT_DATE), br.due_date), 0) * ? AS estimated_fine
         FROM borrows br JOIN books b ON b.id = br.book_id JOIN users u ON u.id = br.user_id
         WHERE br.user_id = ? ORDER BY br.borrowed_on DESC, br.id DESC`,
        [FINE_PER_DAY, userId]
    );
    res.json({ success: true, data: borrows });
}));

app.get('/api/borrows/:id', authenticate, route(async (req, res) => {
    const id = positiveId(req.params.id, 'borrow id');
    const [borrows] = await db.execute(
        `SELECT br.*, b.title, b.code, b.author_name,
                GREATEST(DATEDIFF(COALESCE(br.returned_on, CURRENT_DATE), br.due_date), 0) AS days_late,
                GREATEST(DATEDIFF(COALESCE(br.returned_on, CURRENT_DATE), br.due_date), 0) * ? AS estimated_fine
         FROM borrows br JOIN books b ON b.id = br.book_id WHERE br.id = ?`,
        [FINE_PER_DAY, id]
    );
    if (!borrows.length) throw new HttpError(404, 'Borrow record not found.');
    if (String(borrows[0].user_id) !== req.user.id && !['admin', 'librarian'].includes(req.user.role)) {
        throw new HttpError(403, 'You cannot view another member’s borrow record.');
    }
    res.json({ success: true, data: borrows[0] });
}));

app.post('/api/borrows', authenticate, route(async (req, res) => {
    const bookId = positiveId(req.body.book_id, 'book_id');
    const userId = ['admin', 'librarian'].includes(req.user.role) && req.body.user_id
        ? positiveId(req.body.user_id, 'user_id')
        : req.user.id;
    const dueDate = req.body.due_date || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
    if (!validDate(dueDate) || dueDate < new Date().toISOString().slice(0, 10)) {
        throw new HttpError(400, 'due_date must be today or later in YYYY-MM-DD format.');
    }
    const [result] = await db.execute(
        'INSERT INTO borrows (user_id, book_id, due_date, borrow_fee) VALUES (?, ?, ?, ?)',
        [userId, bookId, dueDate, 10]
    );
    res.status(201).json({ success: true, data: { id: result.insertId } });
}));

app.put('/api/borrows/:id/return', authenticate, route(async (req, res) => {
    const id = positiveId(req.params.id, 'borrow id');
    const [borrows] = await db.execute('SELECT user_id, due_date, returned_on FROM borrows WHERE id = ?', [id]);
    if (!borrows.length) throw new HttpError(404, 'Borrow record not found.');
    const borrow = borrows[0];
    if (String(borrow.user_id) !== req.user.id && !['admin', 'librarian'].includes(req.user.role)) {
        throw new HttpError(403, 'You cannot return another member’s book.');
    }
    if (borrow.returned_on) throw new HttpError(409, 'This book has already been returned.');
    const [result] = await db.execute(
        'UPDATE borrows SET returned_on = CURRENT_DATE WHERE id = ? AND returned_on IS NULL',
        [id]
    );
    if (!result.affectedRows) throw new HttpError(409, 'This book has already been returned.');
    const today = new Date().toISOString().slice(0, 10);
    const daysLate = Math.max(0, Math.floor(
        (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${borrow.due_date}T00:00:00Z`)) / 86400000
    ));
    res.json({ success: true, data: { days_late: daysLate, estimated_fine: daysLate * FINE_PER_DAY } });
}));

app.put('/api/borrows/:id', authenticate, allowRoles('admin', 'librarian'), route(async (req, res) => {
    const id = positiveId(req.params.id, 'borrow id');
    const updates = [];
    const params = [];
    if (Object.prototype.hasOwnProperty.call(req.body, 'due_date')) {
        if (!validDate(req.body.due_date)) throw new HttpError(400, 'due_date must use YYYY-MM-DD format.');
        updates.push('due_date = ?');
        params.push(req.body.due_date);
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'borrow_fee')) {
        const fee = Number(req.body.borrow_fee);
        if (!Number.isFinite(fee) || fee < 0) throw new HttpError(400, 'borrow_fee must be non-negative.');
        updates.push('borrow_fee = ?');
        params.push(fee);
    }
    if (!updates.length) throw new HttpError(400, 'No borrow fields were provided.');
    const [result] = await db.execute(`UPDATE borrows SET ${updates.join(', ')} WHERE id = ?`, [...params, id]);
    if (!result.affectedRows) throw new HttpError(404, 'Borrow record not found.');
    res.json({ success: true, message: 'Borrow updated.' });
}));

app.delete('/api/borrows/:id', authenticate, allowRoles('admin', 'librarian'), route(async (req, res) => {
    const id = positiveId(req.params.id, 'borrow id');
    const [rows] = await db.execute('SELECT returned_on FROM borrows WHERE id = ?', [id]);
    if (!rows.length) throw new HttpError(404, 'Borrow record not found.');
    if (!rows[0].returned_on) throw new HttpError(409, 'Return the active loan before deleting it.');
    await db.execute('DELETE FROM borrows WHERE id = ?', [id]);
    res.json({ success: true, message: 'Borrow deleted.' });
}));

app.get('/api/cart', authenticate, route(async (req, res) => {
    const [items] = await db.execute(
        `SELECT ci.*, b.title, b.author_name, b.price, b.cover_image
         FROM cart_items ci JOIN books b ON b.id = ci.book_id
         WHERE ci.user_id = ? ORDER BY ci.added_at DESC`,
        [req.user.id]
    );
    res.json({ success: true, data: items });
}));

app.put('/api/cart/:bookId', authenticate, route(async (req, res) => {
    const bookId = positiveId(req.params.bookId, 'book id');
    const quantity = Number(req.body.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
        throw new HttpError(400, 'quantity must be from 1 to 999.');
    }
    await db.execute(
        `INSERT INTO cart_items (user_id, book_id, quantity) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)`,
        [req.user.id, bookId, quantity]
    );
    res.json({ success: true, message: 'Cart updated.' });
}));

app.delete('/api/cart/:bookId', authenticate, route(async (req, res) => {
    const bookId = positiveId(req.params.bookId, 'book id');
    await db.execute('DELETE FROM cart_items WHERE user_id = ? AND book_id = ?', [req.user.id, bookId]);
    res.json({ success: true, message: 'Item removed from cart.' });
}));

app.delete('/api/cart', authenticate, route(async (req, res) => {
    await db.execute('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
    res.json({ success: true, message: 'Cart cleared.' });
}));

app.post('/api/cart/checkout', authenticate, route(async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.query('CALL sp_checkout(?, @checkout_order_id)', [req.user.id]);
        const [[rows]] = await connection.query('SELECT @checkout_order_id AS order_id');
        res.status(201).json({ success: true, data: { order_id: rows.order_id } });
    } finally {
        connection.release();
    }
}));

app.get('/api/subscriptions', authenticate, route(async (req, res) => {
    const userId = ['admin', 'librarian'].includes(req.user.role) && req.query.user_id
        ? positiveId(req.query.user_id, 'user_id')
        : req.user.id;
    const [subscriptions] = await db.execute(
        'SELECT * FROM subscriptions WHERE user_id = ? ORDER BY started_at DESC',
        [userId]
    );
    res.json({ success: true, data: subscriptions });
}));

app.post('/api/subscriptions/upgrade', authenticate, route(async (req, res) => {
    await db.query('CALL sp_upgrade_premium(?)', [req.user.id]);
    const [subscriptions] = await db.execute(
        `SELECT id, user_id, price, status, started_at, ends_at
         FROM subscriptions WHERE user_id = ? ORDER BY id DESC LIMIT 1`,
        [req.user.id]
    );
    res.status(201).json({ success: true, data: subscriptions[0] });
}));

app.put('/api/subscriptions/cancel', authenticate, route(async (req, res) => {
    await db.query('CALL sp_cancel_premium(?)', [req.user.id]);
    res.json({ success: true, message: 'Premium subscription canceled.' });
}));

app.put('/api/books/:bookId/rating', authenticate, route(async (req, res) => {
    const bookId = positiveId(req.params.bookId, 'book id');
    const stars = Number(req.body.stars);
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
        throw new HttpError(400, 'stars must be an integer from 1 to 5.');
    }
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        await connection.execute(
            `INSERT INTO book_ratings (user_id, book_id, stars) VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE stars = VALUES(stars)`,
            [req.user.id, bookId, stars]
        );
        await connection.execute(
            `UPDATE books
             SET rating_votes = (SELECT COUNT(*) FROM book_ratings WHERE book_id = ?),
                 rating_avg = COALESCE((SELECT ROUND(AVG(stars), 1) FROM book_ratings WHERE book_id = ?), 0)
             WHERE id = ?`,
            [bookId, bookId, bookId]
        );
        await connection.commit();
        res.json({ success: true, message: 'Rating saved.' });
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}));

app.get('/api/messages', authenticate, route(async (req, res) => {
    const params = [req.user.id, req.user.id];
    let where = '(dm.sender_id = ? OR dm.recipient_id = ?)';
    if (req.query.with_user_id) {
        const other = positiveId(req.query.with_user_id, 'with_user_id');
        where += ' AND ((dm.sender_id = ? AND dm.recipient_id = ?) OR (dm.sender_id = ? AND dm.recipient_id = ?))';
        params.push(req.user.id, other, other, req.user.id);
    }
    const [messages] = await db.execute(
        `SELECT dm.*, sender.username AS sender_username, recipient.username AS recipient_username
         FROM direct_messages dm
         JOIN users sender ON sender.id = dm.sender_id
         JOIN users recipient ON recipient.id = dm.recipient_id
         WHERE ${where} ORDER BY dm.created_at`,
        params
    );
    res.json({ success: true, data: messages });
}));

app.post('/api/messages', authenticate, route(async (req, res) => {
    const recipient = positiveId(req.body.recipient_id, 'recipient_id');
    const body = requiredText(req.body.body, 'body', 500);
    if (recipient === req.user.id) throw new HttpError(400, 'You cannot message yourself.');
    const [result] = await db.execute(
        'INSERT INTO direct_messages (sender_id, recipient_id, body) VALUES (?, ?, ?)',
        [req.user.id, recipient, body]
    );
    res.status(201).json({ success: true, data: { id: result.insertId } });
}));

app.put('/api/messages/:id/read', authenticate, route(async (req, res) => {
    const id = positiveId(req.params.id, 'message id');
    const [result] = await db.execute(
        'UPDATE direct_messages SET read_at = CURRENT_TIMESTAMP WHERE id = ? AND recipient_id = ?',
        [id, req.user.id]
    );
    if (!result.affectedRows) throw new HttpError(404, 'Message not found.');
    res.json({ success: true, message: 'Message marked as read.' });
}));

app.delete('/api/messages/:id', authenticate, route(async (req, res) => {
    const id = positiveId(req.params.id, 'message id');
    const [result] = await db.execute(
        'DELETE FROM direct_messages WHERE id = ? AND (sender_id = ? OR ? = 1)',
        [id, req.user.id, req.user.role === 'admin' ? 1 : 0]
    );
    if (!result.affectedRows) throw new HttpError(404, 'Message not found.');
    res.json({ success: true, message: 'Message deleted.' });
}));

app.get('/api/support', authenticate, route(async (req, res) => {
    const staff = ['admin', 'librarian'].includes(req.user.role);
    const [rows] = staff
        ? await db.query(
            `SELECT sc.*, u.username FROM support_conversations sc
             JOIN users u ON u.id = sc.user_id ORDER BY sc.updated_at DESC`
        )
        : await db.execute('SELECT * FROM support_conversations WHERE user_id = ?', [req.user.id]);
    res.json({ success: true, data: rows });
}));

app.get('/api/support/:conversationId/messages', authenticate, route(async (req, res) => {
    const id = positiveId(req.params.conversationId, 'conversation id');
    const [conversations] = await db.execute('SELECT user_id FROM support_conversations WHERE id = ?', [id]);
    if (!conversations.length) throw new HttpError(404, 'Support conversation not found.');
    const staff = ['admin', 'librarian'].includes(req.user.role);
    if (!staff && String(conversations[0].user_id) !== req.user.id) {
        throw new HttpError(403, 'You cannot view another member’s conversation.');
    }
    const [messages] = await db.execute(
        'SELECT * FROM support_messages WHERE conversation_id = ? ORDER BY created_at, id',
        [id]
    );
    await db.execute(
        'UPDATE support_messages SET is_read = 1 WHERE conversation_id = ? AND sender_type = ?',
        [id, staff ? 'user' : 'admin']
    );
    res.json({ success: true, data: messages });
}));

app.post('/api/support/messages', authenticate, route(async (req, res) => {
    const body = requiredText(req.body.body, 'body', 2000);
    const issueTypes = ['borrow', 'order', 'premium', 'account', 'author', 'book', 'other'];
    const issueType = req.body.issue_type || null;
    if (issueType && !issueTypes.includes(issueType)) throw new HttpError(400, 'Invalid issue_type.');
    const reference = req.body.reference == null ? null : requiredText(req.body.reference, 'reference', 40);
    const [conversation] = await db.execute(
        `INSERT INTO support_conversations (user_id) VALUES (?)
         ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`,
        [req.user.id]
    );
    const [message] = await db.execute(
        `INSERT INTO support_messages
         (conversation_id, sender_type, sender_id, body, issue_type, reference)
         VALUES (?, 'user', ?, ?, ?, ?)`,
        [conversation.insertId, req.user.id, body, issueType, reference]
    );
    res.status(201).json({
        success: true,
        data: { conversation_id: conversation.insertId, message_id: message.insertId }
    });
}));

app.post('/api/support/:conversationId/messages', authenticate, allowRoles('admin', 'librarian'), route(async (req, res) => {
    const id = positiveId(req.params.conversationId, 'conversation id');
    const body = requiredText(req.body.body, 'body', 2000);
    const [result] = await db.execute(
        `INSERT INTO support_messages (conversation_id, sender_type, sender_id, body)
         VALUES (?, 'admin', ?, ?)`,
        [id, req.user.id, body]
    );
    await db.execute('UPDATE support_conversations SET needs_human = 0 WHERE id = ?', [id]);
    res.status(201).json({ success: true, data: { id: result.insertId } });
}));

app.put('/api/support/:conversationId', authenticate, route(async (req, res) => {
    const id = positiveId(req.params.conversationId, 'conversation id');
    const needsHuman = booleanValue(req.body.needs_human, 'needs_human');
    const [conversations] = await db.execute('SELECT user_id FROM support_conversations WHERE id = ?', [id]);
    if (!conversations.length) throw new HttpError(404, 'Support conversation not found.');
    const staff = ['admin', 'librarian'].includes(req.user.role);
    if (!staff && String(conversations[0].user_id) !== req.user.id) {
        throw new HttpError(403, 'You cannot update another member’s conversation.');
    }
    if (!staff && !needsHuman) throw new HttpError(403, 'Only staff can clear the human-support flag.');
    await db.execute('UPDATE support_conversations SET needs_human = ? WHERE id = ?', [needsHuman, id]);
    res.json({ success: true, message: 'Support conversation updated.' });
}));

app.delete('/api/support/:conversationId', authenticate, allowRoles('admin', 'librarian'), route(async (req, res) => {
    const id = positiveId(req.params.conversationId, 'conversation id');
    const [result] = await db.execute('DELETE FROM support_conversations WHERE id = ?', [id]);
    if (!result.affectedRows) throw new HttpError(404, 'Support conversation not found.');
    res.json({ success: true, message: 'Support conversation deleted.' });
}));

app.post('/api/ai/chat', route(async (req, res) => {
    const message = requiredText(req.body.message, 'message', 500);
    const results = await tinyFishSearch(
        message,
        'Find useful web pages that answer the reader’s question. Prefer books, library resources, and reliable sources.'
    );
    res.json({ query: message, results });
}));

app.post('/api/ai/search', route(async (req, res) => {
    const query = requiredText(req.body.query || req.body.message, 'query', 500);
    const results = await tinyFishSearch(
        `Find books matching this plot, subject, or description: ${query}`,
        'Find books matching the reader’s natural-language description. Return book pages, publisher pages, or useful library catalog results.'
    );
    res.json({ success: true, data: results, query });
}));

app.post('/api/ai/recommendations', route(async (req, res) => {
    const preference = requiredText(req.body.preference, 'preference', 500);
    const favorites = Array.isArray(req.body.favorites)
        ? req.body.favorites.filter((item) => typeof item === 'string').slice(0, 5).map((item) => item.slice(0, 120))
        : [];
    const recentlyViewed = Array.isArray(req.body.recentlyViewed)
        ? req.body.recentlyViewed.filter((item) => typeof item === 'string').slice(0, 5).map((item) => item.slice(0, 120))
        : [];
    const parts = [`book recommendations for ${preference}`];
    if (favorites.length) parts.push(`similar to ${favorites.join(', ')}`);
    if (recentlyViewed.length) parts.push(`also consider books similar to ${recentlyViewed.join(', ')}`);
    const query = parts.join('; ').slice(0, 500);
    const recommendations = await tinyFishSearch(
        query,
        'Find book recommendations and reviews that match the reader’s interests.'
    );
    res.json({ query, recommendations });
}));

app.get('/api/admin/stats', authenticate, allowRoles('admin', 'librarian'), route(async (req, res) => {
    const [[books]] = await db.query(
        `SELECT COUNT(*) AS total_titles, COALESCE(SUM(copies_total), 0) AS total_copies,
                COALESCE(SUM(copies_available), 0) AS available_copies FROM books`
    );
    const [[users]] = await db.query(
        `SELECT COUNT(*) AS total_members,
                COALESCE(SUM(membership = 'premium'), 0) AS premium_members FROM users`
    );
    const [[loans]] = await db.query(
        `SELECT COALESCE(SUM(returned_on IS NULL), 0) AS active_borrows,
                COALESCE(SUM(returned_on IS NULL AND due_date < CURRENT_DATE), 0) AS overdue_borrows
         FROM borrows`
    );
    res.json({ success: true, data: { ...books, ...users, ...loans } });
}));

app.use('/api', (req, res) => {
    res.status(404).json({ success: false, message: 'API route not found.' });
});

app.use(express.static(path.resolve(__dirname, '../Frontend')));

app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error instanceof HttpError) {
        return res.status(error.status).json({ success: false, message: error.message });
    }
    if (error.type === 'entity.parse.failed') {
        return res.status(400).json({ success: false, message: 'Request body must contain valid JSON.' });
    }
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ success: false, message: 'A record with that value already exists.' });
    }
    if (error.code === 'ER_SIGNAL_EXCEPTION') {
        return res.status(409).json({ success: false, message: 'The operation violates a library rule.' });
    }
    if (['ER_NO_REFERENCED_ROW_2', 'ER_ROW_IS_REFERENCED_2'].includes(error.code)) {
        return res.status(409).json({ success: false, message: 'This record is linked to other library records.' });
    }
    console.error('Request failed:', error);
    res.status(500).json({ success: false, message: 'An unexpected server error occurred.' });
});

if (require.main === module) {
    const server = app.listen(PORT, () => {
        console.log(`Library API listening on http://localhost:${PORT}`);
    });
    const shutdown = () => {
        server.close(() => db.end().finally(() => process.exit(0)));
    };
    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
}

module.exports = app;
