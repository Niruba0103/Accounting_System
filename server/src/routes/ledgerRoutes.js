const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getAllLedgers,
  getLedgerById,
  createLedger,
  updateLedger,
  deleteLedger
} = require('../controllers/ledgerController');

const router = express.Router();

router.get('/', authMiddleware, getAllLedgers);
router.get('/:id', authMiddleware, getLedgerById);
router.post('/', authMiddleware, createLedger);
router.put('/:id', authMiddleware, updateLedger);
router.delete('/:id', authMiddleware, deleteLedger);

module.exports = router;