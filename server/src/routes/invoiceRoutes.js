const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');

const {
  getAllInvoices,
  getInvoiceById,
  createSalesInvoice,
  createPurchaseInvoice,
  updateInvoice,
  deleteInvoice,
  createReceiptAgainstInvoice,
  createPaymentAgainstInvoice
} = require('../controllers/invoiceController');

const router = express.Router();

router.get('/', authMiddleware, authorizeRoles('admin', 'accountant', 'viewer'), getAllInvoices);
router.get('/:id', authMiddleware, authorizeRoles('admin', 'accountant', 'viewer'), getInvoiceById);

router.post('/sales', authMiddleware, authorizeRoles('admin', 'accountant'), createSalesInvoice);
router.post('/purchase', authMiddleware, authorizeRoles('admin', 'accountant'), createPurchaseInvoice);

router.put('/:id', authMiddleware, authorizeRoles('admin', 'accountant'), updateInvoice);
router.delete('/:id', authMiddleware, authorizeRoles('admin', 'accountant'), deleteInvoice);

router.post('/receipt', authMiddleware, authorizeRoles('admin', 'accountant'), createReceiptAgainstInvoice);
router.post('/payment', authMiddleware, authorizeRoles('admin', 'accountant'), createPaymentAgainstInvoice);

module.exports = router;