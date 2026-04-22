import React from 'react';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';

const ReportActions = ({ data, head, body, fileName, title, subtitle }) => {
  return (
    <div className="d-flex gap-2 mb-3 justify-content-end">
      <button 
        className="btn btn-sm btn-outline-success d-flex align-items-center" 
        onClick={() => exportToExcel(data, fileName)}
      >
        <i className="bi bi-file-earmark-excel me-1"></i>
        Excel
      </button>
      <button 
        className="btn btn-sm btn-outline-danger d-flex align-items-center" 
        onClick={() => exportToPDF({ head, body, fileName, title, subtitle })}
      >
        <i className="bi bi-file-earmark-pdf me-1"></i>
        PDF
      </button>
    </div>
  );
};

export default ReportActions;
