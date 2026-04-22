import React from 'react';
import logo from '../assets/logo.jpeg';

const CompanyHeader = ({ title, subtitle }) => {
  return (
    <div className="report-header d-flex align-items-center gap-3">
      <img 
        src={logo} 
        alt="Logo" 
        style={{ 
          width: '52px', 
          height: '52px', 
          borderRadius: '12px', 
          objectFit: 'cover', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)' 
        }} 
      />
      <div className="flex-grow-1">
        <div className="report-company" style={{ lineHeight: '1.1' }}>PrimeSupply</div>
        <div className="report-title">{title}</div>
        {subtitle && <p className="report-subtitle mb-0">{subtitle}</p>}
      </div>
      <div className="text-end d-none d-md-block">
        <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>System Generated Report</small>
        <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>{new Date().toLocaleString()}</small>
      </div>
    </div>
  );
};

export default CompanyHeader;
