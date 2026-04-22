import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user')) || null
  );
  const [selectedCompany, setSelectedCompany] = useState(
    JSON.parse(localStorage.getItem('selectedCompany')) || null
  );

  const login = (userData, userToken) => {
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(userToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('selectedCompany');
    setToken(null);
    setUser(null);
    setSelectedCompany(null);
  };

  const selectCompany = (company) => {
    localStorage.setItem('selectedCompany', JSON.stringify(company));
    setSelectedCompany(company);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const storedCompany = JSON.parse(localStorage.getItem('selectedCompany'));

    if (storedToken) setToken(storedToken);
    if (storedUser) setUser(storedUser);
    if (storedCompany) setSelectedCompany(storedCompany);
  }, []);

  return (
    <AuthContext.Provider value={{ 
      token, 
      user, 
      selectedCompany, 
      login, 
      logout, 
      selectCompany 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, useAuth };