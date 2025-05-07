import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import "../styles/Analytics.css";
import humcashLogo from "../assets/humcash-logo.png";
import AlertsNotification from "../components/AlertsNotification";

const Analytics = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("Analytics");
  const [menuOpen, setMenuOpen] = useState(false);
  const [expenseData, setExpenseData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [currentMonthTotal, setCurrentMonthTotal] = useState(0);
  const [lastMonthTotal, setLastMonthTotal] = useState(0);
  const [percentageChange, setPercentageChange] = useState(0);
  const [viewMode, setViewMode] = useState("month"); // "month" or "category"

  // Improved colors for better contrast and accessibility
  const COLORS = [
    "#4361EE", // Blue
    "#F72585", // Pink
    "#7209B7", // Purple
    "#3A0CA3", // Deep Purple
    "#4CC9F0", // Light Blue
    "#F9C74F", // Yellow
    "#90BE6D", // Green
    "#F94144", // Red
  ];

  // Load expenses from local storage
  const loadExpenses = () => {
    const savedExpenses = localStorage.getItem("expenses");
    if (savedExpenses) {
      try {
        const parsedExpenses = JSON.parse(savedExpenses);
        processExpenseData(parsedExpenses);
      } catch (error) {
        console.error("Error parsing expenses:", error);
        setExpenseData([]);
        setMonthlyData([]);
        setCategoryData([]);
      }
    } else {
      setExpenseData([]); // No expenses found
      setMonthlyData([]);
      setCategoryData([]);
    }
  };

  // Process expense data for visualization
  const processExpenseData = (expenses) => {
    // Get current and last month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Filter expenses for current and last month
    const currentMonthExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      );
    });

    const lastMonthExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate.getMonth() === lastMonth &&
        expenseDate.getFullYear() === lastMonthYear
      );
    });

    // Calculate totals
    const currentTotal = currentMonthExpenses.reduce(
      (sum, expense) => sum + (parseFloat(expense.amount) || 0),
      0
    );
    const lastTotal = lastMonthExpenses.reduce(
      (sum, expense) => sum + (parseFloat(expense.amount) || 0),
      0
    );

    setCurrentMonthTotal(currentTotal);
    setLastMonthTotal(lastTotal);

    // Calculate percentage change
    if (lastTotal > 0) {
      const change = ((currentTotal - lastTotal) / lastTotal) * 100;
      setPercentageChange(change);
    } else {
      setPercentageChange(currentTotal > 0 ? 100 : 0);
    }

    // Get month names for better labels
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const currentMonthName = monthNames[currentMonth];
    const lastMonthName = monthNames[lastMonth];

    // 1. Prepare Monthly View Data with better labels
    const monthlyViewData = [
      { name: currentMonthName, value: currentTotal, isCurrentMonth: true },
      { name: lastMonthName, value: lastTotal, isCurrentMonth: false },
    ];
    setMonthlyData(monthlyViewData.filter((item) => item.value > 0));

    // 2. Prepare Category View Data with better organization
    const categorySums = {};
    currentMonthExpenses.forEach((expense) => {
      if (expense.category) {
        if (categorySums[expense.category]) {
          categorySums[expense.category] += parseFloat(expense.amount) || 0;
        } else {
          categorySums[expense.category] = parseFloat(expense.amount) || 0;
        }
      }
    });

    // Sort categories by value (largest first) for better visualization
    const categoryViewData = Object.keys(categorySums)
      .map((category) => ({
        name: category,
        value: categorySums[category],
      }))
      .sort((a, b) => b.value - a.value);

    setCategoryData(categoryViewData);

    // Use the appropriate data based on current view mode
    setExpenseData(
      viewMode === "month"
        ? monthlyViewData.filter((item) => item.value > 0)
        : categoryViewData
    );
  };

  // Load expenses on component mount AND whenever the pathname changes
  // FIXED useEffect to prevent unnecessary re-renders
  useEffect(() => {
    loadExpenses();

    // Only set up interval if we're on the analytics page to prevent unnecessary re-renders
    let intervalId;
    if (location.pathname === "/analytics") {
      intervalId = setInterval(() => {
        // Check if there are any changes in localStorage before updating state
        const savedExpenses = localStorage.getItem("expenses");
        if (savedExpenses) {
          try {
            const newExpenses = JSON.parse(savedExpenses);
            // Compare with current state before updating
            const currentKey = JSON.stringify(expenseData);
            const newKey = JSON.stringify(newExpenses);
            if (currentKey !== newKey) {
              loadExpenses();
            }
          } catch (error) {
            console.error("Error parsing expenses:", error);
          }
        }
      }, 2000); // Increase interval to 2 seconds to reduce flickering
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [location.pathname, expenseData.length]);

  // Update the expenseData when viewMode changes
  useEffect(() => {
    // Update the chart data when view mode changes
    if (viewMode === "month") {
      setExpenseData(monthlyData);
    } else {
      setExpenseData(categoryData);
    }
  }, [viewMode, monthlyData, categoryData]);

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
  const handleNavigation = (tab) => {
    setActiveTab(tab);
    setMenuOpen(false);

    switch (tab) {
      case "Home":
        navigate("/dashboard");
        break;
      case "Expenses":
        navigate("/expenses");
        break;
      case "Savings":
        navigate("/savings");
        break;
      case "Analytics":
        navigate("/analytics");
        break;
      default:
        navigate(tab); // For other paths
    }
  };

  // Improved tooltip with clearer information
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const totalValue =
        viewMode === "month"
          ? currentMonthTotal + lastMonthTotal || 1
          : currentMonthTotal || 1;

      const item = payload[0];

      // Calculate percentage of total
      const percentage = Math.round((item.value / totalValue) * 100);

      // Format for display
      const formattedValue = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(item.value);

      return (
        <div className="custom-tooltip">
          <p className="category">{item.name}</p>
          <p className="amount">{formattedValue}</p>
          <p className="percent">
            {percentage}%{" "}
            {viewMode === "month" ? "of total expenses" : "of monthly expenses"}
          </p>
        </div>
      );
    }
    return null;
  };

  // Format the currency value
  const formatCurrency = (value) => {
    return value
      .toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      .replace(/\.00$/, "");
  };

  // Helper to get custom label for pie chart segments
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
    name,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 0.8;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only show label if segment is big enough (more than 5%)
    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="#fff"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // ADDED: Memoize the pie chart to prevent unnecessary re-renders
  const memoizedPieChart = useMemo(() => {
    return expenseData.length > 0 ? (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={expenseData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={115}
            innerRadius={65}
            fill="#8884d8"
            dataKey="value"
            paddingAngle={3}
            label={renderCustomizedLabel}
          >
            {expenseData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="#ffffff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            formatter={(value, entry, index) => (
              <span
                style={{
                  color: COLORS[index % COLORS.length],
                  fontWeight: 500,
                }}
              >
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    ) : null;
  }, [
    expenseData,
    COLORS,
    CustomTooltip,
    renderCustomizedLabel,
    currentMonthTotal,
    lastMonthTotal,
  ]);

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
                  <p>Notifications, security, close my account...</p>
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
        <AlertsNotification />
      </header>

      <div className="dashboard-content">
        <div className="analytics-header">
          <h2>Expense Analytics</h2>
          <div className="view-toggle">
            <button
              className={viewMode === "month" ? "active" : ""}
              onClick={() => setViewMode("month")}
            >
              Monthly
            </button>
            <button
              className={viewMode === "category" ? "active" : ""}
              onClick={() => setViewMode("category")}
            >
              Categories
            </button>
          </div>
        </div>

        <div className="analytics-card">
          <div className="chart-header">
            <div className="chart-title">
              {viewMode === "month"
                ? "Monthly Comparison"
                : "Category Breakdown"}
            </div>
            <div className="chart-details">
              <div className="month-info">
                <div className="current-month">
                  <span className="label">This Month</span>
                  <span className="value">
                    {formatCurrency(currentMonthTotal)}
                  </span>
                </div>
                <div className="last-month">
                  <span className="label">Last Month</span>
                  <span
                    className="value change-percentage"
                    style={{
                      color: percentageChange >= 0 ? "#ff6b6b" : "#4ecdc4",
                    }}
                  >
                    {percentageChange >= 0 ? "+" : ""}
                    {percentageChange.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* UPDATED: chart-container-pie with center text removed */}
          <div className="chart-container-pie">
            {expenseData.length > 0 ? (
              <>
                {memoizedPieChart}
                {/* Center text has been removed */}
              </>
            ) : (
              <div className="empty-state-container">
                <div className="empty-state-message">
                  <p>No expense data available for this period</p>
                </div>
                <div className="add-expense-button-container">
                  <button
                    className="add-expense-link"
                    onClick={() => navigate("/expenses")}
                  >
                    Add your first expense
                  </button>
                </div>
              </div>
            )}
          </div>

          <div
            className="show-more-button"
            onClick={() => navigate("/expenses")}
          >
            SHOW MORE
          </div>
        </div>

        <div className="expenses-preview">
          <h3>Recent Expenses</h3>
          <button
            className="view-all-button"
            onClick={() => navigate("/expenses")}
          >
            View All
          </button>
        </div>
      </div>

      <footer className="app-footer">
        <nav className="footer-nav">
          <div
            className={`nav-item ${activeTab === "Home" ? "active" : ""}`}
            onClick={() => handleNavigation("Home")}
          >
            <div className="nav-icon">🏠</div>
            <div className="nav-label">Home</div>
          </div>
          <div
            className={`nav-item ${activeTab === "Expenses" ? "active" : ""}`}
            onClick={() => handleNavigation("Expenses")}
          >
            <div className="nav-icon">💰</div>
            <div className="nav-label">Expenses</div>
          </div>
          <div
            className={`nav-item ${activeTab === "Savings" ? "active" : ""}`}
            onClick={() => handleNavigation("Savings")}
          >
            <div className="nav-icon">🏦</div>
            <div className="nav-label">Savings</div>
          </div>
          <div
            className={`nav-item ${activeTab === "Analytics" ? "active" : ""}`}
            onClick={() => handleNavigation("Analytics")}
          >
            <div className="nav-icon">📈</div>
            <div className="nav-label">Analytics</div>
          </div>
        </nav>
      </footer>
    </div>
  );
};

export default Analytics;
