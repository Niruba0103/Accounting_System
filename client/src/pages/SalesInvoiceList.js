import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import ReportActions from '../components/ReportActions';

const SalesInvoiceList = () => {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await axiosInstance.get('/invoices');
      const salesOnly = res.data.filter((inv) => inv.invoice_type === 'SALES');
      setInvoices(salesOnly);
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'PAID') return 'success';
    if (status === 'PARTIAL') return 'warning';
    return 'danger';
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Sales Invoices</h2>
        <ReportActions 
          title="Sales Invoices Register"
          fileName="SalesInvoices"
          head={[['No', 'Date', 'Customer', 'Total', 'Paid', 'Balance', 'Status']]}
          body={invoices.map(inv => [
            inv.invoice_no,
            new Date(inv.invoice_date).toLocaleDateString(),
            inv.party_name,
            inv.total_amount,
            inv.paid_amount,
            inv.balance_amount,
            inv.status
          ])}
          data={invoices.map(inv => ({
            no: inv.invoice_no,
            date: new Date(inv.invoice_date).toLocaleDateString(),
            customer: inv.party_name,
            total: inv.total_amount,
            paid: inv.paid_amount,
            balance: inv.balance_amount,
            status: inv.status
          }))}
        />
      </div>

      <div className="light-card light-table-wrap p-3">
        <table className="table light-table mt-3">
        <thead className="table-dark">
          <tr>
            <th>No</th>
            <th>Date</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Paid</th>
            <th>Balance</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id}>
              <td>
                <Link to={`/invoice/${inv.id}`}>{inv.invoice_no}</Link>
              </td>
              <td>{new Date(inv.invoice_date).toLocaleDateString()}</td>
              <td>{inv.party_name}</td>
              <td>{inv.total_amount}</td>
              <td>{inv.paid_amount}</td>
              <td>{inv.balance_amount}</td>
              <td>
                <span className={`badge bg-${getStatusBadge(inv.status)}`}>
                  {inv.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
  );
};

export default SalesInvoiceList;