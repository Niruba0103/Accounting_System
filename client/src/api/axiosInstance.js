import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api'
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const company = localStorage.getItem('selectedCompany');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (company) {
    try {
      const companyData = JSON.parse(company);
      config.headers['x-company-id'] = companyData.id;
    } catch (e) {
      console.error('Error parsing company context', e);
    }
  }

  return config;
});

export default axiosInstance;