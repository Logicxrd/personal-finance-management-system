// components/AlertsNotification.js
import React, { useState, useEffect } from "react";
import "../styles/AlertsNotification.css";
import {
  loadAlerts,
  markAlertAsRead,
  deleteAlert,
  clearAllAlerts,
} from "../utils/AlertsUtil";

const AlertsNotification = () => {
  const [alerts, setAlerts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load alerts on mount and every 30 seconds
  useEffect(() => {
    loadAlertsFromStorage();
    const interval = setInterval(loadAlertsFromStorage, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load alerts from storage
  const loadAlertsFromStorage = () => {
    const savedAlerts = loadAlerts();
    setAlerts(savedAlerts);
  };

  // Handle opening/closing alerts panel
  const toggleAlerts = () => {
    setIsOpen(!isOpen);
  };

  // Mark alert as read
  const handleMarkAsRead = (alertId) => {
    const updatedAlerts = markAlertAsRead(alertId);
    setAlerts(updatedAlerts);
  };

  // Delete alert
  const handleDeleteAlert = (alertId) => {
    const updatedAlerts = deleteAlert(alertId);
    setAlerts(updatedAlerts);
  };

  // Clear all alerts
  const handleClearAllAlerts = () => {
    const updatedAlerts = clearAllAlerts();
    setAlerts(updatedAlerts);
  };

  // Get unread alerts count
  const unreadCount = alerts.filter((alert) => !alert.read).length;

  // Get alert icon based on type
  const getAlertIcon = (type) => {
    switch (type) {
      case "budget_exceeded":
        return "⚠️";
      case "budget_near_limit":
        return "📊";
      case "saving_goal_achieved":
        return "🎉";
      case "saving_goal_near":
        return "🏆";
      case "unusual_expense":
        return "❗";
      case "payment_due":
        return "🔔";
      case "system":
        return "📱";
      default:
        return "📩";
    }
  };

  return (
    <div className="alerts-container">
      <div className="alerts-icon" onClick={toggleAlerts}>
        <span className="icon">🔔</span>
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </div>

      {isOpen && (
        <div className="alerts-dropdown">
          <div className="alerts-header">
            <h3>Notifications</h3>
            <div className="alerts-header-actions">
              {alerts.length > 0 && (
                <button
                  className="clear-all-button"
                  onClick={handleClearAllAlerts}
                >
                  Clear All
                </button>
              )}
              <button className="close-button" onClick={toggleAlerts}>
                ✕
              </button>
            </div>
          </div>

          <div className="alerts-list">
            {alerts.length === 0 ? (
              <div className="empty-alerts">
                <p>No notifications</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`alert-item ${!alert.read ? "unread" : ""}`}
                >
                  <div className="alert-icon">{getAlertIcon(alert.type)}</div>
                  <div className="alert-content">
                    <div className="alert-title">{alert.title}</div>
                    <div className="alert-message">{alert.message}</div>
                    <div className="alert-date">
                      {new Date(alert.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="alert-actions">
                    {!alert.read && (
                      <button
                        className="mark-read-button"
                        onClick={() => handleMarkAsRead(alert.id)}
                      >
                        ✓
                      </button>
                    )}
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteAlert(alert.id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsNotification;
