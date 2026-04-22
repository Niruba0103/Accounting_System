import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.jpeg';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axiosInstance.post('/auth/login', formData);
      login(response.data.user, response.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="light-page d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fb 0%, #eef2ff 100%)' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="light-card p-5 shadow-lg" 
        style={{ maxWidth: '450px', width: '90%', borderRadius: '24px' }}
      >
        <div className="text-center mb-4">
          <img src={logo} alt="Logo" style={{ width: '80px', borderRadius: '16px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }} />
          <h3 className="mt-3 mb-1" style={{ fontWeight: '800', letterSpacing: '-0.5px' }}>PrimeSupply</h3>
          <p className="text-muted" style={{ fontSize: '0.9rem', fontWeight: '500' }}>Accounts Management System</p>
        </div>

        {error ? (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="alert light-alert mb-4"
          >
            {error}
          </motion.div>
        ) : null}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-control light-input"
              placeholder="name@company.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-2">
            <div className="d-flex justify-content-between">
              <label className="form-label">Password</label>
              <Link to="/reset-password" style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              name="password"
              className="form-control light-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button className="btn light-btn w-100 mt-4 py-2" type="submit" style={{ fontSize: '1rem' }}>
            Sign In
          </button>
        </form>

        <div className="text-center mt-4 pt-2 border-top">
          <p className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>
            Don't have an account? <Link to="/register" style={{ color: '#2563eb', fontWeight: '700', textDecoration: 'none' }}>Create Account</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;