require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const bcrypt = require('bcryptjs');
const db = require('./db');

async function main() {
    const username = process.env.ADMIN_USERNAME?.trim();
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!username || !email || !password) {
        throw new Error('Set ADMIN_USERNAME, ADMIN_EMAIL, and ADMIN_PASSWORD in Backend/.env first.');
    }
    if (!/^[A-Za-z][A-Za-z0-9_]{2,39}$/.test(username)) {
        throw new Error('ADMIN_USERNAME must start with a letter and contain 3-40 letters, numbers, or underscores.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('ADMIN_EMAIL must be a valid email address.');
    }
    if (password.length < 12 || !/^[A-Za-z0-9_@#?!-]+$/.test(password)) {
        throw new Error('ADMIN_PASSWORD must be at least 12 characters and use only letters, numbers, _ @ - # ? !.');
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [admins] = await connection.execute(
            'SELECT id FROM users WHERE role = ? LIMIT 1 FOR UPDATE',
            ['admin']
        );
        if (admins.length) {
            throw new Error('An administrator already exists; refusing to create another.');
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const [result] = await connection.execute(
            'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [username, email, passwordHash, 'admin']
        );
        await connection.commit();
        console.log(`Administrator ${username} created with user ID ${result.insertId}.`);
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

main()
    .catch((error) => {
        console.error(`Admin setup failed: ${error.message}`);
        process.exitCode = 1;
    })
    .finally(() => db.end());
