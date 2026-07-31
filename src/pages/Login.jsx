import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./Login.css";

// Key the Navbar/Dashboard read to know who's logged in
const CURRENT_USER_KEY = "currentUser";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      // Call the real backend login API
      const { data } = await api.post("/auth/login", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      const { token, user } = data;

      // Remember Me decides where the session lives:
      // localStorage persists across browser restarts,
      // sessionStorage clears when the browser closes.
      if (rememberMe) {
        localStorage.setItem("token", token);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        sessionStorage.removeItem("token");
        sessionStorage.removeItem(CURRENT_USER_KEY);
      } else {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        localStorage.removeItem("token");
        localStorage.removeItem(CURRENT_USER_KEY);
      }

      navigate("/dashboard");
    } catch (err) {
      // Show the backend's message if it sent one
      const msg =
        err.response?.data?.message ||
        "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-shell">
        {/* Left branding panel */}
        <aside className="login-brand">
          <div className="brand-glow brand-glow-1" />
          <div className="brand-glow brand-glow-2" />
          <div className="brand-content">
            <div className="brand-logo">ResumeAI</div>
            <h2 className="brand-heading">
              Welcome back. Your next opportunity is one login away.
            </h2>
            <p className="brand-text">
              Pick up right where you left off — edit your resume, switch
              templates, and export a polished PDF in seconds.
            </p>
            <ul className="brand-list">
              <li>All your resumes in one place</li>
              <li>Auto-saved as you edit</li>
              <li>One-click PDF export</li>
            </ul>
          </div>
        </aside>

        {/* Right form panel */}
        <main className="login-panel">
          <div className="login-card">
            <div className="login-header">
              <span className="login-eyebrow">Welcome back</span>
              <h1 className="login-title">Log in to your account</h1>
              <p className="login-subtitle">
                Enter your details to continue building.
              </p>
            </div>

            {error && (
              <div className="login-alert login-alert-error" role="alert">
                {error}
              </div>
            )}

            <form className="login-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  className="form-input"
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="input-wrapper">
                  <input
                    className="form-input"
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>

              <button className="login-button" type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Log in"}
              </button>
            </form>

            <p className="login-footer">
              New here?{" "}
              <Link to="/register" className="login-link">
                Create an account
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Login;