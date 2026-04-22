import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axiosInstance from '../api/axiosInstance';
import CompanyHeader from '../components/CompanyHeader';
import ReportActions from '../components/ReportActions';

const LedgerReport = () => {
  const [filters, setFilters] = useState({
    ledger_id: '',
    from_date: '',
    to_date: ''
  });
  const [report, setReport] = useState(null);
  const printRef = useRef();

  const handleChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const fetchReport = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.get('/ledger-report', {
        params: {
          ledger_id: filters.ledger_id,
          from_date: filters.from_date,
          to_date: filters.to_date
        }
      });

      setReport(response.data);
    } catch (error) {
      console.error('Ledger report error:', error);
      alert(error.response?.data?.message || 'Error fetching ledger report');
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Ledger-Report'
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

    pdf.save('Ledger-Report.pdf');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <h2 className="mb-4">Ledger Report</h2>

      <div className="light-card p-4 mb-4 no-print">
        <form className="row g-3" onSubmit={fetchReport}>
          <div className="col-md-3">
            <label>Ledger ID</label>
            <input
              type="number"
              name="ledger_id"
              className="form-control light-input"
              value={filters.ledger_id}
              onChange={handleChange}
            />
          </div>

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

          <div className="col-md-3 d-flex align-items-end">
            <button className="btn light-btn w-100" type="submit">
              View Report
            </button>
          </div>
        </form>
      </div>

      {report && (
        <>
          <div className="d-flex gap-2 mb-3 no-print">
            <button className="btn light-btn" onClick={handlePrint}>
              Print
            </button>
            <button className="btn light-btn light-btn-secondary" onClick={handleDownloadPDF}>
              Export PDF
            </button>
          </div>

          <div ref={printRef}>
            <div className="light-card p-4 mb-4">
              <CompanyHeader 
                title="Ledger Report"
                subtitle={`From ${filters.from_date} to ${filters.to_date}`}
              />

              <h5 className="mb-3">{report.ledger.ledger_name}</h5>
              <p><strong>Opening Balance:</strong> {report.opening_balance}</p>
              <p><strong>Closing Balance:</strong> {report.closing_balance}</p>
            </div>

            <div className="light-card light-table-wrap p-3">
              <table className="table light-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Voucher Type</th>
                    <th>Voucher No</th>
                    <th>Reference</th>
                    <th>Narration</th>
                    <th>Line Description</th>
                    <th>Debit</th>
                    <th>Credit</th>
                    <th>Running Balance</th>
                  </tr>
                </thead>

                <tbody>
                  {report.transactions.map((row, index) => (
                    <tr key={index}>
                      <td>{row.voucher_date}</td>
                      <td>{row.voucher_type}</td>
                      <td>{row.voucher_no}</td>
                      <td>{row.reference_no}</td>
                      <td>{row.narration}</td>
                      <td>{row.line_description}</td>
                      <td>{row.debit}</td>
                      <td>{row.credit}</td>
                      <td>{row.running_balance}</td>
                    </tr>
                  ))}

                  {report.transactions.length === 0 && (
                    <tr>
                      <td colSpan="9" className="text-center">
                        No transactions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default LedgerReport;