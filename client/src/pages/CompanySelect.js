import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const CompanySelect = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const { selectedCompany, selectCompany, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axiosInstance.get('/auth/companies');
      setCompanies(response.data);
      
      // If user only has one company and none is selected, select it automatically
      if (response.data.length === 1 && !selectedCompany) {
        handleSelect(response.data[0]);
      }
    } catch (error) {
      console.error('Fetch companies error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (company) => {
    selectCompany(company);
    navigate('/');
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading companies...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="vh-60 d-flex align-items-center justify-content-center bg-light" style={{
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="light-card p-5 text-center"
        style={{ maxWidth: '600px', width: '90%', borderRadius: '24px' }}
      >
        <div className="mb-4">
          <div className="display-6 fw-bold text-primary mb-2">Welcome Back</div>
          <p className="text-muted">Select an organization to start managing your accounts</p>
        </div>

        <div className="row g-3 mt-2">
          {companies.map((company) => (
            <div className="col-12" key={company.id}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(company)}
                className="btn w-100 p-4 text-start d-flex align-items-center justify-content-between"
                style={{
                  background: 'white',
                  border: '1px solid rgba(0,0,0,0.05)',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
                  borderRadius: '16px'
                }}
              >
                <div>
                  <h5 className="mb-1 text-dark fw-bold">{company.name}</h5>
                  <span className="badge bg-soft-primary text-primary text-uppercase" style={{ fontSize: '0.7rem' }}>
                    {company.role}
                  </span>
                </div>
                <i className="bi bi-chevron-right text-muted"></i>
              </motion.button>
            </div>
          ))}

          {companies.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">You are not associated with any companies yet.</p>
              <button className="btn btn-primary" onClick={() => navigate('/create-company')}>
                Create First Company
              </button>
            </div>
          ) : (
            <div className="col-12 mt-3">
              <button 
                onClick={() => navigate('/create-company')}
                className="btn btn-outline-primary w-100 p-3"
                style={{
                  borderStyle: 'dashed',
                  borderRadius: '16px',
                  fontWeight: 'bold'
                }}
              >
                <i className="bi bi-plus-circle me-2"></i>Create New Organization
              </button>
            </div>
          )}
        </div>

        <div className="mt-5 border-top pt-4">
          <button className="btn btn-link text-muted text-decoration-none" onClick={logout}>
            <i className="bi bi-box-arrow-left me-2"></i>Logout
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CompanySelect;
