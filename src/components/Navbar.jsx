import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import "./Navbar.css";

const CURRENT_USER_KEY = "currentUser";

function hasToken() {
  return Boolean(
    localStorage.getItem("token") || sessionStorage.getItem("token")
  );
}

function readCurrentUser() {
  const stored =
    localStorage.getItem(CURRENT_USER_KEY) ||
    sessionStorage.getItem(CURRENT_USER_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(() => readCurrentUser());
  const [menuOpen, setMenuOpen] = useState(false);

  // Pull the freshest user (incl. profile photo) from the backend
  async function refreshUser() {
    if (!hasToken()) {
      setUser(null);
      return;
    }
    try {
      const { data } = await api.get("/auth/profile");
      setUser(data);
      // Keep the cached snapshot in sync so other pages see the latest
      const target = localStorage.getItem("token") ? localStorage : sessionStorage;
      target.setItem(CURRENT_USER_KEY, JSON.stringify(data));
    } catch {
      // If the call fails, fall back to whatever snapshot we have
      setUser(readCurrentUser());
    }
  }

  // Re-check on every route change (e.g. after saving profile / logging in)
  useEffect(() => {
    setMenuOpen(false);
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  // Live sync across tabs and on custom auth-change events
  useEffect(() => {
    function sync() {
      refreshUser();
    }
    window.addEventListener("storage", sync);
    window.addEventListener("auth-change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("auth-change", sync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem(CURRENT_USER_KEY);
    sessionStorage.removeItem("token");
    sessionStorage.removeItem(CURRENT_USER_KEY);
    setUser(null);
    window.dispatchEvent(new Event("auth-change"));
    navigate("/");
  }

  const gate = (path) => (user ? path : "/login");

  // Handle both backend field (fullName) and any old snapshot (name)
  const displayName = user?.fullName || user?.name || "";
  const firstName = displayName ? displayName.split(" ")[0] : "there";
  const initial = displayName ? displayName.charAt(0).toUpperCase() : "U";
  const photo = user?.profileImage || null;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="navbar-mark">R/</span>
          <span className="navbar-brand-text">Resume Builder</span>
        </Link>

        <button
          type="button"
          className={`navbar-burger ${menuOpen ? "is-open" : ""}`}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`navbar-actions ${menuOpen ? "is-open" : ""}`}>
          <div className="navbar-nav">
            <Link to="/" className="navbar-link">
              Home
            </Link>
            <Link to={gate("/templates")} className="navbar-link">
              Templates
            </Link>
            <Link to={gate("/builder")} className="navbar-link">
              Builder
            </Link>
            <Link to={gate("/dashboard")} className="navbar-link">
              Dashboard
            </Link>
          </div>

          <span className="navbar-divider" aria-hidden="true" />

          {user ? (
            <div className="navbar-auth">
              <Link to="/profile" className="navbar-user navbar-user-link">
                <span className="navbar-avatar">
                  {photo ? (
                    <img src={photo} alt="Profile" className="navbar-avatar-img" />
                  ) : (
                    initial
                  )}
                </span>
                <span className="navbar-greeting">Hi, {firstName}</span>
              </Link>
              <button
                type="button"
                className="navbar-cta navbar-cta-button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="navbar-auth">
              <Link to="/login" className="navbar-link navbar-link-strong">
                Log in
              </Link>
              <Link to="/register" className="navbar-cta">
                Get started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;