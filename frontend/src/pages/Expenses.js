import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import "../styles/Expenses.css";
import humcashLogo from "../assets/humcash-logo.png";
import { generateAllAlerts, saveAlerts } from "../utils/AlertsUtil";
import AlertsNotification from "../components/AlertsNotification";

const Expenses = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("Expenses");
  const [menuOpen, setMenuOpen] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [viewMode, setViewMode] = useState("month"); // "month" or "category"
  const [currentMonthTotal, setCurrentMonthTotal] = useState(0);
  const [lastMonthTotal, setLastMonthTotal] = useState(0);
  const [percentageChange, setPercentageChange] = useState(0);
  const [categoryData, setCategoryData] = useState([]);

  // Colors for the pie chart segments
  const COLORS = [
    "#0088FE",
    "#FF8042",
    "#8884D8",
    "#FFBB28",
    "#00C49F",
    "#FF6666",
    "#36A2EB",
    "#FF9F40",
  ];

  // Function to generate and save alerts - NEW FUNCTION
  const generateAndSaveAlerts = () => {
    // Load data from localStorage
    const expenses = JSON.parse(localStorage.getItem("expenses") || "[]");
    const budgets = JSON.parse(localStorage.getItem("budgets") || "[]");
    const savingsGoals = JSON.parse(
      localStorage.getItem("savingsGoals") || "[]"
    );

    // Generate alerts
    const newAlerts = generateAllAlerts(expenses, budgets, savingsGoals);

    // Save alerts
    saveAlerts(newAlerts);
  };

  // Load expenses from local storage
  const loadExpenses = () => {
    const savedExpenses = localStorage.getItem("expenses");
    if (savedExpenses) {
      try {
        const parsedExpenses = JSON.parse(savedExpenses);
        setExpenses(parsedExpenses);
        processExpenseData(parsedExpenses);
      } catch (error) {
        console.error("Error parsing expenses:", error);
        setExpenses([]);
      }
    } else {
      setExpenses([]); // No expenses found
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

    // Group expenses by category for the current month
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

    // Convert to array for the pie chart
    const categoryDataArray = Object.keys(categorySums).map((category) => ({
      name: category,
      value: categorySums[category],
    }));

    setCategoryData(categoryDataArray);
  };

  // Load expenses on component mount AND whenever the pathname changes
  useEffect(() => {
    loadExpenses();
    const intervalId = setInterval(loadExpenses, 500); // Check every 500ms
    return () => clearInterval(intervalId); // Clean up interval
  }, [location.pathname]);

  // Save expenses to local storage whenever they change
  useEffect(() => {
    if (expenses.length > 0) {
      localStorage.setItem("expenses", JSON.stringify(expenses));
    } else {
      localStorage.removeItem("expenses"); // Remove if no expenses left
    }
  }, [expenses]);

  // New function to handle deducting expenses from savings
  const deductFromSavingsIfNeeded = (expense) => {
    // Load current savings data
    const savedTotalSavings = localStorage.getItem("totalSavings");
    if (!savedTotalSavings) return;

    // Get the total savings amount
    const totalSavings = JSON.parse(savedTotalSavings);

    // Check if savings history exists
    const savedHistory = localStorage.getItem("savingsHistory");
    if (!savedHistory) return;

    // Parse savings history to find latest contribution
    const savingsHistory = JSON.parse(savedHistory);
    if (savingsHistory.length === 0) return;

    // Sort savings history by date (newest first)
    savingsHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Get the date of the latest savings contribution
    const latestContributionMonth = savingsHistory[0].date; // Format: YYYY-MM
    const latestContributionDate = new Date(`${latestContributionMonth}-01`);

    // Get the expense date
    const expenseDate = new Date(expense.date);

    // If the expense is in the same month or after the latest contribution, deduct it from savings
    if (expenseDate >= latestContributionDate) {
      const newTotalSavings = Math.max(0, totalSavings - expense.amount);
      localStorage.setItem("totalSavings", JSON.stringify(newTotalSavings));

      // Update the savings history for the current month
      const expenseMonth = expense.date.substring(0, 7); // Format: YYYY-MM
      const updatedHistory = savingsHistory.map((entry) => {
        if (entry.date === expenseMonth) {
          return {
            ...entry,
            amount: Math.max(0, entry.amount - expense.amount),
          };
        }
        return entry;
      });

      localStorage.setItem("savingsHistory", JSON.stringify(updatedHistory));
    }
  };

  // New function to add back to savings when expense is deleted
  const addBackToSavingsIfNeeded = (expense) => {
    if (!expense) return;

    // Load current savings data
    const savedTotalSavings = localStorage.getItem("totalSavings");
    if (!savedTotalSavings) return;

    // Get the total savings amount
    const totalSavings = JSON.parse(savedTotalSavings);

    // Check if savings history exists
    const savedHistory = localStorage.getItem("savingsHistory");
    if (!savedHistory) return;

    // Parse savings history
    const savingsHistory = JSON.parse(savedHistory);
    if (savingsHistory.length === 0) return;

    // Sort savings history by date (newest first)
    savingsHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Get the date of the latest savings contribution
    const latestContributionMonth = savingsHistory[0].date; // Format: YYYY-MM
    const latestContributionDate = new Date(`${latestContributionMonth}-01`);

    // Get the expense date
    const expenseDate = new Date(expense.date);

    // If the expense was in the same month or after the latest contribution, add it back to savings
    if (expenseDate >= latestContributionDate) {
      const newTotalSavings = totalSavings + expense.amount;
      localStorage.setItem("totalSavings", JSON.stringify(newTotalSavings));

      // Update the savings history for the expense's month
      const expenseMonth = expense.date.substring(0, 7); // Format: YYYY-MM
      const updatedHistory = savingsHistory.map((entry) => {
        if (entry.date === expenseMonth) {
          return {
            ...entry,
            amount: entry.amount + expense.amount,
          };
        }
        return entry;
      });

      localStorage.setItem("savingsHistory", JSON.stringify(updatedHistory));
    }
  };

  // MODIFIED: Generate alerts after adding expense
  const handleAddExpense = (newExpense) => {
    const updatedExpenses = [...expenses, { ...newExpense, id: Date.now() }];
    setExpenses(updatedExpenses);
    setIsAddModalOpen(false);

    // Update localStorage
    localStorage.setItem("expenses", JSON.stringify(updatedExpenses));

    // New functionality: Deduct from savings if expense is on or after latest savings contribution
    deductFromSavingsIfNeeded(newExpense);

    // NEW: Generate and save alerts
    generateAndSaveAlerts();
  };

  // MODIFIED: Generate alerts after editing expense
  const handleEditExpense = (updatedExpense) => {
    // Find the original expense
    const originalExpense = expenses.find(
      (expense) => expense.id === updatedExpense.id
    );

    // Update expenses
    const updatedExpenses = expenses.map((expense) =>
      expense.id === updatedExpense.id ? updatedExpense : expense
    );

    setExpenses(updatedExpenses);
    setIsEditModalOpen(false);
    setCurrentExpense(null);

    // If amount changed, adjust savings
    if (originalExpense && originalExpense.amount !== updatedExpense.amount) {
      // If expense decreased, add the difference back to savings
      if (originalExpense.amount > updatedExpense.amount) {
        const difference = originalExpense.amount - updatedExpense.amount;
        const tempExpense = { ...originalExpense, amount: difference };
        addBackToSavingsIfNeeded(tempExpense);
      }
      // If expense increased, deduct the difference from savings
      else if (originalExpense.amount < updatedExpense.amount) {
        const difference = updatedExpense.amount - originalExpense.amount;
        const tempExpense = { ...updatedExpense, amount: difference };
        deductFromSavingsIfNeeded(tempExpense);
      }
    }

    // NEW: Generate and save alerts
    generateAndSaveAlerts();
  };

  // MODIFIED: Generate alerts after deleting expense
  const handleDeleteExpense = (id) => {
    // Find the expense before deleting it
    const expenseToDelete = expenses.find((expense) => expense.id === id);

    // Delete the expense
    const updatedExpenses = expenses.filter((expense) => expense.id !== id);
    setExpenses(updatedExpenses);

    // Update localStorage
    localStorage.setItem("expenses", JSON.stringify(updatedExpenses));

    // Add back to savings if the expense was deducted
    addBackToSavingsIfNeeded(expenseToDelete);

    // NEW: Generate and save alerts
    generateAndSaveAlerts();
  };

  const openEditModal = (expense) => {
    setCurrentExpense(expense);
    setIsEditModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/");
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleNavigation = (tab) => {
    setMenuOpen(false);
    setActiveTab(tab);
    if (tab === "Home") {
      navigate("/dashboard");
    } else if (tab === "Savings") {
      navigate("/savings");
    } else if (tab === "Analytics") {
      navigate("/analytics");
    }
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

  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="category">{payload[0].name}</p>
          <p className="amount">${payload[0].value.toFixed(2)}</p>
          <p className="percent">
            {((payload[0].value / currentMonthTotal) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
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
        {/* Added AlertsNotification component here */}
        <AlertsNotification />
      </header>

      <div className="dashboard-content">
        {/* Expense Analytics Card */}
        <div className="analytics-card">
          <div className="chart-header">
            <div className="chart-title">Expense Structure</div>
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

          <div className="chart-container-pie">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state-container">
                <div className="empty-state-message">
                  <p>No expense data available for this period</p>
                </div>
                <div className="add-expense-button-container">
                  <button
                    className="add-expense-link"
                    onClick={() => setIsAddModalOpen(true)}
                  >
                    Add your first expense
                  </button>
                </div>
              </div>
            )}
          </div>

          <div
            className="show-more-button"
            onClick={() => navigate("/analytics")}
          >
            SHOW MORE
          </div>
        </div>

        {/* MODIFIED: Expenses Header with Manage Budgets button */}
        <div className="expenses-header">
          <h2>My Expenses</h2>
          <div className="expenses-actions">
            <button
              className="manage-budgets-button"
              onClick={() => navigate("/budgets")}
            >
              Manage Budgets
            </button>
            <button
              className="add-expense-button"
              onClick={() => setIsAddModalOpen(true)}
            >
              + Add Expense
            </button>
          </div>
        </div>

        <div className="expenses-list-container">
          {expenses.length === 0 ? (
            <div className="no-expenses">
              <p>
                No expenses yet. Click the button above to add your first
                expense.
              </p>
            </div>
          ) : (
            <div className="expenses-list">
              {expenses.map((expense) => (
                <div key={expense.id} className="expense-item-full">
                  <div className="expense-icon">{expense.icon}</div>
                  <div className="expense-details">
                    <p className="expense-merchant">{expense.merchant}</p>
                    <p className="expense-category">{expense.category}</p>
                    <p className="expense-date">{expense.date}</p>
                  </div>
                  <div className="expense-amount">
                    ${parseFloat(expense.amount).toFixed(2)}
                  </div>
                  <div className="expense-actions">
                    <button onClick={() => openEditModal(expense)}>Edit</button>
                    <button onClick={() => handleDeleteExpense(expense.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      {isAddModalOpen && (
        <ExpenseFormModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddExpense}
          isEdit={false}
        />
      )}

      {/* Edit Expense Modal */}
      {isEditModalOpen && (
        <ExpenseFormModal
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleEditExpense}
          isEdit={true}
          expense={currentExpense}
        />
      )}

      {/* Footer Navigation */}
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

// Form modal component for adding/editing expenses
const ExpenseFormModal = ({ onClose, onSave, isEdit, expense }) => {
  const [formData, setFormData] = useState(
    isEdit
      ? { ...expense }
      : {
          merchant: "",
          amount: "",
          category: "",
          date: new Date().toISOString().split("T")[0],
          icon: "🛒", // Default icon
        }
  );

  const categories = [
    { name: "Food", icon: "🛒" },
    { name: "Transportation", icon: "🚗" },
    { name: "Rent", icon: "🏠" },
    { name: "Entertainment", icon: "🎬" },
    { name: "Clothing", icon: "👕" },
    { name: "Debts/Loans", icon: "💳" },
    { name: "Subscriptions", icon: "📱" },
    { name: "Other", icon: "📦" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "amount" ? parseFloat(value) || "" : value,
    });
  };

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    const categoryObj = categories.find((cat) => cat.name === selectedCategory);
    setFormData({
      ...formData,
      category: selectedCategory,
      icon: categoryObj ? categoryObj.icon : "📦",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{isEdit ? "Edit Expense" : "Add Expense"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Merchant</label>
            <input
              type="text"
              name="merchant"
              value={formData.merchant}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Amount ($)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              min="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleCategoryChange}
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">{isEdit ? "Update" : "Add"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Expenses;
