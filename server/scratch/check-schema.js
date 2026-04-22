const pool = require('../src/config/db');
require('dotenv').config({ path: '../.env' });

(async () => {
    try {
        const [rows] = await pool.query('DESCRIBE users');
        console.log('Users table schema:', rows);
        process.exit(0);
    } catch (err) {
        console.error('Schema Error:', err);
        process.exit(1);
    }
})();
