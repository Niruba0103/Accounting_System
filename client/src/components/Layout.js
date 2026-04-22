import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="light-page">
      <div className="d-flex light-layout">
        <Sidebar />

        <div className="light-main">
          <motion.div
            className="light-card light-topbar d-flex justify-content-between align-items-center"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div>
              <h5 className="mb-0">Welcome, {user ? user.name : 'User'}</h5>
              <small>{user?.role ? `Role: ${user.role}` : ''}</small>
            </div>

            <div className="d-flex gap-2">
              <button
                className="btn light-btn light-btn-secondary btn-sm mode-toggle"
                onClick={toggleTheme}
              >
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </button>

              <button
                className="btn light-btn light-btn-danger btn-sm"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </motion.div>

          <motion.div
            className="light-card light-content"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Layout;