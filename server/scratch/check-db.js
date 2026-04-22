const pool = require('../src/config/db');
require('dotenv').config({ path: '../.env' }); // Make sure env is loaded relative to this script

(async () => {
    try {
        console.log('Using DB_HOST:', process.env.DB_HOST);
        const [rows] = await pool.query('SHOW TABLES');
        console.log('Tables found:', rows);
        process.exit(0);
    } catch (err) {
        console.error('DB Connection/Query Error:', err);
        process.exit(1);
    }
})();
