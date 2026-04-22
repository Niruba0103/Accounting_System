const pool = require('../config/db');

/*
  Get ledger opening balance before from_date
  This includes:
  - ledger opening balance
  - all voucher movements before from_date
*/
const getLedgerOpeningBalance = async (ledgerId, fromDate) => {
  // 1. get ledger opening balance
  const [ledgerRows] = await pool.query(
    `SELECT opening_balance, opening_balance_type
     FROM ledgers
     WHERE id = ?`,
    [ledgerId]
  );

  if (ledgerRows.length === 0) {
    throw new Error('Ledger not found');
  }

  const ledger = ledgerRows[0];

  let openingDebit = 0;
  let openingCredit = 0;

  if (ledger.opening_balance_type === 'DR') {
    openingDebit = Number(ledger.opening_balance || 0);
  } else {
    openingCredit = Number(ledger.opening_balance || 0);
  }

  // 2. get voucher movement before from_date
  const [entryRows] = await pool.query(
    `SELECT
       COALESCE(SUM(ve.debit), 0) AS total_debit,
       COALESCE(SUM(ve.credit), 0) AS total_credit
     FROM voucher_entries ve
     JOIN vouchers v ON ve.voucher_id = v.id
     WHERE ve.ledger_id = ?
       AND v.voucher_date < ?`,
    [ledgerId, fromDate]
  );

  const movementDebit = Number(entryRows[0].total_debit || 0);
  const movementCredit = Number(entryRows[0].total_credit || 0);

  const totalDebit = openingDebit + movementDebit;
  const totalCredit = openingCredit + movementCredit;

  return {
    opening_debit: totalDebit,
    opening_credit: totalCredit,
    net_balance: totalDebit - totalCredit
  };
};

/*
  Get ledger transactions between two dates
*/
const getLedgerTransactions = async (ledgerId, fromDate, toDate) => {
  const [rows] = await pool.query(
    `SELECT
       v.voucher_date,
       v.voucher_type,
       v.voucher_no,
       v.reference_no,
       v.narration,
       ve.debit,
       ve.credit,
       ve.line_description
     FROM voucher_entries ve
     JOIN vouchers v ON ve.voucher_id = v.id
     WHERE ve.ledger_id = ?
       AND v.voucher_date BETWEEN ? AND ?
     ORDER BY v.voucher_date ASC, v.voucher_no ASC, ve.id ASC`,
    [ledgerId, fromDate, toDate]
  );

  return rows;
};

/*
  Trial balance query
*/
const getTrialBalanceData = async (toDate, companyId) => {
  const [rows] = await pool.query(
    `SELECT
       l.id AS ledger_id,
       l.ledger_code,
       l.ledger_name,
       ag.group_name,
       ag.category,
       l.opening_balance,
       l.opening_balance_type,
       COALESCE(SUM(CASE WHEN v.voucher_date <= ? THEN ve.debit ELSE 0 END), 0) AS total_debit,
       COALESCE(SUM(CASE WHEN v.voucher_date <= ? THEN ve.credit ELSE 0 END), 0) AS total_credit
     FROM ledgers l
     JOIN account_groups ag ON l.group_id = ag.id
     LEFT JOIN voucher_entries ve ON l.id = ve.ledger_id
     LEFT JOIN vouchers v ON ve.voucher_id = v.id
     WHERE l.company_id = ?
     GROUP BY
       l.id, l.ledger_code, l.ledger_name,
       ag.group_name, ag.category,
       l.opening_balance, l.opening_balance_type
     ORDER BY l.ledger_code ASC`,
    [toDate, toDate, companyId]
  );

  return rows.map((row) => {
    let openingDebit = 0;
    let openingCredit = 0;

    if (row.opening_balance_type === 'DR') {
      openingDebit = Number(row.opening_balance || 0);
    } else {
      openingCredit = Number(row.opening_balance || 0);
    }

    const finalDebit = openingDebit + Number(row.total_debit || 0);
    const finalCredit = openingCredit + Number(row.total_credit || 0);
    const net = finalDebit - finalCredit;

    return {
      ledger_id: row.ledger_id,
      ledger_code: row.ledger_code,
      ledger_name: row.ledger_name,
      group_name: row.group_name,
      category: row.category,
      debit: net > 0 ? net : 0,
      credit: net < 0 ? Math.abs(net) : 0
    };
  });
};

/*
  Profit and loss data
*/
const getProfitAndLossData = async (fromDate, toDate, companyId) => {
  const [rows] = await pool.query(
    `SELECT
       l.id AS ledger_id,
       l.ledger_code,
       l.ledger_name,
       ag.group_name,
       ag.category,
       COALESCE(SUM(ve.debit), 0) AS total_debit,
       COALESCE(SUM(ve.credit), 0) AS total_credit
     FROM ledgers l
     JOIN account_groups ag ON l.group_id = ag.id
     LEFT JOIN voucher_entries ve ON l.id = ve.ledger_id
     LEFT JOIN vouchers v ON ve.voucher_id = v.id
     WHERE ag.category IN ('REVENUE', 'EXPENSE')
       AND l.company_id = ?
       AND v.voucher_date BETWEEN ? AND ?
     GROUP BY l.id, l.ledger_code, l.ledger_name, ag.group_name, ag.category
     ORDER BY ag.category, l.ledger_code`,
    [companyId, fromDate, toDate]
  );

  const revenue = [];
  const expenses = [];

  for (const row of rows) {
    const debit = Number(row.total_debit || 0);
    const credit = Number(row.total_credit || 0);

    if (row.category === 'REVENUE') {
      const amount = credit - debit;
      revenue.push({
        ...row,
        amount: amount > 0 ? amount : 0
      });
    } else if (row.category === 'EXPENSE') {
      const amount = debit - credit;
      expenses.push({
        ...row,
        amount: amount > 0 ? amount : 0
      });
    }
  }

  const totalRevenue = revenue.reduce((sum, row) => sum + row.amount, 0);
  const totalExpenses = expenses.reduce((sum, row) => sum + row.amount, 0);

  return {
    revenue,
    expenses,
    totalRevenue,
    totalExpenses,
    netProfit: totalRevenue - totalExpenses
  };
};

/*
  Balance sheet data
*/
const getBalanceSheetData = async (toDate, companyId) => {
  const [rows] = await pool.query(
    `SELECT
       l.id AS ledger_id,
       l.ledger_code,
       l.ledger_name,
       ag.group_name,
       ag.category,
       l.opening_balance,
       l.opening_balance_type,
       COALESCE(SUM(CASE WHEN v.voucher_date <= ? THEN ve.debit ELSE 0 END), 0) AS total_debit,
       COALESCE(SUM(CASE WHEN v.voucher_date <= ? THEN ve.credit ELSE 0 END), 0) AS total_credit
     FROM ledgers l
     JOIN account_groups ag ON l.group_id = ag.id
     LEFT JOIN voucher_entries ve ON l.id = ve.ledger_id
     LEFT JOIN vouchers v ON ve.voucher_id = v.id
     WHERE ag.category IN ('ASSET', 'LIABILITY', 'EQUITY')
       AND l.company_id = ?
     GROUP BY
       l.id, l.ledger_code, l.ledger_name,
       ag.group_name, ag.category,
       l.opening_balance, l.opening_balance_type
     ORDER BY ag.category, l.ledger_code`,
    [toDate, toDate, companyId]
  );

  const assets = [];
  const liabilities = [];
  const equity = [];

  for (const row of rows) {
    let openingDebit = 0;
    let openingCredit = 0;

    if (row.opening_balance_type === 'DR') {
      openingDebit = Number(row.opening_balance || 0);
    } else {
      openingCredit = Number(row.opening_balance || 0);
    }

    const finalDebit = openingDebit + Number(row.total_debit || 0);
    const finalCredit = openingCredit + Number(row.total_credit || 0);
    const net = finalDebit - finalCredit;

    if (row.category === 'ASSET') {
      assets.push({
        ...row,
        amount: net
      });
    } else if (row.category === 'LIABILITY') {
      liabilities.push({
        ...row,
        amount: Math.abs(net)
      });
    } else if (row.category === 'EQUITY') {
      equity.push({
        ...row,
        amount: Math.abs(net)
      });
    }
  }

  return {
    assets,
    liabilities,
    equity,
    totalAssets: assets.reduce((sum, row) => sum + row.amount, 0),
    totalLiabilities: liabilities.reduce((sum, row) => sum + row.amount, 0),
    totalEquity: equity.reduce((sum, row) => sum + row.amount, 0)
  };
};

module.exports = {
  getLedgerOpeningBalance,
  getLedgerTransactions,
  getTrialBalanceData,
  getProfitAndLossData,
  getBalanceSheetData
};