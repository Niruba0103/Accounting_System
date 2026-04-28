const pool = require('../config/db');
const { getStockOnHandData } = require('../services/stockService');

/*
  Create stock item
*/
const createStockItem = async (req, res) => {
  try {
    const { item_code, item_name, unit, opening_qty, opening_rate } = req.body;

    if (!item_name) {
      return res.status(400).json({ message: 'item_name is required' });
    }

    if (item_code) {
      const [existing] = await pool.query(
        'SELECT id FROM stock_items WHERE item_code = ? AND company_id = ?',
        [item_code, req.companyId]
      );

      if (existing.length > 0) {
        return res.status(400).json({ message: 'item_code already exists in this company' });
      }
    }

    const [result] = await pool.query(
      `INSERT INTO stock_items (company_id, item_code, item_name, unit, opening_qty, opening_rate)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.companyId,
        item_code || null,
        item_name,
        unit || null,
        opening_qty || 0,
        opening_rate || 0
      ]
    );

    const [rows] = await pool.query(
      'SELECT * FROM stock_items WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Stock item created successfully',
      data: rows[0]
    });
  } catch (error) {
    console.error('Create stock item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/*
  Create stock movement
*/
const createStockMovement = async (req, res) => {
  try {
    const {
      item_id,
      movement_date,
      movement_type,
      qty,
      rate,
      reference_type,
      reference_id,
      remarks
    } = req.body;

    if (!item_id || !movement_date || !movement_type || qty === undefined) {
      return res.status(400).json({
        message: 'item_id, movement_date, movement_type and qty are required'
      });
    }

    const [itemRows] = await pool.query(
      'SELECT id FROM stock_items WHERE id = ? AND company_id = ?',
      [item_id, req.companyId]
    );

    if (itemRows.length === 0) {
      return res.status(400).json({ message: 'Invalid item_id for this company' });
    }

    if (!['IN', 'OUT', 'ADJUSTMENT'].includes(movement_type)) {
      return res.status(400).json({ message: 'Invalid movement_type' });
    }

    await pool.query(
      `INSERT INTO stock_movements
       (company_id, item_id, movement_date, movement_type, qty, rate, reference_type, reference_id, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.companyId,
        item_id,
        movement_date,
        movement_type,
        qty,
        rate || 0,
        reference_type || null,
        reference_id || null,
        remarks || null
      ]
    );

    res.status(201).json({
      message: 'Stock movement created successfully'
    });
  } catch (error) {
    console.error('Create stock movement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/*
  Stock on hand report
*/
const getStockOnHand = async (req, res) => {
  try {
    const { to_date } = req.query;

    if (!to_date) {
      return res.status(400).json({ message: 'to_date is required' });
    }

    const rows = await getStockOnHandData(to_date, req.companyId);

    res.json({
      to_date,
      rows,
      totalStockValue: rows.reduce((sum, row) => sum + row.value, 0)
    });
  } catch (error) {
    console.error('Stock on hand error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createStockItem,
  createStockMovement,
  getStockOnHand
};