import { useState, useRef, useLayoutEffect } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "../components/Navbar";
import { TEMPLATES } from "../templates/templateConfig";
import "./Home.css";

gsap.registerPlugin(ScrollTrigger);

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

// Split a stat value like "120K+" into number(120), suffix("K+")
function parseStat(value) {
  const match = value.match(/^([\d.]+)(.*)$/);
  if (!match) return { num: 0, suffix: value };
  return { num: parseFloat(match[1]), suffix: match[2] };
}

// ---- Small reusable pieces ----
function StatCard({ value, label }) {
  const { num, suffix } = parseStat(value);
  return (
    <div className="hm-stat">
      <span className="hm-stat-value" data-target={num} data-suffix={suffix}>
        0{suffix}
      </span>
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

  const previewTemplates = TEMPLATES.slice(0, 6);

  const rootRef = useRef(null);

  useLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const ctx = gsap.context(() => {
      const EASE = "power3.out";
      const TOGGLE = "play reverse play reverse";

      const reveal = (targets, trigger, opts = {}) =>
        gsap.from(targets, {
          opacity: 0,
          y: 40,
          duration: 1,
          ease: EASE,
          stagger: 0.12,
          scrollTrigger: { trigger, start: "top 82%", toggleActions: TOGGLE },
          ...opts,
        });

      // ===== 1. HERO — word-by-word title reveal + text timeline =====
      // Split the hero title into word spans (keeps the accent styling)
      const titleEl = rootRef.current.querySelector(".hm-hero-title");
      if (titleEl && !titleEl.dataset.split) {
        titleEl.dataset.split = "1";
        const accentEl = titleEl.querySelector(".hm-accent");
        const accentText = accentEl ? accentEl.textContent : "";
        // Rebuild: wrap each word in a span; keep the accent word highlighted
        const raw = titleEl.textContent;
        const words = raw.split(" ");
        titleEl.innerHTML = words
          .map((w) => {
            const isAccent = accentText && w.replace(/[.,]/g, "") === accentText.replace(/[.,]/g, "");
            const cls = isAccent ? "hm-word hm-accent" : "hm-word";
            return `<span class="${cls}" style="display:inline-block">${w}</span>`;
          })
          .join(" ");
      }

      const heroTl = gsap.timeline({ defaults: { ease: EASE } });
      heroTl
        .from(".hm-badge", { opacity: 0, y: 20, duration: 0.9 }, 0.1)
        .from(".hm-hero-title .hm-word", { opacity: 0, y: 40, duration: 0.9, stagger: 0.09 }, 0.25)
        .from(".hm-hero-sub", { opacity: 0, y: 24, duration: 1 }, 0.9)
        .from(".hm-hero-actions .hm-btn", { opacity: 0, y: 20, duration: 0.9, stagger: 0.15 }, 1.15)
        .from(".hm-hero-proof", { opacity: 0, y: 16, duration: 0.9 }, 1.4);

      // ===== PARALLAX — hero glows drift as you scroll =====
      gsap.to(".hm-glow-1", {
        y: 120,
        ease: "none",
        scrollTrigger: { trigger: ".hm-hero", start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".hm-glow-2", {
        y: -90,
        ease: "none",
        scrollTrigger: { trigger: ".hm-hero", start: "top top", end: "bottom top", scrub: true },
      });

      // ===== Button press effect (mouse + touch) =====
      const pressButtons = document.querySelectorAll(".hm-hero-actions .hm-btn");
      const pressHandlers = [];
      pressButtons.forEach((btn) => {
        const down = () => gsap.to(btn, { scale: 0.94, duration: 0.15, ease: "power2.out" });
        const up = () => gsap.to(btn, { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.5)" });
        btn.addEventListener("mousedown", down);
        btn.addEventListener("mouseup", up);
        btn.addEventListener("mouseleave", up);
        btn.addEventListener("touchstart", down, { passive: true });
        btn.addEventListener("touchend", up);
        pressHandlers.push({ btn, down, up });
      });
      window.__hmPressHandlers = pressHandlers;

      // ===== 2. STATS — fade up + COUNT-UP numbers =====
      reveal(".hm-stat", ".hm-stats-band", { y: 30, duration: 0.9, stagger: 0.1 });

      // Count-up: animate each stat number from 0 to its target when in view
      gsap.utils.toArray(".hm-stat-value").forEach((el) => {
        const target = parseFloat(el.dataset.target) || 0;
        const suffix = el.dataset.suffix || "";
        const isDecimal = target % 1 !== 0;
        const counter = { val: 0 };
        gsap.to(counter, {
          val: target,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: { trigger: ".hm-stats-band", start: "top 80%", toggleActions: "play none none reset" },
          onUpdate: () => {
            const shown = isDecimal ? counter.val.toFixed(1) : Math.round(counter.val);
            el.textContent = `${shown}${suffix}`;
          },
        });
      });

      // ===== Section headings =====
      gsap.utils.toArray(".hm-head").forEach((head) => {
        gsap.from(head, {
          opacity: 0, y: 30, duration: 1, ease: EASE,
          scrollTrigger: { trigger: head, start: "top 85%", toggleActions: TOGGLE },
        });
      });

      // ===== 3. FEATURES =====
      reveal(".hm-feature", ".hm-features");

      // ===== 4. STEPS =====
      reveal(".hm-step", ".hm-steps", { stagger: 0.15 });

      // ===== 5. TEMPLATES — stagger + tiny scale =====
      gsap.from(".hm-tpl", {
        opacity: 0, y: 40, scale: 0.96, duration: 1, ease: EASE, stagger: 0.1,
        scrollTrigger: { trigger: ".hm-templates", start: "top 82%", toggleActions: TOGGLE },
      });

      // ===== 6. WHY =====
      reveal(".hm-why-card", ".hm-why", { stagger: 0.15 });

      // ===== 7. TESTIMONIALS =====
      reveal(".hm-testimonial", ".hm-testimonials", { stagger: 0.15 });

      // ===== 8. FAQ =====
      reveal(".hm-faq-item", ".hm-faq", { y: 26, duration: 0.9, stagger: 0.1 });

      // ===== 9. CTA =====
      gsap.from(".hm-cta-inner > *", {
        opacity: 0, y: 36, duration: 1, ease: EASE, stagger: 0.12,
        scrollTrigger: { trigger: ".hm-cta", start: "top 82%", toggleActions: TOGGLE },
      });
    }, rootRef);

    return () => {
      ctx.revert();
      (window.__hmPressHandlers || []).forEach(({ btn, down, up }) => {
        btn.removeEventListener("mousedown", down);
        btn.removeEventListener("mouseup", up);
        btn.removeEventListener("mouseleave", up);
        btn.removeEventListener("touchstart", down);
        btn.removeEventListener("touchend", up);
      });
      window.__hmPressHandlers = [];
    };
  }, []);

  return (
    <div ref={rootRef}>
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
    </div>
  );
}

export default Home;