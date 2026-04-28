const pool = require('../config/db');

const setupDefaultCompanyData = async (companyId, connection) => {
  // 1. Default Root Groups (correct ENUM values from DB schema)
  const groups = [
    { name: 'Assets', category: 'ASSET', nature: 'OTHER', group_type: 'OTHER' },
    { name: 'Liabilities', category: 'LIABILITY', nature: 'OTHER', group_type: 'OTHER' },
    { name: 'Equity', category: 'EQUITY', nature: 'OTHER', group_type: 'CORE' },
    { name: 'Income', category: 'REVENUE', nature: 'OTHER', group_type: 'OTHER' },
    { name: 'Expenses', category: 'EXPENSE', nature: 'OTHER', group_type: 'OTHER' },
  ];
  const groupIds = {};

  for (const group of groups) {
    const [result] = await connection.query(
      'INSERT INTO account_groups (company_id, group_name, category, nature, group_type) VALUES (?, ?, ?, ?, ?)',
      [companyId, group.name, group.category, group.nature, group.group_type]
    );
    groupIds[group.name] = result.insertId;
  }

  // 2. Default Sub-groups
  const subGroups = [
    { name: 'Current Assets', parent: 'Assets', category: 'ASSET', nature: 'CURRENT', group_type: 'CURRENT' },
    { name: 'Non Current Assets', parent: 'Assets', category: 'ASSET', nature: 'NON_CURRENT', group_type: 'NON_CURRENT' },

    { name: 'Current Liabilities', parent: 'Liabilities', category: 'LIABILITY', nature: 'CURRENT', group_type: 'CURRENT' },
    { name: 'Non Current Liabilities', parent: 'Liabilities', category: 'LIABILITY', nature: 'NON_CURRENT', group_type: 'NON_CURRENT' },

    { name: 'Capital', parent: 'Equity', category: 'EQUITY', nature: 'OTHER', group_type: 'CORE' },

    { name: 'Direct Income', parent: 'Income', category: 'REVENUE', nature: 'DIRECT', group_type: 'DIRECT' },
    { name: 'Indirect Income', parent: 'Income', category: 'REVENUE', nature: 'INDIRECT', group_type: 'INDIRECT' },

    { name: 'Direct Expenses', parent: 'Expenses', category: 'EXPENSE', nature: 'DIRECT', group_type: 'DIRECT' },
    { name: 'Indirect Expenses', parent: 'Expenses', category: 'EXPENSE', nature: 'INDIRECT', group_type: 'INDIRECT' },
  ];

  for (const sg of subGroups) {
    const [result] = await connection.query(
      'INSERT INTO account_groups (company_id, group_name, parent_group_id, category, nature, group_type) VALUES (?, ?, ?, ?, ?, ?)',
      [companyId, sg.name, groupIds[sg.parent], sg.category, sg.nature, sg.group_type]
    );
    groupIds[sg.name] = result.insertId;
  }

  // 3. Default Ledgers
const ledgers = [
  // Current Assets
  { code: 'CASH001', name: 'Cash-in-Hand', group: 'Current Assets' },
  { code: 'BANK001', name: 'Bank Accounts', group: 'Current Assets' },
  { code: 'AR001', name: 'Accounts Receivable (Customers)', group: 'Current Assets' },
  { code: 'INV001', name: 'Inventory', group: 'Current Assets' },
  { code: 'PRE001', name: 'Prepaid Expenses', group: 'Current Assets' },

  // Non Current Assets
  { code: 'FA001', name: 'Furniture & Fixtures', group: 'Non Current Assets' },
  { code: 'FA002', name: 'Computers & Equipment', group: 'Non Current Assets' },
  { code: 'FA003', name: 'Vehicles', group: 'Non Current Assets' },
  { code: 'FA004', name: 'Buildings', group: 'Non Current Assets' },

  // Current Liabilities
  { code: 'AP001', name: 'Accounts Payable (Suppliers)', group: 'Current Liabilities' },
  { code: 'OL001', name: 'Outstanding Expenses', group: 'Current Liabilities' },
  { code: 'TAX001', name: 'Tax Payable / GST Payable', group: 'Current Liabilities' },

  // Non Current Liabilities
  { code: 'NCL001', name: 'Bank Loan', group: 'Non Current Liabilities' },
  { code: 'NCL002', name: 'Long-term Borrowings', group: 'Non Current Liabilities' },

  // Equity (under Capital subgroup)
  { code: 'CAP001', name: 'Capital', group: 'Capital' },
  { code: 'EQ001', name: "Owner's Equity", group: 'Capital' },
  { code: 'RE001', name: 'Retained Earnings', group: 'Capital' },
  { code: 'DRAW001', name: 'Drawings', group: 'Capital' },

  // Income
  { code: 'SALE001', name: 'Sales', group: 'Direct Income' },
  { code: 'INC001', name: 'Other Income', group: 'Indirect Income' },

  // Expenses
  { code: 'EXP001', name: 'Purchases / Cost of Goods Sold', group: 'Direct Expenses' },
  { code: 'EXP002', name: 'Salaries Expense', group: 'Indirect Expenses' },
  { code: 'EXP003', name: 'Rent Expense', group: 'Indirect Expenses' },
  { code: 'EXP004', name: 'Utilities Expense', group: 'Indirect Expenses' },
];

  for (const ledger of ledgers) {
    await connection.query(
      `INSERT INTO ledgers (company_id, ledger_code, ledger_name, group_id, opening_balance, opening_balance_type, status)
       VALUES (?, ?, ?, ?, 0, 'DR', 'ACTIVE')`,
      [companyId, ledger.code, ledger.name, groupIds[ledger.group]]
    );
  }
};

module.exports = {
  setupDefaultCompanyData
};
