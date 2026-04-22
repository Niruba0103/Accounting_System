const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');
const {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer
} = require('../controllers/customerController');

const router = express.Router();

router.get('/', authMiddleware, authorizeRoles('admin', 'accountant'), getAllCustomers);
router.get('/:id', authMiddleware, authorizeRoles('admin', 'accountant'), getCustomerById);
router.post('/', authMiddleware, authorizeRoles('admin', 'accountant'), createCustomer);
router.put('/:id', authMiddleware, authorizeRoles('admin', 'accountant'), updateCustomer);
router.delete('/:id', authMiddleware, authorizeRoles('admin', 'accountant'), deleteCustomer);

module.exports = router;