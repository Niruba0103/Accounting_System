const pool = require('../config/db');

/**
 * GET DASHBOARD SUMMARY
 */
const getDashboardSummary = async (req, res) => {
  try {
    const [customerRows] = await pool.query(
      'SELECT COUNT(*) AS totalCustomers FROM customers WHERE company_id = ?',
      [req.companyId]
    );

    const [supplierRows] = await pool.query(
      'SELECT COUNT(*) AS totalSuppliers FROM suppliers WHERE company_id = ?',
      [req.companyId]
    );

    const [salesRows] = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS totalSales
       FROM invoices
       WHERE invoice_type = 'SALES' AND company_id = ?`,
       [req.companyId]
    );

    const [purchaseRows] = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS totalPurchases
       FROM invoices
       WHERE invoice_type = 'PURCHASE' AND company_id = ?`,
       [req.companyId]
    );

    const [receivableRows] = await pool.query(
      `SELECT COALESCE(SUM(balance_amount), 0) AS totalReceivables
       FROM invoices
       WHERE invoice_type = 'SALES' AND company_id = ?`,
       [req.companyId]
    );

    const [payableRows] = await pool.query(
      `SELECT COALESCE(SUM(balance_amount), 0) AS totalPayables
       FROM invoices
       WHERE invoice_type = 'PURCHASE' AND company_id = ?`,
       [req.companyId]
    );

    res.json({
      totalCustomers: Number(customerRows[0].totalCustomers || 0),
      totalSuppliers: Number(supplierRows[0].totalSuppliers || 0),
      totalSales: Number(salesRows[0].totalSales || 0),
      totalPurchases: Number(purchaseRows[0].totalPurchases || 0),
      totalReceivables: Number(receivableRows[0].totalReceivables || 0),
      totalPayables: Number(payableRows[0].totalPayables || 0)
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDashboardSummary
};