// Dashboard.js - Modified to include AlertsNotification
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Dashboard.css";
import humcashLogo from "../assets/humcash-logo.png";
import AlertsNotification from "../components/AlertsNotification"; // Added import

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

  // Function to calculate the current month's expenses total
  const calculateCurrentMonthExpenses = () => {
    const savedExpenses = localStorage.getItem("expenses");
    if (!savedExpenses) return 0;

    try {
      const expenses = JSON.parse(savedExpenses);
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // Filter expenses for current month
      const currentMonthExpenses = expenses.filter((expense) => {
        const expenseDate = new Date(expense.date);
        return (
          expenseDate.getMonth() === currentMonth &&
          expenseDate.getFullYear() === currentYear
        );
      });

      // Sum the expenses
      return currentMonthExpenses.reduce(
        (sum, expense) => sum + (parseFloat(expense.amount) || 0),
        0
      );
    } catch (error) {
      console.error("Error calculating current month expenses:", error);
      return 0;
    }
  };

  // Function to calculate the last month's expenses total
  const calculateLastMonthExpenses = () => {
    const savedExpenses = localStorage.getItem("expenses");
    if (!savedExpenses) return 0;

    try {
      const expenses = JSON.parse(savedExpenses);
      const now = new Date();
      const lastMonth = now.getMonth() - 1 < 0 ? 11 : now.getMonth() - 1;
      const lastMonthYear =
        now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

      // Filter expenses for last month
      const lastMonthExpenses = expenses.filter((expense) => {
        const expenseDate = new Date(expense.date);
        return (
          expenseDate.getMonth() === lastMonth &&
          expenseDate.getFullYear() === lastMonthYear
        );
      });

      // Sum the expenses
      return lastMonthExpenses.reduce(
        (sum, expense) => sum + (parseFloat(expense.amount) || 0),
        0
      );
    } catch (error) {
      console.error("Error calculating last month expenses:", error);
      return 0;
    }
  };

  // Function to get the total savings amount
  const getTotalSavings = () => {
    const savedTotalSavings = localStorage.getItem("totalSavings");
    if (!savedTotalSavings) return 0;

    try {
      return JSON.parse(savedTotalSavings) || 0;
    } catch (error) {
      console.error("Error parsing total savings:", error);
      return 0;
    }
  };

  // Function to calculate the percentage change between two values
  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // Function to get the savings history for the chart
  const getSavingsHistory = () => {
    const savedHistory = localStorage.getItem("savingsHistory");
    if (!savedHistory) return [];

    try {
      const history = JSON.parse(savedHistory);
      return history.sort((a, b) => new Date(a.date) - new Date(b.date));
    } catch (error) {
      console.error("Error parsing savings history:", error);
      return [];
    }
  };

  // Replace the mock financialData with real data
  const currentMonthExpenses = calculateCurrentMonthExpenses();
  const lastMonthExpenses = calculateLastMonthExpenses();
  const totalSavings = getTotalSavings();
  const savingsHistory = getSavingsHistory();

  // Build the financial data object
  const financialData = {
    // Use total savings as "Gross Income" for now
    netWorth: totalSavings,
    netWorthGrowth:
      calculatePercentageChange(totalSavings, totalSavings * 0.9).toFixed(1) +
      "%", // Simulated growth

    // Use current month expenses as "Current Balance"
    currentBalance: currentMonthExpenses,
    currentBalanceGrowth:
      calculatePercentageChange(
        currentMonthExpenses,
        lastMonthExpenses
      ).toFixed(1) + "%",

    // Format savings history data for the chart
    chartData: savingsHistory.map((entry) => ({
      date: entry.date,
      value: entry.amount,
    })),
  };

  // If the chart data is empty, provide some default data points
  if (financialData.chartData.length === 0) {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();

    // Create empty data for the last 6 months
    financialData.chartData = [];
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const year = currentDate.getFullYear() - (currentMonth - i < 0 ? 1 : 0);
      financialData.chartData.push({
        date: `${months[monthIndex]} ${year.toString().substr(2)}`,
        value: 0,
      });
    }
  }

  // Format the netWorth and currentBalance for display
  financialData.netWorth = financialData.netWorth || 0;
  financialData.currentBalance = financialData.currentBalance || 0;

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
        {/* Added AlertsNotification component here */}
        <AlertsNotification />
      </header>
      {/* Rest of your component remains the same */}
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
