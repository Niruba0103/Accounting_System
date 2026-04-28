const pool = require('../config/db');

const approvalWorkflowController = {
  // Get all approval workflows
  getAllApprovalWorkflows: async (req, res) => {
    try {
      const { company_id } = req.company;
      const { document_type } = req.query;
      
      let query = `SELECT aw.*, u.name as approver_name FROM approval_workflows aw
                   LEFT JOIN users u ON aw.approver_id = u.id
                   WHERE aw.company_id = ? AND aw.is_active = TRUE`;
      const params = [company_id];
      
      if (document_type) {
        query += ` AND aw.document_type = ?`;
        params.push(document_type);
      }
      
      query += ` ORDER BY aw.document_type, aw.approval_level`;
      
      const [workflows] = await pool.query(query, params);
      res.json(workflows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create approval workflow
  createApprovalWorkflow: async (req, res) => {
    try {
      const { company_id } = req.company;
      const { document_type, approval_level, approver_id, min_amount, max_amount } = req.body;
      
      if (!document_type || !approval_level || !approver_id) {
        return res.status(400).json({ error: 'document_type, approval_level, and approver_id are required' });
      }
      
      const [result] = await pool.query(
        `INSERT INTO approval_workflows (company_id, document_type, approval_level, approver_id, min_amount, max_amount)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [company_id, document_type, approval_level, approver_id, min_amount, max_amount]
      );
      
      res.json({ id: result.insertId, message: 'Approval workflow created' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update approval workflow
  updateApprovalWorkflow: async (req, res) => {
    try {
      const { company_id } = req.company;
      const { id } = req.params;
      const { document_type, approval_level, approver_id, min_amount, max_amount, is_active } = req.body;
      
      const [result] = await pool.query(
        `UPDATE approval_workflows 
         SET document_type = ?, approval_level = ?, approver_id = ?, min_amount = ?, max_amount = ?, is_active = ?
         WHERE id = ? AND company_id = ?`,
        [document_type, approval_level, approver_id, min_amount, max_amount, is_active, id, company_id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Approval workflow not found' });
      }
      
      res.json({ message: 'Approval workflow updated' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete approval workflow
  deleteApprovalWorkflow: async (req, res) => {
    try {
      const { company_id } = req.company;
      const { id } = req.params;
      
      const [result] = await pool.query(
        `DELETE FROM approval_workflows 
         WHERE id = ? AND company_id = ?`,
        [id, company_id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Approval workflow not found' });
      }
      
      res.json({ message: 'Approval workflow deleted' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

const approvalController = {
  // Get pending approvals for user
  getPendingApprovals: async (req, res) => {
    try {
      const { user_id, company_id } = req.user;
      
      const [approvals] = await pool.query(
        `SELECT a.*, u.name as requester_name FROM approvals a
         LEFT JOIN users u ON a.approver_id = u.id
         WHERE a.company_id = ? AND a.approver_id = ? AND a.status = 'pending'
         ORDER BY a.created_at DESC`,
        [company_id, user_id]
      );
      
      res.json(approvals);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create approval request
  createApproval: async (req, res) => {
    try {
      const { company_id } = req.company;
      const { document_type, document_id } = req.body;
      
      if (!document_type || !document_id) {
        return res.status(400).json({ error: 'document_type and document_id are required' });
      }
      
      // Get document amount
      let amount = 0;
      if (document_type === 'invoice') {
        const [docs] = await pool.query('SELECT total_amount FROM invoices WHERE id = ? AND company_id = ?', [document_id, company_id]);
        if (docs.length) amount = docs[0].total_amount;
      } else if (document_type === 'voucher') {
        const [docs] = await pool.query('SELECT SUM(amount) as total FROM voucher_details WHERE voucher_id = ? AND company_id = ?', [document_id, company_id]);
        if (docs.length) amount = docs[0].total || 0;
      }
      
      // Get approval workflows
      const [workflows] = await pool.query(
        `SELECT * FROM approval_workflows 
         WHERE company_id = ? AND document_type = ? AND is_active = TRUE
         ORDER BY approval_level`,
        [company_id, document_type]
      );
      
      // Create approval records
      for (const workflow of workflows) {
        if (!amount || ((!workflow.min_amount || amount >= workflow.min_amount) && (!workflow.max_amount || amount <= workflow.max_amount))) {
          await pool.query(
            `INSERT INTO approvals (company_id, document_type, document_id, approval_level, approver_id, status)
             VALUES (?, ?, ?, ?, ?, 'pending')`,
            [company_id, document_type, document_id, workflow.approval_level, workflow.approver_id]
          );
        }
      }
      
      res.json({ message: 'Approval requests created' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Approve document
  approveDocument: async (req, res) => {
    try {
      const { company_id, user_id } = req.user;
      const { id } = req.params;
      const { comments } = req.body;
      
      const [result] = await pool.query(
        `UPDATE approvals 
         SET status = 'approved', approver_id = ?, comments = ?, approved_at = NOW()
         WHERE id = ? AND company_id = ? AND status = 'pending'`,
        [user_id, comments, id, company_id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Approval not found or already processed' });
      }
      
      res.json({ message: 'Document approved' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Reject document
  rejectDocument: async (req, res) => {
    try {
      const { company_id, user_id } = req.user;
      const { id } = req.params;
      const { comments } = req.body;
      
      const [result] = await pool.query(
        `UPDATE approvals 
         SET status = 'rejected', approver_id = ?, comments = ?, approved_at = NOW()
         WHERE id = ? AND company_id = ? AND status = 'pending'`,
        [user_id, comments, id, company_id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Approval not found or already processed' });
      }
      
      res.json({ message: 'Document rejected' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = { approvalWorkflowController, approvalController };
