import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';
import CompanyProtectedRoute from './components/CompanyProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Ledgers from './pages/Ledgers';
import Customers from './pages/Customers';
import Suppliers from './pages/Suppliers';
import SalesInvoice from './pages/SalesInvoice';
import PurchaseInvoice from './pages/PurchaseInvoice';
import SalesInvoiceList from './pages/SalesInvoiceList';
import PurchaseInvoiceList from './pages/PurchaseInvoiceList';
import InvoiceDetail from './pages/InvoiceDetail';
import ReceiptEntry from './pages/ReceiptEntry';
import PaymentEntry from './pages/PaymentEntry';
import JournalVoucher from './pages/JournalVoucher';
import LedgerReport from './pages/LedgerReport';
import TrialBalance from './pages/TrialBalance';
import ProfitLoss from './pages/ProfitLoss';
import BalanceSheet from './pages/BalanceSheet';
import StockOnHand from './pages/StockOnHand';
import Users from './pages/Users';
import EditInvoice from './pages/EditInvoice';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import EditSupplier from './pages/EditSupplier';
import EditCustomer from './pages/EditCustomer';
import CompanySelect from './pages/CompanySelect';
import CreateCompany from './pages/CreateCompany';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Company Selection/Creation - Requires Auth but NOT Company context */}
        <Route 
          path="/select-company" 
          element={
            <ProtectedRoute>
              <CompanySelect />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/create-company" 
          element={
            <ProtectedRoute>
              <CreateCompany />
            </ProtectedRoute>
          } 
        />

        {/* All operational routes require BOTH Auth and Company selection */}
        <Route
          path="/"
          element={
            <CompanyProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </CompanyProtectedRoute>
          }
        />

        <Route
          path="/ledgers"
          element={
            <CompanyProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'accountant']}>
                <Layout>
                  <Ledgers />
                </Layout>
              </RoleProtectedRoute>
            </CompanyProtectedRoute>
          }
        />

        <Route
          path="/customers"
          element={
            <CompanyProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'accountant']}>
                <Layout>
                  <Customers />
                </Layout>
              </RoleProtectedRoute>
            </CompanyProtectedRoute>
          }
        />

        <Route
          path="/suppliers"
          element={
            <CompanyProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'accountant']}>
                <Layout>
                  <Suppliers />
                </Layout>
              </RoleProtectedRoute>
            </CompanyProtectedRoute>
          }
        />

        <Route
          path="/sales-invoice"
          element={
            <CompanyProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'accountant']}>
                <Layout>
                  <SalesInvoice />
                </Layout>
              </RoleProtectedRoute>
            </CompanyProtectedRoute>
          }
        />

        <Route
          path="/purchase-invoice"
          element={
            <CompanyProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'accountant']}>
                <Layout>
                  <PurchaseInvoice />
                </Layout>
              </RoleProtectedRoute>
            </CompanyProtectedRoute>
          }
        />

        <Route
          path="/sales-invoices"
          element={
            <CompanyProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'accountant', 'viewer']}>
                <Layout>
                  <SalesInvoiceList />
                </Layout>
              </RoleProtectedRoute>
            </CompanyProtectedRoute>
          }
        />

        <Route
          path="/purchase-invoices"
          element={
            <CompanyProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'accountant', 'viewer']}>
                <Layout>
                  <PurchaseInvoiceList />
                </Layout>
              </RoleProtectedRoute>
            </CompanyProtectedRoute>
          }
        />

        <Route
          path="/invoice/:id"
          element={
            <CompanyProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'accountant', 'viewer']}>
                <Layout>
                  <InvoiceDetail />
                </Layout>
              </RoleProtectedRoute>
            </CompanyProtectedRoute>
          }
        />

        <Route
          path="/receipt-entry"
          element={
            <CompanyProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'accountant']}>
                <Layout>
                  <ReceiptEntry />
                </Layout>
              </RoleProtectedRoute>
            </CompanyProtectedRoute>
          }
        />

        <Route
          path="/payment-entry"
          element={
            <CompanyProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'accountant']}>
                <Layout>
                  <PaymentEntry />
                </Layout>
              </RoleProtectedRoute>
            </CompanyProtectedRoute>
          }
        />

        <Route
          path="/journal-voucher"
          element={
            <CompanyProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'accountant']}>
                <Layout>
                  <JournalVoucher />
                </Layout>
              </RoleProtectedRoute>
            </CompanyProtectedRoute>
          }
        />

        <Route
          path="/ledger-report"
          element={
            <CompanyProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'accountant', 'viewer']}>
                <Layout>
                  <LedgerReport />
                </Layout>
              </RoleProtectedRoute>
            </CompanyProtectedRoute>
          }
        />

        <Route
          path="/trial-balance"
          element={
            <CompanyProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'accountant', 'viewer']}>
                <Layout>
                  <TrialBalance />
                </Layout>
              </RoleProtectedRoute>
            </CompanyProtectedRoute>
          }
        />

        <Route
          path="/profit-loss"
          element={
            <CompanyProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'accountant', 'viewer']}>
                <Layout>
                  <ProfitLoss />
                </Layout>
              </RoleProtectedRoute>
            </CompanyProtectedRoute>
          }
        />

        <Route
          path="/balance-sheet"
          element={
            <CompanyProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'accountant', 'viewer']}>
                <Layout>
                  <BalanceSheet />
                </Layout>
              </RoleProtectedRoute>
            </CompanyProtectedRoute>
          }
        />

        <Route
          path="/stock-on-hand"
          element={
            <CompanyProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'accountant', 'viewer']}>
                <Layout>
                  <StockOnHand />
                </Layout>
              </RoleProtectedRoute>
            </CompanyProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <CompanyProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <Users />
                </Layout>
              </RoleProtectedRoute>
            </CompanyProtectedRoute>
          }
        />
        <Route
          path="/invoice/:id/edit"
          element={
            <CompanyProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'accountant']}>
                <Layout>
                  <EditInvoice />
                </Layout>
              </RoleProtectedRoute>
            </CompanyProtectedRoute>
          }
        />
        <Route
          path="/supplier/:id/edit"
          element={
            <CompanyProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'accountant']}>
                <Layout>
                  <EditSupplier />
                </Layout>
              </RoleProtectedRoute>
            </CompanyProtectedRoute>
          }
        />
        <Route
          path="/customer/:id/edit"
          element={
            <CompanyProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'accountant']}>
                <Layout>
                  <EditCustomer />
                </Layout>
              </RoleProtectedRoute>
            </CompanyProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;