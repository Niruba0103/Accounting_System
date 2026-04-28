import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axiosInstance from '../api/axiosInstance';
import logo from '../assets/logo.jpeg';

const ResetPassword = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post('/auth/reset-password', {
        email: formData.email,
        password: formData.password
      });
      setSuccess('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3" 
      style={{ 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-100"
        style={{ maxWidth: '480px' }}
      >
        {/* Card Container */}
        <div className="bg-white rounded-4 shadow-lg p-5" style={{ backdropFilter: 'blur(10px)' }}>
          {/* Header */}
          <div className="text-center mb-5">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <img src={logo} alt="Logo" style={{ width: '80px', borderRadius: '16px', marginBottom: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
            </motion.div>
            <h1 className="fw-bold mb-2" style={{ fontSize: '2rem', color: '#1a1a1a', letterSpacing: '-0.5px' }}>
              Reset Password
            </h1>
            <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
              Enter your email and new password to regain access
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="alert alert-danger py-3 px-4 mb-4 border-0 rounded-3"
              style={{ 
                fontSize: '0.9rem',
                backgroundColor: '#fee',
                color: '#c33',
                borderLeft: '4px solid #c33'
              }}
            >
              <span>⚠️ {error}</span>
            </motion.div>
          )}

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="alert alert-success py-3 px-4 mb-4 border-0 rounded-3"
              style={{ 
                fontSize: '0.9rem',
                backgroundColor: '#efe',
                color: '#3a3',
                borderLeft: '4px solid #3a3'
              }}
            >
              <span>✓ {success}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="mb-4">
              <label className="form-label fw-semibold text-dark mb-2" style={{ fontSize: '0.9rem' }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                className="form-control border-0 px-4 py-3"
                placeholder="you@company.com"
                style={{ 
                  fontSize: '0.95rem',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '10px',
                  transition: 'all 0.3s ease',
                  border: '1px solid #e0e0e0'
                }}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* New Password Field */}
            <div className="mb-3">
              <label className="form-label fw-semibold text-dark mb-2" style={{ fontSize: '0.9rem' }}>
                New Password
              </label>
              <input
                type="password"
                name="password"
                className="form-control border-0 px-4 py-3"
                placeholder="••••••••••••"
                style={{ 
                  fontSize: '0.95rem',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '10px',
                  transition: 'all 0.3s ease',
                  border: '1px solid #e0e0e0'
                }}
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* Confirm Password Field */}
            <div className="mb-4">
              <label className="form-label fw-semibold text-dark mb-2" style={{ fontSize: '0.9rem' }}>
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control border-0 px-4 py-3"
                placeholder="••••••••••••"
                style={{ 
                  fontSize: '0.95rem',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '10px',
                  transition: 'all 0.3s ease',
                  border: '1px solid #e0e0e0'
                }}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            {/* Submit Button */}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn btn-primary w-100 py-3 fw-bold rounded-3 mb-4"
              type="submit"
              disabled={loading}
              style={{ 
                fontSize: '0.95rem',
                background: loading ? '#ccc' : 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                border: 'none',
                boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)',
                letterSpacing: '0.5px'
              }}
            >
              {loading ? 'Updating Password...' : 'Update Password'}
            </motion.button>
          </form>

          {/* Footer Link */}
          <div className="text-center pt-4 border-top border-light">
            <p className="mb-0" style={{ fontSize: '0.9rem', color: '#666' }}>
              Ready to sign in?{' '}
              <Link to="/login" style={{ color: '#2563eb', fontWeight: '700', textDecoration: 'none' }}>
                Go to Login
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;

