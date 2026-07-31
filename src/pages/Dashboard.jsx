import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import "./Dashboard.css";

const CURRENT_USER_KEY = "currentUser";
const profileKey = (email) => `profile:${email}`;

const TEMPLATE_NAMES = {
  azure: "Azure",
  onyx: "Onyx",
  coral: "Coral",
  classic: "Classic",
  minimal: "Minimal",
  elegant: "Elegant",
  premium: "Premium",
  modern: "Modern",
  professional: "Executive",
  creative: "Creative",
};

function getCurrentUser() {
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

function loadProfile(email) {
  try {
    const raw = localStorage.getItem(profileKey(email));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function formatDate(iso, opts) {
  try {
    return new Date(iso).toLocaleDateString(
      undefined,
      opts || { month: "short", day: "numeric", year: "numeric" }
    );
  } catch {
    return "—";
  }
}

// Completion for a single resume (mirrors the builder's fields)
function resumeCompletion(r) {
  const f = r.form || {};
  const checks = [
    f.name,
    f.title,
    f.email,
    f.phone,
    f.summary,
    (f.experience || []).length > 0,
    (f.education || []).length > 0,
    f.skills,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(undefined);
  const [resumes, setResumes] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate("/login", { replace: true });
      return;
    }
    setUser(currentUser);
    setProfile(loadProfile(currentUser.email));

    // Fetch this user's resumes from the backend.
    // The token is auto-attached by the axios interceptor, and the
    // backend already returns only the logged-in user's resumes,
    // sorted by updatedAt — so no owner filtering needed here.
    async function fetchResumes() {
      try {
        const { data } = await api.get("/resumes");
        setResumes(Array.isArray(data) ? data : []);
      } catch (error) {
        // If the token is invalid/expired, send them back to login
        if (error.response?.status === 401) {
          navigate("/login", { replace: true });
          return;
        }
        setResumes([]);
      } finally {
        setLoading(false);
      }
    }

    fetchResumes();
  }, [navigate]);

  async function handleDelete(id) {
    // Optimistically remove from the UI, then delete on the backend
    const previous = resumes;
    setResumes((prev) => prev.filter((r) => r._id !== id));
    try {
      await api.delete(`/resumes/${id}`);
    } catch (error) {
      // If it fails, put it back so nothing silently disappears
      setResumes(previous);
      alert("Could not delete the resume. Please try again.");
    }
  }

  function handleOpen(resume) {
    navigate("/builder", { state: { resume } });
  }

  if (!user) return null;

  const firstName = user.fullName
    ? user.fullName.split(" ")[0]
    : user.name
    ? user.name.split(" ")[0]
    : "there";
  const initial = user.fullName
    ? user.fullName.charAt(0).toUpperCase()
    : user.name
    ? user.name.charAt(0).toUpperCase()
    : "U";

  // ---- Real analytics from fetched data ----
  const total = resumes.length;

  // Most used template
  const templateCounts = {};
  resumes.forEach((r) => {
    templateCounts[r.template] = (templateCounts[r.template] || 0) + 1;
  });
  const favoriteTemplateId =
    Object.keys(templateCounts).sort(
      (a, b) => templateCounts[b] - templateCounts[a]
    )[0] || null;
  const favoriteTemplate = favoriteTemplateId
    ? TEMPLATE_NAMES[favoriteTemplateId] || favoriteTemplateId
    : "—";

  // Average completion
  const avgCompletion =
    total > 0
      ? Math.round(
          resumes.reduce((sum, r) => sum + resumeCompletion(r), 0) / total
        )
      : 0;

  // Profile completion
  const profileFields = profile
    ? ["fullName", "username", "email", "phone", "country", "profession", "bio"]
    : [];
  const profileFilled = profile
    ? profileFields.filter((f) => profile[f] && String(profile[f]).trim()).length +
      (profile.photo ? 1 : 0)
    : 0;
  const profileCompletion = profile
    ? Math.round((profileFilled / (profileFields.length + 1)) * 100)
    : 0;

  const lastEdited = total > 0 ? formatDate(resumes[0].updatedAt) : "—";
  const accountCreated =
    profile?.joined ? formatDate(profile.joined, { month: "long", year: "numeric" }) : "—";

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Stat cards
  const stats = [
    { icon: "📄", label: "Total Resumes", value: total, tone: "violet" },
    { icon: "⬇", label: "PDF Downloads", value: "—", tone: "blue", soft: "Tracking soon" },
    { icon: "★", label: "Favorite Template", value: favoriteTemplate, tone: "amber" },
    { icon: "◆", label: "Profile Completion", value: `${profileCompletion}%`, tone: "emerald" },
    { icon: "✎", label: "Last Resume Edited", value: lastEdited, tone: "rose" },
    { icon: "◷", label: "Account Created", value: accountCreated, tone: "slate" },
  ];

  // Recent activity (derived from real resume timestamps)
  const activity = resumes.slice(0, 5).map((r) => ({
    id: r._id,
    text: `Edited "${r.name || "Untitled"}"`,
    meta: `${TEMPLATE_NAMES[r.template] || r.template} · ${formatDate(r.updatedAt)}`,
    icon: "✎",
  }));

  const quickActions = [
    { to: "/builder", label: "Create New Resume", note: "Start from scratch", icon: "＋", tone: "violet" },
    { to: "/templates", label: "Browse Templates", note: "Pick a design", icon: "▤", tone: "blue" },
    { to: "/dashboard", label: "My Resumes", note: "Manage saved", icon: "❐", tone: "emerald" },
    { to: null, label: "AI Resume Assistant", note: "Coming soon", icon: "✦", tone: "amber", soon: true },
    { to: null, label: "Job Tracker", note: "Coming soon", icon: "◎", tone: "rose", soon: true },
  ];

  return (
    <>
      <Navbar />
      <div className="dash">
        <div className="dash-inner">
          {/* ===== Header ===== */}
          <header className="dash-header">
            <div>
              <span className="dash-date">{today}</span>
              <h1 className="dash-welcome">Welcome back, {firstName} 👋</h1>
            </div>
            <div className="dash-header-actions">
              <Link to="/builder" className="dash-hbtn dash-hbtn-primary">Create Resume</Link>
              <Link to="/templates" className="dash-hbtn">Browse Templates</Link>
              <Link to="/profile" className="dash-hbtn dash-hbtn-chip">
                <span className="dash-hbtn-avatar">{initial}</span>
                My Profile
              </Link>
            </div>
          </header>

          {/* ===== Stat cards ===== */}
          <section className="dash-stats">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`dash-stat tone-${s.tone}`}
                style={{ animationDelay: `${0.05 + i * 0.05}s` }}
              >
                <span className="dash-stat-icon">{s.icon}</span>
                <div className="dash-stat-body">
                  <span className="dash-stat-value">{s.value}</span>
                  <span className="dash-stat-label">{s.label}</span>
                  {s.soft && <span className="dash-stat-soft">{s.soft}</span>}
                </div>
              </div>
            ))}
          </section>

          <div className="dash-columns">
            {/* ===== Left column ===== */}
            <div className="dash-col-main">
              {/* Recent Resumes */}
              <section className="dash-panel">
                <div className="dash-panel-head">
                  <h2 className="dash-panel-title">Recent Resumes</h2>
                  <Link to="/builder" className="dash-panel-link">+ New</Link>
                </div>

                {loading ? (
                  <div className="dash-empty">
                    <p className="dash-empty-text">Loading your resumes…</p>
                  </div>
                ) : resumes.length === 0 ? (
                  <div className="dash-empty">
                    <div className="dash-empty-icon">📄</div>
                    <p className="dash-empty-text">No resumes yet. Build your first one!</p>
                    <Link to="/builder" className="dash-empty-btn">Create resume</Link>
                  </div>
                ) : (
                  <div className="dash-resume-list">
                    {resumes.slice(0, 5).map((r) => (
                      <div key={r._id} className="dash-resume-row">
                        <div className="dash-resume-avatar">
                          {r.photo ? (
                            <img src={r.photo} alt="" />
                          ) : (
                            <span>{r.name ? r.name.charAt(0).toUpperCase() : "?"}</span>
                          )}
                        </div>
                        <div className="dash-resume-info">
                          <span className="dash-resume-name">{r.name || "Untitled"}</span>
                          <span className="dash-resume-meta">
                            {TEMPLATE_NAMES[r.template] || r.template} · Modified {formatDate(r.updatedAt)}
                          </span>
                        </div>
                        <div className="dash-resume-actions">
                          <button className="dash-mini-btn" onClick={() => handleOpen(r)}>Edit</button>
                          <button className="dash-mini-btn ghost" onClick={() => handleOpen(r)}>PDF</button>
                          <button className="dash-mini-btn danger" onClick={() => handleDelete(r._id)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Quick Actions */}
              <section className="dash-panel">
                <div className="dash-panel-head">
                  <h2 className="dash-panel-title">Quick Actions</h2>
                </div>
                <div className="dash-actions-grid">
                  {quickActions.map((a) =>
                    a.to ? (
                      <Link key={a.label} to={a.to} className={`dash-action tone-${a.tone}`}>
                        <span className="dash-action-icon">{a.icon}</span>
                        <span className="dash-action-label">{a.label}</span>
                        <span className="dash-action-note">{a.note}</span>
                      </Link>
                    ) : (
                      <div key={a.label} className={`dash-action tone-${a.tone} is-soon`}>
                        <span className="dash-action-icon">{a.icon}</span>
                        <span className="dash-action-label">{a.label}</span>
                        <span className="dash-action-note">{a.note}</span>
                        <span className="dash-soon-badge">Soon</span>
                      </div>
                    )
                  )}
                </div>
              </section>
            </div>

            {/* ===== Right column ===== */}
            <div className="dash-col-side">
              {/* Analytics */}
              <section className="dash-panel">
                <div className="dash-panel-head">
                  <h2 className="dash-panel-title">Resume Analytics</h2>
                </div>
                <div className="dash-analytics">
                  <AnalyticsRow label="Total Resumes" value={total} />
                  <AnalyticsRow label="Total Downloads" value="—" soft />
                  <AnalyticsRow label="Most Used Template" value={favoriteTemplate} />
                  <AnalyticsRow label="Avg. Completion" value={`${avgCompletion}%`} bar={avgCompletion} />
                  <AnalyticsRow label="Last Activity" value={lastEdited} />
                </div>
              </section>

              {/* Activity timeline */}
              <section className="dash-panel">
                <div className="dash-panel-head">
                  <h2 className="dash-panel-title">Recent Activity</h2>
                </div>
                {activity.length === 0 ? (
                  <p className="dash-empty-text small">No activity yet.</p>
                ) : (
                  <div className="dash-timeline">
                    {activity.map((a) => (
                      <div key={a.id} className="dash-tl-item">
                        <span className="dash-tl-dot">{a.icon}</span>
                        <div className="dash-tl-body">
                          <span className="dash-tl-text">{a.text}</span>
                          <span className="dash-tl-meta">{a.meta}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function AnalyticsRow({ label, value, bar, soft }) {
  return (
    <div className="dash-an-row">
      <div className="dash-an-top">
        <span className="dash-an-label">{label}</span>
        <span className={`dash-an-value ${soft ? "is-soft" : ""}`}>{value}</span>
      </div>
      {typeof bar === "number" && (
        <div className="dash-an-bar">
          <div className="dash-an-bar-fill" style={{ width: `${bar}%` }} />
        </div>
      )}
    </div>
  );
}

export default Dashboard;