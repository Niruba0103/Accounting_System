const pool = require('../src/config/db');

async function runMigration() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    console.log('--- Creating companies table ---');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        tax_id VARCHAR(50),
        address TEXT,
        email VARCHAR(100),
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Ensure we have at least one company to migrate data to
    let companyId;
    const [existingCompanies] = await connection.query('SELECT id FROM companies LIMIT 1');
    if (existingCompanies.length === 0) {
      const [result] = await connection.query('INSERT INTO companies (name) VALUES ("PrimeSupply Default")');
      companyId = result.insertId;
      console.log(`Created default company with ID: ${companyId}`);
    } else {
      companyId = existingCompanies[0].id;
      console.log(`Using existing company ID: ${companyId}`);
    }

    console.log('--- Creating user_companies table ---');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_companies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        company_id INT NOT NULL,
        role ENUM('admin', 'accountant', 'viewer') DEFAULT 'viewer',
        status ENUM('active', 'invited', 'suspended') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY user_company_unique (user_id, company_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
      )
    `);

    // Assign all existing users to the default company
    const [users] = await connection.query('SELECT id, role FROM users');
    for (const user of users) {
      await connection.query('INSERT IGNORE INTO user_companies (user_id, company_id, role) VALUES (?, ?, ?)', [user.id, companyId, user.role]);
    }

    // List of tables that need company_id
    const tablesToMigrate = [
      'account_groups',
      'customers',
      'financial_years',
      'invoices',
      'ledgers',
      'payment_details',
      'stock_items',
      'suppliers',
      'vouchers'
    ];

    for (const tableName of tablesToMigrate) {
      console.log(`--- Migrating ${tableName} ---`);
      
      const [columns] = await connection.query(`SHOW COLUMNS FROM ${tableName} LIKE 'company_id'`);
      if (columns.length === 0) {
        await connection.query(`ALTER TABLE ${tableName} ADD COLUMN company_id INT AFTER id`);
        // Update existing rows to the default company BEFORE adding the constraint
        await connection.query(`UPDATE ${tableName} SET company_id = ?`, [companyId]);
        // Make it NOT NULL for future safety
        await connection.query(`ALTER TABLE ${tableName} MODIFY COLUMN company_id INT NOT NULL`);
        await connection.query(`ALTER TABLE ${tableName} ADD CONSTRAINT fk_${tableName}_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE`);
        console.log(`Migrated ${tableName} with company_id ${companyId}`);
      } else {
        console.log(`company_id already exists in ${tableName}`);
      }
    }

    await connection.commit();
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    await connection.rollback();
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    connection.release();
  }
}

runMigration();
