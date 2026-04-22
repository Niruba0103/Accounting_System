const pool = require('../config/db');

/**
 * companyMiddleware - Ensures the user is working within a valid company context.
 * Expects 'x-company-id' header from the client.
 * Injects req.companyId into the request object.
 */
const companyMiddleware = async (req, res, next) => {
  try {
    const companyId = req.headers['x-company-id'];

    if (!companyId) {
      return res.status(400).json({ message: 'Company context missing. Please select a company.' });
    }

    // Verify user has access to this company
    const [membership] = await pool.query(
      'SELECT role, status FROM user_companies WHERE user_id = ? AND company_id = ?',
      [req.user.id, companyId]
    );

    if (membership.length === 0) {
      return res.status(403).json({ message: 'Access denied. You are not a member of this company.' });
    }

    if (membership[0].status !== 'active') {
      return res.status(403).json({ message: 'Your membership for this company is not active.' });
    }

    // Attach company info to request
    req.companyId = Number(companyId);
    req.userCompanyRole = membership[0].role; // Role within this specific company

    next();
  } catch (error) {
    console.error('Company middleware error:', error);
    res.status(500).json({ message: 'Internal server error during company validation.' });
  }
};

module.exports = companyMiddleware;
