import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '../api/axiosInstance';
import ReportActions from '../components/ReportActions';

const Ledgers = () => {
  const [ledgers, setLedgers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    ledger_code: '',
    ledger_name: '',
    group_id: '',
    opening_balance: '',
    opening_balance_type: 'Dr'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ledgerRes, groupRes] = await Promise.all([
        axiosInstance.get('/ledgers'),
        axiosInstance.get('/account-groups')
      ]);
      setLedgers(ledgerRes.data);
      setGroups(groupRes.data);
    } catch (error) {
      console.error('Fetch data error:', error);
    } finally {
      setLoading(false);
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

    if (!formData.group_id) {
      alert('Please select an Account Group');
      return;
    }

    try {
      await axiosInstance.post('/ledgers', {
        ...formData,
        group_id: Number(formData.group_id),
        opening_balance: Number(formData.opening_balance || 0)
      });

      window.dispatchEvent(new Event('dashboard-refresh'));

      setFormData({
        ledger_code: '',
        ledger_name: '',
        group_id: '',
        opening_balance: '',
        opening_balance_type: 'Dr'
      });

      fetchData();
    } catch (error) {
      console.error('Create ledger error:', error);
      alert(error.response?.data?.message || 'Error creating ledger');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ledger?')) return;
    try {
      await axiosInstance.delete(`/ledgers/${id}`);
      fetchData();
    } catch (error) {
      console.error('Delete ledger error:', error);
      alert(error.response?.data?.message || 'Error deleting ledger');
    }
  };

  if (loading) return <div className="p-4">Loading ledgers...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0">Chart of Accounts</h2>
          <p className="text-muted small">Manage your ledgers and account groups</p>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <ReportActions 
            title="Chart of Accounts / Ledgers"
            fileName="Ledgers"
            head={[['Code', 'Name', 'Group', 'Opening Bal', 'Type']]}
            body={ledgers.map(l => [l.ledger_code, l.ledger_name, l.group_name, l.opening_balance, l.opening_balance_type])}
            data={ledgers.map(l => ({
              code: l.ledger_code,
              name: l.ledger_name,
              group: l.group_name,
              opening_balance: l.opening_balance,
              type: l.opening_balance_type
            }))}
          />
          <button className="btn light-btn" onClick={fetchData}>
            <i className="bi bi-arrow-clockwise"></i> Refresh
          </button>
        </div>
      </div>

      {/* CREATE FORM */}
      <div className="light-card p-4 mb-4">
        <h5 className="mb-3">Create New Ledger</h5>
        <form className="row g-3" onSubmit={handleSubmit}>
          
          <div className="col-md-2">
            <label className="form-label small fw-bold">Code</label>
            <input
              type="text"
              name="ledger_code"
              className="form-control light-input"
              value={formData.ledger_code}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-3">
            <label className="form-label small fw-bold">Ledger Name</label>
            <input
              type="text"
              name="ledger_name"
              className="form-control light-input"
              value={formData.ledger_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-3">
            <label className="form-label small fw-bold">Account Group</label>
            <select
              name="group_id"
              className="form-control light-input"
              value={formData.group_id}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Group --</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.group_name} ({g.nature})</option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-bold">Opening Balance</label>
            <input
              type="number"
              name="opening_balance"
              className="form-control light-input"
              value={formData.opening_balance}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-bold">Type</label>
            <select
              name="opening_balance_type"
              className="form-control light-input"
              value={formData.opening_balance_type}
              onChange={handleChange}
            >
              <option value="Dr">Dr</option>
              <option value="Cr">Cr</option>
            </select>
          </div>

          <div className="col-md-12 mt-4">
            <button className="btn light-btn w-100 py-2 fw-bold" type="submit">
              <i className="bi bi-plus-circle me-2"></i>Create Ledger
            </button>
          </div>

        </form>
      </div>

      {/* TABLE */}
      <div className="light-card light-table-wrap p-3">
        <table className="table light-table mb-0">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Group</th>
              <th>Opening Balance</th>
              <th>Type</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {ledgers.map((ledger) => (
              <tr key={ledger.id}>
                <td className="fw-medium text-primary">{ledger.ledger_code}</td>
                <td>{ledger.ledger_name}</td>
                <td>
                  <span className="badge bg-light text-dark border">{ledger.group_name}</span>
                </td>
                <td>{Number(ledger.opening_balance).toLocaleString()}</td>
                <td>
                  <span className={`badge ${ledger.opening_balance_type === 'Dr' ? 'text-success' : 'text-danger'}`}>
                    {ledger.opening_balance_type}
                  </span>
                </td>
                <td className="text-center">
                  <button 
                    className="btn btn-sm btn-outline-danger border-0" 
                    onClick={() => handleDelete(ledger.id)}
                    title="Delete Ledger"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}

            {ledgers.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-4 text-muted">
                  No ledgers found. Create your first ledger using the form above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </motion.div>
  );
};

export default Ledgers;