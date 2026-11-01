const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const db = require('../db');

const router = express.Router();

router.post('/seed-admin', async (req, res) => {
	const expectedToken = process.env.ADMIN_SEED_TOKEN;
	const suppliedToken = req.get('x-admin-seed-token');

	if (!expectedToken || !suppliedToken) {
		return res.status(403).json({ success: false, message: 'Forbidden' });
	}

	const expected = Buffer.from(expectedToken);
	const supplied = Buffer.from(suppliedToken);
	if (expected.length !== supplied.length || !crypto.timingSafeEqual(expected, supplied)) {
		return res.status(403).json({ success: false, message: 'Forbidden' });
	}

	const username = process.env.ADMIN_USERNAME;
	const email = process.env.ADMIN_EMAIL;
	const password = process.env.ADMIN_PASSWORD;
	if (!username || !email || !password || password.length < 12) {
		return res.status(503).json({
			success: false,
			message: 'Admin seed configuration is missing or invalid.'
		});
	}

	try {
		const [admins] = await db.query(
			'SELECT id FROM users WHERE role = ? LIMIT 1',
			['admin']
		);

		if (admins.length > 0) {
			return res.status(409).json({
				success: false,
				message: 'An admin account already exists.'
			});
		}

		const passwordHash = await bcrypt.hash(password, 10);
		await db.query(
			'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
			[username, email, passwordHash, 'admin']
		);

		return res.status(201).json({
			success: true,
			message: 'Admin account created successfully.'
		});
	} catch (err) {
		return res.status(500).json({
			success: false,
			message: 'Unable to create admin account.'
		});
	}
});

module.exports = router;
