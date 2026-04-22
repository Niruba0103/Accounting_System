const pool = require('../config/db');
const {
  getFinancialYearByDate,
  getNextVoucherNumber
} = require('../utils/voucherNumberHelper');

/*
  Create voucher with voucher lines
  Used for Journal, Payment, Receipt, etc.
*/
const createVoucherWithEntries = async ({
  voucher_type,
  voucher_date,
  reference_no,
  narration,
  entries,
  created_by
}) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    /*
      1. Validate financial year
    */
    const financialYear = await getFinancialYearByDate(voucher_date);

    if (!financialYear) {
      throw new Error('No financial year found for the selected voucher date');
    }

    /*
      2. Validate entries
      Must have at least 2 lines
    */
    if (!Array.isArray(entries) || entries.length < 2) {
      throw new Error('Voucher must contain at least 2 entry lines');
    }

    let totalDebit = 0;
    let totalCredit = 0;

    for (const entry of entries) {
      const debit = Number(entry.debit || 0);
      const credit = Number(entry.credit || 0);

      /*
        One line should not have both debit and credit > 0
      */
      if (debit > 0 && credit > 0) {
        throw new Error('A voucher line cannot have both debit and credit amounts');
      }

      /*
        One line should not have both zero
      */
      if (debit === 0 && credit === 0) {
        throw new Error('Each voucher line must have debit or credit amount');
      }

      /*
        Check ledger exists
      */
      const [ledgerRows] = await conn.query(
        'SELECT id FROM ledgers WHERE id = ?',
        [entry.ledger_id]
      );

      if (ledgerRows.length === 0) {
        throw new Error(`Invalid ledger_id: ${entry.ledger_id}`);
      }

      totalDebit += debit;
      totalCredit += credit;
    }

    /*
      Debit and credit must match
    */
    if (Number(totalDebit.toFixed(2)) !== Number(totalCredit.toFixed(2))) {
      throw new Error('Total debit must equal total credit');
    }

    /*
      3. Validate voucher date ordering
      Prevent entering a voucher date earlier than the latest
      voucher date for the same voucher type in the same financial year
    */
    const [lastVoucherRows] = await conn.query(
      `SELECT voucher_date, voucher_no
       FROM vouchers
       WHERE financial_year_id = ? AND voucher_type = ?
       ORDER BY voucher_no DESC
       LIMIT 1`,
      [financialYear.id, voucher_type]
    );

    if (lastVoucherRows.length > 0) {
      const lastVoucherDate = new Date(lastVoucherRows[0].voucher_date);
      const currentVoucherDate = new Date(voucher_date);

      if (currentVoucherDate < lastVoucherDate) {
        throw new Error(
          'Voucher date cannot be earlier than the latest voucher date for this voucher type'
        );
      }
    }

    /*
      4. Generate next voucher number
    */
    const nextVoucherNo = await getNextVoucherNumber(
      financialYear.id,
      voucher_type,
      conn
    );

    /*
      5. Insert voucher header
      sequence_no = voucher_no for now
    */
    const [voucherResult] = await conn.query(
      `INSERT INTO vouchers
       (financial_year_id, voucher_type, voucher_no, voucher_date, sequence_no, reference_no, narration, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        financialYear.id,
        voucher_type,
        nextVoucherNo,
        voucher_date,
        nextVoucherNo,
        reference_no || null,
        narration || null,
        created_by || null
      ]
    );

    const voucherId = voucherResult.insertId;

    /*
      6. Insert voucher lines
    */
    for (const entry of entries) {
      await conn.query(
        `INSERT INTO voucher_entries
         (voucher_id, ledger_id, debit, credit, line_description)
         VALUES (?, ?, ?, ?, ?)`,
        [
          voucherId,
          entry.ledger_id,
          entry.debit || 0,
          entry.credit || 0,
          entry.line_description || null
        ]
      );
    }

    await conn.commit();

    /*
      7. Return created voucher
    */
    const [voucherRows] = await pool.query(
      'SELECT * FROM vouchers WHERE id = ?',
      [voucherId]
    );

    const [entryRows] = await pool.query(
      `SELECT ve.*, l.ledger_name, l.ledger_code
       FROM voucher_entries ve
       JOIN ledgers l ON ve.ledger_id = l.id
       WHERE ve.voucher_id = ?`,
      [voucherId]
    );

    return {
      voucher: voucherRows[0],
      entries: entryRows
    };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

module.exports = {
  createVoucherWithEntries
};