const pool = require('../config/db');

const createCompany = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { name, tax_id, address, email, phone } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Company name is required' });
    }

    await connection.beginTransaction();

    // 1. Create company
    const [compResult] = await connection.query(
      `INSERT INTO companies (name, tax_id, address, email, phone)
       VALUES (?, ?, ?, ?, ?)`,
      [name, tax_id, address, email, phone]
    );

    const companyId = compResult.insertId;

    // 2. Associate user as Admin
    await connection.query(
      `INSERT INTO user_companies (user_id, company_id, role, status)
       VALUES (?, ?, 'admin', 'active')`,
      [req.user.id, companyId]
    );

    await connection.commit();

    res.status(201).json({
      message: 'Company created successfully',
      company: { id: companyId, name }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create company error:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
};

module.exports = {
  createCompany
};
