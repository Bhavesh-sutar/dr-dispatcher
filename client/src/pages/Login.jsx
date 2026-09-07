import { useState } from "react"; // Import the useState hook from React to manage component state
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Import the useAuth hook from the
// AuthContext file to access authentication context
import { Link } from "react-router-dom";
import "./Login.css";

// Define the Login component that handles user login functionality
const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
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
    setIsSubmitting(true);

    try {
      await login(formData);
      navigate("/dr-dispatcher");
    } catch (error) {
      setError(
        error.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render the login form with input fields for email and password, and a submit button
  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">Sign in</h1>
            <p className="login-subtitle">
              Access your grid operations dashboard
            </p>
          </div>

          {error && (
            <div className="login-error" role="alert">
              <svg
                className="login-error-icon"
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

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="login-field">
              <label className="login-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className="login-input"
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

            <div className="login-field">
              <div className="login-field-row">
                <label className="login-label" htmlFor="password">
                  Password
                </label>
                {/* Wire this to a real route if/when password reset exists */}
                {/* <Link className="login-inline-link" to="/forgot-password">Forgot password?</Link> */}
              </div>
              <input
                id="password"
                className="login-input"
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                aria-invalid={Boolean(error)}
                required
              />
            </div>

            <button
              className="login-submit"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting && <span className="login-spinner" aria-hidden="true" />}
              {isSubmitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="login-footer">
            Don&apos;t have an account? <Link className="login-footer-link" to="/signup">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;