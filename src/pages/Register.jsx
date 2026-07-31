import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validate = (data) => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!data.name.trim()) {
      newErrors.name = "Name is required.";
    }
    if (!data.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(data.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!data.password) {
      newErrors.password = "Password is required.";
    } else if (data.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }
    if (!data.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (data.confirmPassword !== data.password) {
      newErrors.confirmPassword = "Passwords do not match.";
    }
    return newErrors;
  };

  const isFormValid = useMemo(
    () => Object.keys(validate(formData)).length === 0,
    [formData]
  );

  const passwordStrength = useMemo(() => {
    const pwd = formData.password;
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  }, [formData.password]);

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][passwordStrength];

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    setErrors(validate(updated));
    setSubmitError("");
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    const validationErrors = validate(formData);
    setErrors(validationErrors);
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      // Call the backend register API
      await api.post("/auth/register", {
        fullName: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      setSuccessMessage("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      // Show the backend's error message if it sent one
      const msg =
        error.response?.data?.message ||
        "Something went wrong. Please try again.";
      setSubmitError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-shell">
        <aside className="register-brand">
          <div className="brand-glow brand-glow-1" />
          <div className="brand-glow brand-glow-2" />
          <div className="brand-content">
            <div className="brand-logo">ResumeAI</div>
            <h2 className="brand-heading">
              Land your dream job with a resume that stands out.
            </h2>
            <p className="brand-text">
              Build a polished, ATS-friendly resume in minutes with beautiful
              templates and one-click PDF export.
            </p>
            <ul className="brand-list">
              <li>Recruiter-approved templates</li>
              <li>Real-time editing & preview</li>
              <li>Instant PDF download</li>
            </ul>
          </div>
        </aside>

        <main className="register-panel">
          <div className="register-card">
            <div className="register-header">
              <h1 className="register-title">Create your account</h1>
              <p className="register-subtitle">
                Start building your professional resume today.
              </p>
            </div>

            {successMessage && (
              <div className="register-alert register-alert-success" role="status">
                {successMessage}
              </div>
            )}

            {submitError && (
              <div className="register-alert register-alert-error" role="alert">
                {submitError}
              </div>
            )}

            <form className="register-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="name" className="form-label">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={`form-input ${touched.name && errors.name ? "input-error" : ""}`}
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="name"
                />
                {touched.name && errors.name && (
                  <span className="error-text">{errors.name}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`form-input ${touched.email && errors.email ? "input-error" : ""}`}
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="email"
                />
                {touched.email && errors.email && (
                  <span className="error-text">{errors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    className={`form-input ${touched.password && errors.password ? "input-error" : ""}`}
                    placeholder="At least 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {formData.password && (
                  <div className="strength-meter">
                    <div className="strength-bars">
                      {[1, 2, 3, 4].map((level) => (
                        <span
                          key={level}
                          className={`strength-bar ${passwordStrength >= level ? `strength-${passwordStrength}` : ""}`}
                        />
                      ))}
                    </div>
                    <span className={`strength-label strength-label-${passwordStrength}`}>
                      {strengthLabel}
                    </span>
                  </div>
                )}

                {touched.password && errors.password && (
                  <span className="error-text">{errors.password}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <div className="input-wrapper">
                  <input
                    type={showConfirm ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    className={`form-input ${touched.confirmPassword && errors.confirmPassword ? "input-error" : ""}`}
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowConfirm((s) => !s)}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? "Hide" : "Show"}
                  </button>
                </div>
                {touched.confirmPassword && errors.confirmPassword && (
                  <span className="error-text">{errors.confirmPassword}</span>
                )}
              </div>

              <button
                type="submit"
                className="register-button"
                disabled={!isFormValid || loading || Boolean(successMessage)}
              >
                {loading ? "Creating account..." : successMessage ? "Success!" : "Create Account"}
              </button>
            </form>

            <p className="register-footer">
              Already have an account?{" "}
              <Link to="/login" className="register-link">Log in</Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Register;