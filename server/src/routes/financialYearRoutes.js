const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getAllFinancialYears,
  getActiveFinancialYear,
  createFinancialYear,
  setActiveFinancialYear
} = require('../controllers/financialYearController');

const router = express.Router();

router.get('/', authMiddleware, getAllFinancialYears);
router.get('/active', authMiddleware, getActiveFinancialYear);
router.post('/', authMiddleware, createFinancialYear);
router.put('/:id/set-active', authMiddleware, setActiveFinancialYear);

module.exports = router;