import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

import logo from '../assets/logo.jpeg';

const Sidebar = () => {
  const { user, selectedCompany } = useAuth();
  const role = user?.role || 'admin';

  const navSections = [
    {
      title: 'Main',
      items: [
        { to: '/', label: 'Dashboard', icon: 'bi-grid-1x2-fill', roles: ['admin', 'accountant', 'viewer'] },
        { to: '/users', label: 'Users', icon: 'bi-people-fill', roles: ['admin'] },
      ]
    },
    {
      title: 'Masters',
      items: [
        { to: '/ledgers', label: 'Ledgers', icon: 'bi-book-half', roles: ['admin', 'accountant'] },
        { to: '/customers', label: 'Customers', icon: 'bi-person-badge', roles: ['admin', 'accountant'] },
        { to: '/suppliers', label: 'Suppliers', icon: 'bi-truck', roles: ['admin', 'accountant'] },
      ]
    },
    {
      title: 'Invoices',
      items: [
        { to: '/sales-invoice', label: 'Sales Invoice', icon: 'bi-file-earmark-plus', roles: ['admin', 'accountant'] },
        { to: '/purchase-invoice', label: 'Purchase Invoice', icon: 'bi-cart-plus', roles: ['admin', 'accountant'] },
      ]
    },
    {
      title: 'Vouchers',
      items: [
        { to: '/receipt-entry', label: 'Receipt Entry', icon: 'bi-arrow-down-left-circle', roles: ['admin', 'accountant'] },
        { to: '/payment-entry', label: 'Payment Entry', icon: 'bi-arrow-up-right-circle', roles: ['admin', 'accountant'] },
        { to: '/journal-voucher', label: 'Journal Voucher', icon: 'bi-journal-text', roles: ['admin', 'accountant'] },
      ]
    },
    {
      title: 'Registers',
      items: [
        { to: '/sales-invoices', label: 'Sales Register', icon: 'bi-card-list', roles: ['admin', 'accountant', 'viewer'] },
        { to: '/purchase-invoices', label: 'Purchase Register', icon: 'bi-cart-check', roles: ['admin', 'accountant', 'viewer'] },
      ]
    },
    {
      title: 'Reports',
      items: [
        { to: '/ledger-report', label: 'Ledger Report', icon: 'bi-file-earmark-text', roles: ['admin', 'accountant', 'viewer'] },
        { to: '/trial-balance', label: 'Trial Balance', icon: 'bi-calculator', roles: ['admin', 'accountant', 'viewer'] },
        { to: '/profit-loss', label: 'Profit & Loss', icon: 'bi-graph-up-arrow', roles: ['admin', 'accountant', 'viewer'] },
        { to: '/balance-sheet', label: 'Balance Sheet', icon: 'bi-layers-fill', roles: ['admin', 'accountant', 'viewer'] },
        { to: '/stock-on-hand', label: 'Stock On Hand', icon: 'bi-box-seam', roles: ['admin', 'accountant', 'viewer'] }
      ]
    }
  ];

  return (
    <motion.div
      className="light-card light-sidebar"
      style={{ overflowY: 'auto' }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="brand-section px-3 py-4 mb-3" style={{ 
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        background: 'rgba(255,255,255,0.4)',
        borderRadius: '12px 12px 0 0'
      }}>
        <div className="d-flex align-items-center gap-3">
          <img src={logo} alt="Logo" style={{ 
            width: '42px', 
            height: '42px', 
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            objectFit: 'cover'
          }} />
          <div className="brand-text">
            <h6 className="mb-0" style={{ 
              fontWeight: '800', 
              letterSpacing: '0.5px',
              color: '#1a202c',
              textTransform: 'uppercase',
              fontSize: '0.9rem'
            }}>{selectedCompany?.name || 'PrimeSupply'}</h6>
            <span style={{ 
              fontSize: '0.75rem', 
              color: '#718096', 
              fontWeight: '500',
              display: 'block',
              marginTop: '-2px'
            }}>Accounting System</span>
          </div>
        </div>
        
        {/* Company Switcher Trigger */}
        <div className="mt-3 px-2">
          <Link to="/select-company" className="text-decoration-none small text-primary fw-bold" style={{ fontSize: '0.7rem' }}>
            <i className="bi bi-arrow-left-right me-1"></i> SWITCH COMPANY
          </Link>
        </div>
      </div>

      <div className="sidebar-content">
        {navSections.map((section, sIdx) => {
          const sectionVisibleItems = section.items.filter(item => item.roles.includes(role));
          if (sectionVisibleItems.length === 0) return null;

          return (
            <div key={section.title} className="mb-3">
              <div className="sidebar-section-title">{section.title}</div>
              <ul className="nav flex-column px-2">
                {sectionVisibleItems.map((item, iIdx) => (
                  <motion.li
                    className="nav-item"
                    key={item.to}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (sIdx * 0.1) + (iIdx * 0.03), duration: 0.2 }}
                  >
                    <Link className="light-nav-link d-flex align-items-center gap-2" to={item.to}>
                      <i className={`bi ${item.icon}`}></i>
                      <span>{item.label}</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Sidebar;