const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getTrialBalance,
  getProfitAndLoss,
  getBalanceSheet
} = require('../controllers/financialStatementController');

const router = express.Router();

router.get('/trial-balance', authMiddleware, getTrialBalance);
router.get('/profit-loss', authMiddleware, getProfitAndLoss);
router.get('/balance-sheet', authMiddleware, getBalanceSheet);

module.exports = router;