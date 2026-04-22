const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { getLedgerReport } = require('../controllers/ledgerReportController');

const router = express.Router();

router.get('/', authMiddleware, getLedgerReport);

module.exports = router;