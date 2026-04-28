const pool = require('../config/db');
const auditService = require('../services/auditService');

const expenseCategoryController = {
  // Get all expense categories
  getAllExpenseCategories: async (req, res) => {
    try {
      const company_id = req.companyId;
      
      const [categories] = await pool.query(
        `SELECT * FROM expense_categories 
         WHERE company_id = ? AND is_active = TRUE
         ORDER BY name`,
        [company_id]
      );
      
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get expense category by ID
  getExpenseCategoryById: async (req, res) => {
    try {
      const company_id = req.companyId;
      const { id } = req.params;
      
      const [categories] = await pool.query(
        `SELECT * FROM expense_categories 
         WHERE id = ? AND company_id = ?`,
        [id, company_id]
      );
      
      if (categories.length === 0) {
        return res.status(404).json({ error: 'Expense category not found' });
      }
      
      res.json(categories[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create expense category
  createExpenseCategory: async (req, res) => {
    try {
      const company_id = req.companyId;
      const { name, description, parent_id, ledger_id } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'name is required' });
      }
      
      const [result] = await pool.query(
        `INSERT INTO expense_categories (company_id, name, description, parent_id, ledger_id)
         VALUES (?, ?, ?, ?, ?)`,
        [company_id, name, description, parent_id, ledger_id]
      );
      
      res.json({ id: result.insertId, message: 'Expense category created' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update expense category
  updateExpenseCategory: async (req, res) => {
    try {
      const company_id = req.companyId;
      const { id } = req.params;
      const { name, description, parent_id, ledger_id, is_active } = req.body;
      
      const [result] = await pool.query(
        `UPDATE expense_categories 
         SET name = ?, description = ?, parent_id = ?, ledger_id = ?, is_active = ?
         WHERE id = ? AND company_id = ?`,
        [name, description, parent_id, ledger_id, is_active, id, company_id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Expense category not found' });
      }
      
      res.json({ message: 'Expense category updated' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete expense category
  deleteExpenseCategory: async (req, res) => {
    try {
      const company_id = req.companyId;
      const { id } = req.params;
      
      const [result] = await pool.query(
        `DELETE FROM expense_categories 
         WHERE id = ? AND company_id = ?`,
        [id, company_id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Expense category not found' });
      }
      
      res.json({ message: 'Expense category deleted' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

const costCenterController = {
  // Get all cost centers
  getAllCostCenters: async (req, res) => {
    try {
      const company_id = req.companyId;
      
      const [centers] = await pool.query(
        `SELECT cc.id, cc.company_id, cc.code, cc.name, cc.description, cc.manager_id, cc.budget_amount, cc.is_active, 
                DATE_FORMAT(cc.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
                DATE_FORMAT(cc.updated_at, '%Y-%m-%d %H:%i:%s') as updated_at,
                u.name as manager_name 
         FROM cost_centers cc
         LEFT JOIN users u ON cc.manager_id = u.id
         WHERE cc.company_id = ? AND cc.is_active = TRUE
         ORDER BY cc.code`,
        [company_id]
      );
      
      res.json(centers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get cost center by ID
  getCostCenterById: async (req, res) => {
    try {
      const company_id = req.companyId;
      const { id } = req.params;
      
      const [centers] = await pool.query(
        `SELECT cc.id, cc.company_id, cc.code, cc.name, cc.description, cc.manager_id, cc.budget_amount, cc.is_active, 
                DATE_FORMAT(cc.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
                DATE_FORMAT(cc.updated_at, '%Y-%m-%d %H:%i:%s') as updated_at,
                u.name as manager_name 
         FROM cost_centers cc
         LEFT JOIN users u ON cc.manager_id = u.id
         WHERE cc.id = ? AND cc.company_id = ?`,
        [id, company_id]
      );
      
      if (centers.length === 0) {
        return res.status(404).json({ error: 'Cost center not found' });
      }
      
      res.json(centers[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create cost center
  createCostCenter: async (req, res) => {
    try {
      const company_id = req.companyId;
      const { code, name, description, manager_id, budget_amount } = req.body;
      
      if (!code || !name) {
        return res.status(400).json({ error: 'code and name are required' });
      }
      
      const finalManagerId = manager_id === '' ? null : manager_id;
      const finalBudgetAmount = budget_amount === '' ? null : budget_amount;

      const [result] = await pool.query(
        `INSERT INTO cost_centers (company_id, code, name, description, manager_id, budget_amount)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [company_id, code, name, description, finalManagerId, finalBudgetAmount]
      );
      
      res.json({ id: result.insertId, message: 'Cost center created' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update cost center
  updateCostCenter: async (req, res) => {
    try {
      const company_id = req.companyId;
      const { id } = req.params;
      const { code, name, description, manager_id, budget_amount, is_active } = req.body;
      
      const finalManagerId = manager_id === '' ? null : manager_id;
      const finalBudgetAmount = budget_amount === '' ? null : budget_amount;

      const [result] = await pool.query(
        `UPDATE cost_centers 
         SET code = ?, name = ?, description = ?, manager_id = ?, budget_amount = ?, is_active = ?
         WHERE id = ? AND company_id = ?`,
        [code, name, description, finalManagerId, finalBudgetAmount, is_active, id, company_id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Cost center not found' });
      }
      
      res.json({ message: 'Cost center updated' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete cost center
  deleteCostCenter: async (req, res) => {
    try {
      const company_id = req.companyId;
      const { id } = req.params;
      const userId = req.userId; // Assuming auth middleware sets this
      
      // First, fetch the cost center data before deletion
      const [centers] = await pool.query(
        `SELECT * FROM cost_centers WHERE id = ? AND company_id = ?`,
        [id, company_id]
      );
      
      if (centers.length === 0) {
        return res.status(404).json({ error: 'Cost center not found' });
      }
      
      const costCenter = centers[0];
      
      // Archive the deleted record before deletion
      const restorationToken = await auditService.archiveDeletedRecord(
        'cost_centers',
        id,
        costCenter.name,
        costCenter,
        userId,
        company_id
      );
      
      // Log the deletion action
      await auditService.logAction(
        'cost_centers',
        id,
        'DELETE',
        userId,
        costCenter,
        null,
        company_id
      );
      
      // Now delete the cost center
      const [result] = await pool.query(
        `DELETE FROM cost_centers 
         WHERE id = ? AND company_id = ?`,
        [id, company_id]
      );
      
      res.json({ 
        message: 'Cost center deleted',
        restorationToken: restorationToken,
        note: 'Data archived and can be restored using the restoration token'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = { expenseCategoryController, costCenterController };
