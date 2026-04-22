import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const SalesInvoice = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);

  const [formData, setFormData] = useState({
    party_type: 'CUSTOMER',
    party_id: '',
    invoice_date: '',
    due_date: '',
    tax_amount: '',
    discount_amount: '',
    remarks: '',
    items: [{ item_name: '', qty: '', unit_price: '' }]
  });

  // fetch customers
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axiosInstance.get('/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
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
      items: [...formData.items, { item_name: '', qty: '', unit_price: '' }]
    });
  };

  const removeItemRow = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  // 🔥 CALCULATIONS
  const calculateItemTotal = (item) => {
    return Number(item.qty) * Number(item.unit_price);
  };

  const subTotal = formData.items.reduce(
    (sum, item) => sum + calculateItemTotal(item),
    0
  );

  const finalTotal =
    subTotal +
    Number(formData.tax_amount) -
    Number(formData.discount_amount);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axiosInstance.post('/invoices/sales', {
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

      alert('Sales invoice created successfully');
      navigate('/');

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Error');
    }
  };

  return (
    <div>
      <h2>Sales Invoice</h2>

      <form onSubmit={handleSubmit}>
        <div className="light-card p-4 mb-4">
          <div className="row g-3">
            <div className="col-md-4">
              <label>Customer</label>
              <select
                name="party_id"
                className="form-control light-select"
                value={formData.party_id}
                onChange={handleChange}
              >
                <option value="">Select Customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
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
          </div>
        </div>

        {/* ITEMS */}
        <div className="light-card p-4 mb-4">
          <h5 className="mb-4">Items</h5>

          {formData.items.map((item, index) => (
            <div className="row g-3 mb-3" key={index}>
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control light-input"
                  placeholder="Item Name"
                  value={item.item_name}
                  onChange={(e) =>
                    handleItemChange(index, 'item_name', e.target.value)
                  }
                />
              
              </div>

              <div className="col-md-2">
                <input
                  type="number"
                  className="form-control light-input"
                  placeholder="Qty"
                  value={item.qty}
                  onChange={(e) =>
                    handleItemChange(index, 'qty', e.target.value)
                  }
                />
              </div>

              <div className="col-md-2">
                <input
                  type="number"
                  className="form-control light-input"
                  placeholder="Price"
                  value={item.unit_price}
                  onChange={(e) =>
                    handleItemChange(index, 'unit_price', e.target.value)
                  }
                />
              </div>

              <div className="col-md-2">
                <input
                  type="text"
                  className="form-control light-input"
                  readOnly
                  value={calculateItemTotal(item)}
                />
              </div>
              <div className="col-md-2 d-flex align-items-end">
                <button 
                  type="button" 
                  className="btn light-btn light-btn-danger w-100" 
                  onClick={() => removeItemRow(index)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            className="btn light-btn light-btn-secondary"
            onClick={addItemRow}
          >
            + Add Item
          </button>
        </div>

        {/* TOTAL SECTION */}
        <div className="light-card p-4 mb-4">
          <div className="row g-3">
            <div className="col-md-3">
              <label>Sub Total</label>
              <input className="form-control light-input" readOnly value={subTotal} />
            </div>

            <div className="col-md-3">
              <label>Tax</label>
              <input
                type="number"
                name="tax_amount"
                className="form-control light-input"
                value={formData.tax_amount}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-3">
              <label>Discount</label>
              <input
                type="number"
                name="discount_amount"
                className="form-control light-input"
                value={formData.discount_amount}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-3">
              <label>Total</label>
              <input className="form-control light-input" readOnly value={finalTotal} />
            </div>
          </div>
        </div>

        <button className="btn light-btn">Save Invoice</button>
      </form>
    </div>
  );
};

export default SalesInvoice;