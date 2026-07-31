import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Templates.css";

const categories = ["All", "Simple", "Professional", "Creative"];

const templates = [
  {
    id: "classic",
    name: "Classic",
    note: "Timeless serif layout, single column",
    tag: "Most popular",
    category: "Simple",
    accent: "#7c3aed",
  },
  {
    id: "modern",
    name: "Modern",
    note: "Clean sans-serif with accent rules",
    tag: "Fresh",
    category: "Professional",
    accent: "#3b82f6",
  },
  {
    id: "minimal",
    name: "Minimal",
    note: "Maximum whitespace, zero clutter",
    tag: "Clean",
    category: "Simple",
    accent: "#0f172a",
  },
  {
    id: "professional",
    name: "Executive",
    note: "Two-column with a bold sidebar",
    tag: "Recruiter favorite",
    category: "Professional",
    accent: "#0f766e",
  },
  {
    id: "creative",
    name: "Creative",
    note: "Colored sidebar that stands out",
    tag: "Bold",
    category: "Creative",
    accent: "#db2777",
  },
  {
    id: "elegant",
    name: "Elegant",
    note: "Centered header with fine rules",
    tag: "Refined",
    category: "Creative",
    accent: "#9333ea",
  },
];

/* A real miniature resume rendered per template style */
function TemplatePreview({ id, accent }) {
  return (
    <div className={`mini mini-${id}`} style={{ "--mini-accent": accent }}>
      {/* Sidebar templates */}
      {(id === "professional" || id === "creative") && (
        <div className="mini-sidebar">
          <div className="mini-avatar" />
          <span className="mini-side-label">Contact</span>
          <span className="mini-side-line" />
          <span className="mini-side-line short" />
          <span className="mini-side-label">Skills</span>
          <span className="mini-side-line" />
          <span className="mini-side-line short" />
          <span className="mini-side-line" />
        </div>
      )}

      <div className="mini-main">
        <div className="mini-head">
          <div className="mini-name">Jordan Lee</div>
          <div className="mini-role">Software Engineer</div>
          {id !== "professional" && id !== "creative" && (
            <div className="mini-contact">jordan@email.com · +1 555 0100</div>
          )}
        </div>

        <div className="mini-rule" />

        <div className="mini-section">
          <span className="mini-label">Experience</span>
          <span className="mini-text" />
          <span className="mini-text" />
          <span className="mini-text short" />
        </div>

        <div className="mini-section">
          <span className="mini-label">Education</span>
          <span className="mini-text" />
          <span className="mini-text short" />
        </div>

        {id !== "professional" && id !== "creative" && (
          <div className="mini-section">
            <span className="mini-label">Skills</span>
            <div className="mini-chips">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Templates() {
  const navigate = useNavigate();
  const [active, setActive] = useState("All");

  const shown =
    active === "All"
      ? templates
      : templates.filter((t) => t.category === active);

  function handleSelect(id) {
    navigate("/builder", { state: { template: id } });
  }

  return (
    <>
      <Navbar />
      <div className="templates">
        <div className="templates-inner">
          <header className="templates-head">
            <span className="templates-eyebrow">Layouts</span>
            <h1 className="templates-title">Pick a template you love</h1>
            <p className="templates-sub">
              Every layout below parses cleanly through ATS software — the
              differences are purely visual. Choose a look, then make it yours.
            </p>
          </header>

          <div className="templates-filters">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`templates-filter ${
                  active === cat ? "is-active" : ""
                }`}
                onClick={() => setActive(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="templates-grid">
            {shown.map((template) => (
              <div key={template.id} className="templates-card">
                <div className="templates-preview-wrap">
                  <TemplatePreview
                    id={template.id}
                    accent={template.accent}
                  />
                  <div className="templates-overlay">
                    <button
                      className="templates-use"
                      type="button"
                      onClick={() => handleSelect(template.id)}
                    >
                      Use this template
                    </button>
                  </div>
                </div>

                <div className="templates-meta">
                  <div className="templates-meta-text">
                    <h3 className="templates-name">{template.name}</h3>
                    <p className="templates-note">{template.note}</p>
                  </div>
                  <span
                    className="templates-tag"
                    style={{ background: template.accent }}
                  >
                    {template.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Templates;