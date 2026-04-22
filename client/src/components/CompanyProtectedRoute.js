import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CompanyProtectedRoute = ({ children }) => {
  const { token, selectedCompany } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!selectedCompany) {
    return <Navigate to="/select-company" replace />;
  }

  return children;
};

export default CompanyProtectedRoute;
