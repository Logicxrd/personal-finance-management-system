import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Dashboard.css";
import humcashLogo from "../assets/humcash-logo.png";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("Home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [recentExpenses, setRecentExpenses] = useState([]);

  // Function to load expenses - defined outside useEffect so we can call it directly
  const loadExpenses = () => {
    const savedExpenses = localStorage.getItem("expenses");
    if (savedExpenses) {
      try {
        const expensesData = JSON.parse(savedExpenses);
        // Sort by date, newest first
        const sortedExpenses = expensesData.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setRecentExpenses(sortedExpenses.slice(0, 10));
      } catch (error) {
        console.error("Error parsing expenses:", error);
        setRecentExpenses([]);
      }
    } else {
      setRecentExpenses([]);
    }
  };

  // Load expenses on initial mount AND whenever the pathname changes
  useEffect(() => {
    loadExpenses();

    // This is the key part - we create a timer to check for expense updates frequently
    const intervalId = setInterval(() => {
      loadExpenses();
    }, 500); // Check every 500ms

    return () => clearInterval(intervalId); // Clean up interval
  }, [location.pathname]); // Re-run when path changes

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
                onClick={() => {
                  console.log("Personal info clicked");
                  setMenuOpen(false);
                  navigate("/personal-info");
                }}
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
            {recentExpenses.length > 0 ? (
              recentExpenses.map((expense) => (
                <div key={expense.id} className="expense-item">
                  <div className="expense-icon">{expense.icon}</div>
                  <div className="expense-details">
                    <p className="expense-amount">
                      ${expense.amount.toFixed(2)}
                    </p>
                    <p className="expense-merchant">{expense.merchant}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-expenses">
                <p>No recent expenses to display.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="app-footer">
        <nav className="footer-nav">
          <div
            className={`nav-item ${activeTab === "Home" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("Home");
              loadExpenses(); // Explicitly reload expenses
            }}
          >
            <div className="nav-icon">🏠</div>
            <div className="nav-label">Home</div>
          </div>
          <div
            className={`nav-item ${activeTab === "Expenses" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("Expenses");
              navigate("/expenses");
            }}
          >
            <div className="nav-icon">💰</div>
            <div className="nav-label">Expenses</div>
          </div>
          <div
            className={`nav-item ${activeTab === "Savings" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("Savings");
              navigate("/savings");
            }}
          >
            <div className="nav-icon">🏦</div>
            <div className="nav-label">Savings</div>
          </div>
          <div
            className={`nav-item ${activeTab === "Analytics" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("Analytics");
              navigate("/analytics");
            }}
          >
            <div className="nav-icon">📈</div>
            <div className="nav-label">Analytics</div>
          </div>
        </nav>
      </footer>
    </div>
  );
};

export default Dashboard;
