const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');
const { recurringTransactionController, budgetController } = require('../controllers/recurringBudgetController');

const router = express.Router();

// Recurring Transactions
router.get('/recurring', authMiddleware, authorizeRoles('admin', 'accountant'), recurringTransactionController.getAllRecurringTransactions);
router.post('/recurring', authMiddleware, authorizeRoles('admin', 'accountant'), recurringTransactionController.createRecurringTransaction);
router.put('/recurring/:id', authMiddleware, authorizeRoles('admin', 'accountant'), recurringTransactionController.updateRecurringTransaction);
router.delete('/recurring/:id', authMiddleware, authorizeRoles('admin'), recurringTransactionController.deleteRecurringTransaction);

// Budgets
router.get('/budgets', authMiddleware, authorizeRoles('admin', 'accountant', 'viewer'), budgetController.getAllBudgets);
router.post('/budgets', authMiddleware, authorizeRoles('admin', 'accountant'), budgetController.createBudget);
router.put('/budgets/:id', authMiddleware, authorizeRoles('admin', 'accountant'), budgetController.updateBudget);
router.get('/budgets/vs-actual', authMiddleware, authorizeRoles('admin', 'accountant', 'viewer'), budgetController.getBudgetVsActual);

module.exports = router;
