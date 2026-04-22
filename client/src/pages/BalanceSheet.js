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

const BalanceSheet = () => {
  const [toDate, setToDate] = useState('');
  const [report, setReport] = useState(null);

  const fetchReport = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.get('/financial-statements/balance-sheet', {
        params: { to_date: toDate }
      });
      setReport(response.data);
    } catch (error) {
      console.error('Balance sheet error:', error);
      alert(error.response?.data?.message || 'Error fetching balance sheet');
    }
  };

  const renderSection = (sectionTitle, rows, sectionTotal) => {
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
          <td>{sectionTotal}</td>
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
      <h2 className="mb-4">Balance Sheet</h2>

      <div className="light-card p-4 mb-4">
        <form className="row g-3" onSubmit={fetchReport}>
          <div className="col-md-4">
            <label>To Date</label>
            <input
              type="date"
              className="form-control light-input"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
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
            title="Balance Sheet"
            subtitle={`As of ${toDate}`}
            fileName={`BalanceSheet_${toDate}`}
            head={[['Particulars', 'Amount']]}
            body={[
              ['ASSETS', ''],
              ...report.assets.map(a => [a.ledger_name, a.amount]),
              ['Total Assets', report.totalAssets],
              ['', ''],
              ['LIABILITIES', ''],
              ...report.liabilities.map(l => [l.ledger_name, l.amount]),
              ['Total Liabilities', report.totalLiabilities],
              ['', ''],
              ['EQUITY', ''],
              ...report.equity.map(e => [e.ledger_name, e.amount]),
              ['Total Equity', report.totalEquity]
            ]}
            data={[
              { section: 'ASSETS', particulars: '', amount: '' },
              ...report.assets.map(a => ({ section: 'ASSETS', particulars: a.ledger_name, amount: a.amount })),
              { section: 'ASSETS', particulars: 'Total Assets', amount: report.totalAssets },
              { section: 'LIABILITIES', particulars: '', amount: '' },
              ...report.liabilities.map(l => ({ section: 'LIABILITIES', particulars: l.ledger_name, amount: l.amount })),
              { section: 'LIABILITIES', particulars: 'Total Liabilities', amount: report.totalLiabilities },
              { section: 'EQUITY', particulars: '', amount: '' },
              ...report.equity.map(e => ({ section: 'EQUITY', particulars: e.ledger_name, amount: e.amount })),
              { section: 'EQUITY', particulars: 'Total Equity', amount: report.totalEquity }
            ]}
          />
          <CompanyHeader 
            title="Balance Sheet"
            subtitle={`As of ${toDate}`}
          />

          <table className="table light-table">
            <thead>
              <tr>
                <th>Particulars</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>
              {renderSection('Assets', report.assets, report.totalAssets)}
              {renderSection('Liabilities', report.liabilities, report.totalLiabilities)}
              {renderSection('Equity', report.equity, report.totalEquity)}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default BalanceSheet;