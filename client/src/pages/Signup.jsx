import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Signup.css";

const Signup = () => {
  const { signup } = useAuth();

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      await signup(formData);
      navigate("/dr-dispatcher");
      setSuccess("Account created successfully");

      setFormData({
        name: "",
        email: "",
        password: "",
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Signup failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-card">
          <div className="signup-header">
            <h1 className="signup-title">Create account</h1>
            <p className="signup-subtitle">
              Set up access to the grid operations dashboard
            </p>
          </div>

          {error && (
            <div className="signup-error" role="alert">
              <svg
                className="signup-status-icon"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="signup-success" role="status">
              <svg
                className="signup-status-icon"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 10.5a1 1 0 111.4-1.4l3.6 3.6 6.7-6.7a1 1 0 011.4 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{success}</span>
            </div>
          )}

          <form className="signup-form" onSubmit={handleSubmit} noValidate>
            <div className="signup-field">
              <label className="signup-label" htmlFor="name">
                Full name
              </label>
              <input
                id="name"
                className="signup-input"
                type="text"
                name="name"
                placeholder="Jane Doe"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                aria-invalid={Boolean(error)}
                required
              />
            </div>

            <div className="signup-field">
              <label className="signup-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className="signup-input"
                type="email"
                name="email"
                placeholder="you@company.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                aria-invalid={Boolean(error)}
                required
              />
            </div>

            <div className="signup-field">
              <label className="signup-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                className="signup-input"
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                aria-invalid={Boolean(error)}
                required
              />
            </div>

            <button
              className="signup-submit"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting && <span className="signup-spinner" aria-hidden="true" />}
              {isSubmitting ? "Creating account…" : "Create account"}
            </button>
          </form>

          <div className="signup-footer">
            Already have an account? <Link className="signup-footer-link" to="/login">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;