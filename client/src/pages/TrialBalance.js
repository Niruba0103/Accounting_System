import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axiosInstance from '../api/axiosInstance';
import CompanyHeader from '../components/CompanyHeader';

const TrialBalance = () => {
  const [toDate, setToDate] = useState('');
  const [report, setReport] = useState(null);
  const printRef = useRef();

  const fetchTrialBalance = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.get('/financial-statements/trial-balance', {
        params: { to_date: toDate }
      });
      setReport(response.data);
    } catch (error) {
      console.error('Trial balance error:', error);
      alert(error.response?.data?.message || 'Error fetching trial balance');
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Trial-Balance'
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

    pdf.save('Trial-Balance.pdf');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <h2 className="mb-4">Trial Balance</h2>

      <div className="light-card p-4 mb-4 no-print">
        <form className="row g-3" onSubmit={fetchTrialBalance}>
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
        <>
          <div className="d-flex gap-2 mb-3 no-print">
            <button className="btn light-btn" onClick={handlePrint}>
              Print
            </button>
            <button className="btn light-btn light-btn-secondary" onClick={handleDownloadPDF}>
              Export PDF
            </button>
          </div>

          <div ref={printRef} className="light-card light-table-wrap p-4">
            <CompanyHeader 
              title="Trial Balance"
              subtitle={`As of ${toDate}`}
            />

            <table className="table light-table">
              <thead>
                <tr>
                  <th>Ledger Code</th>
                  <th>Ledger Name</th>
                  <th>Group</th>
                  <th>Debit</th>
                  <th>Credit</th>
                </tr>
              </thead>

              <tbody>
                {report.rows.map((row) => (
                  <tr key={row.ledger_id}>
                    <td>{row.ledger_code}</td>
                    <td>{row.ledger_name}</td>
                    <td>{row.group_name}</td>
                    <td>{row.debit}</td>
                    <td>{row.credit}</td>
                  </tr>
                ))}

                <tr className="report-grand-total">
                  <td colSpan="3">Total</td>
                  <td>{report.totalDebit}</td>
                  <td>{report.totalCredit}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default TrialBalance;