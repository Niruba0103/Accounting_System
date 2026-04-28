import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const CreateCompany = () => {
  const [formData, setFormData] = useState({
    name: '',
    tax_id: '',
    address: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const { selectCompany } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axiosInstance.post('/companies', formData);
      // Automatically select the newly created company
      selectCompany(response.data.company);
      navigate('/');
    } catch (error) {
      console.error('Create company error:', error);
      alert(error.response?.data?.message || 'Error creating company');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vh-60 d-flex align-items-center justify-content-center bg-light" style={{
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="light-card p-5"
        style={{ maxWidth: '600px', width: '90%', borderRadius: '24px' }}
      >
        <div className="text-center mb-4">
          <h2 className="fw-bold text-primary">Create Your Organization</h2>
          <p className="text-muted">Set up your business profile to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-12">
            <label className="form-label fw-bold small">Company Name *</label>
            <input
              type="text"
              name="name"
              className="form-control light-input"
              placeholder="e.g. My Awesome Business"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold small">Tax / VAT ID</label>
            <input
              type="text"
              name="tax_id"
              className="form-control light-input"
              value={formData.tax_id}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold small">Phone</label>
            <input
              type="text"
              name="phone"
              className="form-control light-input"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="col-12">
            <label className="form-label fw-bold small">Official Email</label>
            <input
              type="email"
              name="email"
              className="form-control light-input"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="col-12">
            <label className="form-label fw-bold small">Address</label>
            <textarea
              name="address"
              className="form-control light-input"
              rows="2"
              value={formData.address}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="col-12 mt-4">
            <button 
              type="submit" 
              className="btn btn-primary w-100 py-3 fw-bold" 
              disabled={loading}
              style={{ borderRadius: '12px' }}
            >
              {loading ? 'Creating...' : 'Launch Organization'}
            </button>
            <button 
              type="button" 
              className="btn btn-link w-100 mt-2 text-muted text-decoration-none small"
              onClick={() => navigate('/select-company')}
            >
              Back to Selection
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateCompany;
