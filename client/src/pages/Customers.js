import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '../api/axiosInstance';
import ReportActions from '../components/ReportActions';
import { useNavigate } from 'react-router-dom';
const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [ledgers, setLedgers] = useState([]);
  const [formData, setFormData] = useState({
    customer_code: '',
    name: '',
    phone: '',
    email: '',
    address: '',
    ledger_id: ''
  });

  useEffect(() => {
    fetchLedgers();
    fetchCustomers();
  }, []);

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

  const fetchCustomers = async () => {
    try {
      const response = await axiosInstance.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Fetch customers error:', error);
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
      await axiosInstance.post('/customers', {
        ...formData,
        ledger_id: formData.ledger_id ? Number(formData.ledger_id) : null
      });

      window.dispatchEvent(new Event('dashboard-refresh'));

      setFormData({
        customer_code: '',
        name: '',
        phone: '',
        email: '',
        address: '',
        ledger_id: ''
      });

      fetchCustomers();
    } catch (error) {
      console.error('Create customer error:', error);
      alert(error.response?.data?.message || 'Error creating customer');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await axiosInstance.delete(`/customers/${id}`);
      fetchCustomers();
    } catch (error) {
      console.error('Delete customer error:', error);
      alert(error.response?.data?.message || 'Error deleting customer');
    }
  };
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Customers</h2>
        <ReportActions 
          title="Customers List"
          fileName="Customers"
          head={[['Code', 'Name', 'Phone', 'Email', 'Address']]}
          body={customers.map(c => [c.customer_code, c.name, c.phone, c.email, c.address])}
          data={customers.map(c => ({
            code: c.customer_code,
            name: c.name,
            phone: c.phone,
            email: c.email,
            address: c.address
          }))}
        />
      </div>

      <div className="light-card p-4 mb-4">
        <form className="row g-3" onSubmit={handleSubmit}>
          <div className="col-md-2">
            <label>Code</label>
            <input type="text" name="customer_code" className="form-control light-input" value={formData.customer_code} onChange={handleChange} />
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
            <label>Ledger</label>
            <select name="ledger_id" className="form-control light-input" value={formData.ledger_id} onChange={handleChange}>
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
            <input type="text" name="address" className="form-control light-input" value={formData.address} onChange={handleChange} />
          </div>

          <div className="col-md-3 d-flex align-items-end">
            <button className="btn light-btn w-100" type="submit">
              Add Customer
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
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.customer_code}</td>
                <td>{customer.name}</td>
                <td>{customer.phone}</td>
                <td>{customer.email}</td>
                <td>{customer.address}</td>
                <td className="d-flex gap-2">
                  <button className="btn btn-sm btn-primary" onClick={() => navigate(`/customer/${customer.id}/edit`)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(customer.id)}>Delete</button>
                </td>
               </tr>
            ))}

            {customers.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center">No customers found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default Customers;