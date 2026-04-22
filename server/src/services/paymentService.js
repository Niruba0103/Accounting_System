const pool = require('../config/db');
const {
  getFinancialYearByDate,
  getNextVoucherNumber
} = require('../utils/voucherNumberHelper');

/*
  Create payment or receipt linked to invoice
*/
const createPaymentOrReceipt = async ({
  payment_type,
  payment_method,
  invoice_id,
  amount,
  payment_date,
  reason,
  bank_name,
  bank_account_no,
  bank_branch,
  created_by
}) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    /*
      1. Validate invoice
    */
    const [invoiceRows] = await conn.query(
      'SELECT * FROM invoices WHERE id = ?',
      [invoice_id]
    );

    if (invoiceRows.length === 0) {
      throw new Error('Invoice not found');
    }

    const invoice = invoiceRows[0];
    const amountNumber = Number(amount || 0);

    if (amountNumber <= 0) {
      throw new Error('Amount must be greater than zero');
    }

    if (amountNumber > Number(invoice.balance_amount)) {
      throw new Error('Payment amount cannot exceed invoice balance');
    }

    /*
      2. Validate payment method
    */
    if (!['CASH', 'BANK'].includes(payment_method)) {
      throw new Error('Invalid payment method');
    }

    if (payment_method === 'BANK') {
      if (!bank_name || !bank_account_no || !bank_branch) {
        throw new Error('Bank name, bank account no and branch are required for BANK payment');
      }
    }

    /*
      3. Validate financial year
    */
    const financialYear = await getFinancialYearByDate(payment_date);
    if (!financialYear) {
      throw new Error('No financial year found for selected payment date');
    }

    /*
      4. Determine voucher type
    */
    const voucherType = payment_type === 'RECEIPT' ? 'RECEIPT' : 'PAYMENT';
    const nextVoucherNo = await getNextVoucherNumber(financialYear.id, voucherType, conn);

    /*
      5. Find cash/bank ledger
    */
    let cashBankLedger;
    if (payment_method === 'CASH') {
      const [rows] = await conn.query(
        "SELECT id FROM ledgers WHERE ledger_name = 'Cash in Hand' LIMIT 1"
      );
      if (rows.length === 0) {
        throw new Error('Cash in Hand ledger not found');
      }
      cashBankLedger = rows[0].id;
    } else {
      const [rows] = await conn.query(
        "SELECT id FROM ledgers WHERE ledger_name = 'Bank Account' LIMIT 1"
      );
      if (rows.length === 0) {
        throw new Error('Bank Account ledger not found');
      }
      cashBankLedger = rows[0].id;
    }

    /*
      6. Find party control ledger
    */
    let partyLedgerId;

    if (invoice.invoice_type === 'SALES') {
      const [rows] = await conn.query(
        "SELECT id FROM ledgers WHERE ledger_name = 'Debtors Control Account' LIMIT 1"
      );
      if (rows.length === 0) {
        throw new Error('Debtors Control Account ledger not found');
      }
      partyLedgerId = rows[0].id;
    } else {
      const [rows] = await conn.query(
        "SELECT id FROM ledgers WHERE ledger_name = 'Creditors Control Account' LIMIT 1"
      );
      if (rows.length === 0) {
        throw new Error('Creditors Control Account ledger not found');
      }
      partyLedgerId = rows[0].id;
    }

    /*
      7. Create voucher header
    */
    const [voucherResult] = await conn.query(
      `INSERT INTO vouchers
       (financial_year_id, voucher_type, voucher_no, voucher_date, sequence_no, reference_no, narration, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        financialYear.id,
        voucherType,
        nextVoucherNo,
        payment_date,
        nextVoucherNo,
        invoice.invoice_no,
        reason || `${payment_type} against invoice ${invoice.invoice_no}`,
        created_by || null
      ]
    );

    const voucherId = voucherResult.insertId;

    /*
      8. Create voucher lines
      SALES invoice receipt:
        Dr Cash/Bank
        Cr Debtors
      PURCHASE invoice payment:
        Dr Creditors
        Cr Cash/Bank
    */
    if (invoice.invoice_type === 'SALES' && payment_type === 'RECEIPT') {
      await conn.query(
        `INSERT INTO voucher_entries
         (voucher_id, ledger_id, debit, credit, line_description)
         VALUES (?, ?, ?, ?, ?)`,
        [voucherId, cashBankLedger, amountNumber, 0, 'Cash/Bank received']
      );

      await conn.query(
        `INSERT INTO voucher_entries
         (voucher_id, ledger_id, debit, credit, line_description)
         VALUES (?, ?, ?, ?, ?)`,
        [voucherId, partyLedgerId, 0, amountNumber, 'Customer balance reduced']
      );
    } else if (invoice.invoice_type === 'PURCHASE' && payment_type === 'PAYMENT') {
      await conn.query(
        `INSERT INTO voucher_entries
         (voucher_id, ledger_id, debit, credit, line_description)
         VALUES (?, ?, ?, ?, ?)`,
        [voucherId, partyLedgerId, amountNumber, 0, 'Supplier balance reduced']
      );

      await conn.query(
        `INSERT INTO voucher_entries
         (voucher_id, ledger_id, debit, credit, line_description)
         VALUES (?, ?, ?, ?, ?)`,
        [voucherId, cashBankLedger, 0, amountNumber, 'Cash/Bank paid']
      );
    } else {
      throw new Error('Invalid payment type for invoice type');
    }

    /*
      9. Store payment detail
    */
    await conn.query(
      `INSERT INTO payment_details
       (voucher_id, invoice_id, payment_type, payment_method, party_type, party_id,
        amount, payment_date, reason, bank_name, bank_account_no, bank_branch)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        voucherId,
        invoice.id,
        payment_type,
        payment_method,
        invoice.party_type,
        invoice.party_id,
        amountNumber,
        payment_date,
        reason || null,
        bank_name || null,
        bank_account_no || null,
        bank_branch || null
      ]
    );

    /*
      10. Update invoice balance
    */
    const newPaidAmount = Number(invoice.paid_amount) + amountNumber;
    const newBalanceAmount = Number(invoice.total_amount) - newPaidAmount;

    let newStatus = 'UNPAID';
    if (newBalanceAmount <= 0) {
      newStatus = 'PAID';
    } else if (newPaidAmount > 0) {
      newStatus = 'PARTIAL';
    }

    await conn.query(
      `UPDATE invoices
       SET paid_amount = ?, balance_amount = ?, status = ?
       WHERE id = ?`,
      [
        newPaidAmount,
        newBalanceAmount,
        newStatus,
        invoice.id
      ]
    );

    await conn.commit();

    return {
      voucher_id: voucherId,
      invoice_id: invoice.id,
      paid_amount: newPaidAmount,
      balance_amount: newBalanceAmount,
      status: newStatus
    };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

module.exports = {
  createPaymentOrReceipt
};