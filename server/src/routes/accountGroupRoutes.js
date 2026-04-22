const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getAllAccountGroups,
  createAccountGroup,
  updateAccountGroup
} = require('../controllers/accountGroupController');

const router = express.Router();

router.get('/', authMiddleware, getAllAccountGroups);
router.post('/', authMiddleware, createAccountGroup);
router.put('/:id', authMiddleware, updateAccountGroup);

module.exports = router;