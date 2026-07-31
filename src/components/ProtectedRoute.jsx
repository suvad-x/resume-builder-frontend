import { Navigate, useLocation } from "react-router-dom";

// Must match the key used across Login / Dashboard / Navbar / Home
const CURRENT_USER_KEY = "currentUser";

function isLoggedIn() {
  return Boolean(
    localStorage.getItem(CURRENT_USER_KEY) ||
      sessionStorage.getItem(CURRENT_USER_KEY)
  );
}

function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!isLoggedIn()) {
    // Send them to login, remembering where they were headed so we can
    // bounce them back there after a successful login (optional to use).
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;