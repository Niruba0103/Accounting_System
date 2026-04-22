import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '../api/axiosInstance';
import ReportActions from '../components/ReportActions';
import CompanyHeader from '../components/CompanyHeader';

const groupByGroupName = (rows) => {
  const grouped = {};

  rows.forEach((row) => {
    const key = row.group_name || 'Ungrouped';

    if (!grouped[key]) {
      grouped[key] = [];
    }

    grouped[key].push(row);
  });

  return grouped;
};

const getGroupTotal = (rows) => {
  return rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
};

const ProfitLoss = () => {
  const [filters, setFilters] = useState({
    from_date: '',
    to_date: ''
  });
  const [report, setReport] = useState(null);

  const handleChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const fetchReport = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.get('/financial-statements/profit-loss', {
        params: filters
      });
      setReport(response.data);
    } catch (error) {
      console.error('Profit & loss error:', error);
      alert(error.response?.data?.message || 'Error fetching profit & loss');
    }
  };

  const renderSection = (sectionTitle, rows, total) => {
    const grouped = groupByGroupName(rows);

    return (
      <>
        <tr className="report-section-title">
          <td colSpan="2">{sectionTitle}</td>
        </tr>

        {Object.keys(grouped).map((groupName) => {
          const groupRows = grouped[groupName];
          const groupTotal = getGroupTotal(groupRows);

          return (
            <React.Fragment key={`${sectionTitle}-${groupName}`}>
              <tr className="report-group-title">
                <td colSpan="2">{groupName}</td>
              </tr>

              {groupRows.map((row) => (
                <tr className="report-ledger-row" key={`${sectionTitle}-${groupName}-${row.ledger_id}`}>
                  <td>{row.ledger_name}</td>
                  <td>{row.amount}</td>
                </tr>
              ))}

              <tr className="report-total-row">
                <td>Total {groupName}</td>
                <td>{groupTotal}</td>
              </tr>
            </React.Fragment>
          );
        })}

        <tr className="report-grand-total">
          <td>Total {sectionTitle}</td>
          <td>{total}</td>
        </tr>
      </>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <h2 className="mb-4">Profit & Loss</h2>

      <div className="light-card p-4 mb-4">
        <form className="row g-3" onSubmit={fetchReport}>
          <div className="col-md-3">
            <label>From Date</label>
            <input
              type="date"
              name="from_date"
              className="form-control light-input"
              value={filters.from_date}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-3">
            <label>To Date</label>
            <input
              type="date"
              name="to_date"
              className="form-control light-input"
              value={filters.to_date}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-2 d-flex align-items-end">
            <button className="btn light-btn w-100" type="submit">
              View
            </button>
          </div>
        </form>
      </div>

      {report && (
        <div className="light-card light-table-wrap p-4">
          <ReportActions 
            title="Profit & Loss Account"
            subtitle={`From ${filters.from_date} to ${filters.to_date}`}
            fileName={`ProfitLoss_${filters.from_date}_${filters.to_date}`}
            head={[['Particulars', 'Amount']]}
            body={[
              ['REVENUE', ''],
              ...report.revenue.map(r => [r.ledger_name, r.amount]),
              ['Total Revenue', report.totalRevenue],
              ['', ''],
              ['EXPENSES', ''],
              ...report.expenses.map(e => [e.ledger_name, e.amount]),
              ['Total Expenses', report.totalExpenses],
              ['', ''],
              ['NET PROFIT', report.netProfit]
            ]}
            data={[
              { section: 'REVENUE', particulars: '', amount: '' },
              ...report.revenue.map(r => ({ section: 'REVENUE', particulars: r.ledger_name, amount: r.amount })),
              { section: 'REVENUE', particulars: 'Total Revenue', amount: report.totalRevenue },
              { section: 'EXPENSES', particulars: '', amount: '' },
              ...report.expenses.map(e => ({ section: 'EXPENSES', particulars: e.ledger_name, amount: e.amount })),
              { section: 'EXPENSES', particulars: 'Total Expenses', amount: report.totalExpenses },
              { section: 'SUMMARY', particulars: 'Net Profit', amount: report.netProfit }
            ]}
          />
          <CompanyHeader 
            title="Profit & Loss"
            subtitle={`Statement Period: ${filters.from_date} to ${filters.to_date}`}
          />

          <table className="table light-table">
            <thead>
              <tr>
                <th>Particulars</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>
              {renderSection('Revenue', report.revenue, report.totalRevenue)}
              {renderSection('Expenses', report.expenses, report.totalExpenses)}

              <tr className="report-grand-total">
                <td>Net Profit</td>
                <td>{report.netProfit}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default ProfitLoss;