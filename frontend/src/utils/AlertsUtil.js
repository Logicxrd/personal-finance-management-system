// Types of alerts
export const ALERT_TYPES = {
  BUDGET_EXCEEDED: "budget_exceeded",
  BUDGET_NEAR_LIMIT: "budget_near_limit",
  SAVING_GOAL_ACHIEVED: "saving_goal_achieved",
  SAVING_GOAL_NEAR: "saving_goal_near",
  UNUSUAL_EXPENSE: "unusual_expense",
  PAYMENT_DUE: "payment_due",
  SYSTEM: "system",
};

// Check for budget alerts
export const checkBudgetAlerts = (expenses, budgets) => {
  const alerts = [];

  if (!budgets.length || !expenses.length) {
    return alerts;
  }

  // Get current month expenses
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    return (
      expenseDate.getMonth() === currentMonth &&
      expenseDate.getFullYear() === currentYear
    );
  });

  // Calculate spent per category
  const categorySpending = {};

  currentMonthExpenses.forEach((expense) => {
    const category = expense.category;
    const amount = parseFloat(expense.amount) || 0;

    if (!categorySpending[category]) {
      categorySpending[category] = 0;
    }

    categorySpending[category] += amount;
  });

  // Check each budget for alerts
  budgets.forEach((budget) => {
    const budgetCategory = budget.category;
    const budgetAmount = budget.amount;
    const spent = categorySpending[budgetCategory] || 0;

    // Check if budget is exceeded
    if (spent > budgetAmount) {
      alerts.push({
        id: Date.now() + Math.random(),
        type: ALERT_TYPES.BUDGET_EXCEEDED,
        title: "Budget Exceeded",
        message: `You've exceeded your ${budgetCategory} budget by ${(
          spent - budgetAmount
        ).toFixed(2)}`,
        category: budgetCategory,
        amount: spent,
        budget: budgetAmount,
        createdAt: new Date().toISOString(),
        read: false,
      });
    }
    // Check if budget is near limit (80% or more)
    else if (spent >= budgetAmount * 0.8) {
      alerts.push({
        id: Date.now() + Math.random(),
        type: ALERT_TYPES.BUDGET_NEAR_LIMIT,
        title: "Budget Alert",
        message: `You've used ${Math.round(
          (spent / budgetAmount) * 100
        )}% of your ${budgetCategory} budget`,
        category: budgetCategory,
        amount: spent,
        budget: budgetAmount,
        createdAt: new Date().toISOString(),
        read: false,
      });
    }
  });

  return alerts;
};

// Check for savings goal alerts
export const checkSavingsGoalAlerts = (savingsGoals) => {
  const alerts = [];

  if (!savingsGoals || !savingsGoals.length) {
    return alerts;
  }

  savingsGoals.forEach((goal) => {
    const currentAmount = parseFloat(goal.currentAmount) || 0;
    const targetAmount = parseFloat(goal.targetAmount) || 0;
    const percentage = (currentAmount / targetAmount) * 100;

    // Goal achieved
    if (currentAmount >= targetAmount) {
      alerts.push({
        id: Date.now() + Math.random(),
        type: ALERT_TYPES.SAVING_GOAL_ACHIEVED,
        title: "Goal Achieved!",
        message: `Congratulations! You've reached your savings goal for ${goal.name}`,
        goalName: goal.name,
        amount: currentAmount,
        target: targetAmount,
        createdAt: new Date().toISOString(),
        read: false,
      });
    }
    // Goal near completion (90% or more)
    else if (percentage >= 90 && percentage < 100) {
      alerts.push({
        id: Date.now() + Math.random(),
        type: ALERT_TYPES.SAVING_GOAL_NEAR,
        title: "Almost There!",
        message: `You're at ${percentage.toFixed(0)}% of your ${
          goal.name
        } savings goal`,
        goalName: goal.name,
        amount: currentAmount,
        target: targetAmount,
        createdAt: new Date().toISOString(),
        read: false,
      });
    }

    // Check if deadline is approaching (within 7 days)
    const deadlineDate = new Date(goal.deadline);
    const today = new Date();
    const daysUntilDeadline = Math.ceil(
      (deadlineDate - today) / (1000 * 60 * 60 * 24)
    );

    if (
      daysUntilDeadline > 0 &&
      daysUntilDeadline <= 7 &&
      currentAmount < targetAmount
    ) {
      alerts.push({
        id: Date.now() + Math.random(),
        type: ALERT_TYPES.PAYMENT_DUE,
        title: "Goal Deadline Approaching",
        message: `Your ${
          goal.name
        } goal deadline is in ${daysUntilDeadline} days, and you're at ${percentage.toFixed(
          0
        )}%`,
        goalName: goal.name,
        daysLeft: daysUntilDeadline,
        amount: currentAmount,
        target: targetAmount,
        createdAt: new Date().toISOString(),
        read: false,
      });
    }
  });

  return alerts;
};

// Check for unusual expenses (significantly higher than average for that category)
export const checkUnusualExpenses = (expenses) => {
  const alerts = [];

  if (!expenses || expenses.length < 5) {
    return alerts; // Need enough data to establish a pattern
  }

  // Group expenses by category
  const expensesByCategory = {};

  expenses.forEach((expense) => {
    const category = expense.category;
    const amount = parseFloat(expense.amount) || 0;

    if (!expensesByCategory[category]) {
      expensesByCategory[category] = [];
    }

    expensesByCategory[category].push({
      amount,
      date: new Date(expense.date),
      id: expense.id,
      merchant: expense.merchant,
    });
  });

  // Check each category for unusual expenses
  Object.keys(expensesByCategory).forEach((category) => {
    const categoryExpenses = expensesByCategory[category];

    // Sort by date, newest first
    categoryExpenses.sort((a, b) => b.date - a.date);

    // Get the most recent expense
    const latestExpense = categoryExpenses[0];

    // Get previous expenses to calculate average (exclude the latest)
    const previousExpenses = categoryExpenses.slice(1);

    if (previousExpenses.length >= 3) {
      const previousTotal = previousExpenses.reduce(
        (sum, exp) => sum + exp.amount,
        0
      );
      const previousAvg = previousTotal / previousExpenses.length;

      // If latest expense is 50% higher than average, flag it
      if (latestExpense.amount > previousAvg * 1.5) {
        alerts.push({
          id: Date.now() + Math.random(),
          type: ALERT_TYPES.UNUSUAL_EXPENSE,
          title: "Unusual Expense Detected",
          message: `Your recent ${category} expense of $${latestExpense.amount.toFixed(
            2
          )} at ${
            latestExpense.merchant
          } is significantly higher than your average of $${previousAvg.toFixed(
            2
          )}`,
          category,
          amount: latestExpense.amount,
          average: previousAvg,
          merchantName: latestExpense.merchant,
          expenseId: latestExpense.id,
          createdAt: new Date().toISOString(),
          read: false,
        });
      }
    }
  });

  return alerts;
};

// Helper function to remove duplicate alerts
const removeDuplicateAlerts = (alerts) => {
  const uniqueKeys = new Set();
  return alerts.filter((alert) => {
    // Create a unique key based on alert properties that should be unique
    const key = `${alert.type}_${alert.category || alert.goalName || ""}_${
      alert.message
    }`;

    // If we've seen this key before, filter out this alert
    if (uniqueKeys.has(key)) {
      return false;
    }

    // Otherwise, add the key to our set and keep the alert
    uniqueKeys.add(key);
    return true;
  });
};

// Generate all alerts
export const generateAllAlerts = (expenses, budgets, savingsGoals) => {
  let allAlerts = [];

  // Add budget alerts
  allAlerts = allAlerts.concat(checkBudgetAlerts(expenses, budgets));

  // Add savings goal alerts
  allAlerts = allAlerts.concat(checkSavingsGoalAlerts(savingsGoals));

  // Add unusual expense alerts
  allAlerts = allAlerts.concat(checkUnusualExpenses(expenses));

  // Filter out duplicate alerts before sorting
  allAlerts = removeDuplicateAlerts(allAlerts);

  // Sort alerts by date (newest first)
  allAlerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return allAlerts;
};

// Save alerts to local storage
export const saveAlerts = (alerts) => {
  localStorage.setItem("alerts", JSON.stringify(alerts));
};

// Load alerts from local storage
export const loadAlerts = () => {
  const saved = localStorage.getItem("alerts");
  return saved ? JSON.parse(saved) : [];
};

// Mark alert as read
export const markAlertAsRead = (alertId) => {
  const alerts = loadAlerts();
  const updatedAlerts = alerts.map((alert) => {
    if (alert.id === alertId) {
      return { ...alert, read: true };
    }
    return alert;
  });

  saveAlerts(updatedAlerts);
  return updatedAlerts;
};

// Delete an alert
export const deleteAlert = (alertId) => {
  const alerts = loadAlerts();
  const updatedAlerts = alerts.filter((alert) => alert.id !== alertId);

  saveAlerts(updatedAlerts);
  return updatedAlerts;
};

// Clear all alerts
export const clearAllAlerts = () => {
  localStorage.removeItem("alerts");
  return [];
};
