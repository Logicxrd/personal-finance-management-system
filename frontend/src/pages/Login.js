import React, { useState, useEffect } from "react";
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

  // Check if user is already authenticated
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (isAuthenticated === "true") {
      navigate("/dashboard");
    }
  }, [navigate]);

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
      // Check if this phone number exists in our "database" (localStorage)
      const allUsers = localStorage.getItem("allUsers");
      let userExists = false;
      let userData = null;

      if (allUsers) {
        const parsedUsers = JSON.parse(allUsers);
        // Find user with this phone number
        userData = parsedUsers.find(
          (user) => user.phoneNumber.replace(/\D/g, "") === numbersOnly
        );

        if (userData) {
          userExists = true;
        }
      }

      if (!userExists) {
        setError(
          "No account found with this phone number. Please create an account."
        );
        setIsLoading(false);
        return;
      }

      // Move to verification step if user exists
      setStep("verification");
      setError("");

      // BACKEND INTEGRATION NOTE:
      // In a real app with backend integration, you would make an API call here to:
      // 1. Verify the phone number exists in the database
      // 2. Send a verification code to that phone number
      // Example: await api.sendVerificationCode(phoneNumber);
    } catch (err) {
      setError("Could not send verification code. Please try again.");
      console.error("Login error:", err);
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
      // Mock API call - simulate verification time
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // BACKEND INTEGRATION NOTE:
      // In a real app with backend integration, you would make an API call here to:
      // 1. Verify the code matches what was sent to the user's phone
      // 2. Create an authentication token or session
      // Example: const authResult = await api.verifyCode(phoneNumber, verificationCode);

      // Get user data from localStorage
      const allUsers = localStorage.getItem("allUsers");
      if (allUsers) {
        const parsedUsers = JSON.parse(allUsers);
        const numbersOnly = phoneNumber.replace(/\D/g, "");

        // Find user with this phone number
        const userData = parsedUsers.find(
          (user) => user.phoneNumber.replace(/\D/g, "") === numbersOnly
        );

        if (userData) {
          // For testing purposes - any 6-digit code is accepted
          // In production, this would actually validate the code

          // Set auth status and user info
          localStorage.setItem("isAuthenticated", "true");
          localStorage.setItem("userInfo", JSON.stringify(userData));

          // Navigate to Dashboard
          navigate("/dashboard");
          return;
        }
      }

      // If we reached here, something went wrong
      throw new Error("User not found");
    } catch (err) {
      setError(
        "Invalid verification code or user not found. Please try again."
      );
      console.error("Verification error:", err);
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
              {isLoading ? "Verifying..." : "Continue"}
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

export default Login;
