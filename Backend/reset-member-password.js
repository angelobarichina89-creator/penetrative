const bcrypt = require('bcrypt');
const db = require('./db'); // Assumes db.js exports your database connection

async function resetPassword(memberEmail, newPassword) {
    if (!memberEmail || !newPassword) {
        console.log('❌ Please provide both email and new password.');
        console.log('Usage: node reset-member-password.js <email> <new_password>');
        process.exit(1);
    }

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Adjust the query table/column names based on your database schema
        const query = 'UPDATE members SET password = ? WHERE email = ?';

        db.query(query, [hashedPassword, memberEmail], (err, result) => {
            if (err) {
                console.error('❌ Error resetting password:', err.message);
                process.exit(1);
            }
            
            if (result.affectedRows === 0) {
                console.log(`⚠️ No member found with email: ${memberEmail}`);
            } else {
                console.log(`✅ Password successfully reset for member: ${memberEmail}`);
            }
            process.exit(0);
        });
    } catch (error) {
        console.error('❌ Password hashing failed:', error);
        process.exit(1);
    }
}

// Run from terminal: node reset-member-password.js user@example.com newPassword123
const args = process.argv.slice(2);
resetPassword(args[0], args[1]);