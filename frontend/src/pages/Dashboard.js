import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Mock logout function
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>HumCash</h1>
        <div className="user-actions">
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>Welcome to HumCash</h2>
          <p>Your personal finance management system</p>
        </div>
        
        <div className="quick-links">
          <div className="feature-card">
            <h3>Transactions</h3>
            <p>Track your income and expenses</p>
            <button className="action-button">Manage Transactions</button>
          </div>
          
          <div className="feature-card">
            <h3>Budgets</h3>
            <p>Set and monitor your spending limits</p>
            <button className="action-button">Set Budgets</button>
          </div>
          
          <div className="feature-card">
            <h3>Savings Goals</h3>
            <p>Plan and track your financial goals</p>
            <button className="action-button">Create Goals</button>
          </div>
          
          <div className="feature-card">
            <h3>Reports</h3>
            <p>Get insights into your financial habits</p>
            <button className="action-button">View Reports</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;