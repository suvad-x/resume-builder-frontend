import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { TEMPLATES } from "../templates/templateConfig";
import "./Home.css";

const CURRENT_USER_KEY = "currentUser";
function isLoggedIn() {
  return Boolean(
    localStorage.getItem(CURRENT_USER_KEY) ||
      sessionStorage.getItem(CURRENT_USER_KEY)
  );
}

const STATS = [
  { value: "120K+", label: "Resumes Created" },
  { value: "45K+", label: "Active Users" },
  { value: "92%", label: "ATS Success Rate" },
  { value: "20+", label: "Professional Templates" },
];

const FEATURES = [
  { icon: "✦", title: "AI Resume Writing", text: "Get smart suggestions for wording, skills, and phrasing tuned to your target role." },
  { icon: "✓", title: "ATS-Friendly", text: "Every template parses cleanly through applicant tracking systems — no lost data." },
  { icon: "⬇", title: "PDF Download", text: "Export a pixel-perfect PDF in one click, ready to send to any recruiter." },
  { icon: "▤", title: "Pro Templates", text: "Choose from polished, recruiter-approved designs in multiple layouts and colors." },
  { icon: "⚡", title: "Fast Builder", text: "Live preview updates as you type — a full resume in minutes, not hours." },
  { icon: "🔒", title: "Secure Account", text: "Your data stays private and saved to your account, ready whenever you return." },
];

const STEPS = [
  { n: "1", title: "Create Account", text: "Sign up free in seconds — no card required." },
  { n: "2", title: "Choose Template", text: "Pick a design and color that fits your style." },
  { n: "3", title: "Build Resume", text: "Fill in your details with live preview." },
  { n: "4", title: "Download PDF", text: "Export and start applying right away." },
];

const WHY = [
  { icon: "◎", title: "Built for results", text: "Designed around what recruiters and ATS software actually look for." },
  { icon: "◆", title: "Genuinely easy", text: "No design skills needed — the builder handles structure and spacing." },
  { icon: "★", title: "Truly free to start", text: "Build, preview, and export without hidden paywalls at every step." },
];

const TESTIMONIALS = [
  { name: "Priya N.", role: "Data Analyst", avatar: "P", rating: 5, quote: "Rewrote my resume here and had two interviews the same week. The ATS tips made a real difference." },
  { name: "Marcus T.", role: "Product Designer", avatar: "M", rating: 5, quote: "The cleanest builder I've used. Live preview and one-click PDF — exactly what I needed." },
  { name: "Elena V.", role: "Backend Engineer", avatar: "E", rating: 5, quote: "Finally a tool that doesn't fight me on formatting. It just gets out of the way." },
];

const FAQS = [
  { q: "Is it really free to use?", a: "Yes — you can build, preview, and download resumes for free. Creating an account lets you save and reopen your drafts anytime." },
  { q: "Will my resume pass ATS software?", a: "Every template avoids the formatting that trips up parsers — no text boxes, no icons standing in for words. What you see is what the parser reads." },
  { q: "Can I make more than one resume?", a: "Absolutely. Build as many tailored versions as you like, each saved separately to your account." },
  { q: "Where is my data stored?", a: "Right now everything is saved securely in your browser on this device. Nothing is shared publicly." },
];

// ---- Small reusable pieces ----
function StatCard({ value, label }) {
  return (
    <div className="hm-stat">
      <span className="hm-stat-value">{value}</span>
      <span className="hm-stat-label">{label}</span>
    </div>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <div className="hm-feature">
      <span className="hm-feature-icon">{icon}</span>
      <h3 className="hm-feature-title">{title}</h3>
      <p className="hm-feature-text">{text}</p>
    </div>
  );
}

function Stars({ n }) {
  return (
    <span className="hm-stars" aria-label={`${n} stars`}>
      {"★".repeat(n)}
      <span className="hm-stars-off">{"★".repeat(5 - n)}</span>
    </span>
  );
}

function Home() {
  const [openFaq, setOpenFaq] = useState(0);
  const buildTarget = isLoggedIn() ? "/builder" : "/login";
  const templatesTarget = isLoggedIn() ? "/templates" : "/login";

  // First 6 templates for the preview strip
  const previewTemplates = TEMPLATES.slice(0, 6);

  return (
    <>
      <Navbar />

      {/* ===== 1. Hero ===== */}
      <section className="hm-hero">
        <div className="hm-hero-bg" aria-hidden="true">
          <span className="hm-glow hm-glow-1" />
          <span className="hm-glow hm-glow-2" />
          <span className="hm-grid" />
        </div>
        <div className="hm-hero-inner">
          <div className="hm-hero-copy">
            <span className="hm-badge">✦ Trusted by 45,000+ job seekers</span>
            <h1 className="hm-hero-title">
              Build a resume that gets you <span className="hm-accent">hired</span>.
            </h1>
            <p className="hm-hero-sub">
              Create a polished, ATS-friendly resume in minutes. Beautiful
              templates, live preview, and one-click PDF export — completely free
              to start.
            </p>
            <div className="hm-hero-actions">
              <Link to={buildTarget} className="hm-btn hm-btn-primary">Create Resume</Link>
              <Link to={templatesTarget} className="hm-btn hm-btn-ghost">Browse Templates</Link>
            </div>
            <div className="hm-hero-proof">
              <div className="hm-hero-avatars">
                <span>A</span><span>M</span><span>J</span><span>+</span>
              </div>
              <span className="hm-hero-proof-text">Join thousands building standout resumes</span>
            </div>
          </div>

          <div className="hm-hero-visual" aria-hidden="true">
            <div className="hm-mock">
              <div className="hm-mock-side">
                <div className="hm-mock-photo" />
                <span className="hm-mock-bar" />
                <span className="hm-mock-bar short" />
                <span className="hm-mock-bar" />
                <span className="hm-mock-bar short" />
              </div>
              <div className="hm-mock-main">
                <span className="hm-mock-title" />
                <span className="hm-mock-sub" />
                <span className="hm-mock-line" />
                <span className="hm-mock-line" />
                <span className="hm-mock-line short" />
                <span className="hm-mock-line" />
                <span className="hm-mock-line short" />
              </div>
            </div>
            <div className="hm-float hm-float-1">✓ ATS Ready</div>
            <div className="hm-float hm-float-2">⬇ PDF Export</div>
          </div>
        </div>
      </section>

      {/* ===== 2. Statistics ===== */}
      <section className="hm-stats-band">
        <div className="hm-stats">
          {STATS.map((s) => <StatCard key={s.label} {...s} />)}
        </div>
      </section>

      {/* ===== 3. Features ===== */}
      <section className="hm-section">
        <div className="hm-head">
          <span className="hm-eyebrow">Why it works</span>
          <h2 className="hm-section-title">Everything you need to stand out</h2>
          <p className="hm-section-sub">Powerful tools that make building a professional resume effortless.</p>
        </div>
        <div className="hm-features">
          {FEATURES.map((f) => <FeatureCard key={f.title} {...f} />)}
        </div>
      </section>

      {/* ===== 4. How It Works ===== */}
      <section className="hm-section hm-section-alt">
        <div className="hm-head">
          <span className="hm-eyebrow">How it works</span>
          <h2 className="hm-section-title">From blank page to hired in 4 steps</h2>
        </div>
        <div className="hm-steps">
          {STEPS.map((s, i) => (
            <div key={s.n} className="hm-step">
              <span className="hm-step-num">{s.n}</span>
              <h3 className="hm-step-title">{s.title}</h3>
              <p className="hm-step-text">{s.text}</p>
              {i < STEPS.length - 1 && <span className="hm-step-arrow">→</span>}
            </div>
          ))}
        </div>
      </section>

      {/* ===== 5. Templates preview ===== */}
      <section className="hm-section">
        <div className="hm-head">
          <span className="hm-eyebrow">Templates</span>
          <h2 className="hm-section-title">Designs recruiters love</h2>
          <p className="hm-section-sub">Pick a layout, customize the color, make it yours.</p>
        </div>
        <div className="hm-templates">
          {previewTemplates.map((t) => (
            <div key={t.id} className="hm-tpl" style={{ "--tpl-accent": t.accent, "--tpl-sidebar": t.sidebarBg || "#1e293b", "--tpl-header": t.headerBg }}>
              <div className={`hm-tpl-mini ${t.layout === "two-column" ? "two" : "single"}`}>
                {t.layout === "two-column" && <div className="hm-tpl-side" />}
                <div className="hm-tpl-body">
                  <span className="hm-tpl-band" />
                  <span className="hm-tpl-l" />
                  <span className="hm-tpl-l short" />
                  <span className="hm-tpl-l" />
                </div>
              </div>
              <span className="hm-tpl-name">{t.name}</span>
            </div>
          ))}
        </div>
        <div className="hm-center">
          <Link to={templatesTarget} className="hm-btn hm-btn-primary">View All Templates</Link>
        </div>
      </section>

      {/* ===== 6. Why Choose Us ===== */}
      <section className="hm-section hm-section-alt">
        <div className="hm-head">
          <span className="hm-eyebrow">Why choose us</span>
          <h2 className="hm-section-title">Made to actually get you interviews</h2>
        </div>
        <div className="hm-why">
          {WHY.map((w) => (
            <div key={w.title} className="hm-why-card">
              <span className="hm-why-icon">{w.icon}</span>
              <h3 className="hm-why-title">{w.title}</h3>
              <p className="hm-why-text">{w.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 7. Testimonials ===== */}
      <section className="hm-section">
        <div className="hm-head">
          <span className="hm-eyebrow">Testimonials</span>
          <h2 className="hm-section-title">Loved by job seekers</h2>
        </div>
        <div className="hm-testimonials">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="hm-testimonial">
              <Stars n={t.rating} />
              <blockquote className="hm-testimonial-quote">"{t.quote}"</blockquote>
              <figcaption className="hm-testimonial-foot">
                <span className="hm-testimonial-avatar">{t.avatar}</span>
                <span className="hm-testimonial-meta">
                  <span className="hm-testimonial-name">{t.name}</span>
                  <span className="hm-testimonial-role">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ===== 8. FAQ ===== */}
      <section className="hm-section hm-section-alt">
        <div className="hm-head">
          <span className="hm-eyebrow">FAQ</span>
          <h2 className="hm-section-title">Questions, answered</h2>
        </div>
        <div className="hm-faq">
          {FAQS.map((item, i) => {
            const open = openFaq === i;
            return (
              <div key={item.q} className={`hm-faq-item ${open ? "is-open" : ""}`}>
                <button className="hm-faq-q" onClick={() => setOpenFaq(open ? -1 : i)} aria-expanded={open}>
                  {item.q}
                  <span className="hm-faq-icon" aria-hidden="true" />
                </button>
                {open && <p className="hm-faq-a">{item.a}</p>}
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== 9. Final CTA ===== */}
      <section className="hm-cta">
        <div className="hm-cta-inner">
          <h2 className="hm-cta-title">Your next job starts with a better resume</h2>
          <p className="hm-cta-sub">Join thousands who've built standout resumes in minutes. Free to start.</p>
          <Link to={buildTarget} className="hm-btn hm-btn-light">Start Building Resume</Link>
        </div>
      </section>

      {/* ===== 10. Footer ===== */}
      <footer className="hm-footer">
        <div className="hm-footer-top">
          <div className="hm-footer-brand">
            <span className="hm-footer-logo">
              <span className="hm-footer-mark">R/</span> Resume Builder
            </span>
            <p className="hm-footer-tag">Build. Download. Get hired.</p>
          </div>
          <div className="hm-footer-col">
            <span className="hm-footer-h">Product</span>
            <Link to={buildTarget}>Resume Builder</Link>
            <Link to={templatesTarget}>Templates</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>
          <div className="hm-footer-col">
            <span className="hm-footer-h">Company</span>
            <a href="#">About</a>
            <a href="#">Contact</a>
          </div>
          <div className="hm-footer-col">
            <span className="hm-footer-h">Legal</span>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
          <div className="hm-footer-col">
            <span className="hm-footer-h">Follow</span>
            <a href="#">Twitter</a>
            <a href="#">LinkedIn</a>
            <a href="#">GitHub</a>
          </div>
        </div>
        <div className="hm-footer-bottom">
          <span>© {new Date().getFullYear()} Resume Builder. All rights reserved.</span>
        </div>
      </footer>
    </>
  );
}

export default Home;