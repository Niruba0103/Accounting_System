const pool = require('../config/db');

const getAllLedgers = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        l.*,
        ag.group_name,
        ag.category,
        ag.nature
      FROM ledgers l
      JOIN account_groups ag ON l.group_id = ag.id
      WHERE l.company_id = ?
      ORDER BY l.ledger_code ASC
    `, [req.companyId]);

    res.json(rows);
  } catch (error) {
    console.error('Get ledgers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getLedgerById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(`
      SELECT 
        l.*,
        ag.group_name,
        ag.category,
        ag.nature
      FROM ledgers l
      JOIN account_groups ag ON l.group_id = ag.id
      WHERE l.id = ? AND l.company_id = ?
    `, [id, req.companyId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Ledger not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Get ledger by id error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createLedger = async (req, res) => {
  try {
    const {
      ledger_code,
      ledger_name,
      group_id,
      opening_balance,
      opening_balance_type,
      status
    } = req.body;

    if (!ledger_code || !ledger_name || !group_id) {
      return res.status(400).json({ message: 'ledger_code, ledger_name and group_id are required' });
    }

    const [existing] = await pool.query(
      'SELECT id FROM ledgers WHERE ledger_code = ? AND company_id = ?',
      [ledger_code, req.companyId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Ledger code already exists in this company' });
    }

    // Verify group belongs to company
    const [group] = await pool.query(
      'SELECT id FROM account_groups WHERE id = ? AND company_id = ?',
      [group_id, req.companyId]
    );

    if (group.length === 0) {
      return res.status(400).json({ message: 'Invalid group_id for this company' });
    }

    const [result] = await pool.query(
      `INSERT INTO ledgers
       (company_id, ledger_code, ledger_name, group_id, opening_balance, opening_balance_type, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.companyId,
        ledger_code,
        ledger_name,
        group_id,
        opening_balance || 0,
        opening_balance_type || 'DR',
        status || 'ACTIVE'
      ]
    );

    const [rows] = await pool.query(
      'SELECT * FROM ledgers WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Ledger created successfully',
      data: rows[0]
    });
  } catch (error) {
    console.error('Create ledger error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateLedger = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      ledger_code,
      ledger_name,
      group_id,
      opening_balance,
      opening_balance_type,
      status
    } = req.body;

    const [existingRows] = await pool.query(
      'SELECT * FROM ledgers WHERE id = ? AND company_id = ?',
      [id, req.companyId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ message: 'Ledger not found' });
    }

    const existing = existingRows[0];

    if (ledger_code && ledger_code !== existing.ledger_code) {
      const [duplicate] = await pool.query(
        'SELECT id FROM ledgers WHERE ledger_code = ? AND id != ? AND company_id = ?',
        [ledger_code, id, req.companyId]
      );

      if (duplicate.length > 0) {
        return res.status(400).json({ message: 'Ledger code already exists in this company' });
      }
    }

    if (group_id) {
      const [group] = await pool.query(
        'SELECT id FROM account_groups WHERE id = ? AND company_id = ?',
        [group_id, req.companyId]
      );

      if (group.length === 0) {
        return res.status(400).json({ message: 'Invalid group_id for this company' });
      }
    }

    await pool.query(
      `UPDATE ledgers
       SET ledger_code = ?, ledger_name = ?, group_id = ?, opening_balance = ?,
           opening_balance_type = ?, status = ?
       WHERE id = ? AND company_id = ?`,
      [
        ledger_code || existing.ledger_code,
        ledger_name || existing.ledger_name,
        group_id || existing.group_id,
        opening_balance !== undefined ? opening_balance : existing.opening_balance,
        opening_balance_type || existing.opening_balance_type,
        status || existing.status,
        id,
        req.companyId
      ]
    );

    const [rows] = await pool.query(
      'SELECT * FROM ledgers WHERE id = ?',
      [id]
    );

    res.json({
      message: 'Ledger updated successfully',
      data: rows[0]
    });
  } catch (error) {
    console.error('Update ledger error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteLedger = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if ledger exists and belongs to company
    const [ledger] = await pool.query('SELECT * FROM ledgers WHERE id = ? AND company_id = ?', [id, req.companyId]);
    if (ledger.length === 0) {
      return res.status(404).json({ message: 'Ledger not found' });
    }

    // Check if used in voucher_entries
    const [vouchers] = await pool.query('SELECT id FROM voucher_entries WHERE ledger_id = ?', [id]);
    if (vouchers.length > 0) {
      return res.status(400).json({ message: 'Cannot delete ledger: It has existing transactions in vouchers.' });
    }

    // Check if linked to customers
    const [cust] = await pool.query('SELECT id FROM customers WHERE ledger_id = ?', [id]);
    if (cust.length > 0) {
      return res.status(400).json({ message: 'Cannot delete ledger: It is linked to one or more Customers.' });
    }

    // Check if linked to suppliers
    const [supp] = await pool.query('SELECT id FROM suppliers WHERE ledger_id = ?', [id]);
    if (supp.length > 0) {
      return res.status(400).json({ message: 'Cannot delete ledger: It is linked to one or more Suppliers.' });
    }

    await pool.query('DELETE FROM ledgers WHERE id = ? AND company_id = ?', [id, req.companyId]);

    res.json({ message: 'Ledger deleted successfully' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ message: 'Cannot delete ledger: It is being referenced by other records.' });
    }
    console.error('Delete ledger error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllLedgers,
  getLedgerById,
  createLedger,
  updateLedger,
  deleteLedger
};