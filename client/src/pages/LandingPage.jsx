import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const POPULAR_CATEGORIES = [
  { icon: "</>", name: "Web Development", bg: "#EEF2FF", color: "#635BFF" },
  { icon: "📱", name: "Mobile Development", bg: "#F0FDF4", color: "#16A34A" },
  { icon: "✏️", name: "UI/UX Design", bg: "#FDF2F8", color: "#DB2777" },
  { icon: "🎨", name: "Graphic Design", bg: "#FFF7ED", color: "#EA580C" },
  { icon: "📝", name: "Content Writing", bg: "#F0F9FF", color: "#0284C7" },
  { icon: "📢", name: "Digital Marketing", bg: "#F0FDF4", color: "#16A34A" },
  { icon: "📹", name: "Video & Animation", bg: "#F3E8FF", color: "#9333EA" },
  { icon: "🎵", name: "Music & Audio", bg: "#FEF2F2", color: "#DC2626" },
];

const POPULAR_PROJECTS = [
  {
    icon: "🛒",
    iconBg: "#EEF2FF",
    iconColor: "#635BFF",
    title: "Build a Modern E-commerce Website",
    category: "Web Development",
    budget: "₹25,000 - ₹50,000",
    status: "Open",
    proposals: "24"
  },
  {
    icon: "📱",
    iconBg: "#F0F9FF",
    iconColor: "#0284C7",
    title: "UI/UX Design for Mobile App",
    category: "UI/UX Design",
    budget: "₹15,000 - ₹30,000",
    status: "Open",
    proposals: "18"
  }
];

export default function LandingPage() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("");

  // Featured Talent state managed dynamically via localStorage
  const [featuredTalent, setFeaturedTalent] = useState(() => {
    try {
      const stored = localStorage.getItem("skillhive_featured_talent");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Error reading talent from storage:", e);
    }
    return []; // Empty by default as requested: remove all static talent
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTalentDetails, setSelectedTalentDetails] = useState(null);
  const fileInputRef = useRef(null);

  const [newTalent, setNewTalent] = useState({
    name: "",
    title: "",
    rate: "₹1,500 /hr",
    location: "From India",
    rating: "4.9",
    reviews: "50",
    avatar: "",
    customAvatarUrl: "",
    uploadedFileName: "",
    isUploaded: false,
    verified: true,
    bio: "",
    skills: "",
  });

  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WEBP, etc.)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size should be under 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setNewTalent((prev) => ({
        ...prev,
        avatar: reader.result,
        uploadedFileName: file.name,
        isUploaded: true,
        customAvatarUrl: "",
      }));
      toast.success("Profile photo uploaded!");
    };
    reader.onerror = () => {
      toast.error("Failed to read image file");
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setNewTalent((prev) => ({
      ...prev,
      avatar: "",
      uploadedFileName: "",
      isUploaded: false,
      customAvatarUrl: "",
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const updateTalentStorage = (newList) => {
    setFeaturedTalent(newList);
    try {
      localStorage.setItem("skillhive_featured_talent", JSON.stringify(newList));
    } catch (e) {
      console.error("Error saving talent to storage:", e);
    }
  };

  const handleHeroSearch = (e) => {
    e.preventDefault();
    let queryParams = [];
    if (searchQuery.trim()) queryParams.push(`q=${encodeURIComponent(searchQuery.trim())}`);
    if (selectedCat) queryParams.push(`category=${encodeURIComponent(selectedCat)}`);
    
    navigate(`/search${queryParams.length ? `?${queryParams.join("&")}` : ""}`);
  };

  const handleAddTalentSubmit = (e) => {
    e.preventDefault();
    if (!newTalent.name.trim()) {
      toast.error("Please enter the talent's full name");
      return;
    }
    if (!newTalent.title.trim()) {
      toast.error("Please enter the talent's skill or title");
      return;
    }

    let finalRate = newTalent.rate.trim();
    if (!finalRate.includes("/hr") && !finalRate.includes("₹")) {
      finalRate = `₹${finalRate} /hr`;
    } else if (!finalRate.includes("/hr")) {
      finalRate = `${finalRate} /hr`;
    }

    const talentEntry = {
      id: "talent_" + Date.now(),
      name: newTalent.name.trim(),
      title: newTalent.title.trim(),
      rate: finalRate,
      location: newTalent.location.trim() || "Remote",
      rating: newTalent.rating || "5.0",
      reviews: newTalent.reviews || "1",
      avatar: newTalent.avatar || "",
      verified: Boolean(newTalent.verified),
      bio: newTalent.bio.trim(),
      skills: newTalent.skills.trim()
        ? newTalent.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : [newTalent.title.trim()],
    };

    const updated = [talentEntry, ...featuredTalent];
    updateTalentStorage(updated);
    toast.success(`Added ${talentEntry.name} to Featured Talent!`);

    // Reset form and close modal
    setNewTalent({
      name: "",
      title: "",
      rate: "₹1,500 /hr",
      location: "From India",
      rating: "4.9",
      reviews: "50",
      avatar: "",
      customAvatarUrl: "",
      uploadedFileName: "",
      isUploaded: false,
      verified: true,
      bio: "",
      skills: "",
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setShowAddModal(false);
  };

  const handleDeleteTalent = (e, talentId, talentName) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = featuredTalent.filter((t) => (t.id || t.name) !== talentId);
    updateTalentStorage(updated);
    if (selectedTalentDetails && (selectedTalentDetails.id || selectedTalentDetails.name) === talentId) {
      setSelectedTalentDetails(null);
    }
    toast.success(`Removed ${talentName}`);
  };

  return (
    <div className="landing-page">
      {/* HERO SECTION */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-left">
              <h1 className="hero-title">
                The Skill Marketplace <br />
                <span className="hero-title-purple">for Real Work</span>
              </h1>
              <p className="hero-subtitle">
                Find skilled freelancers for any project, or showcase your skills and earn from anywhere in the world.
              </p>

              {/* HERO SEARCH WIDGET CARD */}
              <form className="hero-search-card" onSubmit={handleHeroSearch}>
                <div className="search-card-input-wrap">
                  <input
                    type="text"
                    className="search-card-input"
                    placeholder="What service do you need?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="search-card-divider" />
                <div className="search-card-select-wrap">
                  <select
                    className="search-card-select"
                    value={selectedCat}
                    onChange={(e) => setSelectedCat(e.target.value)}
                  >
                    <option value="">Select Category</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Mobile Development">Mobile Development</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Graphic Design">Graphic Design</option>
                    <option value="Content Writing">Content Writing</option>
                    <option value="Digital Marketing">Digital Marketing</option>
                  </select>
                </div>
                <button type="submit" className="search-card-btn">
                  Search
                </button>
              </form>

              {/* STATS ROW */}
              <div className="hero-stats-row">
                <div className="hero-stat-item">
                  <div className="hero-stat-icon">👤</div>
                  <div className="hero-stat-text">
                    <span className="hero-stat-val">50K+</span>
                    <span className="hero-stat-lbl">Skilled Freelancers</span>
                  </div>
                </div>
                <div className="hero-stat-item">
                  <div className="hero-stat-icon">💼</div>
                  <div className="hero-stat-text">
                    <span className="hero-stat-val">10K+</span>
                    <span className="hero-stat-lbl">Jobs Posted</span>
                  </div>
                </div>
                <div className="hero-stat-item">
                  <div className="hero-stat-icon">⭐</div>
                  <div className="hero-stat-text">
                    <span className="hero-stat-val">4.9/5</span>
                    <span className="hero-stat-lbl">Average Rating</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="hero-right">
              <div className="hero-img-wrap">
                <img
                  src="/images/hero_freelancer.png"
                  alt="SkillHive Professional Freelancer"
                  className="hero-freelancer-img"
                />
                <div className="floating-badge badge-active-orders">
                  <span className="badge-pulse"></span>
                  <div>
                    <span className="badge-bold">2,400+</span>
                    <span className="badge-sub">Active Bookings</span>
                  </div>
                </div>
                <div className="floating-badge badge-verified">
                  <span className="badge-star">★</span>
                  <div>
                    <span className="badge-bold">100% Verified</span>
                    <span className="badge-sub">Skill Certified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR CATEGORIES 8-TILE GRID */}
      <section className="categories-section">
        <div className="container">
          <div className="section-top-bar">
            <div>
              <h2 className="section-title">Popular Categories</h2>
              <p className="section-subtitle">
                Explore the most in-demand skills and top rated freelance talents.
              </p>
            </div>
            <Link to="/search" className="section-view-all">
              View all categories →
            </Link>
          </div>

          <div className="categories-grid-8">
            {POPULAR_CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                to={`/search?category=${encodeURIComponent(cat.name)}`}
                className="category-tile"
              >
                <div
                  className="cat-icon-box"
                  style={{ background: cat.bg, color: cat.color }}
                >
                  {cat.icon}
                </div>
                <span className="cat-tile-title">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TWO COLUMN SECTION: FEATURED TALENT & POPULAR PROJECTS */}
      <section className="two-col-section">
        <div className="container">
          <div className="two-col-grid">
            
            {/* FEATURED TALENT COLUMN */}
            <div className="column-card-wrapper">
              <div className="section-top-bar" style={{ marginBottom: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <h2 className="section-title" style={{ fontSize: "1.35rem" }}>Featured Talent</h2>
                  {featuredTalent.length > 0 && (
                    <span
                      style={{
                        background: "#EEF2FF",
                        color: "#635BFF",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        padding: "0.2rem 0.55rem",
                        borderRadius: "12px",
                      }}
                    >
                      {featuredTalent.length}
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    style={{
                      padding: "0.35rem 0.75rem",
                      fontSize: "0.8rem",
                      borderRadius: "8px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      fontWeight: 600,
                    }}
                    onClick={() => setShowAddModal(true)}
                  >
                    <span style={{ fontSize: "1rem", lineHeight: 1 }}>+</span> Add Talent
                  </button>

                  <Link to="/search" className="section-view-all" style={{ fontSize: "0.825rem" }}>
                    View all talent →
                  </Link>
                </div>
              </div>

              {/* Dynamic Talent List or Empty State */}
              {featuredTalent.length === 0 ? (
                <div className="talent-empty-state">
                  <div style={{ fontSize: "2rem", marginBottom: "0.4rem" }}>✨</div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0F172A", margin: "0 0 0.3rem 0" }}>
                    No Featured Talent Yet
                  </h3>
                  <p style={{ fontSize: "0.8rem", color: "#64748B", margin: "0 0 1rem 0", maxWidth: "280px", lineHeight: 1.4 }}>
                    Add freelance talent details (name, skill, hourly rate, rating, and avatar) to showcase them here.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ borderRadius: "8px", fontSize: "0.825rem", padding: "0.45rem 1rem", fontWeight: 600 }}
                    onClick={() => setShowAddModal(true)}
                  >
                    + Add Talent Details
                  </button>
                </div>
              ) : (
                <div className="talent-cards-grid">
                  {featuredTalent.map((t) => (
                    <div
                      key={t.id || t.name}
                      className="talent-mini-card"
                      onClick={() => setSelectedTalentDetails(t)}
                      title="Click to view talent details"
                    >
                      {/* Delete option button */}
                      <button
                        type="button"
                        className="talent-card-delete-btn"
                        title={`Delete ${t.name}`}
                        onClick={(e) => handleDeleteTalent(e, t.id || t.name, t.name)}
                      >
                        ✕
                      </button>

                      {t.avatar ? (
                        <img
                          src={t.avatar}
                          alt={t.name}
                          className="talent-avatar"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            if (e.currentTarget.nextSibling) {
                              e.currentTarget.nextSibling.style.display = "flex";
                            }
                          }}
                        />
                      ) : null}
                      <div
                        className="talent-avatar-fallback"
                        style={{ display: t.avatar ? "none" : "flex" }}
                      >
                        {t.name ? t.name.charAt(0).toUpperCase() : "T"}
                      </div>

                      <div className="talent-name-wrap">
                        <span className="talent-name">{t.name}</span>
                        {t.verified && <span className="talent-check">✓</span>}
                      </div>
                      <span className="talent-title">{t.title}</span>
                      <div className="talent-rating">
                        <span style={{ color: "#F59E0B" }}>★</span> {t.rating} <span style={{ color: "#94A3B8" }}>({t.reviews})</span>
                      </div>
                      <span className="talent-location">{t.location}</span>
                      <span className="talent-price">{t.rate}</span>
                      <span className="talent-card-details-badge">View Details</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* POPULAR PROJECTS COLUMN */}
            <div className="column-card-wrapper">
              <div className="section-top-bar" style={{ marginBottom: "0.5rem" }}>
                <h2 className="section-title" style={{ fontSize: "1.35rem" }}>Popular Projects</h2>
                <Link to="/search" className="section-view-all" style={{ fontSize: "0.825rem" }}>
                  View all projects →
                </Link>
              </div>

              <div className="projects-list">
                {POPULAR_PROJECTS.map((p) => (
                  <Link key={p.title} to="/search" className="project-card-item">
                    <div className="project-left">
                      <div className="project-icon-box" style={{ background: p.iconBg, color: p.iconColor }}>
                        {p.icon}
                      </div>
                      <div className="project-info-h">
                        <span className="project-item-title">{p.title}</span>
                        <span className="project-item-cat">{p.category}</span>
                        <span className="project-item-budget">{p.budget}</span>
                      </div>
                    </div>
                    <div className="project-right">
                      <span className="project-status-badge">{p.status}</span>
                      <span className="project-proposals-count">Proposals: {p.proposals}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* MODAL 1: ADD TALENT DETAILS */}
      {showAddModal && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setShowAddModal(false)}
        >
          <div className="modal fade-in" style={{ maxWidth: "480px", width: "92%" }}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ fontSize: "1.2rem", fontWeight: 700 }}>
                Add Talent Details
              </h2>
              <button
                className="btn btn-ghost btn-sm"
                type="button"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTalentSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Alex Johnson"
                  value={newTalent.name}
                  onChange={(e) => setNewTalent({ ...newTalent, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Skill / Professional Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Full Stack Developer, UI/UX Designer"
                  value={newTalent.title}
                  onChange={(e) => setNewTalent({ ...newTalent, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Hourly Rate</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. ₹1,500 /hr"
                    value={newTalent.rate}
                    onChange={(e) => setNewTalent({ ...newTalent, rate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. From India, Remote"
                    value={newTalent.location}
                    onChange={(e) => setNewTalent({ ...newTalent, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Rating (1.0 - 5.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    className="form-input"
                    value={newTalent.rating}
                    onChange={(e) => setNewTalent({ ...newTalent, rating: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Reviews Count</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={newTalent.reviews}
                    onChange={(e) => setNewTalent({ ...newTalent, reviews: e.target.value })}
                  />
                </div>
              </div>

              {/* Profile Photo Upload Component */}
              <div className="form-group">
                <label className="form-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Profile Photo</span>
                  {newTalent.isUploaded && (
                    <span style={{ fontSize: "0.75rem", color: "#16A34A", fontWeight: 600 }}>✓ Custom Photo Loaded</span>
                  )}
                </label>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/webp, image/jpg"
                  style={{ display: "none" }}
                  onChange={handleFileUpload}
                />

                {newTalent.isUploaded ? (
                  /* Preview Box when image is uploaded */
                  <div className="photo-upload-preview-wrap">
                    <img
                      src={newTalent.avatar}
                      alt="Uploaded profile"
                      className="photo-upload-preview-img"
                    />
                    <div className="photo-upload-preview-info">
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0F172A", wordBreak: "break-all" }}>
                        {newTalent.uploadedFileName || "Custom Uploaded Photo"}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "#64748B" }}>Ready to save</span>
                    </div>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        className="photo-upload-remove-btn"
                        onClick={handleRemovePhoto}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Upload Dropzone Button */
                  <div
                    className="photo-upload-dropzone"
                    onClick={() => fileInputRef.current?.click()}
                    title="Click to browse image file"
                  >
                    <div className="photo-upload-icon-circle">
                      📷
                    </div>
                    <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#635BFF" }}>
                      Upload Profile Photo
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "#64748B" }}>
                      PNG, JPG, or WEBP (Max 5MB)
                    </span>
                  </div>
                )}

              </div>

              <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: "0.2rem 0" }}>
                <input
                  type="checkbox"
                  id="verified-talent-chk"
                  checked={newTalent.verified}
                  onChange={(e) => setNewTalent({ ...newTalent, verified: e.target.checked })}
                  style={{ width: "16px", height: "16px", accentColor: "#635BFF", cursor: "pointer" }}
                />
                <label htmlFor="verified-talent-chk" style={{ fontSize: "0.85rem", color: "#334155", cursor: "pointer" }}>
                  Verified Skill Badge (✓)
                </label>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Add Talent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TALENT DETAILS POPUP */}
      {selectedTalentDetails && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setSelectedTalentDetails(null)}
        >
          <div className="modal fade-in" style={{ maxWidth: "440px", width: "90%" }}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ fontSize: "1.15rem", fontWeight: 700 }}>
                Talent Details
              </h2>
              <button
                className="btn btn-ghost btn-sm"
                type="button"
                onClick={() => setSelectedTalentDetails(null)}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0.5rem 0" }}>
              {selectedTalentDetails.avatar ? (
                <img
                  src={selectedTalentDetails.avatar}
                  alt={selectedTalentDetails.name}
                  style={{ width: "72px", height: "72px", borderRadius: "50%", objectFit: "cover", marginBottom: "0.75rem", border: "3px solid #EEF2FF" }}
                />
              ) : (
                <div className="talent-avatar-fallback" style={{ width: "72px", height: "72px", fontSize: "1.5rem" }}>
                  {selectedTalentDetails.name?.charAt(0)}
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.2rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "#0F172A" }}>
                  {selectedTalentDetails.name}
                </h3>
                {selectedTalentDetails.verified && (
                  <span className="talent-check" style={{ width: "16px", height: "16px", fontSize: "9px" }}>✓</span>
                )}
              </div>

              <span style={{ fontSize: "0.85rem", color: "#64748B", fontWeight: 500, marginBottom: "0.4rem" }}>
                {selectedTalentDetails.title}
              </span>

              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.85rem", marginBottom: "0.85rem" }}>
                <span style={{ color: "#F59E0B", fontWeight: 700 }}>
                  ★ {selectedTalentDetails.rating} <span style={{ color: "#94A3B8", fontWeight: 400 }}>({selectedTalentDetails.reviews} reviews)</span>
                </span>
                <span style={{ color: "#CBD5E1" }}>•</span>
                <span style={{ color: "#64748B" }}>{selectedTalentDetails.location}</span>
              </div>

              <div
                style={{
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: "12px",
                  padding: "0.75rem 1.25rem",
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.25rem",
                }}
              >
                <span style={{ fontSize: "0.825rem", color: "#64748B" }}>Hourly Rate</span>
                <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#635BFF" }}>
                  {selectedTalentDetails.rate}
                </span>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", width: "100%" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1, color: "#EF4444", borderColor: "#FEE2E2", background: "#FEF2F2" }}
                  onClick={(e) => handleDeleteTalent(e, selectedTalentDetails.id || selectedTalentDetails.name, selectedTalentDetails.name)}
                >
                  Delete Talent
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => {
                    const q = selectedTalentDetails.name;
                    setSelectedTalentDetails(null);
                    navigate(`/search?q=${encodeURIComponent(q)}`);
                  }}
                >
                  Find on Search →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
