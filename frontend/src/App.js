// App.js - Modified to update alerts on data changes
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Loading from "./pages/Loading";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Analytics from "./pages/Analytics";
import Savings from "./pages/Savings";
import Budgets from "./pages/Budgets";
import PersonalInfo from "./pages/PersonalInfo";
import { generateAllAlerts, saveAlerts, loadAlerts } from "./utils/AlertsUtil";
import "./App.css";

// Simple auth check function
const isAuthenticated = () => {
  return localStorage.getItem("isAuthenticated") === "true";
};

// Protected route component
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  // State to track data changes
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());

  // Initial load of alerts
  useEffect(() => {
    if (isAuthenticated()) {
      updateAlerts();
    }
  }, []);

  // Set up a regular interval to check for data changes and update alerts
  useEffect(() => {
    if (isAuthenticated()) {
      const intervalId = setInterval(() => {
        updateAlerts();
      }, 5000); // Check every 5 seconds

      return () => clearInterval(intervalId);
    }
  }, [lastUpdateTime]);

  // Function to update alerts based on current data
  const updateAlerts = () => {
    // Load data from localStorage
    const expenses = JSON.parse(localStorage.getItem("expenses") || "[]");
    const budgets = JSON.parse(localStorage.getItem("budgets") || "[]");
    const savingsGoals = JSON.parse(
      localStorage.getItem("savingsGoals") || "[]"
    );

    // Generate alerts
    const newAlerts = generateAllAlerts(expenses, budgets, savingsGoals);

    // Load existing alerts
    const existingAlerts = loadAlerts();

    // Merge alerts, avoiding duplicates (using id for comparison)
    const existingIds = existingAlerts.map((alert) => alert.id);
    const uniqueNewAlerts = newAlerts.filter(
      (alert) => !existingIds.includes(alert.id)
    );

    const mergedAlerts = [...uniqueNewAlerts, ...existingAlerts];

    // Save merged alerts
    saveAlerts(mergedAlerts);

    // Update last check time
    setLastUpdateTime(Date.now());
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Default route should redirect to loading */}
          <Route exact path="/loading" element={<Loading />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes - require authentication */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses"
            element={
              <ProtectedRoute>
                <Expenses updateAlerts={updateAlerts} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/savings"
            element={
              <ProtectedRoute>
                <Savings updateAlerts={updateAlerts} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/budgets"
            element={
              <ProtectedRoute>
                <Budgets updateAlerts={updateAlerts} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/personal-info"
            element={
              <ProtectedRoute>
                <PersonalInfo />
              </ProtectedRoute>
            }
          />

          {/* Redirect any unknown routes to loading page */}
          <Route path="*" element={<Navigate to="/loading" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
