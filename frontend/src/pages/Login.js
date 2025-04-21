import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Login.css";
import humcashLogo from "../assets/humcash-logo.png";

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState("phone"); // 'phone' or 'verification'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Format phone number as user types (XXX) XXX-XXXX
  const handlePhoneChange = (e) => {
    const input = e.target.value.replace(/\D/g, "");
    let formatted = "";

    if (input.length <= 3) {
      formatted = input;
    } else if (input.length <= 6) {
      formatted = `(${input.slice(0, 3)}) ${input.slice(3)}`;
    } else {
      formatted = `(${input.slice(0, 3)}) ${input.slice(3, 6)}-${input.slice(
        6,
        10
      )}`;
    }

    setPhoneNumber(formatted);
  };

  // Handle verification code input
  const handleCodeChange = (e) => {
    const input = e.target.value.replace(/\D/g, "");
    if (input.length <= 6) {
      setVerificationCode(input);
    }
  };

  // Request verification code
  const requestCode = async (e) => {
    e.preventDefault();
    setError("");

    // Validate phone number (basic validation)
    const numbersOnly = phoneNumber.replace(/\D/g, "");
    if (numbersOnly.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setIsLoading(true);

    try {
      // Mock API call - replace with actual API when backend is ready
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Move to verification step
      setStep("verification");
      setError("");
    } catch (err) {
      setError("Could not send verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Verify code and login
  const verifyCode = async (e) => {
    e.preventDefault();
    setError("");

    if (verificationCode.length !== 6) {
      setError("Please enter a 6-digit verification code");
      return;
    }

    setIsLoading(true);

    try {
      // Mock API call - replace with actual API when backend is ready
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock successful login - this will be replaced with actual auth logic
      localStorage.setItem("isAuthenticated", "true");

      // Navigate to Dashboard
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Go back to phone input
  const handleBack = () => {
    setStep("phone");
    setVerificationCode("");
    setError("");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo">
          <img src={humcashLogo} alt="HumCash Logo" className="app-logo" />
        </div>

        {step === "phone" ? (
          <form onSubmit={requestCode}>
            <h2 className="login-title">Login</h2>
            <div className="input-group">
              <input
                type="text"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="(123)456-7890"
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="primary-button"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Continue"}
            </button>

            <div className="divider">
              <hr />
              <span>or</span>
              <hr />
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/register")}
            >
              Create an Account
            </button>
          </form>
        ) : (
          <form onSubmit={verifyCode}>
            <h2 className="Login-title">Verify your Identity</h2>
            <div className="input-group">
              <input
                type="text"
                value={verificationCode}
                onChange={handleCodeChange}
                placeholder="Verification Code"
                required
              />
              <p className="description">
                We sent a 6-digit code to {phoneNumber}
              </p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="primary-button"
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Continue"}
            </button>

            <button
              type="button"
              className="secondary-button" //changed from text-button
              onClick={handleBack}
              disabled={isLoading}
            >
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
