import { useNavigate } from "react-router-dom";
import "./Hero.css";

// Must match the key used in Login / Dashboard / Navbar
const CURRENT_USER_KEY = "currentUser";

function isLoggedIn() {
  return Boolean(
    localStorage.getItem(CURRENT_USER_KEY) ||
      sessionStorage.getItem(CURRENT_USER_KEY)
  );
}

const scanFields = [
  { label: "NAME", delay: "0.4s" },
  { label: "EXPERIENCE", delay: "0.9s" },
  { label: "SKILLS", delay: "1.4s" },
  { label: "EDUCATION", delay: "1.9s" },
];

function Hero() {
  const navigate = useNavigate();

  function handleCreate() {
    // Logged in → go build. Logged out → send to login first.
    navigate(isLoggedIn() ? "/builder" : "/login");
  }

  function handleTemplates() {
    navigate("/templates");
  }

  return (
    <section className="hero">
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />
      </div>

      <div className="hero-copy">
        <span className="hero-eyebrow">
          Built for applicant tracking systems
        </span>
        <h1 className="hero-title">
          Write a resume the machine reads first —
          <br />
          and the recruiter reads next.
        </h1>
        <p className="hero-sub">
          Answer a few prompts, and the builder drafts a clean, ATS-parseable
          resume in minutes. No formatting fights, no guesswork on keywords.
        </p>
        <div className="hero-actions">
          <button className="hero-primary" onClick={handleCreate}>
            Create your resume
          </button>
          <button className="hero-secondary" onClick={handleTemplates}>
            Browse templates
          </button>
        </div>

        <div className="hero-trust">
          <div className="hero-trust-avatars">
            <span>A</span>
            <span>M</span>
            <span>J</span>
            <span>+</span>
          </div>
          <p className="hero-trust-text">
            Trusted by job seekers building standout resumes
          </p>
        </div>
      </div>

      <div className="hero-doc" aria-hidden="true">
        <div className="hero-doc-sheet">
          <div className="hero-doc-line hero-doc-line--title" />
          <div className="hero-doc-line hero-doc-line--sub" />
          <div className="hero-doc-block" />
          <div className="hero-doc-line" />
          <div className="hero-doc-line" />
          <div className="hero-doc-line hero-doc-line--short" />
          <div className="hero-scanner" />
        </div>
        <ul className="hero-scan-list">
          {scanFields.map((field) => (
            <li
              key={field.label}
              className="hero-scan-item"
              style={{ animationDelay: field.delay }}
            >
              <span className="hero-scan-check">✓</span>
              {field.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default Hero;