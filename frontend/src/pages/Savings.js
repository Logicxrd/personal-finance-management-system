import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "../styles/Savings.css";
import humcashLogo from "../assets/humcash-logo.png";
import { generateAllAlerts, saveAlerts } from "../utils/AlertsUtil"; // Added import
import AlertsNotification from "../components/AlertsNotification"; // Added import

const Savings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("Savings");
  const [menuOpen, setMenuOpen] = useState(false);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [savingsHistory, setSavingsHistory] = useState([]);
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [isEditGoalModalOpen, setIsEditGoalModalOpen] = useState(false);
  const [currentGoal, setCurrentGoal] = useState(null);

  // NEW: Function to generate and save alerts after data changes
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

  // Initialize savings history with current month
  const initializeSavingsHistory = () => {
    const today = new Date();
    const currentMonth = today.toISOString().split("T")[0].substring(0, 7); // Format: YYYY-MM

    const initialHistory = [
      {
        date: currentMonth,
        amount: 0, // Start with zero
      },
    ];

    setSavingsHistory(initialHistory);
    localStorage.setItem("savingsHistory", JSON.stringify(initialHistory));
  };

  // Generate savings timeline based on earliest data
  const generateSavingsTimeline = () => {
    // Load all expenses
    const savedExpenses = localStorage.getItem("expenses");
    let expenses = [];
    if (savedExpenses) {
      try {
        expenses = JSON.parse(savedExpenses);
      } catch (error) {
        console.error("Error parsing expenses:", error);
      }
    }

    // Find the earliest date from expenses
    let earliestDate = new Date();
    if (expenses.length > 0) {
      const dates = expenses.map((expense) => new Date(expense.date));
      earliestDate = new Date(Math.min(...dates));
    }

    // Get current savings history
    const savedHistory = localStorage.getItem("savingsHistory");
    let savingsHistory = [];
    if (savedHistory) {
      try {
        savingsHistory = JSON.parse(savedHistory);

        // If we have history, find the earliest date among savings entries
        if (savingsHistory.length > 0) {
          const savingsDates = savingsHistory.map(
            (entry) => new Date(`${entry.date}-01`)
          );
          const earliestSavingsDate = new Date(Math.min(...savingsDates));

          // Use the earlier of the two dates
          if (earliestSavingsDate < earliestDate) {
            earliestDate = earliestSavingsDate;
          }
        }
      } catch (error) {
        console.error("Error parsing savings history:", error);
      }
    }

    // Create a timeline from earliest date to current month
    const timeline = [];
    const today = new Date();
    let currentDate = new Date(earliestDate);
    currentDate.setDate(1); // Set to first day of month

    // Ensure we have at least the current month
    if (currentDate > today) {
      currentDate = new Date(today);
      currentDate.setDate(1);
    }

    // Generate timeline entries for each month
    let previousAmount = 0;
    while (currentDate <= today) {
      const monthKey = currentDate.toISOString().split("T")[0].substring(0, 7);

      // Find if we have existing data for this month
      const existingEntry = savingsHistory.find(
        (entry) => entry.date === monthKey
      );

      if (existingEntry) {
        timeline.push({
          date: monthKey,
          amount: existingEntry.amount,
        });
        previousAmount = existingEntry.amount;
      } else {
        // If no data for this month, use previous month's amount
        timeline.push({
          date: monthKey,
          amount: previousAmount,
        });
      }

      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return timeline;
  };

  // Load savings goals from local storage
  const loadSavingsGoals = () => {
    const savedGoals = localStorage.getItem("savingsGoals");
    if (savedGoals) {
      try {
        const parsedGoals = JSON.parse(savedGoals);
        setSavingsGoals(parsedGoals);
      } catch (error) {
        console.error("Error parsing savings goals:", error);
        setSavingsGoals([]);
      }
    } else {
      setSavingsGoals([]); // No goals found
    }

    // Load total savings
    const savedTotalSavings = localStorage.getItem("totalSavings");
    if (savedTotalSavings) {
      try {
        const parsedTotalSavings = JSON.parse(savedTotalSavings);
        setTotalSavings(parsedTotalSavings);
      } catch (error) {
        console.error("Error parsing total savings:", error);
        setTotalSavings(0);
      }
    }

    // Load savings history
    const savedHistory = localStorage.getItem("savingsHistory");
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setSavingsHistory(parsedHistory);
      } catch (error) {
        console.error("Error parsing savings history:", error);
        setSavingsHistory([]);
      }
    } else {
      // Generate timeline if no history exists
      const timeline = generateSavingsTimeline();
      setSavingsHistory(timeline);
      localStorage.setItem("savingsHistory", JSON.stringify(timeline));
    }
  };

  // Load savings goals when component mounts - FIXED INTERVAL LOGIC
  useEffect(() => {
    // Load savings goals
    const savedGoals = localStorage.getItem("savingsGoals");
    if (savedGoals) {
      try {
        const parsedGoals = JSON.parse(savedGoals);
        setSavingsGoals(parsedGoals);
      } catch (error) {
        console.error("Error parsing savings goals:", error);
        setSavingsGoals([]);
      }
    } else {
      setSavingsGoals([]);
    }

    // Load total savings
    const savedTotalSavings = localStorage.getItem("totalSavings");
    if (savedTotalSavings) {
      try {
        const parsedTotalSavings = JSON.parse(savedTotalSavings);
        setTotalSavings(parsedTotalSavings);
      } catch (error) {
        console.error("Error parsing total savings:", error);
        setTotalSavings(0);
      }
    }

    // Generate and set savings timeline
    const timeline = generateSavingsTimeline();
    setSavingsHistory(timeline);

    // Only set up interval if no modals are open
    let intervalId;
    if (!isAddGoalModalOpen && !isEditGoalModalOpen && !currentGoal) {
      intervalId = setInterval(() => {
        // Reload savings goals
        const savedGoals = localStorage.getItem("savingsGoals");
        if (savedGoals) {
          try {
            const parsedGoals = JSON.parse(savedGoals);
            setSavingsGoals(parsedGoals);
          } catch (error) {
            console.error("Error parsing savings goals:", error);
          }
        }

        // Reload total savings
        const savedTotalSavings = localStorage.getItem("totalSavings");
        if (savedTotalSavings) {
          try {
            const parsedTotalSavings = JSON.parse(savedTotalSavings);
            setTotalSavings(parsedTotalSavings);
          } catch (error) {
            console.error("Error parsing total savings:", error);
          }
        }

        // Reload savings history
        const savedHistory = localStorage.getItem("savingsHistory");
        if (savedHistory) {
          try {
            const parsedHistory = JSON.parse(savedHistory);
            setSavingsHistory(parsedHistory);
          } catch (error) {
            console.error("Error parsing savings history:", error);
          }
        }
      }, 2000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId); // Clean up interval
    };
  }, [location.pathname, isAddGoalModalOpen, isEditGoalModalOpen, currentGoal]);

  // Save savings goals to local storage when they change
  useEffect(() => {
    if (savingsGoals.length > 0) {
      localStorage.setItem("savingsGoals", JSON.stringify(savingsGoals));
    }
  }, [savingsGoals]);

  // MODIFIED: Handle adding a new savings goal with alert generation
  const handleAddGoal = (newGoal) => {
    const updatedGoals = [...savingsGoals, { ...newGoal, id: Date.now() }];
    setSavingsGoals(updatedGoals);
    setIsAddGoalModalOpen(false);

    // Update localStorage
    localStorage.setItem("savingsGoals", JSON.stringify(updatedGoals));

    // NEW: Generate alerts
    generateAndSaveAlerts();
  };

  // MODIFIED: Handle editing a savings goal with alert generation
  const handleEditGoal = (updatedGoal) => {
    const updatedGoals = savingsGoals.map((goal) =>
      goal.id === updatedGoal.id ? updatedGoal : goal
    );

    setSavingsGoals(updatedGoals);
    setIsEditGoalModalOpen(false);
    setCurrentGoal(null);

    // Update localStorage
    localStorage.setItem("savingsGoals", JSON.stringify(updatedGoals));

    // NEW: Generate alerts
    generateAndSaveAlerts();
  };

  // MODIFIED: Handle deleting a savings goal with alert generation
  const handleDeleteGoal = (id) => {
    // Filter out the goal with the specified id
    const updatedGoals = savingsGoals.filter((goal) => goal.id !== id);

    // Update the state
    setSavingsGoals(updatedGoals);

    // Immediately update localStorage
    if (updatedGoals.length > 0) {
      localStorage.setItem("savingsGoals", JSON.stringify(updatedGoals));
    } else {
      // If there are no goals left, remove the item from localStorage
      localStorage.removeItem("savingsGoals");
    }

    // NEW: Generate alerts
    generateAndSaveAlerts();

    // Force a refresh of the component
    loadSavingsGoals();
  };

  // Open edit modal for a goal
  const openEditModal = (goal) => {
    setCurrentGoal(goal);
    setIsEditGoalModalOpen(true);
  };

  // MODIFIED: Handle contributing to a goal with alert generation
  const handleContribute = (goalId, amount) => {
    // Parse the amount to ensure it's a number
    const parsedAmount = parseFloat(amount);

    // Update the goals
    const updatedGoals = savingsGoals.map((goal) => {
      if (goal.id === goalId) {
        // Make sure we're working with numbers
        const currentAmount = parseFloat(goal.currentAmount) || 0;
        const newCurrentAmount = currentAmount + parsedAmount;

        return {
          ...goal,
          currentAmount: newCurrentAmount,
        };
      }
      return goal;
    });

    // Update state with the new goals
    setSavingsGoals(updatedGoals);

    // Force save to localStorage to ensure persistence
    localStorage.setItem("savingsGoals", JSON.stringify(updatedGoals));

    // Update total savings
    const newTotalSavings = totalSavings + parsedAmount;
    setTotalSavings(newTotalSavings);
    localStorage.setItem("totalSavings", JSON.stringify(newTotalSavings));

    // Update savings history for the current month
    const today = new Date();
    const month = today.toISOString().split("T")[0].substring(0, 7); // YYYY-MM

    let historyUpdated = false;
    const updatedHistory = savingsHistory.map((entry) => {
      if (entry.date === month) {
        historyUpdated = true;
        return {
          ...entry,
          amount: entry.amount + parsedAmount,
        };
      }
      return entry;
    });

    if (!historyUpdated) {
      updatedHistory.push({
        date: month,
        amount: parsedAmount,
      });
    }

    // Sort history by date
    updatedHistory.sort(
      (a, b) => new Date(`${a.date}-01`) - new Date(`${b.date}-01`)
    );

    setSavingsHistory(updatedHistory);
    localStorage.setItem("savingsHistory", JSON.stringify(updatedHistory));

    // After updating the history, regenerate the timeline
    const timeline = generateSavingsTimeline();
    setSavingsHistory(timeline);
    localStorage.setItem("savingsHistory", JSON.stringify(timeline));

    // NEW: Generate alerts
    generateAndSaveAlerts();
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

  // Calculate progress percentage for a goal - ensure we're working with numbers
  const calculateProgress = (currentAmount, targetAmount) => {
    // Convert to numbers to ensure proper calculation
    const current = parseFloat(currentAmount) || 0;
    const target = parseFloat(targetAmount) || 1; // Avoid division by zero

    // Calculate percentage and limit to 100%
    return Math.min(100, Math.round((current / target) * 100));
  };

  // Calculate days remaining for a goal
  const calculateRemainingDays = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const timeDiff = deadlineDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return Math.max(0, daysDiff);
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
        {/* Added AlertsNotification component here */}
        <AlertsNotification />
      </header>
      <div className="dashboard-content">
        {/* Total Savings Card */}
        <div className="savings-card">
          <div className="savings-total-header">
            <h2>Total Savings</h2>
          </div>
          <div className="savings-total-amount">
            {formatCurrency(totalSavings)}
          </div>
          <div className="savings-growth">+12.3% from last month</div>
        </div>

        {/* Savings Chart */}
        <div className="savings-chart-card">
          <div className="chart-header">
            <div className="chart-title">Savings Chart</div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={savingsHistory}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => {
                    // Convert YYYY-MM to MMM format (e.g., Jan, Feb)
                    const monthNames = [
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
                    const [year, month] = date.split("-");
                    return `${monthNames[parseInt(month) - 1]} ${year.substring(
                      2
                    )}`;
                  }}
                />
                <YAxis />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  labelFormatter={(date) => {
                    // Format the label to show Month Year
                    const [year, month] = date.split("-");
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
                    return `${monthNames[parseInt(month) - 1]} ${year}`;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="show-more-button">SHOW MORE</div>
        </div>

        {/* Savings Goals */}
        <div className="savings-goals-header">
          <h2>Savings Goals</h2>
          <button
            className="add-goal-button"
            onClick={() => setIsAddGoalModalOpen(true)}
          >
            + Add Goal
          </button>
        </div>

        <div className="savings-goals-container">
          {savingsGoals.length === 0 ? (
            <div className="no-goals">
              <p>
                No savings goals yet. Click the button above to add your first
                goal.
              </p>
            </div>
          ) : (
            <div className="savings-goals-list">
              {savingsGoals.map((goal) => (
                <div key={goal.id} className="savings-goal-item">
                  <div className="goal-icon">{goal.icon}</div>
                  <div className="goal-details">
                    <div className="goal-header">
                      <h3>{goal.name}</h3>
                      <div className="goal-actions">
                        <button
                          className="contribute-button"
                          onClick={() => setCurrentGoal(goal)}
                        >
                          +
                        </button>
                        <button onClick={() => openEditModal(goal)}>
                          Edit
                        </button>
                        <button onClick={() => handleDeleteGoal(goal.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="goal-progress-info">
                      <div className="goal-amounts">
                        <span>{formatCurrency(goal.currentAmount)}</span>
                        <span className="goal-target">
                          of {formatCurrency(goal.targetAmount)}
                        </span>
                      </div>
                      <div className="goal-deadline">
                        {calculateRemainingDays(goal.deadline)} days remaining
                      </div>
                    </div>
                    <div className="goal-progress-bar-container">
                      <div
                        className="goal-progress-bar"
                        style={{
                          width: `${calculateProgress(
                            goal.currentAmount,
                            goal.targetAmount
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="goal-progress-percentage">
                      {calculateProgress(goal.currentAmount, goal.targetAmount)}
                      %
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Savings Goal Modal */}
      {isAddGoalModalOpen && (
        <SavingsGoalModal
          onClose={() => setIsAddGoalModalOpen(false)}
          onSave={handleAddGoal}
          isEdit={false}
        />
      )}

      {/* Edit Savings Goal Modal */}
      {isEditGoalModalOpen && (
        <SavingsGoalModal
          onClose={() => setIsEditGoalModalOpen(false)}
          onSave={handleEditGoal}
          isEdit={true}
          goal={currentGoal}
        />
      )}

      {/* Contribute to Goal Modal */}
      {currentGoal && !isEditGoalModalOpen && (
        <ContributeModal
          onClose={() => setCurrentGoal(null)}
          onSave={(amount) => {
            handleContribute(currentGoal.id, amount);
            setCurrentGoal(null);
          }}
          goal={currentGoal}
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

// Savings Goal Modal Component - Now defined inside Savings component
const SavingsGoalModal = ({ onClose, onSave, isEdit, goal }) => {
  const [formData, setFormData] = useState(
    isEdit
      ? { ...goal }
      : {
          name: "",
          targetAmount: "",
          currentAmount: 0,
          deadline: new Date().toISOString().split("T")[0],
          icon: "🎯", // Default icon
        }
  );

  const icons = ["🎯", "🏠", "🚗", "✈️", "🎓", "💍", "👶", "🏝️", "💻", "🏋️‍♀️"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "targetAmount" || name === "currentAmount"
          ? parseFloat(value) || 0
          : value,
    });
  };

  const handleIconSelect = (icon) => {
    setFormData({
      ...formData,
      icon: icon,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{isEdit ? "Edit Savings Goal" : "Add Savings Goal"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Goal Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. New Car, Vacation, Emergency Fund"
              required
            />
          </div>
          <div className="form-group">
            <label>Target Amount ($)</label>
            <input
              type="number"
              name="targetAmount"
              value={formData.targetAmount}
              onChange={handleChange}
              step="0.01"
              min="0.01"
              placeholder="5000.00"
              required
            />
          </div>
          {isEdit && (
            <div className="form-group">
              <label>Current Amount ($)</label>
              <input
                type="number"
                name="currentAmount"
                value={formData.currentAmount}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
              />
            </div>
          )}
          <div className="form-group">
            <label>Target Date</label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>
          <div className="form-group">
            <label>Icon</label>
            <div className="icon-selector">
              {icons.map((icon) => (
                <div
                  key={icon}
                  className={`icon-option ${
                    formData.icon === icon ? "selected" : ""
                  }`}
                  onClick={() => handleIconSelect(icon)}
                >
                  {icon}
                </div>
              ))}
            </div>
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

// Contribute to Goal Modal Component - Now defined inside Savings component
const ContributeModal = ({ onClose, onSave, goal }) => {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }

    const parsedAmount = parseFloat(amount);

    // Check if contribution would exceed the goal
    const newTotal = parseFloat(goal.currentAmount) + parsedAmount;
    if (newTotal > parseFloat(goal.targetAmount)) {
      setError(
        `This contribution would exceed your goal by $${(
          newTotal - goal.targetAmount
        ).toFixed(2)}`
      );
      return;
    }

    onSave(parsedAmount);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Contribute to {goal.name}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Amount to Add ($)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError(""); // Clear error when user types
              }}
              step="0.01"
              min="0.01"
              placeholder="100.00"
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="goal-summary">
            <div className="summary-row">
              <span>Current Progress:</span>
              <span>
                ${goal.currentAmount} of ${goal.targetAmount}
              </span>
            </div>
            <div className="summary-row">
              <span>After Contribution:</span>
              <span>
                $
                {(
                  parseFloat(goal.currentAmount) + (parseFloat(amount) || 0)
                ).toFixed(2)}{" "}
                of ${goal.targetAmount}
              </span>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">Contribute</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Savings;
