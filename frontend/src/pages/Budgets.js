// Budgets.js - Complete implementation
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Budgets.css"; // You'll need to create this CSS file
import humcashLogo from "../assets/humcash-logo.png";
import AlertsNotification from "../components/AlertsNotification";
import { generateAllAlerts, saveAlerts } from "../utils/AlertsUtil";

const Budgets = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("Budgets");
  const [menuOpen, setMenuOpen] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentBudget, setCurrentBudget] = useState(null);

  // Categories for budgets (same as expenses for consistency)
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

  // Load budgets on component mount
  useEffect(() => {
    loadBudgets();
    const intervalId = setInterval(loadBudgets, 500); // Check every 500ms
    return () => clearInterval(intervalId); // Clean up interval
  }, [location.pathname]);

  // Function to load budgets from localStorage
  const loadBudgets = () => {
    const savedBudgets = localStorage.getItem("budgets");
    if (savedBudgets) {
      try {
        const parsedBudgets = JSON.parse(savedBudgets);
        setBudgets(parsedBudgets);
      } catch (error) {
        console.error("Error parsing budgets:", error);
        setBudgets([]);
      }
    } else {
      setBudgets([]); // No budgets found
    }
  };

  // Function to update alerts when budgets change
  const updateAlerts = () => {
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

  // Handle adding a new budget
  const handleAddBudget = (newBudget) => {
    // Check if a budget for this category already exists
    const existingBudgetIndex = budgets.findIndex(
      (budget) => budget.category === newBudget.category
    );

    let updatedBudgets;
    if (existingBudgetIndex >= 0) {
      // Update existing budget
      updatedBudgets = [...budgets];
      updatedBudgets[existingBudgetIndex] = {
        ...updatedBudgets[existingBudgetIndex],
        amount: newBudget.amount,
      };
    } else {
      // Add new budget
      updatedBudgets = [...budgets, { ...newBudget, id: Date.now() }];
    }

    setBudgets(updatedBudgets);
    localStorage.setItem("budgets", JSON.stringify(updatedBudgets));
    setIsAddModalOpen(false);

    // Update alerts when budget changes
    updateAlerts();
  };

  // Handle editing a budget
  const handleEditBudget = (updatedBudget) => {
    const updatedBudgets = budgets.map((budget) =>
      budget.id === updatedBudget.id ? updatedBudget : budget
    );

    setBudgets(updatedBudgets);
    localStorage.setItem("budgets", JSON.stringify(updatedBudgets));
    setIsEditModalOpen(false);
    setCurrentBudget(null);

    // Update alerts when budget changes
    updateAlerts();
  };

  // Handle deleting a budget
  const handleDeleteBudget = (id) => {
    const updatedBudgets = budgets.filter((budget) => budget.id !== id);

    setBudgets(updatedBudgets);
    localStorage.setItem("budgets", JSON.stringify(updatedBudgets));

    // Update alerts when budget changes
    updateAlerts();
  };

  // Open edit modal for a budget
  const openEditModal = (budget) => {
    setCurrentBudget(budget);
    setIsEditModalOpen(true);
  };

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
    setMenuOpen(false);
    setActiveTab(tab);
    if (tab === "Home") {
      navigate("/dashboard");
    } else if (tab === "Expenses") {
      navigate("/expenses");
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

  // Calculate spending progress for a category
  const calculateSpendingProgress = (category) => {
    // Load expenses from localStorage
    const savedExpenses = localStorage.getItem("expenses");
    if (!savedExpenses) return { spent: 0, percentage: 0 };

    try {
      const expenses = JSON.parse(savedExpenses);

      // Get current month expenses
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const categoryExpenses = expenses.filter((expense) => {
        const expenseDate = new Date(expense.date);
        return (
          expense.category === category &&
          expenseDate.getMonth() === currentMonth &&
          expenseDate.getFullYear() === currentYear
        );
      });

      // Calculate total spent
      const spent = categoryExpenses.reduce(
        (sum, expense) => sum + (parseFloat(expense.amount) || 0),
        0
      );

      // Find budget for this category
      const budget = budgets.find((b) => b.category === category);
      if (!budget) return { spent, percentage: 0 };

      // Calculate percentage
      const percentage = Math.min(
        100,
        Math.round((spent / budget.amount) * 100)
      );

      return { spent, percentage };
    } catch (error) {
      console.error("Error calculating spending progress:", error);
      return { spent: 0, percentage: 0 };
    }
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
        {/* Budgets Header */}
        <div className="budgets-header">
          <h2>My Budgets</h2>
          <button
            className="add-budget-button"
            onClick={() => setIsAddModalOpen(true)}
          >
            + Add Budget
          </button>
        </div>

        <div className="budgets-container">
          {budgets.length === 0 ? (
            <div className="no-budgets">
              <p>
                No budgets yet. Click the button above to add your first budget.
              </p>
            </div>
          ) : (
            <div className="budgets-list">
              {budgets.map((budget) => {
                const { spent, percentage } = calculateSpendingProgress(
                  budget.category
                );
                const isOverBudget = spent > budget.amount;

                return (
                  <div key={budget.id} className="budget-item">
                    <div className="budget-icon">
                      {categories.find((cat) => cat.name === budget.category)
                        ?.icon || "📊"}
                    </div>
                    <div className="budget-details">
                      <div className="budget-header">
                        <h3>{budget.category}</h3>
                        <div className="budget-actions">
                          <button onClick={() => openEditModal(budget)}>
                            Edit
                          </button>
                          <button onClick={() => handleDeleteBudget(budget.id)}>
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="budget-info">
                        <span className="budget-amount">
                          {formatCurrency(budget.amount)}
                        </span>
                        <span className="budget-spent">
                          Spent:{" "}
                          <span className={isOverBudget ? "over-budget" : ""}>
                            {formatCurrency(spent)}
                          </span>
                        </span>
                      </div>
                      <div className="budget-progress-bar-container">
                        <div
                          className={`budget-progress-bar ${
                            isOverBudget ? "over-budget" : ""
                          }`}
                          style={{
                            width: `${percentage}%`,
                          }}
                        ></div>
                      </div>
                      <div className="budget-progress-percentage">
                        {percentage}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Budget Modal */}
      {isAddModalOpen && (
        <BudgetFormModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddBudget}
          isEdit={false}
          categories={categories}
          existingBudgets={budgets}
        />
      )}

      {/* Edit Budget Modal */}
      {isEditModalOpen && currentBudget && (
        <BudgetFormModal
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleEditBudget}
          isEdit={true}
          budget={currentBudget}
          categories={categories}
          existingBudgets={budgets}
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

// Budget Form Modal Component
const BudgetFormModal = ({
  onClose,
  onSave,
  isEdit,
  budget,
  categories,
  existingBudgets,
}) => {
  const [formData, setFormData] = useState(
    isEdit
      ? { ...budget }
      : {
          category: "",
          amount: "",
        }
  );

  const [error, setError] = useState("");

  // Filter out categories that already have budgets
  const availableCategories = categories.filter(
    (category) =>
      !existingBudgets.some(
        (budget) =>
          budget.category === category.name &&
          (!isEdit || budget.id !== formData.id)
      )
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "amount" ? parseFloat(value) || "" : value,
    });
    setError(""); // Clear error when user changes input
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.category) {
      setError("Please select a category");
      return;
    }

    if (!formData.amount || formData.amount <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }

    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{isEdit ? "Edit Budget" : "Add Budget"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Category</label>
            {isEdit ? (
              <input type="text" value={formData.category} readOnly />
            ) : (
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select a category</option>
                {availableCategories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="form-group">
            <label>Budget Amount ($)</label>
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
          {error && <div className="error-message">{error}</div>}
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

export default Budgets;
