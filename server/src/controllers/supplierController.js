const pool = require('../config/db');

/*
  GET ALL SUPPLIERS
*/
const getAllSuppliers = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.*, l.ledger_name, l.ledger_code
      FROM suppliers s
      LEFT JOIN ledgers l ON s.ledger_id = l.id
      WHERE s.company_id = ?
      ORDER BY s.id DESC
    `, [req.companyId]);

    res.json(rows);
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/*
  GET SUPPLIER BY ID
*/
const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(`
      SELECT s.*, l.ledger_name, l.ledger_code
      FROM suppliers s
      LEFT JOIN ledgers l ON s.ledger_id = l.id
      WHERE s.id = ? AND s.company_id = ?
    `, [id, req.companyId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Get supplier by id error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/*
  CREATE SUPPLIER
*/
const createSupplier = async (req, res) => {
  try {
    const { supplier_code, name, phone, email, address, ledger_id } = req.body;

    if(!supplier_code||!name||!phone||!email||!address||!ledger_id){
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (supplier_code) {
      const [existingCode] = await pool.query(
        'SELECT id FROM suppliers WHERE supplier_code = ? AND company_id = ?',
        [supplier_code, req.companyId]
      );

      if (existingCode.length > 0) {
        return res.status(400).json({ message: 'Supplier code already exists in this company' });
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

    const [result] = await pool.query(
      `INSERT INTO suppliers (company_id, supplier_code, name, phone, email, address, ledger_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.companyId,
        supplier_code,
        name,
        phone,
        email,
        address,
        ledger_id
      ]
    );

    const [rows] = await pool.query(
      'SELECT * FROM suppliers WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Supplier created successfully',
      data: rows[0]
    });
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/*
  UPDATE SUPPLIER
*/
const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { supplier_code, name, phone, email, address, ledger_id } = req.body;

    const [existingRows] = await pool.query(
      'SELECT * FROM suppliers WHERE id = ? AND company_id = ?',
      [id, req.companyId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    const existing = existingRows[0];

    if (supplier_code && supplier_code !== existing.supplier_code) {
      const [duplicate] = await pool.query(
        'SELECT id FROM suppliers WHERE supplier_code = ? AND id != ? AND company_id = ?',
        [supplier_code, id, req.companyId]
      );

      if (duplicate.length > 0) {
        return res.status(400).json({ message: 'Supplier code already exists in this company' });
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
      `UPDATE suppliers
       SET supplier_code = ?, name = ?, phone = ?, email = ?, address = ?, ledger_id = ?
       WHERE id = ? AND company_id = ?`,
      [
        supplier_code !== undefined ? supplier_code : existing.supplier_code,
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
      'SELECT * FROM suppliers WHERE id = ?',
      [id]
    );

    res.json({
      message: 'Supplier updated successfully',
      data: rows[0]
    });
  } catch (error) {
    console.error('Update supplier error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/*
  DELETE SUPPLIER
*/
const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if supplier exists
    const [supplier] = await pool.query('SELECT * FROM suppliers WHERE id = ? AND company_id = ?', [id, req.companyId]);
    if (supplier.length === 0) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    // Check for associated invoices (Foreign Key check)
    // NOTE: In the invoices table, suppliers are also party_id? 
    // Usually invoices have a party_type 'CUSTOMER' or 'SUPPLIER'.
    const [invoices] = await pool.query("SELECT id FROM invoices WHERE party_id = ? AND party_type = 'SUPPLIER' AND company_id = ?", [id, req.companyId]);
    if (invoices.length > 0) {
      return res.status(400).json({ message: 'Cannot delete supplier: Existing invoices are linked to this supplier.' });
    }

    await pool.query('DELETE FROM suppliers WHERE id = ? AND company_id = ?', [id, req.companyId]);

    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ message: 'Cannot delete supplier: It is being referenced by other records.' });
    }
    console.error('Delete supplier error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
};