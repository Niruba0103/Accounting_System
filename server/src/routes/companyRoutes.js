const express = require('express');
const { createCompany } = require('../controllers/companyController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Only authenticated users can create companies
router.post('/', authMiddleware, createCompany);

module.exports = router;
