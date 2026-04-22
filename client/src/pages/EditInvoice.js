import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const EditInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    invoice_date: '',
    due_date: '',
    tax_amount: 0,
    discount_amount: 0,
    remarks: '',
    items: [{ item_name: '', qty: 1, unit_price: 0 }]
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const res = await axiosInstance.get(`/invoices/${id}`);
      const { invoice, items } = res.data;

      setFormData({
        invoice_date: invoice.invoice_date ? invoice.invoice_date.slice(0, 10) : '',
        due_date: invoice.due_date ? invoice.due_date.slice(0, 10) : '',
        tax_amount: Number(invoice.tax_amount || 0),
        discount_amount: Number(invoice.discount_amount || 0),
        remarks: invoice.remarks || '',
        items: items.length
          ? items.map((item) => ({
              item_name: item.item_name,
              qty: Number(item.qty),
              unit_price: Number(item.unit_price)
            }))
          : [{ item_name: '', qty: 1, unit_price: 0 }]
      });
    } catch (error) {
      console.error('Fetch invoice error:', error);
      alert(error.response?.data?.message || 'Error loading invoice');
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

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;

    setFormData((prev) => ({
      ...prev,
      items: updatedItems
    }));
  };

  const addItemRow = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { item_name: '', qty: 1, unit_price: 0 }]
    }));
  };

  const removeItemRow = (index) => {
    if (formData.items.length === 1) return;
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      items: updatedItems
    }));
  };

  const calculateItemTotal = (item) => {
    return Number(item.qty || 0) * Number(item.unit_price || 0);
  };

  const subTotal = formData.items.reduce(
    (sum, item) => sum + calculateItemTotal(item),
    0
  );

  const finalTotal =
    subTotal +
    Number(formData.tax_amount || 0) -
    Number(formData.discount_amount || 0);

  const invalidDueDate =
    formData.invoice_date &&
    formData.due_date &&
    new Date(formData.due_date) < new Date(formData.invoice_date);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (invalidDueDate) {
      alert('Due date cannot be earlier than invoice date');
      return;
    }

    try {
      await axiosInstance.put(`/invoices/${id}`, {
        ...formData,
        tax_amount: Number(formData.tax_amount),
        discount_amount: Number(formData.discount_amount),
        items: formData.items.map((item) => ({
          item_name: item.item_name,
          qty: Number(item.qty),
          unit_price: Number(item.unit_price)
        }))
      });

      alert('Invoice updated successfully');
      navigate(`/invoice/${id}`);
    } catch (error) {
      console.error('Update invoice error:', error);
      alert(error.response?.data?.message || 'Error updating invoice');
    }
  };

  if (loading) {
    return <p>Loading invoice...</p>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <h2 className="mb-4">Edit Invoice</h2>

      <form onSubmit={handleSubmit}>
        <div className="light-card p-4 mb-4">
          <div className="row g-3">
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
              {invalidDueDate && (
                <small className="text-danger">
                  Due date cannot be earlier than invoice date
                </small>
              )}
            </div>

            <div className="col-md-4">
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
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control light-input"
                  placeholder="Item Name"
                  value={item.item_name}
                  onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                />
              </div>

              <div className="col-md-2">
                <input
                  type="number"
                  className="form-control light-input"
                  placeholder="Qty"
                  value={item.qty}
                  onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                />
              </div>

              <div className="col-md-2">
                <input
                  type="number"
                  className="form-control light-input"
                  placeholder="Price"
                  value={item.unit_price}
                  onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                />
              </div>

              <div className="col-md-2">
                <input
                  type="text"
                  readOnly
                  className="form-control light-input"
                  value={calculateItemTotal(item)}
                />
              </div>

              <div className="col-md-2">
                <button
                  type="button"
                  className="btn light-btn light-btn-danger w-100"
                  onClick={() => removeItemRow(index)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <button type="button" className="btn light-btn light-btn-secondary" onClick={addItemRow}>
            + Add Item
          </button>
        </div>

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

        <div className="d-flex gap-2">
          <button className="btn light-btn" type="submit">
            Update Invoice
          </button>

          <button
            type="button"
            className="btn light-btn light-btn-secondary"
            onClick={() => navigate(`/invoice/${id}`)}
          >
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default EditInvoice;