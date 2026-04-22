import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const PaymentEntry = () => {
  const navigate = useNavigate();

  const [purchaseInvoices, setPurchaseInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [formData, setFormData] = useState({
    invoice_id: '',
    payment_method: 'CASH',
    amount: '',
    payment_date: '',
    reason: '',
    bank_name: '',
    bank_account_no: '',
    bank_branch: ''
  });

  useEffect(() => {
    fetchPurchaseInvoices();
  }, []);

  const fetchPurchaseInvoices = async () => {
    try {
      const response = await axiosInstance.get('/invoices');
      const onlyPurchase = response.data.filter(
        (invoice) =>
          invoice.invoice_type === 'PURCHASE' &&
          Number(invoice.balance_amount) > 0
      );
      setPurchaseInvoices(onlyPurchase);
    } catch (error) {
      console.error('Fetch purchase invoices error:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'invoice_id') {
      const invoice = purchaseInvoices.find(
        (inv) => String(inv.id) === String(value)
      );

      setSelectedInvoice(invoice || null);

      setFormData({
        ...formData,
        invoice_id: value,
        amount: invoice ? invoice.balance_amount : '',
        reason: invoice
          ? `Payment against invoice ${invoice.invoice_no}`
          : formData.reason
      });

      return;
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axiosInstance.post('/invoices/payment', {
        ...formData,
        invoice_id: Number(formData.invoice_id),
        amount: Number(formData.amount)
      });

      window.dispatchEvent(new Event('dashboard-refresh'));
      alert('Payment recorded successfully');
      navigate('/');
    } catch (error) {
      console.error('Payment entry error:', error);
      alert(error.response?.data?.message || 'Error recording payment');
    }
  };

  const invalidAmount =
    selectedInvoice && Number(formData.amount || 0) > Number(selectedInvoice.balance_amount);

  return (
    <div>
      <h2>Payment Entry</h2>

      <form className="row g-3" onSubmit={handleSubmit}>
        <div className="col-md-4">
          <label>Purchase Invoice</label>
          <select
            name="invoice_id"
            className="form-control light-select"
            value={formData.invoice_id}
            onChange={handleChange}
          >
            <option value="">Select Purchase Invoice</option>
            {purchaseInvoices.map((invoice) => (
              <option key={invoice.id} value={invoice.id}>
                {invoice.invoice_no} | {invoice.party_name} | Balance: {invoice.balance_amount}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <label>Payment Method</label>
          <select
            name="payment_method"
            className="form-control light-select"
            value={formData.payment_method}
            onChange={handleChange}
          >
            <option value="CASH">CASH</option>
            <option value="BANK">BANK</option>
          </select>
        </div>

        <div className="col-md-4">
          <label>Amount</label>
          <input
            type="number"
            name="amount"
            className="form-control"
            value={formData.amount}
            onChange={handleChange}
          />
          {invalidAmount && (
            <small className="text-danger">
              Amount cannot exceed invoice balance
            </small>
          )}
        </div>

        <div className="col-md-4">
          <label>Payment Date</label>
          <input
            type="date"
            name="payment_date"
            className="form-control"
            value={formData.payment_date}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-8">
          <label>Reason</label>
          <input
            type="text"
            name="reason"
            className="form-control"
            value={formData.reason}
            onChange={handleChange}
          />
        </div>

        {selectedInvoice && (
          <div className="col-md-12">
            <div className="alert alert-info">
              <strong>Invoice No:</strong> {selectedInvoice.invoice_no} <br />
              <strong>Party:</strong> {selectedInvoice.party_name} <br />
              <strong>Total Amount:</strong> {selectedInvoice.total_amount} <br />
              <strong>Paid Amount:</strong> {selectedInvoice.paid_amount} <br />
              <strong>Balance Amount:</strong> {selectedInvoice.balance_amount}
            </div>
          </div>
        )}

        {formData.payment_method === 'BANK' && (
          <>
            <div className="col-md-4">
              <label>Bank Name</label>
              <input
                type="text"
                name="bank_name"
                className="form-control"
                value={formData.bank_name}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <label>Bank Account No</label>
              <input
                type="text"
                name="bank_account_no"
                className="form-control"
                value={formData.bank_account_no}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <label>Bank Branch</label>
              <input
                type="text"
                name="bank_branch"
                className="form-control"
                value={formData.bank_branch}
                onChange={handleChange}
              />
            </div>
          </>
        )}

        <div className="col-md-12">
          <button className="btn btn-primary" type="submit" disabled={invalidAmount}>
            Save Payment
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentEntry;