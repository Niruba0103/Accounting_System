const pool = require('../src/config/db');

async function analyzeSchema() {
  try {
    const [tables] = await pool.query('SHOW TABLES');
    const results = {};
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      const [schema] = await pool.query(`DESCRIBE ${tableName}`);
      results[tableName] = schema.map(s => s.Field);
    }
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

analyzeSchema();
