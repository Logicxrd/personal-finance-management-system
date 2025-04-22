import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import humcashLogo from "../assets/humcash-logo.png";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Home");
  const [menuOpen, setMenuOpen] = useState(false);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/");
  };

  // Toggle menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Handle navigation
  const handleNavigation = (path) => {
    setMenuOpen(false);
    // In a real app, you would navigate to these routes
    console.log(`Navigating to: ${path}`);
    // navigate(path); // Uncomment when routes are set up
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
      { id: 1, merchant: "Walmart", amount: 89.72, icon: "🛒" },
      { id: 2, merchant: "Uber", amount: 8.69, icon: "🚗" },
      // Add more expenses as needed
    ],
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="hamburger-menu">
          <div className="hamburger-icon" onClick={toggleMenu}>
            ☰
          </div>
          {menuOpen && (
            <div className="menu-dropdown">
              <div className="menu-header">
                <h2>Menu</h2>
                <span className="close-menu" onClick={toggleMenu}>
                  ✕
                </span>
              </div>

              <div
                className="menu-item"
                onClick={() => handleNavigation("/personal-info")}
              >
                <div className="menu-item-content">
                  <h3>Personal info</h3>
                  <p>Name, email, phone number</p>
                </div>
                <span className="menu-arrow">›</span>
              </div>

              <div
                className="menu-item"
                onClick={() => handleNavigation("/financial-info")}
              >
                <div className="menu-item-content">
                  <h3>Financial info</h3>
                  <p>Linked financial institutions, cards...</p>
                </div>
                <span className="menu-arrow">›</span>
              </div>

              <div
                className="menu-item"
                onClick={() => handleNavigation("/settings")}
              >
                <div className="menu-item-content">
                  <h3>Settings</h3>
                  <p>Notifications, security, close my a...</p>
                </div>
                <span className="menu-arrow">›</span>
              </div>

              <div
                className="menu-item"
                onClick={() => handleNavigation("/support")}
              >
                <div className="menu-item-content">
                  <h3>Support</h3>
                  <p>Help center, contact us</p>
                </div>
                <span className="menu-arrow">›</span>
              </div>

              <div
                className="menu-item"
                onClick={() => handleNavigation("/legal")}
              >
                <div className="menu-item-content">
                  <h3>Legal</h3>
                  <p>Terms of use, privacy policies...</p>
                </div>
                <span className="menu-arrow">›</span>
              </div>

              <div className="logout-button-container" onClick={handleLogout}>
                <button className="menu-logout-button">Log out</button>
              </div>
            </div>
          )}
        </div>
        <div className="logo-container">
          <img src={humcashLogo} alt="HumCash Logo" className="header-logo" />
          <h1 className="app-title">ℍ𝕌𝕄ℂ𝔸𝕊ℍ</h1>
        </div>
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
