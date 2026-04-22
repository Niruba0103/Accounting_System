const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');
const {
  getDebtorsReport,
  getCreditorsReport,
  getPaymentDetailReport,
  getReceiptDetailReport
} = require('../controllers/reportController');

const router = express.Router();

router.get('/debtors', authMiddleware, authorizeRoles('admin', 'accountant', 'viewer'), getDebtorsReport);
router.get('/creditors', authMiddleware, authorizeRoles('admin', 'accountant', 'viewer'), getCreditorsReport);
router.get('/payments', authMiddleware, authorizeRoles('admin', 'accountant', 'viewer'), getPaymentDetailReport);
router.get('/receipts', authMiddleware, authorizeRoles('admin', 'accountant', 'viewer'), getReceiptDetailReport);

module.exports = router;