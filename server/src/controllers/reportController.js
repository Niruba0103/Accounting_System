const pool = require('../config/db');

/*
  DEBTORS REPORT
  Shows sales invoices with outstanding balances
*/
const getDebtorsReport = async (req, res) => {
  try {
    const { from_date, to_date } = req.query;

    const [rows] = await pool.query(`
      SELECT
        i.id,
        i.invoice_no,
        i.invoice_date,
        i.total_amount,
        i.paid_amount,
        i.balance_amount,
        i.status,
        c.customer_code,
        c.name AS customer_name
      FROM invoices i
      JOIN customers c ON i.party_id = c.id
      WHERE i.invoice_type = 'SALES'
        AND i.party_type = 'CUSTOMER'
        AND i.invoice_date BETWEEN ? AND ?
      ORDER BY i.invoice_date ASC, i.invoice_no ASC
    `, [from_date, to_date]);

    res.json(rows);
  } catch (error) {
    console.error('Debtors report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/*
  CREDITORS REPORT
  Shows purchase invoices with outstanding balances
*/
const getCreditorsReport = async (req, res) => {
  try {
    const { from_date, to_date } = req.query;

    const [rows] = await pool.query(`
      SELECT
        i.id,
        i.invoice_no,
        i.invoice_date,
        i.total_amount,
        i.paid_amount,
        i.balance_amount,
        i.status,
        s.supplier_code,
        s.name AS supplier_name
      FROM invoices i
      JOIN suppliers s ON i.party_id = s.id
      WHERE i.invoice_type = 'PURCHASE'
        AND i.party_type = 'SUPPLIER'
        AND i.invoice_date BETWEEN ? AND ?
      ORDER BY i.invoice_date ASC, i.invoice_no ASC
    `, [from_date, to_date]);

    res.json(rows);
  } catch (error) {
    console.error('Creditors report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/*
  PAYMENT DETAIL REPORT
*/
const getPaymentDetailReport = async (req, res) => {
  try {
    const { from_date, to_date } = req.query;

    const [rows] = await pool.query(`
      SELECT
        pd.payment_date,
        v.voucher_no,
        v.reference_no,
        pd.amount,
        pd.reason,
        pd.payment_method,
        pd.bank_name,
        pd.bank_account_no,
        pd.bank_branch,
        i.invoice_no,
        s.name AS supplier_name
      FROM payment_details pd
      JOIN vouchers v ON pd.voucher_id = v.id
      LEFT JOIN invoices i ON pd.invoice_id = i.id
      LEFT JOIN suppliers s
        ON pd.party_type = 'SUPPLIER' AND pd.party_id = s.id
      WHERE pd.payment_type = 'PAYMENT'
        AND pd.payment_date BETWEEN ? AND ?
      ORDER BY pd.payment_date ASC, v.voucher_no ASC
    `, [from_date, to_date]);

    res.json(rows);
  } catch (error) {
    console.error('Payment detail report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/*
  RECEIPT DETAIL REPORT
*/
const getReceiptDetailReport = async (req, res) => {
  try {
    const { from_date, to_date } = req.query;

    const [rows] = await pool.query(`
      SELECT
        pd.payment_date,
        v.voucher_no,
        v.reference_no,
        pd.amount,
        pd.reason,
        pd.payment_method,
        pd.bank_name,
        pd.bank_account_no,
        pd.bank_branch,
        i.invoice_no,
        c.name AS customer_name
      FROM payment_details pd
      JOIN vouchers v ON pd.voucher_id = v.id
      LEFT JOIN invoices i ON pd.invoice_id = i.id
      LEFT JOIN customers c
        ON pd.party_type = 'CUSTOMER' AND pd.party_id = c.id
      WHERE pd.payment_type = 'RECEIPT'
        AND pd.payment_date BETWEEN ? AND ?
      ORDER BY pd.payment_date ASC, v.voucher_no ASC
    `, [from_date, to_date]);

    res.json(rows);
  } catch (error) {
    console.error('Receipt detail report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDebtorsReport,
  getCreditorsReport,
  getPaymentDetailReport,
  getReceiptDetailReport
};