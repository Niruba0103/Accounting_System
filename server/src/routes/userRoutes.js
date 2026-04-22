const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');

const {
  getAllUsers,
  createUser,
  updateUserRole,
  deleteUser
} = require('../controllers/userController');

const router = express.Router();

router.get('/', authMiddleware, authorizeRoles('admin'), getAllUsers);
router.post('/', authMiddleware, authorizeRoles('admin'), createUser);
router.put('/:id/role', authMiddleware, authorizeRoles('admin'), updateUserRole);
router.delete('/:id', authMiddleware, authorizeRoles('admin'), deleteUser);

module.exports = router;