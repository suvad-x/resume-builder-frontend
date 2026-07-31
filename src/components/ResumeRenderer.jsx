import "./ResumeRenderer.css";

// Turns comma / newline text into arrays
function toList(text, sep = ",") {
  if (!text) return [];
  return text.split(sep).map((s) => s.trim()).filter(Boolean);
}
function dateRange(start, end) {
  if (start && end) return `${start} – ${end}`;
  return start || end || "";
}

// ---- Section renderers ----
function ContactBlock({ data }) {
  const items = [
    { label: "Email", value: data.email },
    { label: "Phone", value: data.phone },
    { label: "Location", value: data.location },
    { label: "LinkedIn", value: data.linkedin },
    { label: "Website", value: data.website },
  ].filter((i) => i.value);
  if (items.length === 0) return null;
  return (
    <div className="rr-block">
      <span className="rr-block-label">Contact</span>
      {items.map((i) => (
        <div key={i.label} className="rr-contact">
          <span className="rr-contact-key">{i.label}</span>
          <span className="rr-contact-val">{i.value}</span>
        </div>
      ))}
    </div>
  );
}

function SkillsBlock({ data, config, inSidebar }) {
  const skills = toList(data.skills);
  if (skills.length === 0) return null;
  return (
    <div className={inSidebar ? "rr-block" : "rr-section"}>
      <span className={inSidebar ? "rr-block-label" : "rr-label"}>Skills</span>
      {config.skillStyle === "bar" && (
        <div className="rr-skillbars">
          {skills.map((s) => (
            <div key={s} className="rr-skillbar">
              <span>{s}</span>
              <i />
            </div>
          ))}
        </div>
      )}
      {config.skillStyle === "dot" && (
        <div className="rr-skilldots">
          {skills.map((s) => (
            <div key={s} className="rr-skilldot">
              <span>{s}</span>
              <em>
                {[1, 2, 3, 4, 5].map((n) => (
                  <b key={n} className={n <= 4 ? "on" : ""} />
                ))}
              </em>
            </div>
          ))}
        </div>
      )}
      {config.skillStyle === "chip" && (
        <div className="rr-chips">
          {skills.map((s) => (
            <span key={s} className="rr-chip">{s}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function LanguagesBlock({ data, inSidebar }) {
  const langs = toList(data.languages);
  if (langs.length === 0) return null;
  return (
    <div className={inSidebar ? "rr-block" : "rr-section"}>
      <span className={inSidebar ? "rr-block-label" : "rr-label"}>Languages</span>
      {inSidebar ? (
        langs.map((l) => <span key={l} className="rr-block-item">{l}</span>)
      ) : (
        <div className="rr-chips">
          {langs.map((l) => (
            <span key={l} className="rr-chip">{l}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryBlock({ data }) {
  if (!data.summary) return null;
  return (
    <div className="rr-section">
      <span className="rr-label">Summary</span>
      <p className="rr-text">{data.summary}</p>
    </div>
  );
}

function ExperienceBlock({ data }) {
  const exp = (data.experience || []).filter((e) => e.title || e.company || e.bullets);
  if (exp.length === 0) return null;
  return (
    <div className="rr-section">
      <span className="rr-label">Experience</span>
      {exp.map((e) => (
        <div key={e.id} className="rr-entry">
          <div className="rr-entry-head">
            <div>
              <span className="rr-entry-title">{e.title || "Job Title"}</span>
              {(e.company || e.location) && (
                <span className="rr-entry-sub">
                  {[e.company, e.location].filter(Boolean).join(" · ")}
                </span>
              )}
            </div>
            {dateRange(e.start, e.end) && (
              <span className="rr-entry-date">{dateRange(e.start, e.end)}</span>
            )}
          </div>
          {toList(e.bullets, "\n").length > 0 && (
            <ul className="rr-bullets">
              {toList(e.bullets, "\n").map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

function EducationBlock({ data }) {
  const ed = (data.education || []).filter((e) => e.degree || e.school);
  if (ed.length === 0) return null;
  return (
    <div className="rr-section">
      <span className="rr-label">Education</span>
      {ed.map((e) => (
        <div key={e.id} className="rr-entry">
          <div className="rr-entry-head">
            <div>
              <span className="rr-entry-title">{e.degree || "Degree"}</span>
              {(e.school || e.location) && (
                <span className="rr-entry-sub">
                  {[e.school, e.location].filter(Boolean).join(" · ")}
                </span>
              )}
            </div>
            {dateRange(e.start, e.end) && (
              <span className="rr-entry-date">{dateRange(e.start, e.end)}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function CertBlock({ data }) {
  const certs = toList(data.certifications, "\n");
  if (certs.length === 0) return null;
  return (
    <div className="rr-section">
      <span className="rr-label">Certifications</span>
      <ul className="rr-bullets">
        {certs.map((c, i) => (
          <li key={i}>{c}</li>
        ))}
      </ul>
    </div>
  );
}

// Map section keys to components
function renderSection(key, data, config, inSidebar) {
  switch (key) {
    case "contact": return <ContactBlock key={key} data={data} />;
    case "skills": return <SkillsBlock key={key} data={data} config={config} inSidebar={inSidebar} />;
    case "languages": return <LanguagesBlock key={key} data={data} inSidebar={inSidebar} />;
    case "summary": return <SummaryBlock key={key} data={data} />;
    case "experience": return <ExperienceBlock key={key} data={data} />;
    case "education": return <EducationBlock key={key} data={data} />;
    case "certifications": return <CertBlock key={key} data={data} />;
    default: return null;
  }
}

// ---- Main renderer ----
export default function ResumeRenderer({ config, data, photo, sheetRef }) {
  const initial = data.name ? data.name.charAt(0).toUpperCase() : "?";

  // CSS variables come from the config recipe
  const styleVars = {
    "--rr-font": config.font,
    "--rr-accent": config.accent,
    "--rr-accent-soft": config.accentSoft,
    "--rr-sidebar-bg": config.sidebarBg || "#1e293b",
    "--rr-sidebar-text": config.sidebarText || "#e2e8f0",
    "--rr-sidebar-heading": config.sidebarHeading || "#38bdf8",
    "--rr-header-bg": config.headerBg,
    "--rr-header-text": config.headerText,
  };

  const Header = (
    <header className={`rr-header rr-header-${config.headerStyle}`}>
      <h2 className="rr-name">{data.name || "Your Name"}</h2>
      <p className="rr-role">{data.title || "Target Role"}</p>
    </header>
  );

  if (config.layout === "two-column") {
    return (
      <div
        ref={sheetRef}
        className={`rr-sheet rr-two-col template-${config.id}`}
        style={styleVars}
      >
        <aside className="rr-sidebar">
          {config.showPhoto && (
            <div className="rr-photo">
              {photo ? <img src={photo} alt="" /> : <span>{initial}</span>}
            </div>
          )}
          {config.sidebar.map((key) => renderSection(key, data, config, true))}
        </aside>
        <div className="rr-main">
          {Header}
          <div className="rr-main-body">
            {config.main.map((key) => renderSection(key, data, config, false))}
          </div>
        </div>
      </div>
    );
  }

  // Single column
  return (
    <div
      ref={sheetRef}
      className={`rr-sheet rr-single template-${config.id}`}
      style={styleVars}
    >
      {Header}
      {config.main.map((key) => renderSection(key, data, config, false))}
    </div>
  );
}