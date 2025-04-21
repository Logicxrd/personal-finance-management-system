import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Loading from "./pages/Loading";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
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
  console.log("App is rendering"); // Debug line

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Default route should redirect to loading */}
          <Route exact path="/loading" element={<Loading />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
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
