const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');
const { approvalWorkflowController, approvalController } = require('../controllers/approvalController');

const router = express.Router();

// Approval Workflows
router.get('/workflows', authMiddleware, authorizeRoles('admin'), approvalWorkflowController.getAllApprovalWorkflows);
router.post('/workflows', authMiddleware, authorizeRoles('admin'), approvalWorkflowController.createApprovalWorkflow);
router.put('/workflows/:id', authMiddleware, authorizeRoles('admin'), approvalWorkflowController.updateApprovalWorkflow);
router.delete('/workflows/:id', authMiddleware, authorizeRoles('admin'), approvalWorkflowController.deleteApprovalWorkflow);

// Approvals
router.get('/pending', authMiddleware, approvalController.getPendingApprovals);
router.post('/', authMiddleware, approvalController.createApproval);
router.post('/:id/approve', authMiddleware, approvalController.approveDocument);
router.post('/:id/reject', authMiddleware, approvalController.rejectDocument);

module.exports = router;
