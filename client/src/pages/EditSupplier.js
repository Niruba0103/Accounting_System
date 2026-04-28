import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axiosInstance from '../api/axiosInstance';

const EditSupplier = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    supplier_code: '',
    name: '',
    phone: '',
    email: '',
    address: '',
    ledger_id: ''
  });
  const [ledgers, setLedgers] = useState([]);

  useEffect(() => {
    fetchLedgers();
    fetchSupplier();
  }, [id]);

  const fetchLedgers = async () => {
    try {
      const response = await axiosInstance.get('/ledgers');
      console.log('Fetched ledgers:', response.data);
      setLedgers(response.data);
    } catch (error) {
      console.error('Fetch ledgers error:', error);
      alert('Failed to load ledgers. Please try again.');
    }
  };

  const fetchSupplier = async () => {
    try {
      const response = await axiosInstance.get(`/suppliers/${id}`);
      const data = response.data;

      setFormData({
        supplier_code: data.supplier_code || '',
        name: data.name || '',
        phone: data.phone || '',
        email: data.email || '',
        address: data.address || '',
        ledger_id: data.ledger_id || ''
      });
    } catch (error) {
      console.error('Fetch supplier error:', error);
      alert('Failed to load supplier');
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
      await axiosInstance.put(`/suppliers/${id}`, {
        ...formData,
        ledger_id: formData.ledger_id ? Number(formData.ledger_id) : null
      });

      window.dispatchEvent(new Event('dashboard-refresh'));
      navigate('/suppliers');
    } catch (error) {
      console.error('Update supplier error:', error);
      alert(error.response?.data?.message || 'Error updating supplier');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <h2 className="mb-4">Edit Supplier</h2>

      <div className="light-card p-4">
        <form className="row g-3" onSubmit={handleUpdate}>
          <div className="col-md-2">
            <label>Code</label>
            <input
              type="text"
              name="supplier_code"
              className="form-control light-input"
              value={formData.supplier_code}
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
            <label>Ledger</label>
            <select
              name="ledger_id"
              className="form-control light-input"
              value={formData.ledger_id}
              onChange={handleChange}
            >
              <option value="">-- Select Ledger --</option>
              {ledgers && ledgers.length > 0 ? (
                ledgers.map((ledger) => (
                  <option key={ledger.id} value={ledger.id}>
                    {ledger.ledger_name}
                  </option>
                ))
              ) : (
                <option disabled>No ledgers available</option>
              )}
            </select>
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
              Update Supplier
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default EditSupplier;