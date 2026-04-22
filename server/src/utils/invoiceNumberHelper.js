const pool = require('../config/db');

/*
  Generate next invoice number by type
  SALES -> SINV-0001
  PURCHASE -> PINV-0001
*/
const getNextInvoiceNumber = async (invoiceType) => {
  const prefix = invoiceType === 'SALES' ? 'SINV' : 'PINV';

  const [rows] = await pool.query(
    `SELECT invoice_no
     FROM invoices
     WHERE invoice_type = ?
     ORDER BY id DESC
     LIMIT 1`,
    [invoiceType]
  );

  let nextNumber = 1;

  if (rows.length > 0 && rows[0].invoice_no) {
    const parts = rows[0].invoice_no.split('-');
    const lastNumber = parseInt(parts[1], 10);

    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
};

module.exports = {
  getNextInvoiceNumber
};