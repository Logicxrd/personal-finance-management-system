import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Expenses.css";
import humcashLogo from "../assets/humcash-logo.png";

const Expenses = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("Expenses");
  const [menuOpen, setMenuOpen] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);

  // Load expenses from local storage
  const loadExpenses = () => {
    const savedExpenses = localStorage.getItem("expenses");
    if (savedExpenses) {
      try {
        const parsedExpenses = JSON.parse(savedExpenses);
        setExpenses(parsedExpenses);
      } catch (error) {
        console.error("Error parsing expenses:", error);
        setExpenses([]);
      }
    } else {
      setExpenses([]); // No expenses found
    }
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

  const handleAddExpense = (newExpense) => {
    const updatedExpenses = [...expenses, { ...newExpense, id: Date.now() }];
    setExpenses(updatedExpenses);
    setIsAddModalOpen(false);
  };

  const handleEditExpense = (updatedExpense) => {
    const updatedExpenses = expenses.map((expense) =>
      expense.id === updatedExpense.id ? updatedExpense : expense
    );
    setExpenses(updatedExpenses);
    setIsEditModalOpen(false);
    setCurrentExpense(null);
  };

  const handleDeleteExpense = (id) => {
    console.log("Deleting Expense ID:", id); // Log the ID here
    const updatedExpenses = expenses.filter((expense) => expense.id !== id);
    setExpenses(updatedExpenses);
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
      </header>

      <div className="dashboard-content">
        <div className="expenses-header">
          <h2>My Expenses</h2>
          <button
            className="add-expense-button"
            onClick={() => setIsAddModalOpen(true)}
          >
            + Add Expense
          </button>
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
                    ${expense.amount.toFixed(2)}
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
