const pool = require('../config/db');

/*
  Find financial year for a given voucher date
*/
const getFinancialYearByDate = async (voucherDate) => {
  const [rows] = await pool.query(
    `SELECT * FROM financial_years
     WHERE ? BETWEEN start_date AND end_date
     LIMIT 1`,
    [voucherDate]
  );

  return rows.length ? rows[0] : null;
};

/*
  Generate next voucher number for a given financial year and voucher type
  Example:
  PAYMENT in FY 2025-2026
  existing max voucher_no = 5
  next = 6
*/
const getNextVoucherNumber = async (financialYearId, voucherType, conn = null) => {
  const db = conn || pool;

  const [rows] = await db.query(
    `SELECT MAX(voucher_no) AS maxVoucherNo
     FROM vouchers
     WHERE financial_year_id = ? AND voucher_type = ?`,
    [financialYearId, voucherType]
  );

  const maxNo = rows[0].maxVoucherNo || 0;
  return maxNo + 1;
};

module.exports = {
  getFinancialYearByDate,
  getNextVoucherNumber
};