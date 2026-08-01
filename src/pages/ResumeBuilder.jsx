import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Navbar from "../components/Navbar";
import ResumeRenderer from "../components/ResumeRenderer";
import { TEMPLATES, getTemplate } from "../templates/templateConfig";
import api from "../api/axios";
import "./ResumeBuilder.css";

const CURRENT_USER_KEY = "currentUser";

const COLOR_PRESETS = [
  { name: "Blue", accent: "#2563eb", soft: "#eff6ff", sidebar: "#1e293b", heading: "#38bdf8" },
  { name: "Violet", accent: "#7c3aed", soft: "#f3f0ff", sidebar: "#2e1065", heading: "#c4b5fd" },
  { name: "Emerald", accent: "#059669", soft: "#ecfdf5", sidebar: "#064e3b", heading: "#6ee7b7" },
  { name: "Rose", accent: "#db2777", soft: "#fce7f3", sidebar: "#831843", heading: "#f9a8d4" },
  { name: "Amber", accent: "#d97706", soft: "#fffbeb", sidebar: "#451a03", heading: "#fcd34d" },
  { name: "Slate", accent: "#334155", soft: "#f1f5f9", sidebar: "#0f172a", heading: "#94a3b8" },
  { name: "Teal", accent: "#0d9488", soft: "#f0fdfa", sidebar: "#134e4a", heading: "#5eead4" },
  { name: "Crimson", accent: "#dc2626", soft: "#fef2f2", sidebar: "#450a0a", heading: "#fca5a5" },
];

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

const emptyExperience = () => ({
  id: Date.now() + Math.random(),
  title: "",
  company: "",
  location: "",
  start: "",
  end: "",
  bullets: "",
});

const emptyEducation = () => ({
  id: Date.now() + Math.random(),
  degree: "",
  school: "",
  location: "",
  start: "",
  end: "",
});

const initialForm = {
  name: "",
  title: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  website: "",
  summary: "",
  experience: [],
  education: [],
  certifications: "",
  languages: "",
  skills: "",
};

function normalizeForm(form) {
  if (!form) return initialForm;
  const next = { ...initialForm, ...form };
  if (typeof next.experience === "string") {
    next.experience = next.experience.trim()
      ? [{ ...emptyExperience(), bullets: next.experience }]
      : [];
  }
  if (typeof next.education === "string") {
    next.education = next.education.trim()
      ? [{ ...emptyEducation(), degree: next.education }]
      : [];
  }
  if (!Array.isArray(next.experience)) next.experience = [];
  if (!Array.isArray(next.education)) next.education = [];
  next.experience = next.experience.map((exp) => ({ ...emptyExperience(), ...exp }));
  next.education = next.education.map((ed) => ({ ...emptyEducation(), ...ed }));
  return next;
}

function ResumeBuilder() {
  const location = useLocation();
  const navigate = useNavigate();
  const incoming = location.state?.resume || null;

  const [form, setForm] = useState(
    incoming ? normalizeForm(incoming.form) : initialForm
  );
  const [photo, setPhoto] = useState(incoming?.photo || null);
  const [templateId, setTemplateId] = useState(
    incoming?.template || location.state?.template || TEMPLATES[0].id
  );
  const [colorOverride, setColorOverride] = useState(incoming?.color || null);
  const [editingId, setEditingId] = useState(incoming?._id || null);
  const [saveMessage, setSaveMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const fileRef = useRef(null);
  const sheetRef = useRef(null);

  const baseConfig = getTemplate(templateId);
  const config = colorOverride
    ? {
        ...baseConfig,
        accent: colorOverride.accent,
        accentSoft: colorOverride.soft,
        sidebarBg: colorOverride.sidebar,
        sidebarHeading: colorOverride.heading,
        headerBg:
          baseConfig.headerStyle === "banner"
            ? `linear-gradient(120deg, ${colorOverride.accent}, ${colorOverride.sidebar})`
            : baseConfig.headerBg,
      }
    : baseConfig;

  useEffect(() => {
    if (incoming) {
      setForm(normalizeForm(incoming.form));
      setPhoto(incoming.photo || null);
      setTemplateId(incoming.template || TEMPLATES[0].id);
      setColorOverride(incoming.color || null);
      setEditingId(incoming._id || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incoming?._id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSaveMessage("");
  }

  function updateExperience(id, field, value) {
    setForm((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    }));
    setSaveMessage("");
  }
  function addExperience() {
    setForm((prev) => ({ ...prev, experience: [...prev.experience, emptyExperience()] }));
  }
  function removeExperience(id) {
    setForm((prev) => ({ ...prev, experience: prev.experience.filter((e) => e.id !== id) }));
  }

  function updateEducation(id, field, value) {
    setForm((prev) => ({
      ...prev,
      education: prev.education.map((ed) =>
        ed.id === id ? { ...ed, [field]: value } : ed
      ),
    }));
    setSaveMessage("");
  }
  function addEducation() {
    setForm((prev) => ({ ...prev, education: [...prev.education, emptyEducation()] }));
  }
  function removeEducation(id) {
    setForm((prev) => ({ ...prev, education: prev.education.filter((e) => e.id !== id) }));
  }

  function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result);
    reader.readAsDataURL(file);
  }
  function removePhoto() {
    setPhoto(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSave(e) {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) {
      navigate("/login");
      return;
    }
    if (!form.name.trim()) {
      setSaveMessage("Please add your name before saving.");
      return;
    }

    const payload = {
      template: templateId,
      color: colorOverride,
      photo,
      form,
      name: form.name,
      title: form.title || "Untitled resume",
    };

    setSaving(true);
    setSaveMessage("");
    try {
      if (editingId) {
        await api.put(`/resumes/${editingId}`, payload);
        setSaveMessage("Resume updated! You can find it on your dashboard.");
      } else {
        const { data } = await api.post("/resumes", payload);
        if (data?._id) setEditingId(data._id);
        setSaveMessage("Resume saved! You can find it on your dashboard.");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/login");
        return;
      }
      const msg =
        error.response?.data?.message ||
        "Couldn't save your resume. Please try again.";
      setSaveMessage(msg);
    } finally {
      setSaving(false);
    }
  }

  // ===== PDF download — forces full A4 width so text never breaks/squishes =====
  async function handleDownload() {
    if (!sheetRef.current) return;
    setDownloading(true);
    setSaveMessage("");

    const sheet = sheetRef.current;

    // Remember the current on-screen styles so we can restore them after
    const prev = {
      width: sheet.style.width,
      maxWidth: sheet.style.maxWidth,
      transform: sheet.style.transform,
      marginBottom: sheet.style.marginBottom,
      borderRadius: sheet.style.borderRadius,
    };

    try {
      // Force the resume to full desktop A4 width for a clean capture,
      // regardless of whether we're on a phone or PC.
      sheet.style.width = "794px";       // A4 width in px at 96dpi
      sheet.style.maxWidth = "none";
      sheet.style.transform = "none";    // undo the mobile scale
      sheet.style.marginBottom = "0";
      sheet.style.borderRadius = "0";

      // Give the browser a moment to re-layout at the new width
      await new Promise((r) => setTimeout(r, 80));

      const canvas = await html2canvas(sheet, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: 794,
        windowWidth: 794,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      const fileName = `${form.name || "resume"}`.replace(/\s+/g, "_").toLowerCase();
      pdf.save(`${fileName}.pdf`);
    } catch {
      setSaveMessage("Couldn't generate the PDF. Please try again.");
    } finally {
      // Put the on-screen styles back exactly as they were
      sheet.style.width = prev.width;
      sheet.style.maxWidth = prev.maxWidth;
      sheet.style.transform = prev.transform;
      sheet.style.marginBottom = prev.marginBottom;
      sheet.style.borderRadius = prev.borderRadius;
      setDownloading(false);
    }
  }

  const initial = form.name ? form.name.charAt(0).toUpperCase() : "?";

  return (
    <>
      <Navbar />
      <div className="builder">
        <div className="builder-inner">
          {/* ===== Editor ===== */}
          <section className="builder-editor">
            <div className="builder-editor-head">
              <h1 className="builder-title">
                {editingId ? "Edit your resume" : "Build your resume"}
              </h1>
              <p className="builder-subtitle">
                Pick a template, choose a color, and fill in your details — it
                updates live on the right.
              </p>
            </div>

            {/* Template switcher */}
            <div className="builder-templates">
              <span className="builder-field-heading">Template</span>
              <div className="builder-template-chips">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`builder-template-chip ${
                      templateId === t.id ? "is-active" : ""
                    }`}
                    onClick={() => setTemplateId(t.id)}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Color picker */}
            <div className="builder-colors">
              <span className="builder-field-heading">Color</span>
              <div className="builder-swatches">
                <button
                  type="button"
                  className={`builder-swatch builder-swatch-default ${
                    !colorOverride ? "is-active" : ""
                  }`}
                  onClick={() => setColorOverride(null)}
                  title="Template default"
                >
                  <span>A</span>
                </button>
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    className={`builder-swatch ${
                      colorOverride?.accent === c.accent ? "is-active" : ""
                    }`}
                    style={{ background: c.accent }}
                    onClick={() => setColorOverride(c)}
                    title={c.name}
                    aria-label={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Photo upload */}
            <div className="builder-photo">
              <span className="builder-field-heading">Profile photo</span>
              <div className="builder-photo-row">
                <div className="builder-photo-preview">
                  {photo ? (
                    <img src={photo} alt="Profile" />
                  ) : (
                    <span className="builder-photo-placeholder">{initial}</span>
                  )}
                </div>
                <div className="builder-photo-actions">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    id="photo"
                    className="builder-photo-input"
                    onChange={handlePhoto}
                  />
                  <label htmlFor="photo" className="builder-photo-btn">
                    {photo ? "Change photo" : "Upload photo"}
                  </label>
                  {photo && (
                    <button type="button" className="builder-photo-remove" onClick={removePhoto}>
                      Remove
                    </button>
                  )}
                  <p className="builder-photo-hint">
                    Shows on two-column templates. JPG or PNG.
                  </p>
                </div>
              </div>
            </div>

            <form className="builder-form" onSubmit={handleSave}>
              <div className="builder-group-heading">Personal details</div>
              <div className="builder-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Full Name</label>
                  <input className="form-input" id="name" name="name" value={form.name} onChange={handleChange} placeholder="Jordan Lee" />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="title">Target Role</label>
                  <input className="form-input" id="title" name="title" value={form.title} onChange={handleChange} placeholder="Software Engineer" />
                </div>
              </div>

              <div className="builder-group-heading">Contact details</div>
              <div className="builder-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email</label>
                  <input className="form-input" id="email" name="email" value={form.email} onChange={handleChange} placeholder="jordan@email.com" />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="phone">Phone</label>
                  <input className="form-input" id="phone" name="phone" value={form.phone} onChange={handleChange} placeholder="+1 555 123 4567" />
                </div>
              </div>
              <div className="builder-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="location">Location</label>
                  <input className="form-input" id="location" name="location" value={form.location} onChange={handleChange} placeholder="San Francisco, CA" />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="linkedin">LinkedIn</label>
                  <input className="form-input" id="linkedin" name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="linkedin.com/in/jordan" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="website">Website / Portfolio</label>
                <input className="form-input" id="website" name="website" value={form.website} onChange={handleChange} placeholder="jordanlee.dev" />
              </div>

              <div className="builder-group-heading">Profile</div>
              <div className="form-group">
                <label className="form-label" htmlFor="summary">Professional Summary</label>
                <textarea className="form-textarea" id="summary" name="summary" value={form.summary} onChange={handleChange} placeholder="Two or three sentences on what you do and what you're looking for." rows={3} />
              </div>

              <div className="builder-group-heading">Work experience</div>
              {form.experience.map((exp, idx) => (
                <div key={exp.id} className="entry-card">
                  <div className="entry-card-head">
                    <span className="entry-card-num">Job {idx + 1}</span>
                    <button type="button" className="entry-remove" onClick={() => removeExperience(exp.id)}>Remove</button>
                  </div>
                  <div className="builder-row">
                    <div className="form-group">
                      <label className="form-label">Job Title</label>
                      <input className="form-input" value={exp.title} onChange={(e) => updateExperience(exp.id, "title", e.target.value)} placeholder="Senior Engineer" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Company</label>
                      <input className="form-input" value={exp.company} onChange={(e) => updateExperience(exp.id, "company", e.target.value)} placeholder="Acme Corp" />
                    </div>
                  </div>
                  <div className="builder-row builder-row-3">
                    <div className="form-group">
                      <label className="form-label">Location</label>
                      <input className="form-input" value={exp.location} onChange={(e) => updateExperience(exp.id, "location", e.target.value)} placeholder="Remote" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Start</label>
                      <input className="form-input" value={exp.start} onChange={(e) => updateExperience(exp.id, "start", e.target.value)} placeholder="Jan 2020" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">End</label>
                      <input className="form-input" value={exp.end} onChange={(e) => updateExperience(exp.id, "end", e.target.value)} placeholder="Present" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Achievements <span className="form-hint">(one per line = one bullet)</span>
                    </label>
                    <textarea className="form-textarea" value={exp.bullets} onChange={(e) => updateExperience(exp.id, "bullets", e.target.value)} placeholder={"Led a team of 5 engineers\nCut load time by 40%"} rows={3} />
                  </div>
                </div>
              ))}
              <button type="button" className="entry-add" onClick={addExperience}>+ Add job</button>

              <div className="builder-group-heading">Education</div>
              {form.education.map((ed, idx) => (
                <div key={ed.id} className="entry-card">
                  <div className="entry-card-head">
                    <span className="entry-card-num">School {idx + 1}</span>
                    <button type="button" className="entry-remove" onClick={() => removeEducation(ed.id)}>Remove</button>
                  </div>
                  <div className="builder-row">
                    <div className="form-group">
                      <label className="form-label">Degree</label>
                      <input className="form-input" value={ed.degree} onChange={(e) => updateEducation(ed.id, "degree", e.target.value)} placeholder="B.S. Computer Science" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">School</label>
                      <input className="form-input" value={ed.school} onChange={(e) => updateEducation(ed.id, "school", e.target.value)} placeholder="State University" />
                    </div>
                  </div>
                  <div className="builder-row builder-row-3">
                    <div className="form-group">
                      <label className="form-label">Location</label>
                      <input className="form-input" value={ed.location} onChange={(e) => updateEducation(ed.id, "location", e.target.value)} placeholder="Boston, MA" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Start</label>
                      <input className="form-input" value={ed.start} onChange={(e) => updateEducation(ed.id, "start", e.target.value)} placeholder="2016" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">End</label>
                      <input className="form-input" value={ed.end} onChange={(e) => updateEducation(ed.id, "end", e.target.value)} placeholder="2020" />
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" className="entry-add" onClick={addEducation}>+ Add school</button>

              <div className="builder-group-heading">Extras</div>
              <div className="form-group">
                <label className="form-label" htmlFor="certifications">
                  Certifications <span className="form-hint">(one per line)</span>
                </label>
                <textarea className="form-textarea" id="certifications" name="certifications" value={form.certifications} onChange={handleChange} placeholder={"AWS Certified — Amazon\nScrum Master — Scrum.org"} rows={2} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="skills">Skills</label>
                <input className="form-input" id="skills" name="skills" value={form.skills} onChange={handleChange} placeholder="Comma-separated, e.g. React, SQL, Figma" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="languages">Languages</label>
                <input className="form-input" id="languages" name="languages" value={form.languages} onChange={handleChange} placeholder="Comma-separated, e.g. English, Spanish" />
              </div>

              {saveMessage && (
                <div className={`builder-save-msg ${saveMessage.startsWith("Resume saved") || saveMessage.startsWith("Resume updated") ? "is-success" : "is-error"}`}>
                  {saveMessage}
                </div>
              )}

              <div className="builder-actions">
                <button className="builder-submit" type="submit" disabled={saving}>
                  {saving ? "Saving…" : editingId ? "Update resume" : "Save resume"}
                </button>
                <button className="builder-download" type="button" onClick={handleDownload} disabled={downloading}>
                  {downloading ? "Preparing…" : "Download PDF"}
                </button>
              </div>
            </form>
          </section>

          {/* ===== Live Preview ===== */}
          <section className="builder-preview">
            <div className="builder-preview-bar">
              <span className="builder-preview-label">Live preview</span>
              <span className="builder-preview-badge">A4</span>
            </div>

            <ResumeRenderer
              config={config}
              data={form}
              photo={photo}
              sheetRef={sheetRef}
            />
          </section>
        </div>
      </div>
    </>
  );
}

export default ResumeBuilder;