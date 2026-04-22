const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
} = require('../controllers/supplierController');

const router = express.Router();

router.get('/', authMiddleware, getAllSuppliers);
router.get('/:id', authMiddleware, getSupplierById);
router.post('/', authMiddleware, createSupplier);
router.put('/:id', authMiddleware, updateSupplier);
router.delete('/:id', authMiddleware, deleteSupplier);

module.exports = router;