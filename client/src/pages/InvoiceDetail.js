import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import CompanyHeader from '../components/CompanyHeader';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [invoiceData, setInvoiceData] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    fetchInvoiceDetail();
  }, [id]);

  const fetchInvoiceDetail = async () => {
    try {
      const res = await axiosInstance.get(`/invoices/${id}`);
      setInvoiceData(res.data);
    } catch (err) {
      console.error('Invoice detail error:', err);
      alert(err.response?.data?.message || 'Error loading invoice');
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice-${id}`
  });

  const handleDownloadPDF = async () => {
    const element = printRef.current;
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`Invoice-${id}.pdf`);
  };

  const handleDelete = async () => {
    const ok = window.confirm('Are you sure you want to delete this invoice?');
    if (!ok) return;

    try {
      await axiosInstance.delete(`/invoices/${id}`);
      alert('Invoice deleted successfully');
      navigate('/sales-invoices');
    } catch (error) {
      console.error('Delete invoice error:', error);
      alert(error.response?.data?.message || 'Error deleting invoice');
    }
  };

  if (!invoiceData) {
    return <p>Loading invoice details...</p>;
  }

  const { invoice, items } = invoiceData;

  const getStatusBadgeClass = (status) => {
    if (status === 'PAID') return 'light-badge light-badge-success';
    if (status === 'PARTIAL') return 'light-badge light-badge-warning';
    return 'light-badge light-badge-danger';
  };

  const canEditDelete =
    ['admin', 'accountant'].includes(user?.role) &&
    Number(invoice.paid_amount || 0) === 0;

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="d-flex justify-content-between align-items-center mb-4 no-print">
        <h2>Invoice Detail</h2>

        <div className="d-flex gap-2">
          <button className="btn light-btn" onClick={handlePrint}>
            Print
          </button>

          <button className="btn light-btn light-btn-secondary" onClick={handleDownloadPDF}>
            Export PDF
          </button>

          {canEditDelete && (
            <>
              <button
                className="btn light-btn light-btn-secondary"
                onClick={() => navigate(`/invoice/${id}/edit`)}
              >
                Edit
              </button>

              <button
                className="btn light-btn light-btn-danger"
                onClick={handleDelete}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div ref={printRef} className="light-card p-4">
        <CompanyHeader 
          title="Invoice"
          subtitle={`Invoice No: ${invoice.invoice_no}`}
        />

        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <p><strong>Invoice No:</strong> {invoice.invoice_no}</p>
          </div>

          <div className="col-md-4">
            <p><strong>Invoice Type:</strong> {invoice.invoice_type}</p>
          </div>

          <div className="col-md-4">
            <p>
              <strong>Status:</strong>{' '}
              <span className={getStatusBadgeClass(invoice.status)}>
                {invoice.status}
              </span>
            </p>
          </div>

          <div className="col-md-4">
            <p><strong>Party:</strong> {invoice.party_name}</p>
          </div>

          <div className="col-md-4">
            <p><strong>Invoice Date:</strong> {new Date(invoice.invoice_date).toLocaleDateString()}</p>
          </div>

          <div className="col-md-4">
            <p>
              <strong>Due Date:</strong>{' '}
              {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '-'}
            </p>
          </div>

          <div className="col-md-3">
            <p><strong>Subtotal:</strong> {invoice.subtotal}</p>
          </div>

          <div className="col-md-3">
            <p><strong>Tax Amount:</strong> {invoice.tax_amount}</p>
          </div>

          <div className="col-md-3">
            <p><strong>Discount Amount:</strong> {invoice.discount_amount}</p>
          </div>

          <div className="col-md-3">
            <p><strong>Total Amount:</strong> {invoice.total_amount}</p>
          </div>

          <div className="col-md-4">
            <p><strong>Paid Amount:</strong> {invoice.paid_amount}</p>
          </div>

          <div className="col-md-4">
            <p><strong>Balance Amount:</strong> {invoice.balance_amount}</p>
          </div>

          <div className="col-md-4">
            <p><strong>Remarks:</strong> {invoice.remarks || '-'}</p>
          </div>
        </div>

        <div className="light-table-wrap">
          <table className="table light-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.item_name}</td>
                  <td>{item.qty}</td>
                  <td>{item.unit_price}</td>
                  <td>{item.amount}</td>
                </tr>
              ))}

              {items.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center">
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default InvoiceDetail;