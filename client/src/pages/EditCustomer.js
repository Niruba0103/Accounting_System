import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axiosInstance from '../api/axiosInstance';

const EditCustomer = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customer_code: '',
    name: '',
    phone: '',
    email: '',
    address: '',
    ledger_id: ''
  });

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const response = await axiosInstance.get(`/customers/${id}`);
      const data = response.data;

      setFormData({
        customer_code: data.customer_code || '',
        name: data.name || '',
        phone: data.phone || '',
        email: data.email || '',
        address: data.address || '',
        ledger_id: data.ledger_id || ''
      });
    } catch (error) {
      console.error('Fetch customer error:', error);
      alert('Failed to load customer');
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      await axiosInstance.put(`/customers/${id}`, {
        ...formData,
        ledger_id: formData.ledger_id ? Number(formData.ledger_id) : null
      });

      window.dispatchEvent(new Event('dashboard-refresh'));
      navigate('/customers');
    } catch (error) {
      console.error('Update customer error:', error);
      alert(error.response?.data?.message || 'Error updating customer');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <h2 className="mb-4">Edit Customer</h2>

      <div className="light-card p-4">
        <form className="row g-3" onSubmit={handleUpdate}>
          <div className="col-md-2">
            <label>Code</label>
            <input
              type="text"
              name="customer_code"
              className="form-control light-input"
              value={formData.customer_code}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-3">
            <label>Name</label>
            <input
              type="text"
              name="name"
              className="form-control light-input"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-2">
            <label>Phone</label>
            <input
              type="text"
              name="phone"
              className="form-control light-input"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-2">
            <label>Email</label>
            <input
              type="email"
              name="email"
              className="form-control light-input"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-2">
            <label>Ledger ID</label>
            <input
              type="number"
              name="ledger_id"
              className="form-control light-input"
              value={formData.ledger_id}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-9">
            <label>Address</label>
            <input
              type="text"
              name="address"
              className="form-control light-input"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-3 d-flex align-items-end">
            <button className="btn light-btn w-100" type="submit">
              Update Customer
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default EditCustomer;