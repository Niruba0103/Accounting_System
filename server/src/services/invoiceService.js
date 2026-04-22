const pool = require('../config/db');
const {
  getFinancialYearByDate,
  getNextVoucherNumber
} = require('../utils/voucherNumberHelper');

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

/**
 * Create Invoice with its items and a corresponding double-entry voucher
 */
const createInvoiceWithVoucher = async ({
  invoice_type,
  party_type,
  party_id,
  invoice_date,
  due_date,
  items,
  tax_amount = 0,
  discount_amount = 0,
  remarks = '',
  created_by
}) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Get next invoice number
    const invoice_no = await getNextInvoiceNumber(invoice_type);

    // 2. Validate items
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Invoice must have at least one item');
    }

    // 3. Calculate totals
    let subtotal = 0;
    for (const item of items) {
      subtotal += Number(item.qty || 1) * Number(item.unit_price || 0);
    }
    const total_amount = subtotal + Number(tax_amount) - Number(discount_amount);

    // 4. Insert Invoice
    const [invoiceResult] = await conn.query(
      `INSERT INTO invoices 
       (invoice_no, invoice_type, party_type, party_id, invoice_date, due_date, 
        subtotal, tax_amount, discount_amount, total_amount, paid_amount, 
        balance_amount, status, remarks, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 'UNPAID', ?, ?)`,
      [
        invoice_no,
        invoice_type,
        party_type,
        party_id,
        invoice_date,
        due_date || invoice_date,
        subtotal,
        tax_amount,
        discount_amount,
        total_amount,
        total_amount,
        remarks,
        created_by
      ]
    );

    const invoiceId = invoiceResult.insertId;

    // 5. Insert Invoice Items
    for (const item of items) {
      const itemAmount = Number(item.qty || 1) * Number(item.unit_price || 0);
      await conn.query(
        `INSERT INTO invoice_items (invoice_id, item_name, qty, unit_price, amount)
         VALUES (?, ?, ?, ?, ?)`,
        [invoiceId, item.item_name, item.qty || 1, item.unit_price || 0, itemAmount]
      );
    }

    // 6. Generate Voucher
    const financialYear = await getFinancialYearByDate(invoice_date);
    if (!financialYear) {
      throw new Error('No financial year found for the selected date');
    }

    const nextVoucherNo = await getNextVoucherNumber(financialYear.id, invoice_type, conn);

    const [voucherResult] = await conn.query(
      `INSERT INTO vouchers 
       (financial_year_id, voucher_type, voucher_no, voucher_date, sequence_no, reference_no, narration, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        financialYear.id,
        invoice_type,
        nextVoucherNo,
        invoice_date,
        nextVoucherNo,
        invoice_no,
        remarks || `${invoice_type} Invoice ${invoice_no}`,
        created_by
      ]
    );

    const voucherId = voucherResult.insertId;

    // 7. Update Invoice with voucher_id
    await conn.query('UPDATE invoices SET voucher_id = ? WHERE id = ?', [voucherId, invoiceId]);

    // 8. Create Voucher Entries (Double Entry)
    let drLedger, crLedger;
    if (invoice_type === 'SALES') {
      drLedger = 4; // Debtors Control Account
      crLedger = 7; // Sales Account
    } else {
      drLedger = 3; // Stock on Hand (or Purchase Account if we had one)
      crLedger = 5; // Creditors Control Account
    }

    // Debit entry
    await conn.query(
      `INSERT INTO voucher_entries (voucher_id, ledger_id, debit, credit, line_description)
       VALUES (?, ?, ?, ?, ?)`,
      [voucherId, drLedger, total_amount, 0, `Invoice ${invoice_no}`]
    );

    // Credit entry
    await conn.query(
      `INSERT INTO voucher_entries (voucher_id, ledger_id, debit, credit, line_description)
       VALUES (?, ?, ?, ?, ?)`,
      [voucherId, crLedger, 0, total_amount, `Invoice ${invoice_no}`]
    );

    await conn.commit();

    return {
      invoiceId,
      invoice_no,
      total_amount,
      voucherId
    };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

module.exports = {
  getNextInvoiceNumber,
  createInvoiceWithVoucher
};