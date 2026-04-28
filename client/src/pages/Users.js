import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '../api/axiosInstance';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'viewer'
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Fetch users error:', error);
      alert(error.response?.data?.message || 'Error loading users');
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await axiosInstance.put(`/users/${editingId}`, formData);
        alert('User updated successfully');
      } else {
        await axiosInstance.post('/users', formData);
        alert('User created successfully');
      }

      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'viewer'
      });
      setEditingId(null);

      fetchUsers();
    } catch (error) {
      console.error('Save user error:', error);
      alert(error.response?.data?.message || 'Error saving user');
    }
  };

  const handleEdit = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Leave password empty when editing unless they want to change it
      role: user.role
    });
    setEditingId(user.id);
  };

  const handleCancelEdit = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'viewer'
    });
    setEditingId(null);
  };

  const handleRoleChange = async (id, role) => {
    try {
      await axiosInstance.put(`/users/${id}/role`, { role });
      fetchUsers();
    } catch (error) {
      console.error('Update role error:', error);
      alert(error.response?.data?.message || 'Error updating role');
    }
  };



  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <h2 className="mb-4">User Management</h2>

      <div className="light-card p-4 mb-4">
        <form className="row g-3" onSubmit={handleCreateUser}>
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

          <div className="col-md-3">
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
            <label>Password</label>
            <input
              type="password"
              name="password"
              className="form-control light-input"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-2">
            <label>Role</label>
            <select
              name="role"
              className="form-control light-select"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="admin">admin</option>
              <option value="accountant">accountant</option>
              <option value="viewer">viewer</option>
            </select>
          </div>

          <div className="col-md-2 d-flex align-items-end gap-2">
            <button className="btn light-btn w-100" type="submit">
              {editingId ? 'Update User' : 'Add User'}
            </button>
            {editingId && (
              <button className="btn btn-secondary w-100" type="button" onClick={handleCancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="light-card light-table-wrap p-3">
        <table className="table light-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td style={{ width: '180px' }}>
                  <select
                    className="form-control light-select"
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  >
                    <option value="admin">admin</option>
                    <option value="accountant">accountant</option>
                    <option value="viewer">viewer</option>
                  </select>
                </td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn light-btn btn-sm"
                    onClick={() => handleEdit(user)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default Users;