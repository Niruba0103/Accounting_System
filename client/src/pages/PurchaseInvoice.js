import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const PurchaseInvoice = () => {
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    party_type: 'SUPPLIER',
    party_id: '',
    invoice_date: '',
    due_date: '',
    tax_amount: 0,
    discount_amount: 0,
    remarks: '',
    items: [{ item_name: '', qty: 1, unit_price: 0 }]
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;

    setFormData({
      ...formData,
      items: updatedItems
    });
  };

  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { item_name: '', qty: 1, unit_price: 0 }]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axiosInstance.post('/invoices/purchase', {
        ...formData,
        party_id: Number(formData.party_id),
        tax_amount: Number(formData.tax_amount),
        discount_amount: Number(formData.discount_amount),
        items: formData.items.map((item) => ({
          item_name: item.item_name,
          qty: Number(item.qty),
          unit_price: Number(item.unit_price)
        }))
      });

      window.dispatchEvent(new Event('dashboard-refresh'));
      alert('Purchase invoice created successfully');
      navigate('/');

      setFormData({
        party_type: 'SUPPLIER',
        party_id: '',
        invoice_date: '',
        due_date: '',
        tax_amount: 0,
        discount_amount: 0,
        remarks: '',
        items: [{ item_name: '', qty: 1, unit_price: 0 }]
      });
    } catch (error) {
      console.error('Create purchase invoice error:', error);
      alert(error.response?.data?.message || 'Error creating purchase invoice');
    }
  };

  return (
    <div>
      <h2>Purchase Invoice</h2>

      <form onSubmit={handleSubmit}>
        <div className="light-card p-4 mb-4">
          <div className="row g-3">
            <div className="col-md-4">
              <label>Supplier</label>
              <select
                name="party_id"
                className="form-control light-select"
                value={formData.party_id}
                onChange={handleChange}
              >
                <option value="">Select Supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label>Invoice Date</label>
              <input
                type="date"
                name="invoice_date"
                className="form-control light-input"
                value={formData.invoice_date}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <label>Due Date</label>
              <input
                type="date"
                name="due_date"
                className="form-control light-input"
                value={formData.due_date}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-3">
              <label>Tax Amount</label>
              <input
                type="number"
                name="tax_amount"
                className="form-control light-input"
                value={formData.tax_amount}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-3">
              <label>Discount Amount</label>
              <input
                type="number"
                name="discount_amount"
                className="form-control light-input"
                value={formData.discount_amount}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label>Remarks</label>
              <input
                type="text"
                name="remarks"
                className="form-control light-input"
                value={formData.remarks}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="light-card p-4 mb-4">
          <h5 className="mb-4">Items</h5>

          {formData.items.map((item, index) => (
            <div className="row g-3 mb-3" key={index}>
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control light-input"
                  placeholder="Item Name"
                  value={item.item_name}
                  onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                />
              </div>

              <div className="col-md-3">
                <input
                  type="number"
                  className="form-control light-input"
                  placeholder="Qty"
                  value={item.qty}
                  onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                />
              </div>

              <div className="col-md-3">
                <input
                  type="number"
                  className="form-control light-input"
                  placeholder="Unit Price"
                  value={item.unit_price}
                  onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                />
              </div>
            </div>
          ))}

          <div className="mt-4 d-flex gap-2">
            <button type="button" className="btn light-btn light-btn-secondary" onClick={addItemRow}>
              + Add Item
            </button>

            <button type="submit" className="btn light-btn">
              Save Purchase Invoice
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PurchaseInvoice;