import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Loading.css";
import humcashLogo from "../assets/humcash-logo.png";

const Loading = () => {
  console.log("Loading component rendered"); // Debug line
  const navigate = useNavigate();
  const [isExistingUser, setIsExistingUser] = useState(false);

  useEffect(() => {
    // Check if user has previously logged in
    const hasLoggedIn = localStorage.getItem("hasLoggedInBefore");
    if (hasLoggedIn) {
      setIsExistingUser(true);
    }

    console.log("Loading component mounted"); // Debug line
  }, []);

  const handleGetStarted = () => {
    console.log("Get Started clicked"); // Debug line
    // Set flag that user has seen the loading screen
    localStorage.setItem("hasLoggedInBefore", "true");
    navigate("/login");
  };

  return (
    <div className="loading-screen">
      <div className="login-card">
        {/* Top section - App name */}
        <div className="header-section">
          <h1 className="app-name">ℍ𝕌𝕄ℂ𝔸𝕊ℍ</h1>
        </div>

        {/* Middle section - Logo */}
        <div className="center-section">
          <div className="logo-container">
            <img src={humcashLogo} alt="HumCash Logo" className="app-logo" />
          </div>
        </div>

        {/* Bottom section - Button and motto */}
        <div className="bottom-section">
          <button className="get-started-button" onClick={handleGetStarted}>
            {isExistingUser ? "Login" : "Get Started"}
          </button>
          <p className="app-motto">
            Secure. Smart. Simplified.
            <br />
            <span style={{ paddingLeft: "20px" }}>
              ~Your little Hummingbird.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Loading;
