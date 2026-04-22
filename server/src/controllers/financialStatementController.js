const {
  getTrialBalanceData,
  getProfitAndLossData,
  getBalanceSheetData
} = require('../services/reportService');

/*
  Trial Balance
*/
const getTrialBalance = async (req, res) => {
  try {
    const { to_date } = req.query;

    if (!to_date) {
      return res.status(400).json({ message: 'to_date is required' });
    }

    const rows = await getTrialBalanceData(to_date, req.companyId);

    const filteredRows = rows.filter((row) => row.debit !== 0 || row.credit !== 0);

    const totalDebit = filteredRows.reduce((sum, row) => sum + row.debit, 0);
    const totalCredit = filteredRows.reduce((sum, row) => sum + row.credit, 0);

    res.json({
      to_date,
      rows: filteredRows,
      totalDebit,
      totalCredit
    });
  } catch (error) {
    console.error('Trial balance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/*
  Profit and Loss
*/
const getProfitAndLoss = async (req, res) => {
  try {
    const { from_date, to_date } = req.query;

    if (!from_date || !to_date) {
      return res.status(400).json({
        message: 'from_date and to_date are required'
      });
    }

    const result = await getProfitAndLossData(from_date, to_date, req.companyId);

    res.json({
      from_date,
      to_date,
      ...result
    });
  } catch (error) {
    console.error('Profit and loss error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/*
  Balance Sheet
*/
const getBalanceSheet = async (req, res) => {
  try {
    const { to_date } = req.query;

    if (!to_date) {
      return res.status(400).json({ message: 'to_date is required' });
    }

    const result = await getBalanceSheetData(to_date, req.companyId);

    res.json({
      to_date,
      ...result
    });
  } catch (error) {
    console.error('Balance sheet error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getTrialBalance,
  getProfitAndLoss,
  getBalanceSheet
};