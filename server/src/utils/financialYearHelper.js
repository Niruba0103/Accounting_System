const pool = require('../config/db');

/*
  Finds which financial year a given date belongs to
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

module.exports = {
  getFinancialYearByDate
};