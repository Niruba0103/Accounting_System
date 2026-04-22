const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const financialYearRoutes = require('./routes/financialYearRoutes');
const accountGroupRoutes = require('./routes/accountGroupRoutes');
const ledgerRoutes = require('./routes/ledgerRoutes');
const customerRoutes = require('./routes/customerRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const voucherRoutes = require('./routes/voucherRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const reportRoutes = require('./routes/reportRoutes');
const ledgerReportRoutes = require('./routes/ledgerReportRoutes');
const financialStatementRoutes = require('./routes/financialStatementRoutes');
const stockRoutes = require('./routes/stockRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const companyRoutes = require('./routes/companyRoutes');
const authMiddleware = require('./middleware/authMiddleware');
const companyMiddleware = require('./middleware/companyMiddleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({ message: 'Accounting Package API running' });
});

// Auth doesn't need company context for login/register
app.use('/api/auth', authRoutes);
app.use('/api/companies', authMiddleware, companyRoutes);

// Apply company context to all other routes
app.use('/api/financial-years', authMiddleware, companyMiddleware, financialYearRoutes);
app.use('/api/account-groups', authMiddleware, companyMiddleware, accountGroupRoutes);
app.use('/api/ledgers', authMiddleware, companyMiddleware, ledgerRoutes);
app.use('/api/customers', authMiddleware, companyMiddleware, customerRoutes);
app.use('/api/suppliers', authMiddleware, companyMiddleware, supplierRoutes);
app.use('/api/vouchers', authMiddleware, companyMiddleware, voucherRoutes);
app.use('/api/invoices', authMiddleware, companyMiddleware, invoiceRoutes);
app.use('/api/reports', authMiddleware, companyMiddleware, reportRoutes);
app.use('/api/ledger-report', authMiddleware, companyMiddleware, ledgerReportRoutes);
app.use('/api/financial-statements', authMiddleware, companyMiddleware, financialStatementRoutes);
app.use('/api/stock', authMiddleware, companyMiddleware, stockRoutes);
app.use('/api/users', authMiddleware, companyMiddleware, userRoutes);
app.use('/api/dashboard', authMiddleware, companyMiddleware, dashboardRoutes);
module.exports = app;