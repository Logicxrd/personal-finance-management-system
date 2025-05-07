import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/PersonalInfo.css";
import humcashLogo from "../assets/humcash-logo.png";

const PersonalInfo = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Load user info when component mounts
  useEffect(() => {
    loadUserInfo();
  }, []);

  // Load user info from localStorage
  const loadUserInfo = () => {
    const savedUserInfo = localStorage.getItem("userInfo");
    if (savedUserInfo) {
      try {
        const parsedUserInfo = JSON.parse(savedUserInfo);
        setUserInfo(parsedUserInfo);
        // Initialize editing form fields with current values
        setNewPhoneNumber(parsedUserInfo.phoneNumber || "");
        setNewEmail(parsedUserInfo.email || "");
      } catch (error) {
        console.error("Error parsing user info:", error);
      }
    } else {
      // Redirect to login if no user info exists
      navigate("/login");
    }
  };

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

    setNewPhoneNumber(formatted);
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    setError("");
    setSuccess("");

    // Reset form fields to current values when entering edit mode
    if (!isEditing) {
      setNewPhoneNumber(userInfo.phoneNumber || "");
      setNewEmail(userInfo.email || "");
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate phone number
    const numbersOnly = newPhoneNumber.replace(/\D/g, "");
    if (numbersOnly.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    // Basic email validation
    if (newEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      // Mock API call - replace with actual API when backend is ready
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Get existing users from localStorage
      const allUsers = localStorage.getItem("allUsers");
      if (allUsers) {
        const parsedUsers = JSON.parse(allUsers);

        // Find and update the current user
        const currentUserId = userInfo.phoneNumber.replace(/\D/g, "");

        // Check if the new phone number already exists for another user
        if (currentUserId !== numbersOnly) {
          const phoneExists = parsedUsers.some(
            (user) =>
              user.phoneNumber.replace(/\D/g, "") === numbersOnly &&
              user.phoneNumber.replace(/\D/g, "") !== currentUserId
          );

          if (phoneExists) {
            setError("This phone number is already in use by another account");
            setIsLoading(false);
            return;
          }
        }

        // Update user in the array
        const updatedUsers = parsedUsers.map((user) => {
          if (user.phoneNumber.replace(/\D/g, "") === currentUserId) {
            return {
              ...user,
              phoneNumber: newPhoneNumber,
              email: newEmail,
            };
          }
          return user;
        });

        // Save updated users back to localStorage
        localStorage.setItem("allUsers", JSON.stringify(updatedUsers));
      }

      // Update user info in localStorage
      const updatedUserInfo = {
        ...userInfo,
        phoneNumber: newPhoneNumber,
        email: newEmail,
      };

      localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
      setUserInfo(updatedUserInfo);
      setSuccess("Your information has been updated successfully.");
      setIsEditing(false);
    } catch (err) {
      setError("Failed to update your information. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  // Toggle menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Handle navigation
  const handleNavigation = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  // Close edit mode handler
  const handleClose = () => {
    if (isEditing) {
      setIsEditing(false);
      setError("");
      setSuccess("");
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="modern-container">
      {/* Header */}
      <header className="modern-header">
        {isEditing ? (
          <>
            <div className="header-left" onClick={handleClose}>
              <span className="back-icon">✕</span>
            </div>
            <h1 className="header-title">Edit Info</h1>
            <div className="header-right"></div>
          </>
        ) : (
          <>
            <div className="header-left" onClick={() => navigate(-1)}>
              <span className="back-icon">←</span>
            </div>
            <h1 className="header-title">Personal Info</h1>
            <div className="header-right"></div>
          </>
        )}
      </header>

      {/* Main content */}
      <div className="modern-content">
        {!isEditing ? (
          <div className="info-display-modern">
            <div className="info-group">
              <label className="info-label">First name</label>
              <p className="info-value">{userInfo.firstName}</p>
            </div>

            <div className="info-divider"></div>

            <div className="info-group">
              <label className="info-label">Last name</label>
              <p className="info-value">{userInfo.lastName}</p>
            </div>

            <div className="info-divider"></div>

            <div className="info-group">
              <label className="info-label">Email address</label>
              <p className="info-value email-value">
                {userInfo.email || "Not provided"}
              </p>
            </div>

            <div className="info-divider"></div>

            <div className="info-group">
              <div className="phone-info-container">
                <label className="info-label">Mobile phone number</label>
                <p className="info-value">{userInfo.phoneNumber}</p>
              </div>
              <button className="edit-link" onClick={toggleEditMode}>
                Edit
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="edit-form-modern">
            <div className="edit-group">
              <label className="edit-label">First name</label>
              <p className="locked-field-modern">{userInfo.firstName}</p>
            </div>

            <div className="edit-divider"></div>

            <div className="edit-group">
              <label className="edit-label">Last name</label>
              <p className="locked-field-modern">{userInfo.lastName}</p>
            </div>

            <div className="edit-divider"></div>

            <div className="edit-group">
              <label className="edit-label">Email address</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="your@email.com"
                className="edit-input"
              />
            </div>

            <div className="edit-divider"></div>

            <div className="edit-group">
              <label className="edit-label">Mobile phone number</label>
              <input
                type="text"
                value={newPhoneNumber}
                onChange={handlePhoneChange}
                placeholder="(123) 456-7890"
                className="edit-input"
              />
            </div>

            {error && <div className="error-message-modern">{error}</div>}
            {success && <div className="success-message-modern">{success}</div>}

            <button
              type="submit"
              className="save-button-modern"
              disabled={isLoading}
            >
              {isLoading ? "SAVING..." : "SAVE"}
            </button>
          </form>
        )}
      </div>

      {/* Footer navigation removed as requested */}
    </div>
  );
};

export default PersonalInfo;
