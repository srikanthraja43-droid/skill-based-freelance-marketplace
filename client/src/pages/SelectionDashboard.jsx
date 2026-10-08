import { useState } from "react";
import DashboardSwitcher from "../components/common/DashboardSwitcher";
import { useMarketplaceStore } from "../utils/marketplaceStore";
import toast from "react-hot-toast";
import "./SelectionDashboard.css";

const SKILLS_LIST = [
  "React",
  "Node.js",
  "Python",
  "Figma",
  "Adobe XD",
  "Flutter",
  "Vue.js",
  "Django",
  "AWS",
  "Docker",
  "TypeScript",
  "MongoDB",
  "PostgreSQL",
  "WordPress",
  "SEO",
  "GraphQL",
  "Stripe",
  "Firebase",
  "TensorFlow"
];

function Stars({ rating, size = "0.9rem" }) {
  const num = typeof rating === "number" ? rating : parseFloat(rating) || 5;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{
            color: i <= Math.floor(num) ? "#F59E0B" : "#334155",
            fontSize: size
          }}
        >
          {i <= Math.floor(num) ? "★" : "☆"}
        </span>
      ))}
      <span style={{ fontSize: "0.78rem", color: "#94A3B8", marginLeft: 4 }}>
        {num.toFixed(1)}
      </span>
    </span>
  );
}

function MatchScore({ score }) {
  const cls =
    score >= 90
      ? "sl-match-badge sl-match-high"
      : score >= 75
      ? "sl-match-badge sl-match-med"
      : "sl-match-badge sl-match-low";
  return <span className={cls}>🎯 {score}% Match</span>;
}

function Sidebar({ active, setActive, compareList, activeJob, jobs, onSelectJob, shortlistedCount, requestsCount }) {
  const nav = [
    { key: "browse", icon: "🔍", label: "Talent Search" },
    { key: "compare", icon: "⚖️", label: "Compare Talent", badge: compareList.length },
    { key: "shortlist", icon: "⭐", label: "Shortlisted", badge: shortlistedCount },
    { key: "requested", icon: "📨", label: "Work Requests Sent", badge: requestsCount },
    { key: "messages", icon: "💬", label: "Direct Messages" }
  ];

  return (
    <aside className="sl-sidebar">
      <div className="sl-brand">
        <div className="sl-brand-icon">🎯</div>
        <div>
          <div className="sl-brand-name">FreelanceHub</div>
          <div className="sl-brand-sub">Talent Matching Portal</div>
        </div>
      </div>

      {/* Target Job Selector */}
      <div className="sl-job-banner">
        <div className="sl-job-banner-title">Matching For Job:</div>
        <select
          className="sl-job-banner-select"
          value={activeJob.id}
          onChange={(e) => onSelectJob(Number(e.target.value))}
        >
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title}
            </option>
          ))}
        </select>
        <div className="sl-job-banner-meta">
          <span>💰 {activeJob.budget}</span>
          <span>📅 Due {activeJob.deadline}</span>
        </div>
      </div>

      <nav className="sl-nav">
        {nav.map((item) => (
          <button
            key={item.key}
            className={`sl-nav-item ${active === item.key ? "active" : ""}`}
            onClick={() => setActive(item.key)}
          >
            <span className="sl-nav-icon">{item.icon}</span>
            <span className="sl-nav-label">{item.label}</span>
            {item.badge > 0 && <span className="sl-nav-badge">{item.badge}</span>}
          </button>
        ))}
      </nav>

      <div className="sl-sidebar-footer">
        <button
          className="sl-compare-btn"
          disabled={compareList.length < 2}
          onClick={() => setActive("compare")}
        >
          {compareList.length < 2
            ? `Select ${2 - compareList.length} more to compare`
            : `⚖️ Compare ${compareList.length} Candidates`}
        </button>
        <div className="sl-compare-count">
          {compareList.length}/4 selected for side-by-side comparison
        </div>
      </div>
    </aside>
  );
}

function FreelancerCard({
  fl,
  jobSkills,
  compareList,
  toggleCompare,
  isShortlisted,
  toggleShortlist,
  onRequest,
  onChat,
  onViewProfile,
  onViewPortfolio
}) {
  const inCompare = compareList.includes(fl.id);
  const matchSkills = fl.skills.filter((s) => jobSkills.includes(s));
  const otherSkills = fl.skills.filter((s) => !jobSkills.includes(s));

  // Dynamic match percentage
  const matchPct = jobSkills.length > 0
    ? Math.min(100, Math.round((matchSkills.length / jobSkills.length) * 100) + 20)
    : 85;

  return (
    <div className={`sl-fl-card ${inCompare ? "selected" : ""}`}>
      {/* Top selection bar */}
      <div className="sl-card-topbar">
        <label className="sl-compare-check-label" title="Select for side-by-side comparison">
          <input
            type="checkbox"
            checked={inCompare}
            onChange={() => toggleCompare(fl.id)}
          />
          <span>Compare</span>
        </label>
        <button
          className={`sl-star-btn ${isShortlisted ? "starred" : ""}`}
          onClick={() => toggleShortlist(fl.id)}
          title={isShortlisted ? "Remove from Shortlist" : "Add to Shortlist"}
        >
          {isShortlisted ? "★ Shortlisted" : "☆ Shortlist"}
        </button>
      </div>

      <div className="sl-fl-card-top">
        <div style={{ position: "relative" }}>
          <div className="sl-fl-av" style={{ background: fl.avatarGrad }}>
            {fl.avatar}
          </div>
          <div
            className={`sl-avail-dot ${fl.available ? "online" : "busy"}`}
            title={fl.availability}
          ></div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="sl-fl-name-row">
            <div>
              <div className="sl-fl-name">
                {fl.name}
                {fl.verified && <span className="sl-verified-badge">✓ Verified</span>}
              </div>
              <div className="sl-fl-title">{fl.title}</div>
              <div className="sl-fl-loc">📍 {fl.location} · 📂 {fl.category}</div>
            </div>
            <MatchScore score={fl.matchScore || matchPct} />
          </div>

          <div className="sl-fl-rating">
            <Stars rating={fl.rating} />
            <em>({fl.reviewsCount || fl.reviews?.length || 50} reviews)</em>
          </div>
        </div>
      </div>

      {/* Skills Match Section */}
      <div className="sl-fl-skills">
        {matchSkills.map((s) => (
          <span key={s} className="sl-chip match">
            ✓ {s}
          </span>
        ))}
        {otherSkills.slice(0, 3).map((s) => (
          <span key={s} className="sl-chip">
            {s}
          </span>
        ))}
        {otherSkills.length > 3 && (
          <span className="sl-chip-more">+{otherSkills.length - 3}</span>
        )}
      </div>

      {/* Candidate Metrics Grid */}
      <div className="sl-fl-stats">
        <div>
          <span>Projects</span>
          <strong>{fl.completedProjects}</strong>
        </div>
        <div>
          <span>Success</span>
          <strong>{fl.successRate}%</strong>
        </div>
        <div>
          <span>Experience</span>
          <strong>{fl.experience}</strong>
        </div>
        <div>
          <span>Portfolio</span>
          <strong>{fl.portfolio?.length || 3} items</strong>
        </div>
      </div>

      {/* Rate & Timeline */}
      <div className="sl-fl-price-row">
        <div>
          <span className="sl-rate-label">Expected Price</span>
          <div className="sl-fl-price">{fl.expectedPrice || fl.bid}</div>
        </div>
        <div>
          <span className="sl-rate-label">Estimated Delivery</span>
          <div className="sl-fl-timeline">⏱ {fl.estimatedTimeline || fl.timeline}</div>
        </div>
        <div>
          <span className="sl-rate-label">Availability</span>
          <span className={`sl-avail-tag ${fl.available ? "free" : "busy"}`}>
            {fl.available ? "Available Now" : "Busy"}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="sl-fl-actions">
        <button
          className="sl-btn-ghost"
          onClick={() => onViewProfile(fl)}
          title="View Comprehensive Profile"
        >
          👤 View Profile
        </button>
        <button
          className="sl-btn-ghost"
          onClick={() => onViewPortfolio(fl)}
          title="View Portfolio Showcase"
        >
          📁 Portfolio
        </button>
        <button
          className="sl-btn-ghost"
          onClick={() => onChat(fl)}
          title="Direct Message"
        >
          💬 Chat
        </button>
        <button
          className="sl-btn-primary"
          onClick={() => onRequest(fl)}
        >
          Request Work →
        </button>
      </div>
    </div>
  );
}

function BrowseTab({
  freelancers,
  activeJob,
  compareList,
  toggleCompare,
  shortlistedIds,
  toggleShortlist,
  onRequest,
  onChat,
  onViewProfile,
  onViewPortfolio
}) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [expFilter, setExpFilter] = useState("All");
  const [ratingFilter, setRatingFilter] = useState("All");
  const [budgetFilter, setBudgetFilter] = useState("All");
  const [availFilter, setAvailFilter] = useState("All");
  const [deliveryFilter, setDeliveryFilter] = useState("All");
  const [projectsFilter, setProjectsFilter] = useState("All");
  const [sortBy, setSortBy] = useState("match");

  const toggleSkill = (s) =>
    setSelectedSkills((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  let filtered = freelancers.filter((fl) => {
    const matchSearch =
      !search ||
      fl.name.toLowerCase().includes(search.toLowerCase()) ||
      fl.title.toLowerCase().includes(search.toLowerCase()) ||
      fl.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));

    const matchCategory = categoryFilter === "All" || fl.category === categoryFilter;
    const matchSkills =
      selectedSkills.length === 0 || selectedSkills.every((s) => fl.skills.includes(s));

    const expYears = parseInt(fl.experience) || 3;
    const matchExp =
      expFilter === "All" ||
      (expFilter === "<3 years" && expYears < 3) ||
      (expFilter === "3-5 years" && expYears >= 3 && expYears <= 5) ||
      (expFilter === "5+ years" && expYears > 5);

    const matchRating = ratingFilter === "All" || fl.rating >= parseFloat(ratingFilter);
    const matchAvail =
      availFilter === "All" ||
      (availFilter === "Available" && fl.available) ||
      (availFilter === "Busy" && !fl.available);

    const price = fl.priceAmount || parseInt(String(fl.expectedPrice || fl.bid || "").replace(/\D/g, "")) || 1500;
    const matchBudget =
      budgetFilter === "All" ||
      (budgetFilter === "Under $1500" && price < 1500) ||
      (budgetFilter === "$1500-$2000" && price >= 1500 && price <= 2000) ||
      (budgetFilter === "$2000+" && price > 2000);

    const deliveryDays = fl.deliveryDays || 14;
    const matchDelivery =
      deliveryFilter === "All" ||
      (deliveryFilter === "<2 weeks" && deliveryDays <= 14) ||
      (deliveryFilter === "2-3 weeks" && deliveryDays > 14 && deliveryDays <= 21) ||
      (deliveryFilter === "3+ weeks" && deliveryDays > 21);

    const matchProjects =
      projectsFilter === "All" ||
      (projectsFilter === "50+ Projects" && fl.completedProjects >= 50) ||
      (projectsFilter === "100+ Projects" && fl.completedProjects >= 100);

    return (
      matchSearch &&
      matchCategory &&
      matchSkills &&
      matchExp &&
      matchRating &&
      matchAvail &&
      matchBudget &&
      matchDelivery &&
      matchProjects
    );
  });

  // Sorting
  if (sortBy === "match") filtered = [...filtered].sort((a, b) => (b.matchScore || 90) - (a.matchScore || 90));
  else if (sortBy === "rating") filtered = [...filtered].sort((a, b) => b.rating - a.rating);
  else if (sortBy === "price_low") filtered = [...filtered].sort((a, b) => (a.priceAmount || 1000) - (b.priceAmount || 1000));
  else if (sortBy === "price_high") filtered = [...filtered].sort((a, b) => (b.priceAmount || 1000) - (a.priceAmount || 1000));
  else if (sortBy === "projects") filtered = [...filtered].sort((a, b) => b.completedProjects - a.completedProjects);

  const clearAllFilters = () => {
    setCategoryFilter("All");
    setSelectedSkills([]);
    setExpFilter("All");
    setRatingFilter("All");
    setBudgetFilter("All");
    setAvailFilter("All");
    setDeliveryFilter("All");
    setProjectsFilter("All");
    setSearch("");
  };

  return (
    <div className="sl-fade">
      <div className="sl-page-hdr">
        <div>
          <h1 className="sl-page-title">Find the Right Freelancer</h1>
          <p className="sl-subtitle">
            Showing top-tier vetted talent matched to:{" "}
            <strong style={{ color: "#F59E0B" }}>{activeJob.title}</strong>
          </p>
        </div>
      </div>

      {/* Selection Workflow Header */}
      <div className="sl-workflow-banner">
        <div className="sl-workflow-title">Selection Workflow:</div>
        <div className="sl-workflow-steps">
          <span className="sl-wf-step active">1. Filter Talent</span>
          <span className="sl-wf-arrow">➔</span>
          <span className="sl-wf-step active">2. View Profile & Portfolio</span>
          <span className="sl-wf-arrow">➔</span>
          <span className="sl-wf-step active">3. Side-by-Side Compare</span>
          <span className="sl-wf-arrow">➔</span>
          <span className="sl-wf-step">4. Direct Chat</span>
          <span className="sl-wf-arrow">➔</span>
          <span className="sl-wf-step">5. Send Work Request</span>
        </div>
      </div>

      <div className="sl-browse-layout">
        {/* Left Multi-Dimensional Filter Panel */}
        <aside className="sl-filter-panel">
          <div className="sl-filter-box">
            <div className="sl-filter-box-hdr">
              <h3>🎯 Smart Filters</h3>
              <button className="sl-clear-btn" onClick={clearAllFilters}>
                Clear All
              </button>
            </div>

            <div className="sl-filter-group">
              <label>Category</label>
              <select
                className="sl-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="Web Development">Web Development</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Mobile Development">Mobile Development</option>
                <option value="Data Science">Data Science</option>
                <option value="DevOps">DevOps</option>
                <option value="Graphic Design">Graphic Design</option>
              </select>
            </div>

            <div className="sl-filter-group">
              <label>Skills Required ({selectedSkills.length})</label>
              <div className="sl-skill-tags">
                {SKILLS_LIST.map((s) => (
                  <button
                    key={s}
                    className={`sl-skill-tag ${selectedSkills.includes(s) ? "active" : ""}`}
                    onClick={() => toggleSkill(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="sl-filter-group">
              <label>Experience Level</label>
              <select
                className="sl-select"
                value={expFilter}
                onChange={(e) => setExpFilter(e.target.value)}
              >
                <option value="All">All Experience</option>
                <option value="<3 years">&lt; 3 years</option>
                <option value="3-5 years">3 - 5 years (Mid)</option>
                <option value="5+ years">5+ years (Senior / Staff)</option>
              </select>
            </div>

            <div className="sl-filter-group">
              <label>Minimum Client Rating</label>
              <select
                className="sl-select"
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
              >
                <option value="All">Any Rating</option>
                <option value="4.5">★ 4.5+ Stars</option>
                <option value="4.8">★ 4.8+ Stars</option>
                <option value="4.9">★ 4.9+ Stars (Top Rated)</option>
              </select>
            </div>

            <div className="sl-filter-group">
              <label>Budget / Price Range</label>
              <select
                className="sl-select"
                value={budgetFilter}
                onChange={(e) => setBudgetFilter(e.target.value)}
              >
                <option value="All">All Price Ranges</option>
                <option value="Under $1500">Under $1,500</option>
                <option value="$1500-$2000">$1,500 - $2,000</option>
                <option value="$2000+">$2,000+</option>
              </select>
            </div>

            <div className="sl-filter-group">
              <label>Delivery Timeline</label>
              <select
                className="sl-select"
                value={deliveryFilter}
                onChange={(e) => setDeliveryFilter(e.target.value)}
              >
                <option value="All">Any Timeline</option>
                <option value="<2 weeks">&lt; 2 weeks (Fast Track)</option>
                <option value="2-3 weeks">2 - 3 weeks</option>
                <option value="3+ weeks">3+ weeks</option>
              </select>
            </div>

            <div className="sl-filter-group">
              <label>Availability</label>
              <select
                className="sl-select"
                value={availFilter}
                onChange={(e) => setAvailFilter(e.target.value)}
              >
                <option value="All">All Freelancers</option>
                <option value="Available">Available Now</option>
                <option value="Busy">Busy / In Contract</option>
              </select>
            </div>

            <div className="sl-filter-group">
              <label>Completed Projects</label>
              <select
                className="sl-select"
                value={projectsFilter}
                onChange={(e) => setProjectsFilter(e.target.value)}
              >
                <option value="All">Any Project Count</option>
                <option value="50+ Projects">50+ Completed Projects</option>
                <option value="100+ Projects">100+ Completed Projects</option>
              </select>
            </div>
          </div>

          <div className="sl-filter-box">
            <h3>📊 Active Job Matching Matrix</h3>
            <div className="sl-target-job-summary">
              <strong>{activeJob.title}</strong>
              <div style={{ margin: "0.4rem 0" }}>
                {activeJob.skills.map((s) => (
                  <span key={s} className="sl-chip match">
                    {s}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: "0.78rem", color: "#64748B", marginTop: 6 }}>
                <div>💰 Target: {activeJob.budget}</div>
                <div>📅 Deadline: {activeJob.deadline}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Freelancers Grid */}
        <div className="sl-freelancers-main">
          <div className="sl-search-bar">
            <span>🔍</span>
            <input
              className="sl-search-input"
              placeholder="Search talent pool by name, professional title, skill keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="sl-search-clear" onClick={() => setSearch("")}>
                ✕
              </button>
            )}
          </div>

          <div className="sl-sort-bar">
            <div className="sl-results-count">
              <strong>{filtered.length}</strong> top-matched freelancers available{" "}
              {compareList.length > 0 && `· (${compareList.length} in comparison queue)`}
            </div>

            <div className="sl-sort-controls">
              <span>Sort by:</span>
              <select
                className="sl-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="match">🎯 Highest Job Match Score</option>
                <option value="rating">⭐ Highest Client Rating</option>
                <option value="price_low">💰 Price: Low to High</option>
                <option value="price_high">💰 Price: High to Low</option>
                <option value="projects">🏆 Most Completed Projects</option>
              </select>
            </div>
          </div>

          <div className="sl-fl-grid">
            {filtered.map((fl) => (
              <FreelancerCard
                key={fl.id}
                fl={fl}
                jobSkills={activeJob.skills}
                compareList={compareList}
                toggleCompare={toggleCompare}
                isShortlisted={shortlistedIds.includes(fl.id)}
                toggleShortlist={toggleShortlist}
                onRequest={onRequest}
                onChat={onChat}
                onViewProfile={onViewProfile}
                onViewPortfolio={onViewPortfolio}
              />
            ))}

            {filtered.length === 0 && (
              <div className="sl-empty-grid">
                <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🔍</div>
                <h3>No candidates matched your filter criteria</h3>
                <p>Try resetting some filters or searching for general skill terms.</p>
                <button
                  className="sl-btn-primary"
                  style={{ marginTop: "1rem" }}
                  onClick={clearAllFilters}
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CompareTab({ compareList, freelancers, activeJob, onRequest, toggleCompare }) {
  const selected = freelancers.filter((f) => compareList.includes(f.id));

  if (selected.length < 2) {
    return (
      <div className="sl-fade">
        <div className="sl-page-hdr">
          <h1 className="sl-page-title">Compare Freelancers Side-by-Side</h1>
        </div>
        <div className="sl-empty-grid">
          <div style={{ fontSize: "3.5rem" }}>⚖️</div>
          <h3>Select at least 2 candidates to compare</h3>
          <p>
            Check the &quot;Compare&quot; checkbox on any freelancer card to add them to this
            comparative evaluation matrix.
          </p>
        </div>
      </div>
    );
  }

  const METRICS = [
    {
      key: "skills",
      label: "Skills Match",
      render: (fl) => {
        const m = fl.skills.filter((s) => activeJob.skills.includes(s));
        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {m.map((s) => (
              <span key={s} className="sl-chip match" style={{ fontSize: "0.72rem" }}>
                ✓ {s}
              </span>
            ))}
            {m.length === 0 && <span style={{ color: "#64748B" }}>No direct match</span>}
          </div>
        );
      }
    },
    {
      key: "experience",
      label: "Experience",
      render: (fl) => <strong>{fl.experience}</strong>,
      winner: (arr) => arr.reduce((b, f) => (parseInt(f.experience) > parseInt(b.experience) ? f : b), arr[0]).id
    },
    {
      key: "rating",
      label: "⭐ Rating",
      render: (fl) => (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Stars rating={fl.rating} />
          <strong style={{ color: "#F59E0B" }}>{fl.rating}</strong>
        </div>
      ),
      winner: (arr) => arr.reduce((b, f) => (f.rating > b.rating ? f : b), arr[0]).id
    },
    {
      key: "completedProjects",
      label: "Completed Projects",
      render: (fl) => <strong>{fl.completedProjects} projects</strong>,
      winner: (arr) => arr.reduce((b, f) => (f.completedProjects > b.completedProjects ? f : b), arr[0]).id
    },
    {
      key: "price",
      label: "Price / Proposed Amount",
      render: (fl) => (
        <strong style={{ color: "#34D399", fontSize: "1.05rem" }}>
          {fl.expectedPrice || fl.bid}
        </strong>
      ),
      winner: (arr) =>
        arr.reduce((b, f) => {
          const aP = f.priceAmount || parseInt(String(f.expectedPrice || f.bid).replace(/\D/g, "")) || 9999;
          const bP = b.priceAmount || parseInt(String(b.expectedPrice || b.bid).replace(/\D/g, "")) || 9999;
          return aP < bP ? f : b;
        }, arr[0]).id
    },
    {
      key: "deliveryTime",
      label: "Delivery Time",
      render: (fl) => <strong>{fl.estimatedTimeline || fl.timeline}</strong>,
      winner: (arr) =>
        arr.reduce((b, f) => {
          const aD = f.deliveryDays || 30;
          const bD = b.deliveryDays || 30;
          return aD < bD ? f : b;
        }, arr[0]).id
    },
    {
      key: "reviews",
      label: "Client Reviews",
      render: (fl) => (
        <span style={{ fontSize: "0.8rem", color: "#CBD5E1" }}>
          {fl.reviews?.[0]?.comment || `${fl.reviewsCount || 60}+ 5-star testimonials`}
        </span>
      )
    },
    {
      key: "availability",
      label: "Availability",
      render: (fl) => (
        <span style={{ color: fl.available ? "#34D399" : "#F59E0B", fontWeight: 700 }}>
          {fl.available ? "✓ Available Now" : "Busy"}
        </span>
      )
    }
  ];

  return (
    <div className="sl-fade">
      <div className="sl-page-hdr">
        <div>
          <h1 className="sl-page-title">Candidate Comparison Matrix</h1>
          <p className="sl-subtitle">
            Side-by-side analysis of {selected.length} shortlisted candidates for{" "}
            <strong>{activeJob.title}</strong>
          </p>
        </div>
      </div>

      <div className="sl-compare-table-wrap">
        <table className="sl-compare-table">
          <thead>
            <tr>
              <th className="metric-col">Feature / Metric</th>
              {selected.map((fl) => (
                <th key={fl.id}>
                  <div className="sl-compare-fl-hdr">
                    <button
                      className="sl-remove-compare-btn"
                      onClick={() => toggleCompare(fl.id)}
                      title="Remove from comparison"
                    >
                      ✕
                    </button>
                    <div className="sl-compare-av" style={{ background: fl.avatarGrad }}>
                      {fl.avatar}
                    </div>
                    <div className="sl-compare-name">{fl.name}</div>
                    <div className="sl-compare-title">{fl.title}</div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {METRICS.map((metric) => {
              const winnerId = metric.winner ? metric.winner(selected) : null;
              return (
                <tr key={metric.key}>
                  <td className="metric-col">{metric.label}</td>
                  {selected.map((fl) => (
                    <td key={fl.id} className={winnerId === fl.id ? "winner-cell" : ""}>
                      {metric.render(fl)}
                      {winnerId === fl.id && (
                        <div style={{ marginTop: 4 }}>
                          <span className="sl-winner-badge">🏆 Top Candidate</span>
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
            <tr>
              <td className="metric-col">Action</td>
              {selected.map((fl) => (
                <td key={fl.id}>
                  <button
                    className="sl-compare-action-btn"
                    onClick={() => onRequest(fl)}
                  >
                    Request This Freelancer →
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ShortlistTab({ shortlistedIds, freelancers, onRequest, toggleShortlist }) {
  const list = freelancers.filter((f) => shortlistedIds.includes(f.id));

  if (list.length === 0) {
    return (
      <div className="sl-fade">
        <div className="sl-page-hdr">
          <h1 className="sl-page-title">Shortlisted Candidates</h1>
        </div>
        <div className="sl-empty-grid">
          <div style={{ fontSize: "3.5rem" }}>⭐</div>
          <h3>No shortlisted candidates yet</h3>
          <p>Click the &quot;Shortlist&quot; star on any candidate card to save them here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sl-fade">
      <div className="sl-page-hdr">
        <div>
          <h1 className="sl-page-title">Shortlisted Candidates ({list.length})</h1>
          <p className="sl-subtitle">Your saved top talent ready for outreach</p>
        </div>
      </div>

      <div className="sl-fl-grid">
        {list.map((fl) => (
          <div key={fl.id} className="sl-fl-card">
            <div className="sl-fl-card-top">
              <div className="sl-fl-av" style={{ background: fl.avatarGrad }}>
                {fl.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <div className="sl-fl-name">{fl.name}</div>
                <div className="sl-fl-title">{fl.title}</div>
                <Stars rating={fl.rating} />
              </div>
            </div>
            <div className="sl-fl-price-row">
              <div>
                <span className="sl-rate-label">Expected Price</span>
                <div className="sl-fl-price">{fl.expectedPrice || fl.bid}</div>
              </div>
              <div>
                <span className="sl-rate-label">Timeline</span>
                <div className="sl-fl-timeline">⏱ {fl.estimatedTimeline || fl.timeline}</div>
              </div>
            </div>
            <div className="sl-fl-actions">
              <button
                className="sl-btn-ghost"
                onClick={() => toggleShortlist(fl.id)}
              >
                Remove
              </button>
              <button
                className="sl-btn-primary"
                onClick={() => onRequest(fl)}
              >
                Request This Freelancer →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkRequestsTab({ workRequests }) {
  return (
    <div className="sl-fade">
      <div className="sl-page-hdr">
        <div>
          <h1 className="sl-page-title">Direct Work Requests Sent</h1>
          <p className="sl-subtitle">
            Track direct contracts and job inquiries sent to freelancers
          </p>
        </div>
      </div>

      <div className="sl-req-list">
        {workRequests.map((req) => (
          <div key={req.id} className="sl-req-card">
            <div className="sl-req-top">
              <div>
                <h3>Work Request for {req.freelancerName}</h3>
                <div className="sl-req-job">📌 Project: {req.jobTitle}</div>
              </div>
              <span className="sl-req-status-pill">● {req.status}</span>
            </div>

            <div className="sl-req-meta">
              <span>💰 Proposed Budget: <strong>{req.budget}</strong></span>
              <span>⏱ Timeline: <strong>{req.timeline}</strong></span>
              <span>📅 Target Start: <strong>{req.startDate}</strong></span>
              <span>🕒 Sent: {req.sentDate}</span>
            </div>

            {req.message && (
              <p className="sl-req-msg">&quot;{req.message}&quot;</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileModal({ freelancer, onClose, onRequest }) {
  return (
    <div className="sl-overlay" onClick={onClose}>
      <div className="sl-modal wide" onClick={(e) => e.stopPropagation()}>
        <div className="sl-modal-hdr">
          <h2>Candidate Full Profile</h2>
          <button className="sl-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="sl-modal-profile-hdr">
          <div className="sl-fl-av lg" style={{ background: freelancer.avatarGrad }}>
            {freelancer.avatar}
          </div>
          <div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff" }}>
              {freelancer.name}
            </h2>
            <div style={{ color: "#F59E0B", fontWeight: 600, fontSize: "0.95rem" }}>
              {freelancer.title}
            </div>
            <div style={{ fontSize: "0.8rem", color: "#94A3B8", marginTop: 4 }}>
              📍 {freelancer.location} · 📂 {freelancer.category} · 💼 {freelancer.experience} experience
            </div>
            <div style={{ marginTop: 6 }}>
              <Stars rating={freelancer.rating} />
            </div>
          </div>
        </div>

        <div className="sl-modal-metrics-grid">
          <div>
            <span>Completed Projects</span>
            <strong>{freelancer.completedProjects}</strong>
          </div>
          <div>
            <span>Success Rate</span>
            <strong>{freelancer.successRate}%</strong>
          </div>
          <div>
            <span>Expected Bid</span>
            <strong>{freelancer.expectedPrice || freelancer.bid}</strong>
          </div>
          <div>
            <span>Estimated Delivery</span>
            <strong>{freelancer.estimatedTimeline || freelancer.timeline}</strong>
          </div>
        </div>

        <div className="sl-modal-sec">
          <h4>Professional Bio & Overview</h4>
          <p>{freelancer.bio}</p>
        </div>

        <div className="sl-modal-sec">
          <h4>Technical Skills & Frameworks</h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {freelancer.skills.map((s) => (
              <span key={s} className="sl-chip match">
                ✓ {s}
              </span>
            ))}
          </div>
        </div>

        {freelancer.reviews && freelancer.reviews.length > 0 && (
          <div className="sl-modal-sec">
            <h4>Client Feedback & Testimonials</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {freelancer.reviews.map((r, i) => (
                <div key={i} className="sl-modal-review-card">
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <strong>{r.client}</strong>
                    <Stars rating={r.rating} />
                  </div>
                  <p style={{ fontSize: "0.82rem", color: "#CBD5E1", margin: 0 }}>
                    &quot;{r.comment}&quot;
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="sl-modal-actions" style={{ marginTop: "1.5rem" }}>
          <button className="sl-btn-outline" onClick={onClose}>
            Close
          </button>
          <button
            className="sl-btn-primary"
            onClick={() => {
              onClose();
              onRequest(freelancer);
            }}
          >
            Send Work Request →
          </button>
        </div>
      </div>
    </div>
  );
}

function PortfolioModal({ freelancer, onClose }) {
  const items = freelancer.portfolio || [
    { title: "Enterprise Web App Engine", tech: "React · Node · AWS", metric: "99.99% uptime" },
    { title: "Real-time Telemetry Dashboard", tech: "TypeScript · D3", metric: "50k daily users" }
  ];

  return (
    <div className="sl-overlay" onClick={onClose}>
      <div className="sl-modal wide" onClick={(e) => e.stopPropagation()}>
        <div className="sl-modal-hdr">
          <h2>Portfolio Showcase: {freelancer.name}</h2>
          <button className="sl-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="sl-port-showcase-grid">
          {items.map((p, i) => (
            <div key={i} className="sl-port-showcase-card">
              <div className="sl-port-showcase-top">
                <h4>{p.title}</h4>
                <span className="sl-port-metric-pill">{p.metric}</span>
              </div>
              <div className="sl-port-tech-pill">Tech: {p.tech}</div>
              <p style={{ fontSize: "0.82rem", color: "#94A3B8", marginTop: "0.5rem" }}>
                Production-grade architecture with automated CI/CD and localized responsive UI.
              </p>
            </div>
          ))}
        </div>

        <div className="sl-modal-actions" style={{ marginTop: "1.5rem" }}>
          <button className="sl-btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function RequestModal({ freelancer, activeJob, onClose, onSendRequest }) {
  const [startDate, setStartDate] = useState("2026-10-25");
  const [customMsg, setCustomMsg] = useState(
    `Hi ${freelancer.name.split(" ")[0]}, we would like to formally request your services for our project "${activeJob.title}". We are offering ${freelancer.expectedPrice || freelancer.bid}.`
  );
  const [done, setDone] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSendRequest({
      freelancerId: freelancer.id,
      jobId: activeJob.id,
      startDate,
      message: customMsg,
      budget: freelancer.expectedPrice || freelancer.bid,
      timeline: freelancer.estimatedTimeline || freelancer.timeline
    });
    setDone(true);
    toast.success(`Work request sent to ${freelancer.name}!`);
  };

  if (done) {
    return (
      <div className="sl-overlay" onClick={onClose}>
        <div className="sl-modal" onClick={(e) => e.stopPropagation()}>
          <div className="sl-success-box">
            <div className="sl-success-icon">🚀</div>
            <h2>Work Request Dispatched!</h2>
            <p>
              Your formal inquiry has been dispatched to{" "}
              <strong style={{ color: "#F59E0B" }}>{freelancer.name}</strong>. They will
              receive a notification in their Freelancer Portal and respond within 24 hours.
            </p>
            <div className="sl-success-details">
              <div>
                <span>Candidate:</span>
                <strong>{freelancer.name}</strong>
              </div>
              <div>
                <span>Project:</span>
                <strong>{activeJob.title}</strong>
              </div>
              <div>
                <span>Rate:</span>
                <strong>{freelancer.expectedPrice || freelancer.bid}</strong>
              </div>
            </div>
            <button className="sl-btn-primary" style={{ width: "100%" }} onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sl-overlay" onClick={onClose}>
      <div className="sl-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sl-modal-hdr">
          <h2>Send Direct Work Request</h2>
          <button className="sl-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="sl-req-candidate-banner">
          <div className="sl-fl-av" style={{ background: freelancer.avatarGrad }}>
            {freelancer.avatar}
          </div>
          <div>
            <div style={{ fontWeight: 800, color: "#fff", fontSize: "1.05rem" }}>
              {freelancer.name}
            </div>
            <div style={{ color: "#F59E0B", fontSize: "0.82rem" }}>{freelancer.title}</div>
            <div style={{ display: "flex", gap: "1rem", fontSize: "0.78rem", color: "#94A3B8", marginTop: 2 }}>
              <span>💰 {freelancer.expectedPrice || freelancer.bid}</span>
              <span>⏱ {freelancer.estimatedTimeline || freelancer.timeline}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="sl-prop-form">
          <div className="sl-form-group">
            <label className="sl-form-label">Project Scope</label>
            <div className="sl-input disabled">{activeJob.title}</div>
          </div>

          <div className="sl-form-group">
            <label className="sl-form-label">Target Kickoff Date *</label>
            <input
              type="date"
              required
              className="sl-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="sl-form-group">
            <label className="sl-form-label">Contract Invitation Message *</label>
            <textarea
              required
              rows={4}
              className="sl-textarea"
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
            />
          </div>

          <div className="sl-modal-actions">
            <button type="button" className="sl-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="sl-btn-primary">
              🚀 Send Work Request Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ChatModal({ freelancer, onClose }) {
  const [msg, setMsg] = useState("");
  const [msgs, setMsgs] = useState([
    { from: "them", text: `Hi! Thank you for considering my profile. I have extensive experience with your project requirements.` }
  ]);

  const send = () => {
    if (!msg.trim()) return;
    setMsgs((m) => [...m, { from: "me", text: msg }]);
    setMsg("");
    setTimeout(() => {
      setMsgs((m) => [
        ...m,
        { from: "them", text: "Got it! I am ready to review the spec and provide milestone breakdowns." }
      ]);
    }, 1000);
  };

  return (
    <div className="sl-overlay" onClick={onClose}>
      <div className="sl-modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <div className="sl-modal-hdr">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div className="sl-fl-av sm" style={{ background: freelancer.avatarGrad }}>
              {freelancer.avatar}
            </div>
            <div>
              <div style={{ fontWeight: 800, color: "#fff" }}>{freelancer.name}</div>
              <div style={{ fontSize: "0.72rem", color: "#34D399" }}>● Online Now</div>
            </div>
          </div>
          <button className="sl-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="sl-chat-bubbles-pane">
          {msgs.map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: m.from === "me" ? "flex-end" : "flex-start"
              }}
            >
              <div className={`sl-chat-bubble ${m.from}`}>{m.text}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            className="sl-input"
            style={{ flex: 1 }}
            placeholder="Type your message..."
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button className="sl-btn-primary" onClick={send}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SelectionDashboard() {
  const [tab, setTab] = useState("browse");
  const [compareList, setCompareList] = useState([]);
  const [requestTarget, setRequestTarget] = useState(null);
  const [chatTarget, setChatTarget] = useState(null);
  const [profileModalTarget, setProfileModalTarget] = useState(null);
  const [portfolioModalTarget, setPortfolioModalTarget] = useState(null);

  const {
    jobs,
    freelancers,
    workRequests,
    shortlistedFreelancerIds,
    activeJobIdForMatching,
    setActiveJobForMatching,
    sendWorkRequest,
    toggleShortlistFreelancer
  } = useMarketplaceStore();

  const activeJob =
    jobs.find((j) => j.id === activeJobIdForMatching) || jobs[0] || {
      id: 1,
      title: "Build a Full-Stack E-commerce Platform",
      budget: "$1,800 - $3,000",
      deadline: "2026-11-15",
      skills: ["React", "Node.js", "MongoDB"]
    };

  const toggleCompare = (id) => {
    setCompareList((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 4
        ? [...prev, id]
        : prev
    );
  };

  const renderTab = () => {
    switch (tab) {
      case "browse":
        return (
          <BrowseTab
            freelancers={freelancers}
            activeJob={activeJob}
            compareList={compareList}
            toggleCompare={toggleCompare}
            shortlistedIds={shortlistedFreelancerIds}
            toggleShortlist={toggleShortlistFreelancer}
            onRequest={(fl) => setRequestTarget(fl)}
            onChat={(fl) => setChatTarget(fl)}
            onViewProfile={(fl) => setProfileModalTarget(fl)}
            onViewPortfolio={(fl) => setPortfolioModalTarget(fl)}
          />
        );
      case "compare":
        return (
          <CompareTab
            compareList={compareList}
            freelancers={freelancers}
            activeJob={activeJob}
            onRequest={(fl) => setRequestTarget(fl)}
            toggleCompare={toggleCompare}
          />
        );
      case "shortlist":
        return (
          <ShortlistTab
            shortlistedIds={shortlistedFreelancerIds}
            freelancers={freelancers}
            onRequest={(fl) => setRequestTarget(fl)}
            toggleShortlist={toggleShortlistFreelancer}
          />
        );
      case "requested":
        return <WorkRequestsTab workRequests={workRequests} />;
      case "messages":
        return (
          <div className="sl-fade">
            <div className="sl-page-hdr">
              <h1 className="sl-page-title">Direct Recruiter Messages</h1>
            </div>
            <div className="sl-empty-grid">
              <div style={{ fontSize: "3.5rem" }}>💬</div>
              <h3>Active Direct Candidate Conversations</h3>
              <p>Click &quot;Chat&quot; on any freelancer card to initiate a direct channel.</p>
            </div>
          </div>
        );
      default:
        return (
          <BrowseTab
            freelancers={freelancers}
            activeJob={activeJob}
            compareList={compareList}
            toggleCompare={toggleCompare}
            shortlistedIds={shortlistedFreelancerIds}
            toggleShortlist={toggleShortlistFreelancer}
            onRequest={(fl) => setRequestTarget(fl)}
            onChat={(fl) => setChatTarget(fl)}
            onViewProfile={(fl) => setProfileModalTarget(fl)}
            onViewPortfolio={(fl) => setPortfolioModalTarget(fl)}
          />
        );
    }
  };

  return (
    <div className="sl-dashboard-wrapper">
      {/* Universal Top Dashboard Switcher */}
      <DashboardSwitcher currentDashboard="selection" />

      <div className="sl-dashboard">
        <Sidebar
          active={tab}
          setActive={setTab}
          compareList={compareList}
          activeJob={activeJob}
          jobs={jobs}
          onSelectJob={setActiveJobForMatching}
          shortlistedCount={shortlistedFreelancerIds.length}
          requestsCount={workRequests.length}
        />

        <main className="sl-main">
          <div className="sl-topbar">
            <div className="sl-topbar-left">
              <span className="sl-topbar-badge">RECRUITER / SELECTION PORTAL</span>
              <span className="sl-topbar-title">
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </span>
            </div>
            <div className="sl-topbar-right">
              <div className="sl-topbar-active-job">
                Target: <strong>{activeJob.title}</strong>
              </div>
              <button className="sl-topbar-btn">🔔</button>
            </div>
          </div>

          <div className="sl-content">{renderTab()}</div>
        </main>

        {requestTarget && (
          <RequestModal
            freelancer={requestTarget}
            activeJob={activeJob}
            onClose={() => setRequestTarget(null)}
            onSendRequest={sendWorkRequest}
          />
        )}

        {chatTarget && (
          <ChatModal
            freelancer={chatTarget}
            onClose={() => setChatTarget(null)}
          />
        )}

        {profileModalTarget && (
          <ProfileModal
            freelancer={profileModalTarget}
            onClose={() => setProfileModalTarget(null)}
            onRequest={(fl) => setRequestTarget(fl)}
          />
        )}

        {portfolioModalTarget && (
          <PortfolioModal
            freelancer={portfolioModalTarget}
            onClose={() => setPortfolioModalTarget(null)}
          />
        )}
      </div>
    </div>
  );
}
