const pool = require('../config/db');
const {
  getLedgerOpeningBalance,
  getLedgerTransactions
} = require('../services/reportService');

/*
  General Ledger Report with running balance
*/
const getLedgerReport = async (req, res) => {
  try {
    const { ledger_id, from_date, to_date } = req.query;

    if (!ledger_id || !from_date || !to_date) {
      return res.status(400).json({
        message: 'ledger_id, from_date and to_date are required'
      });
    }

    const [ledgerRows] = await pool.query(
      `SELECT l.*, ag.group_name, ag.category
       FROM ledgers l
       JOIN account_groups ag ON l.group_id = ag.id
       WHERE l.id = ? AND l.company_id = ?`,
      [ledger_id, req.companyId]
    );

    if (ledgerRows.length === 0) {
      return res.status(404).json({ message: 'Ledger not found' });
    }

    const ledger = ledgerRows[0];

    const opening = await getLedgerOpeningBalance(ledger_id, from_date);
    const transactions = await getLedgerTransactions(ledger_id, from_date, to_date);

    let runningBalance = Number(opening.net_balance || 0);

    const rows = transactions.map((tx) => {
      runningBalance += Number(tx.debit || 0) - Number(tx.credit || 0);

      return {
        voucher_date: tx.voucher_date,
        voucher_type: tx.voucher_type,
        voucher_no: tx.voucher_no,
        reference_no: tx.reference_no,
        narration: tx.narration,
        line_description: tx.line_description,
        debit: Number(tx.debit || 0),
        credit: Number(tx.credit || 0),
        running_balance: runningBalance
      };
    });

    res.json({
      ledger: {
        id: ledger.id,
        ledger_code: ledger.ledger_code,
        ledger_name: ledger.ledger_name,
        group_name: ledger.group_name,
        category: ledger.category
      },
      opening_balance: opening.net_balance,
      from_date,
      to_date,
      transactions: rows,
      closing_balance: runningBalance
    });
  } catch (error) {
    console.error('Ledger report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getLedgerReport
};