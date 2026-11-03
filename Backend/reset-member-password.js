require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const bcrypt = require('bcryptjs');
const db = require('./db');

async function main() {
    const email = process.argv[2]?.trim().toLowerCase();
    const newPassword = process.env.NEW_PASSWORD;

    if (!email || !newPassword) {
        throw new Error(
            'Usage: set NEW_PASSWORD in the environment, then run `node reset-member-password.js member@example.com`.'
        );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Provide a valid member email address.');
    }
    if (newPassword.length < 8 || !/^[A-Za-z0-9_@#?!-]+$/.test(newPassword)) {
        throw new Error('Password must be at least 8 characters and use only letters, numbers, _ @ - # ? !.');
    }

    const [users] = await db.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (!users.length) throw new Error('No member account was found with that email address.');

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.execute('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, users[0].id]);
    console.log(`Password reset successfully for ${email}.`);
}

main()
    .catch((error) => {
        console.error(`Password reset failed: ${error.message}`);
        process.exitCode = 1;
    })
    .finally(() => db.end());
