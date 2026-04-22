import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '../api/axiosInstance';
import ReportActions from '../components/ReportActions';
import { useNavigate } from 'react-router-dom';


const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    supplier_code: '',
    name: '',
    phone: '',
    email: '',
    address: '',
    ledger_id: ''
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await axiosInstance.get('/suppliers');
      setSuppliers(response.data);
    } catch (error) {
      console.error('Fetch suppliers error:', error);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axiosInstance.post('/suppliers', {
        ...formData,
        ledger_id: formData.ledger_id ? Number(formData.ledger_id) : null
      });

      window.dispatchEvent(new Event('dashboard-refresh'));

      setFormData({
        supplier_code: '',
        name: '',
        phone: '',
        email: '',
        address: '',
        ledger_id: ''
      });

      fetchSuppliers();
    } catch (error) {
      console.error('Create supplier error:', error);
      alert(error.response?.data?.message || 'Error creating supplier');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return;
    try {
      await axiosInstance.delete(`/suppliers/${id}`);
      fetchSuppliers();
    } catch (error) {
      console.error('Delete supplier error:', error);
      alert(error.response?.data?.message || 'Error deleting supplier');
    }
  };

  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Suppliers</h2>
        <ReportActions 
          title="Suppliers List"
          fileName="Suppliers"
          head={[['Code', 'Name', 'Phone', 'Email', 'Address']]}
          body={suppliers.map(s => [s.supplier_code, s.name, s.phone, s.email, s.address])}
          data={suppliers.map(s => ({
            code: s.supplier_code,
            name: s.name,
            phone: s.phone,
            email: s.email,
            address: s.address
          }))}
        />
      </div>

      <div className="light-card p-4 mb-4">
        <form className="row g-3" onSubmit={handleSubmit}>
          <div className="col-md-2">
            <label>Code</label>
            <input type="text" name="supplier_code" className="form-control light-input" value={formData.supplier_code} onChange={handleChange} />
          </div>

          <div className="col-md-3">
            <label>Name</label>
            <input type="text" name="name" className="form-control light-input" value={formData.name} onChange={handleChange} />
          </div>

          <div className="col-md-2">
            <label>Phone</label>
            <input type="text" name="phone" className="form-control light-input" value={formData.phone} onChange={handleChange} />
          </div>

          <div className="col-md-2">
            <label>Email</label>
            <input type="email" name="email" className="form-control light-input" value={formData.email} onChange={handleChange} />
          </div>

          <div className="col-md-2">
            <label>Ledger ID</label>
            <input type="number" name="ledger_id" className="form-control light-input" value={formData.ledger_id} onChange={handleChange} />
          </div>

          <div className="col-md-9">
            <label>Address</label>
            <input type="text" name="address" className="form-control light-input" value={formData.address} onChange={handleChange} />
          </div>

          <div className="col-md-3 d-flex align-items-end">
            <button className="btn light-btn w-100" type="submit">
              Add Supplier
            </button>
          </div>
        </form>
      </div>

      <div className="light-card light-table-wrap p-3">
        <table className="table light-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <tr key={supplier.id}>
                <td>{supplier.supplier_code}</td>
                <td>{supplier.name}</td>
                <td>{supplier.phone}</td>
                <td>{supplier.email}</td>
                <td>{supplier.address}</td>
                <td className="d-flex gap-2">
                  <button className="btn btn-sm btn-primary" onClick={() => navigate(`/supplier/${supplier.id}/edit`)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(supplier.id)}>Delete</button>
                </td>
               </tr>
            ))}
            {suppliers.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center">No suppliers found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default Suppliers;