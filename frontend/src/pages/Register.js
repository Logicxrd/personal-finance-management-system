import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Register.css";
import humcashLogo from "../assets/humcash-logo.png";

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [step, setStep] = useState("register"); // 'register' or 'verification'
  const [verificationCode, setVerificationCode] = useState("");
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

  // Handle form submission and request verification code
  const requestVerification = async (e) => {
    e.preventDefault();
    setError("");

    // Validate inputs
    if (!firstName.trim()) {
      setError("Please enter your first name");
      return;
    }

    if (!lastName.trim()) {
      setError("Please enter your last name");
      return;
    }

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

  // Verify code and complete registration
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

      // Mock successful registration and login
      localStorage.setItem("isAuthenticated", "true");

      // Navigate to Dashboard
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Go back to registration form
  const handleBack = () => {
    setStep("register");
    setVerificationCode("");
    setError("");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo">
          <img src={humcashLogo} alt="HumCash Logo" className="app-logo" />
        </div>

        {step === "register" ? (
          <form onSubmit={requestVerification}>
            <h2 className="login-title">Create Account</h2>
            <p className="description">We'll start with the basics.</p>

            <div className="input-group">
              <label htmlFor="firstName" className="input-label">
                Legal first name
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="lastName" className="input-label">
                Legal last name
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="phoneNumber" className="input-label">
                Phone number
              </label>
              <input
                id="phoneNumber"
                type="text"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="(123) 456-7890"
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="primary-button"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "CONTINUE"}
            </button>

            <div className="divider">
              <hr />
              <span>or</span>
              <hr />
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/login")}
            >
              Back to Login
            </button>
          </form>
        ) : (
          <form onSubmit={verifyCode}>
            <h2 className="login-title">Verify your Identity</h2>
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
              {isLoading ? "Verifying..." : "CONTINUE"}
            </button>

            <button
              type="button"
              className="secondary-button"
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

export default Register;
