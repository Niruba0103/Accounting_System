const bcrypt = require('bcryptjs');
const pool = require('../config/db');

/*
  GET ALL USERS
*/
/*
  GET ALL USERS (Filtered by Company)
*/
const getAllUsers = async (req, res) => {
  try {
    const { companyId } = req;

    const [rows] = await pool.query(`
      SELECT u.id, u.name, u.email, uc.role, uc.status, u.created_at
      FROM users u
      JOIN user_companies uc ON u.id = uc.user_id
      WHERE uc.company_id = ?
      ORDER BY u.id ASC
    `, [companyId]);

    res.json(rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/*
  CREATE USER (And Associate with Company)
*/
const createUser = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { name, email, password, role } = req.body;
    const { companyId } = req;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: 'Name, email, password and role are required'
      });
    }

    await connection.beginTransaction();

    // 1. Check if user exists globally
    const [existingRows] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    let userId;
    if (existingRows.length > 0) {
      userId = existingRows[0].id;
      
      // Check if already in this company
      const [membership] = await connection.query(
        'SELECT * FROM user_companies WHERE user_id = ? AND company_id = ?',
        [userId, companyId]
      );
      
      if (membership.length > 0) {
        await connection.rollback();
        return res.status(400).json({ message: 'User is already a member of this company' });
      }
    } else {
      // Create new global user
      const hashedPassword = await bcrypt.hash(password, 10);
      const [result] = await connection.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES (?, ?, ?, ?)`,
        [name, email, hashedPassword, role] // Storing role globally too for fallback
      );
      userId = result.insertId;
    }

    // 2. Associate with current company
    await connection.query(
      `INSERT INTO user_companies (user_id, company_id, role, status)
       VALUES (?, ?, ?, 'active')`,
      [userId, companyId, role]
    );

    await connection.commit();

    res.status(201).json({
      message: 'User added to company successfully',
      id: userId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
};

/*
  UPDATE USER ROLE (In Company Context)
*/
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const { companyId } = req;

    if (!role) {
      return res.status(400).json({ message: 'Role is required' });
    }

    await pool.query(
      'UPDATE user_companies SET role = ? WHERE user_id = ? AND company_id = ?',
      [role, id, companyId]
    );

    res.json({ message: 'User role updated for this company' });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/*
  DELETE USER (Remove from Company)
*/
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId } = req;

    // We don't delete from "users" table because they might belong to other companies
    // We just remove the association
    await pool.query(
      'DELETE FROM user_companies WHERE user_id = ? AND company_id = ?',
      [id, companyId]
    );

    res.json({ message: 'User removed from company' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUserRole,
  deleteUser
};