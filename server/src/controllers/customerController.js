const pool = require('../config/db');

/**
 * GET ALL CUSTOMERS
 */
const getAllCustomers = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.*, l.ledger_name, l.ledger_code
      FROM customers c
      LEFT JOIN ledgers l ON c.ledger_id = l.id
      WHERE c.company_id = ?
      ORDER BY c.id DESC
    `, [req.companyId]);

    res.json(rows);
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET CUSTOMER BY ID
 */
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(`
      SELECT c.*, l.ledger_name, l.ledger_code
      FROM customers c
      LEFT JOIN ledgers l ON c.ledger_id = l.id
      WHERE c.id = ? AND c.company_id = ?
    `, [id, req.companyId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Get customer by id error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * CREATE CUSTOMER
 */
const createCustomer = async (req, res) => {
  try {
    const { customer_code, name, phone, email, address, ledger_id } = req.body;
    
    if (!customer_code || !name || !phone || !email || !address || !ledger_id) {
        return res.status(400).json({ message: 'All customer fields are required' });
    }

    // Check for duplicate code in same company
    const [existingCode] = await pool.query(
    'SELECT id FROM customers WHERE customer_code = ? AND company_id = ?',
    [customer_code, req.companyId]
    );

    if (existingCode.length > 0) {
    return res.status(400).json({ message: 'Customer code already exists in this company' });
    }

    // Verify ledger belongs to company
    const [ledger] = await pool.query(
    'SELECT id FROM ledgers WHERE id = ? AND company_id = ?',
    [ledger_id, req.companyId]
    );

    if (ledger.length === 0) {
    return res.status(400).json({ message: 'Invalid ledger_id for this company' });
    }

    const [result] = await pool.query(
      `INSERT INTO customers (company_id, customer_code, name, phone, email, address, ledger_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.companyId,
        customer_code,
        name,
        phone,
        email,
        address,
        ledger_id
      ]
    );

    const [rows] = await pool.query(
      'SELECT * FROM customers WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Customer created successfully',
      data: rows[0]
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * UPDATE CUSTOMER
 */
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { customer_code, name, phone, email, address, ledger_id } = req.body;

    const [existingRows] = await pool.query(
      'SELECT * FROM customers WHERE id = ? AND company_id = ?',
      [id, req.companyId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const existing = existingRows[0];

    if (customer_code && customer_code !== existing.customer_code) {
      const [duplicate] = await pool.query(
        'SELECT id FROM customers WHERE customer_code = ? AND id != ? AND company_id = ?',
        [customer_code, id, req.companyId]
      );

      if (duplicate.length > 0) {
        return res.status(400).json({ message: 'Customer code already exists in this company' });
      }
    }

    if (ledger_id) {
      const [ledger] = await pool.query(
        'SELECT id FROM ledgers WHERE id = ? AND company_id = ?',
        [ledger_id, req.companyId]
      );

      if (ledger.length === 0) {
        return res.status(400).json({ message: 'Invalid ledger_id for this company' });
      }
    }

    await pool.query(
      `UPDATE customers
       SET customer_code = ?, name = ?, phone = ?, email = ?, address = ?, ledger_id = ?
       WHERE id = ? AND company_id = ?`,
      [
        customer_code !== undefined ? customer_code : existing.customer_code,
        name !== undefined ? name : existing.name,
        phone !== undefined ? phone : existing.phone,
        email !== undefined ? email : existing.email,
        address !== undefined ? address : existing.address,
        ledger_id !== undefined ? ledger_id : existing.ledger_id,
        id,
        req.companyId
      ]
    );

    const [rows] = await pool.query(
      'SELECT * FROM customers WHERE id = ?',
      [id]
    );

    res.json({
      message: 'Customer updated successfully',
      data: rows[0]
    });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * DELETE CUSTOMER
 */
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if customer exists and belongs to company
    const [customer] = await pool.query('SELECT * FROM customers WHERE id = ? AND company_id = ?', [id, req.companyId]);
    if (customer.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Check for associated invoices (Foreign Key check)
    const [invoices] = await pool.query('SELECT id FROM invoices WHERE party_id = ? AND company_id = ?', [id, req.companyId]);
    if (invoices.length > 0) {
      return res.status(400).json({ message: 'Cannot delete customer: Existing invoices are linked to this customer.' });
    }

    await pool.query('DELETE FROM customers WHERE id = ? AND company_id = ?', [id, req.companyId]);

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ message: 'Cannot delete customer: It is being referenced by other records.' });
    }
    console.error('Delete customer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
};