import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import "./Profile.css";

const CURRENT_USER_KEY = "currentUser";

function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem(CURRENT_USER_KEY);
  sessionStorage.removeItem("token");
  sessionStorage.removeItem(CURRENT_USER_KEY);
}

function Profile() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [resumeCount, setResumeCount] = useState(0);
  const [showDelete, setShowDelete] = useState(false);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Get the real user from the backend
        const { data: user } = await api.get("/auth/profile");
        setProfile(user);

        // Count this user's resumes from the backend
        try {
          const { data: resumes } = await api.get("/resumes");
          setResumeCount(Array.isArray(resumes) ? resumes.length : 0);
        } catch {
          setResumeCount(0);
        }
      } catch (error) {
        if (error.response?.status === 401) {
          navigate("/login", { replace: true });
          return;
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [navigate]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  function handlePhotoClick() {
    if (fileRef.current) fileRef.current.click();
  }

  async function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const { data } = await api.put("/auth/profile", {
          profileImage: reader.result,
        });
        setProfile(data);
        showToast("Profile picture updated!");
      } catch {
        showToast("Couldn't update photo. Try a smaller image.");
      }
    };
    reader.readAsDataURL(file);
  }

  function startEdit() {
    setDraft({
      fullName: profile.fullName || "",
      username: profile.username || "",
      email: profile.email || "",
      phone: profile.phone || "",
      country: profile.country || "",
      profession: profile.profession || "",
      bio: profile.bio || "",
    });
    setEditing(true);
    setToast("");
  }

  function cancelEdit() {
    setEditing(false);
    setDraft(null);
  }

  function handleDraftChange(e) {
    const { name, value } = e.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
  }

  async function saveEdit() {
    try {
      // Email is not editable here (it's the login identity), so we don't send it
      const { data } = await api.put("/auth/profile", {
        fullName: draft.fullName,
        username: draft.username,
        phone: draft.phone,
        country: draft.country,
        profession: draft.profession,
        bio: draft.bio,
      });
      setProfile(data);

      // Keep the name shown in the Navbar/Dashboard in sync
      const stored =
        localStorage.getItem(CURRENT_USER_KEY) ||
        sessionStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.fullName = data.fullName;
        const target = localStorage.getItem(CURRENT_USER_KEY)
          ? localStorage
          : sessionStorage;
        target.setItem(CURRENT_USER_KEY, JSON.stringify(parsed));
      }

      setEditing(false);
      setDraft(null);
      showToast("Profile saved!");
    } catch (error) {
      const msg =
        error.response?.data?.message || "Couldn't save. Please try again.";
      showToast(msg);
    }
  }

  function handleLogout() {
    clearSession();
    navigate("/", { replace: true });
  }

  async function confirmDelete() {
    try {
      await api.delete("/auth/profile");
      clearSession();
      navigate("/", { replace: true });
    } catch {
      showToast("Couldn't delete account. Please try again.");
      setShowDelete(false);
    }
  }

  if (loading || !profile) {
    return (
      <>
        <Navbar />
        <div className="profile">
          <div className="profile-inner">
            <div className="profile-card" style={{ padding: "60px", textAlign: "center", color: "#6b7280" }}>
              Loading your profile…
            </div>
          </div>
        </div>
      </>
    );
  }

  // Profile completion %
  const fields = [
    "fullName",
    "username",
    "email",
    "phone",
    "country",
    "profession",
    "bio",
  ];
  const filled = fields.filter(
    (f) => profile[f] && String(profile[f]).trim()
  ).length;
  const hasPhoto = profile.profileImage ? 1 : 0;
  const completion = Math.round(
    ((filled + hasPhoto) / (fields.length + 1)) * 100
  );

  const initial = profile.fullName
    ? profile.fullName.charAt(0).toUpperCase()
    : "U";

  const joinedDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <>
      <Navbar />
      <div className="profile">
        <div className="profile-inner">
          {/* ===== Banner + avatar ===== */}
          <div className="profile-card profile-hero">
            <div className="profile-banner" />
            <div className="profile-hero-body">
              <div className="profile-avatar-wrap" onClick={handlePhotoClick}>
                {profile.profileImage ? (
                  <img src={profile.profileImage} alt="Profile" className="profile-avatar" />
                ) : (
                  <div className="profile-avatar profile-avatar-fallback">
                    {initial}
                  </div>
                )}
                <span className="profile-avatar-cam" aria-hidden="true">
                  📷
                </span>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="profile-file-input"
                  onChange={handlePhoto}
                />
              </div>

              <div className="profile-hero-info">
                <h1 className="profile-name">
                  {profile.fullName || "Your Name"}
                </h1>
                <p className="profile-handle">
                  @{profile.username || "username"}
                  {profile.profession && (
                    <span className="profile-prof"> · {profile.profession}</span>
                  )}
                </p>
                <p className="profile-joined">Joined {joinedDate}</p>
              </div>

              {!editing && (
                <button className="profile-edit-btn" onClick={startEdit}>
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {toast && <div className="profile-toast">{toast}</div>}

          <div className="profile-grid">
            {/* ===== Left: details ===== */}
            <div className="profile-card profile-details">
              <h2 className="profile-section-title">Profile Information</h2>

              {editing ? (
                <div className="profile-form">
                  <div className="profile-form-row">
                    <div className="profile-field">
                      <label>Full Name</label>
                      <input name="fullName" value={draft.fullName} onChange={handleDraftChange} placeholder="Your name" />
                    </div>
                    <div className="profile-field">
                      <label>Username</label>
                      <input name="username" value={draft.username} onChange={handleDraftChange} placeholder="username" />
                    </div>
                  </div>
                  <div className="profile-form-row">
                    <div className="profile-field">
                      <label>Email</label>
                      <input name="email" value={draft.email} disabled placeholder="you@email.com" />
                    </div>
                    <div className="profile-field">
                      <label>Phone Number</label>
                      <input name="phone" value={draft.phone} onChange={handleDraftChange} placeholder="+1 555 123 4567" />
                    </div>
                  </div>
                  <div className="profile-form-row">
                    <div className="profile-field">
                      <label>Country</label>
                      <input name="country" value={draft.country} onChange={handleDraftChange} placeholder="United States" />
                    </div>
                    <div className="profile-field">
                      <label>Profession</label>
                      <input name="profession" value={draft.profession} onChange={handleDraftChange} placeholder="Software Engineer" />
                    </div>
                  </div>
                  <div className="profile-field">
                    <label>Bio</label>
                    <textarea name="bio" value={draft.bio} onChange={handleDraftChange} placeholder="A short line about you." rows={3} />
                  </div>

                  <div className="profile-form-actions">
                    <button className="profile-save-btn" onClick={saveEdit}>
                      Save changes
                    </button>
                    <button className="profile-cancel-btn" onClick={cancelEdit}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="profile-info-list">
                  <InfoRow label="Full Name" value={profile.fullName} />
                  <InfoRow label="Username" value={profile.username && `@${profile.username}`} />
                  <InfoRow label="Email" value={profile.email} />
                  <InfoRow label="Phone" value={profile.phone} />
                  <InfoRow label="Country" value={profile.country} />
                  <InfoRow label="Profession" value={profile.profession} />
                  <InfoRow label="Bio" value={profile.bio} full />
                </div>
              )}
            </div>

            {/* ===== Right: stats + actions ===== */}
            <div className="profile-side">
              <div className="profile-card profile-completion">
                <h3 className="profile-side-title">Profile Completion</h3>
                <div className="profile-progress">
                  <div
                    className="profile-progress-bar"
                    style={{ width: `${completion}%` }}
                  />
                </div>
                <span className="profile-progress-label">
                  {completion}% complete
                </span>
              </div>

              <div className="profile-card profile-stats">
                <div className="profile-stat">
                  <span className="profile-stat-value">{resumeCount}</span>
                  <span className="profile-stat-label">Resumes created</span>
                </div>
                <div className="profile-stat">
                  <span className="profile-stat-value profile-stat-date">
                    {joinedDate}
                  </span>
                  <span className="profile-stat-label">Member since</span>
                </div>
              </div>

              <div className="profile-card profile-actions">
                <button className="profile-logout-btn" onClick={handleLogout}>
                  Log out
                </button>
                <button
                  className="profile-delete-btn"
                  onClick={() => setShowDelete(true)}
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Delete confirmation ===== */}
      {showDelete && (
        <div className="profile-modal-overlay" onClick={() => setShowDelete(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-icon">⚠️</div>
            <h3 className="profile-modal-title">Delete your account?</h3>
            <p className="profile-modal-text">
              This permanently removes your account, profile, and all saved
              resumes. This can't be undone.
            </p>
            <div className="profile-modal-actions">
              <button
                className="profile-modal-cancel"
                onClick={() => setShowDelete(false)}
              >
                Cancel
              </button>
              <button className="profile-modal-confirm" onClick={confirmDelete}>
                Yes, delete it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function InfoRow({ label, value, full }) {
  return (
    <div className={`profile-info-row ${full ? "is-full" : ""}`}>
      <span className="profile-info-label">{label}</span>
      <span className="profile-info-value">
        {value ? value : <em className="profile-info-empty">Not set</em>}
      </span>
    </div>
  );
}
export default Profile;