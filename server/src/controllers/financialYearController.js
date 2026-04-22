const pool = require('../config/db');

const getAllFinancialYears = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM financial_years ORDER BY start_date DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Get financial years error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getActiveFinancialYear = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM financial_years WHERE is_active = 1 LIMIT 1'
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No active financial year found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Get active financial year error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createFinancialYear = async (req, res) => {
  try {
    const { year_name, start_date, end_date, is_active } = req.body;

    if (!year_name || !start_date || !end_date) {
      return res.status(400).json({ message: 'year_name, start_date and end_date are required' });
    }

    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      if (is_active === 1 || is_active === true) {
        await conn.query('UPDATE financial_years SET is_active = 0');
      }

      const [result] = await conn.query(
        `INSERT INTO financial_years (year_name, start_date, end_date, is_active)
         VALUES (?, ?, ?, ?)`,
        [year_name, start_date, end_date, is_active ? 1 : 0]
      );

      await conn.commit();

      const [rows] = await pool.query(
        'SELECT * FROM financial_years WHERE id = ?',
        [result.insertId]
      );

      res.status(201).json({
        message: 'Financial year created successfully',
        data: rows[0]
      });
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('Create financial year error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const setActiveFinancialYear = async (req, res) => {
  try {
    const { id } = req.params;

    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      await conn.query('UPDATE financial_years SET is_active = 0');
      await conn.query(
        'UPDATE financial_years SET is_active = 1 WHERE id = ?',
        [id]
      );

      await conn.commit();

      res.json({ message: 'Active financial year updated successfully' });
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('Set active financial year error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllFinancialYears,
  getActiveFinancialYear,
  createFinancialYear,
  setActiveFinancialYear
};