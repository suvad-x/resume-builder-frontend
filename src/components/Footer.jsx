import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span className="footer-mark">R/</span>
              <span className="footer-logo-text">Resume Builder</span>
            </Link>
            <p className="footer-tagline">Draft. Scan. Apply.</p>
            <p className="footer-blurb">
              Build clean, ATS-friendly resumes that get past the robots and
              into recruiters' hands.
            </p>
          </div>

          <div className="footer-col">
            <span className="footer-heading">Product</span>
            <Link to="/builder">Resume builder</Link>
            <Link to="/templates">Templates</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>

          <div className="footer-col">
            <span className="footer-heading">Account</span>
            <Link to="/login">Log in</Link>
            <Link to="/register">Create account</Link>
          </div>

          <div className="footer-col">
            <span className="footer-heading">Company</span>
            <a href="#">About</a>
            <a href="#">Contact</a>
            <a href="#">Privacy</a>
          </div>
        </div>

        <div className="footer-bottom">
          <span className="footer-copy">© {year} Resume Builder</span>
          <div className="footer-socials">
            <a href="#" aria-label="Twitter">Twitter</a>
            <a href="#" aria-label="LinkedIn">LinkedIn</a>
            <a href="#" aria-label="GitHub">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;