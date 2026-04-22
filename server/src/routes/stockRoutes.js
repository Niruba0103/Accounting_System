const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  createStockItem,
  createStockMovement,
  getStockOnHand
} = require('../controllers/stockController');

const router = express.Router();

router.post('/items', authMiddleware, createStockItem);
router.post('/movements', authMiddleware, createStockMovement);
router.get('/on-hand', authMiddleware, getStockOnHand);

module.exports = router;