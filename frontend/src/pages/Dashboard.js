import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import humcashLogo from "../assets/humcash-logo.png";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Home");

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/");
  };

  // Mock data for the dashboard
  const financialData = {
    netWorth: 45678.9,
    netWorthGrowth: "+20%",
    currentBalance: 2405,
    currentBalanceGrowth: "+33%",
    chartData: [
      { date: "Jan 23", value: 27500 },
      { date: "24", value: 28000 },
      { date: "25", value: 31000 },
      { date: "26", value: 32000 },
      { date: "27", value: 34000 },
      { date: "28", value: 39000 },
      { date: "29", value: 36000 },
      { date: "30", value: 48000 },
    ],
    recentExpenses: [
      { id: 1, merchant: "Walmart", amount: 89.72, icon: "🛒" }, // Changed to shopping cart icon
      { id: 2, merchant: "Uber", amount: 8.69, icon: "🚗" }, // Changed to car icon
      // Add more expenses as needed
    ],
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo-container">
          <img src={humcashLogo} alt="HumCash Logo" className="header-logo" />
          <h1>HumCash</h1>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <nav className="main-nav">
        <ul>
          <li
            className={activeTab === "Home" ? "active" : ""}
            onClick={() => setActiveTab("Home")}
          >
            Home
          </li>
          <li
            className={activeTab === "Expenses" ? "active" : ""}
            onClick={() => setActiveTab("Expenses")}
          >
            Expenses
          </li>
          <li
            className={activeTab === "Savings" ? "active" : ""}
            onClick={() => setActiveTab("Savings")}
          >
            Savings
          </li>
          <li
            className={activeTab === "Analytics" ? "active" : ""}
            onClick={() => setActiveTab("Analytics")}
          >
            Analytics
          </li>
        </ul>
      </nav>

      <div className="dashboard-content">
        <div className="financial-overview">
          <div className="financial-card">
            <p className="card-label">Gross Income</p>
            <h2 className="card-value">
              $
              {financialData.netWorth.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h2>
            <p className="growth-indicator">
              {financialData.netWorthGrowth} month over month
            </p>
          </div>

          <div className="financial-card">
            <p className="card-label">Current Balance</p>
            <h2 className="card-value">
              ${financialData.currentBalance.toLocaleString("en-US")}
            </h2>
            <p className="growth-indicator">
              {financialData.currentBalanceGrowth} month over month
            </p>
          </div>
        </div>

        <div className="chart-container">
          <p className="card-label">Gross Income</p>
          <div className="chart">
            <div className="y-axis">
              <div className="y-label">$50K</div>
              <div className="y-label">$45K</div>
              <div className="y-label">$40K</div>
              <div className="y-label">$35K</div>
              <div className="y-label">$30K</div>
            </div>
            <div className="chart-visual">
              {/* This is a simplified representation of the chart */}
              <div className="chart-line"></div>
              <div className="chart-gradient"></div>
            </div>
          </div>
          <div className="x-axis">
            {financialData.chartData.map((point, index) => (
              <div key={index} className="x-label">
                {point.date}
              </div>
            ))}
          </div>
        </div>

        <div className="expenses-section">
          <p className="section-title">Expenses</p>
          <div className="expenses-list">
            {financialData.recentExpenses.map((expense) => (
              <div key={expense.id} className="expense-item">
                <div className="expense-icon">{expense.icon}</div>
                <div className="expense-details">
                  <p className="expense-amount">${expense.amount.toFixed(2)}</p>
                  <p className="expense-merchant">{expense.merchant}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="app-footer">
        <div className="footer-nav">
          <div className="footer-icon active">
            <span>🏠</span>
          </div>
          <div className="footer-icon">
            <span>➕</span>
          </div>
          <div className="footer-icon">
            <span>📊</span>
          </div>
          <div className="footer-icon">
            <span>💳</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
