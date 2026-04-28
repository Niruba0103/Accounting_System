const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');
const { expenseCategoryController, costCenterController } = require('../controllers/categoryController');

const router = express.Router();

// Expense Categories
router.get('/categories', authMiddleware, authorizeRoles('admin', 'accountant'), expenseCategoryController.getAllExpenseCategories);
router.get('/categories/:id', authMiddleware, authorizeRoles('admin', 'accountant'), expenseCategoryController.getExpenseCategoryById);
router.post('/categories', authMiddleware, authorizeRoles('admin', 'accountant'), expenseCategoryController.createExpenseCategory);
router.put('/categories/:id', authMiddleware, authorizeRoles('admin'), expenseCategoryController.updateExpenseCategory);
router.delete('/categories/:id', authMiddleware, authorizeRoles('admin'), expenseCategoryController.deleteExpenseCategory);

// Cost Centers
router.get('/cost-centers', authMiddleware, authorizeRoles('admin', 'accountant'), costCenterController.getAllCostCenters);
router.get('/cost-centers/:id', authMiddleware, authorizeRoles('admin', 'accountant'), costCenterController.getCostCenterById);
router.post('/cost-centers', authMiddleware, authorizeRoles('admin', 'accountant'), costCenterController.createCostCenter);
router.put('/cost-centers/:id', authMiddleware, authorizeRoles('admin'), costCenterController.updateCostCenter);
router.delete('/cost-centers/:id', authMiddleware, authorizeRoles('admin'), costCenterController.deleteCostCenter);

module.exports = router;
