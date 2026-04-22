const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');
const {
  createJournalVoucher,
  getAllVouchers,
  getVoucherById
} = require('../controllers/voucherController');

const router = express.Router();

router.get('/', authMiddleware, authorizeRoles('admin', 'accountant', 'viewer'), getAllVouchers);
router.get('/:id', authMiddleware, authorizeRoles('admin', 'accountant', 'viewer'), getVoucherById);
router.post('/journal', authMiddleware, authorizeRoles('admin', 'accountant'), createJournalVoucher);

module.exports = router;