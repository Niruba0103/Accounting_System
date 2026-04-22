import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axiosInstance from '../api/axiosInstance';
import logo from '../assets/logo.jpeg';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'accountant',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

    try {
      await axiosInstance.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        password: formData.password
      });
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
          <p className="text-muted" style={{ fontSize: '0.9rem', fontWeight: '500' }}>Create New Account</p>
        </div>

        {error ? <div className="alert light-alert mb-4">{error}</div> : null}
        {success ? <div className="alert alert-success mb-4">{success}</div> : null}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              className="form-control light-input"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
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

          <div className="mb-3">
            <label className="form-label">Role</label>
            <select
              name="role"
              className="form-control light-select"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="admin">Admin</option>
              <option value="accountant">Accountant</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
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

          <div className="mb-4">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-control light-input"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button className="btn light-btn w-100 py-2" type="submit" style={{ fontSize: '1rem' }}>
            Register Now
          </button>
        </form>

        <div className="text-center mt-4 pt-2 border-top">
          <p className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>
            Already have an account? <Link to="/login" style={{ color: '#2563eb', fontWeight: '700', textDecoration: 'none' }}>Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
