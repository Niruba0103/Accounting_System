const pool = require('../config/db');

const getAllAccountGroups = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ag.*, parent.group_name AS parent_group_name
      FROM account_groups ag
      LEFT JOIN account_groups parent ON ag.parent_group_id = parent.id
      ORDER BY ag.id ASC
    `);

    res.json(rows);
  } catch (error) {
    console.error('Get account groups error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createAccountGroup = async (req, res) => {
  try {
    const { group_name, parent_group_id, category, nature } = req.body;

    if (!group_name || !category) {
      return res.status(400).json({ message: 'group_name and category are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO account_groups (group_name, parent_group_id, category, nature)
       VALUES (?, ?, ?, ?)`,
      [group_name, parent_group_id || null, category, nature || 'OTHER']
    );

    const [rows] = await pool.query(
      'SELECT * FROM account_groups WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Account group created successfully',
      data: rows[0]
    });
  } catch (error) {
    console.error('Create account group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateAccountGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { group_name, parent_group_id, category, nature } = req.body;

    const [existing] = await pool.query(
      'SELECT * FROM account_groups WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Account group not found' });
    }

    await pool.query(
      `UPDATE account_groups
       SET group_name = ?, parent_group_id = ?, category = ?, nature = ?
       WHERE id = ?`,
      [
        group_name || existing[0].group_name,
        parent_group_id !== undefined ? parent_group_id : existing[0].parent_group_id,
        category || existing[0].category,
        nature || existing[0].nature,
        id
      ]
    );

    const [rows] = await pool.query(
      'SELECT * FROM account_groups WHERE id = ?',
      [id]
    );

    res.json({
      message: 'Account group updated successfully',
      data: rows[0]
    });
  } catch (error) {
    console.error('Update account group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllAccountGroups,
  createAccountGroup,
  updateAccountGroup
};