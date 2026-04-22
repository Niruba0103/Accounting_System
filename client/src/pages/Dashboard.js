import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '../api/axiosInstance';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.35
    }
  })
};

const Dashboard = () => {
  const [data, setData] = useState({
    totalCustomers: 0,
    totalSuppliers: 0,
    totalSales: 0,
    totalPurchases: 0,
    totalReceivables: 0,
    totalPayables: 0
  });

  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/dashboard/summary');
      setData(res.data);
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();

    const handleDashboardRefresh = () => {
      fetchDashboard();
    };

    window.addEventListener('dashboard-refresh', handleDashboardRefresh);

    return () => {
      window.removeEventListener('dashboard-refresh', handleDashboardRefresh);
    };
  }, [fetchDashboard]);

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  const cards = [
    { title: 'Total Customers', value: data.totalCustomers },
    { title: 'Total Suppliers', value: data.totalSuppliers },
    { title: 'Total Sales', value: data.totalSales },
    { title: 'Total Purchases', value: data.totalPurchases },
    { title: 'Total Receivables', value: data.totalReceivables },
    { title: 'Total Payables', value: data.totalPayables }
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Dashboard</h2>
        <button className="btn glass-btn btn-sm" onClick={fetchDashboard}>
          Refresh
        </button>
      </div>

      <div className="row g-4">
        {cards.map((card, index) => (
          <div className="col-md-4" key={card.title}>
            <motion.div
              className="glass-card glass-stat-card"
              variants={cardVariants}
              initial="hidden"
              animate="show"
              custom={index}
              whileHover={{ scale: 1.03 }}
            >
              <div className="glass-stat-title">{card.title}</div>
              <p className="glass-stat-value">{card.value}</p>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;