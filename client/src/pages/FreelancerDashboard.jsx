import { useState } from "react";
import DashboardSwitcher from "../components/common/DashboardSwitcher";
import { useMarketplaceStore } from "../utils/marketplaceStore";
import toast from "react-hot-toast";
import "./FreelancerDashboard.css";

const CATEGORIES = [
  "All",
  "Web Development",
  "Mobile Development",
  "UI/UX Design",
  "Graphic Design",
  "Content Writing",
  "Digital Marketing",
  "Data Science",
  "DevOps"
];

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
  "Razorpay",
  "Firebase",
  "TensorFlow"
];

const STATUS_CLR = {
  Applied: "#3B82F6",
  "Under Review": "#F59E0B",
  Shortlisted: "#8B5CF6",
  Accepted: "#10B981",
  Rejected: "#EF4444"
};

const EARNINGS_MONTHS = [
  { month: "Jul", amount: 240000 },
  { month: "Aug", amount: 310000 },
  { month: "Sep", amount: 420000 },
  { month: "Oct", amount: 285000 }
];

function Stars({ rating }) {
  const num = typeof rating === "number" ? rating : parseFloat(rating) || 5;
  return (
    <span className="fl-stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{
            color: i <= Math.floor(num) ? "#F59E0B" : "#334155",
            fontSize: "0.85rem"
          }}
        >
          {i <= Math.floor(num) ? "★" : "☆"}
        </span>
      ))}
      <span style={{ fontSize: "0.78rem", color: "#64748B", marginLeft: 4 }}>
        {num.toFixed(1)}
      </span>
    </span>
  );
}

function Sidebar({ active, setActive, unread, activeProjectsCount, applicationsCount }) {
  const nav = [
    { key: "overview", icon: "⊞", label: "Overview" },
    { key: "browse", icon: "🔍", label: "Browse Jobs" },
    { key: "applications", icon: "📋", label: "My Applications", badge: applicationsCount },
    { key: "active", icon: "⚡", label: "Active Projects", badge: activeProjectsCount },
    { key: "completed", icon: "✅", label: "Completed Projects" },
    { key: "earnings", icon: "💰", label: "Earnings" },
    { key: "messages", icon: "💬", label: "Messages" },
    { key: "notifications", icon: "🔔", label: "Notifications", badge: unread },
    { key: "profile", icon: "👤", label: "Freelancer Profile" }
  ];

  return (
    <aside className="fl-sidebar">
      <div className="fl-sidebar-brand">
        <div className="fl-brand-icon">⚡</div>
        <div>
          <div className="fl-brand-name">FreelanceHub</div>
          <div className="fl-brand-role">Freelancer Portal</div>
        </div>
      </div>

      <div className="fl-sidebar-profile">
        <div className="fl-sidebar-avatar">AJ</div>
        <div>
          <div className="fl-sidebar-name">Alex Johnson</div>
          <div className="fl-avail-badge available">● Available for Work</div>
        </div>
      </div>

      <nav className="fl-nav">
        {nav.map((item) => (
          <button
            key={item.key}
            className={`fl-nav-item ${active === item.key ? "active" : ""}`}
            onClick={() => setActive(item.key)}
          >
            <span className="fl-nav-icon">{item.icon}</span>
            <span className="fl-nav-label">{item.label}</span>
            {item.badge > 0 && <span className="fl-nav-badge">{item.badge}</span>}
          </button>
        ))}
      </nav>

      <div className="fl-sidebar-footer">
        <div className="fl-quick-stat">
          <span>Success Rate</span>
          <strong>99%</strong>
        </div>
        <div className="fl-quick-stat">
          <span>Jobs Won</span>
          <strong>143</strong>
        </div>
      </div>
    </aside>
  );
}

function OverviewTab({ setActiveTab, jobs, applications, activeProjects, completedProjects }) {
  const maxE = Math.max(...EARNINGS_MONTHS.map((e) => e.amount));
  const shortlistedCount = applications.filter((a) => a.status === "Shortlisted").length;
  const acceptedCount = applications.filter((a) => a.status === "Accepted").length;

  return (
    <div className="fl-tab-content fade-in">
      <div className="fl-page-header">
        <div>
          <h1 className="fl-page-title">Welcome back, Alex! 👋</h1>
          <p className="fl-subtitle">
            Find projects, submit competitive proposals, and track your client milestones
          </p>
        </div>
        <button className="fl-btn-primary" onClick={() => setActiveTab("browse")}>
          Browse Available Jobs ({jobs.length}) →
        </button>
      </div>

      {/* Main Flow Banner */}
      <div className="fl-flow-banner">
        <div className="fl-flow-title">Your Freelancing Workflow:</div>
        <div className="fl-flow-steps">
          <span className="fl-flow-step active">1. Find Job</span>
          <span className="fl-flow-arrow">➔</span>
          <span className="fl-flow-step active">2. View Details</span>
          <span className="fl-flow-arrow">➔</span>
          <span className="fl-flow-step active">3. Submit Proposal</span>
          <span className="fl-flow-arrow">➔</span>
          <span className="fl-flow-step">4. Client Reviews</span>
          <span className="fl-flow-arrow">➔</span>
          <span className="fl-flow-step">5. Get Hired & Work</span>
        </div>
      </div>

      <div className="fl-stats-grid">
        <div className="fl-stat-card">
          <div className="fl-stat-icon">💰</div>
          <div className="fl-stat-info">
            <div className="fl-stat-value">₹34,80,000</div>
            <div className="fl-stat-label">Total Earnings</div>
            <div className="fl-stat-change pos">+14% this month</div>
          </div>
        </div>
        <div className="fl-stat-card">
          <div className="fl-stat-icon">⚡</div>
          <div className="fl-stat-info">
            <div className="fl-stat-value">{activeProjects.length}</div>
            <div className="fl-stat-label">Active Projects</div>
            <div className="fl-stat-change pos">In progress</div>
          </div>
        </div>
        <div className="fl-stat-card">
          <div className="fl-stat-icon">📋</div>
          <div className="fl-stat-info">
            <div className="fl-stat-value">{applications.length}</div>
            <div className="fl-stat-label">Applications Submitted</div>
            <div className="fl-stat-change pos">{shortlistedCount} shortlisted · {acceptedCount} accepted</div>
          </div>
        </div>
        <div className="fl-stat-card">
          <div className="fl-stat-icon">⭐</div>
          <div className="fl-stat-info">
            <div className="fl-stat-value">4.95 ★</div>
            <div className="fl-stat-label">Client Rating</div>
            <div className="fl-stat-change pos">87 5-star reviews</div>
          </div>
        </div>
      </div>

      <div className="fl-overview-grid">
        <div className="fl-card">
          <div className="fl-card-header">
            <h3>Earnings Overview (INR)</h3>
            <span className="fl-badge-muted">Last 4 months</span>
          </div>
          <div className="fl-chart">
            {EARNINGS_MONTHS.map((e, i) => (
              <div key={i} className="fl-chart-col">
                <div
                  className="fl-chart-bar"
                  style={{ height: `${(e.amount / maxE) * 120}px` }}
                >
                  <span className="fl-chart-tip">₹{(e.amount / 1000).toFixed(0)}k</span>
                </div>
                <span className="fl-chart-lbl">{e.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="fl-card">
          <div className="fl-card-header">
            <h3>Active Projects</h3>
            <button className="fl-btn-sm" onClick={() => setActiveTab("active")}>
              View All
            </button>
          </div>
          {activeProjects.map((p) => (
            <div key={p.id} className="fl-active-item">
              <div className="fl-active-row">
                <span className="fl-active-title">{p.title}</span>
                <span className="fl-active-amount">{p.budget}</span>
              </div>
              <div className="fl-active-sub">
                👤 {p.client} · Due in {p.daysLeft || 14} days
              </div>
              <div className="fl-prog-wrap">
                <div className="fl-prog-bar">
                  <div className="fl-prog-fill" style={{ width: `${p.progress}%` }}></div>
                </div>
                <span>{p.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Applications Feed */}
      <div className="fl-card">
        <div className="fl-card-header">
          <h3>Recent Applications & Status</h3>
          <button className="fl-btn-sm" onClick={() => setActiveTab("applications")}>
            Manage Applications ({applications.length})
          </button>
        </div>
        <div className="fl-app-table-wrap">
          {applications.slice(0, 4).map((a) => (
            <div key={a.id} className="fl-app-row">
              <div className="fl-app-title-cell">
                <strong>{a.jobTitle}</strong>
                <span className="fl-app-sub">Applied {a.appliedDate}</span>
              </div>
              <div className="fl-app-client-cell">👤 {a.clientName}</div>
              <div className="fl-app-bid-cell">{a.expectedPrice}</div>
              <div className="fl-app-time-cell">⏱ {a.estimatedTimeline}</div>
              <div
                className="fl-status-pill"
                style={{
                  background: `${STATUS_CLR[a.status] || "#3B82F6"}18`,
                  color: STATUS_CLR[a.status] || "#3B82F6",
                  border: `1px solid ${STATUS_CLR[a.status] || "#3B82F6"}40`
                }}
              >
                {a.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BrowseJobsTab({ jobs, applications, setSelectedJob, setShowProposal }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [budgetFilter, setBudgetFilter] = useState("All");
  const [selectedSkills, setSelectedSkills] = useState([]);

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const appliedJobIds = applications.map((a) => a.jobId);

  const filteredJobs = jobs.filter((j) => {
    const matchSearch =
      !search ||
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.description.toLowerCase().includes(search.toLowerCase()) ||
      j.client.toLowerCase().includes(search.toLowerCase()) ||
      (j.skills && j.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())));

    const matchCategory = category === "All" || j.category === category;
    const matchLocation =
      locationFilter === "All" ||
      (locationFilter === "Remote" && j.location.toLowerCase().includes("remote")) ||
      j.location === locationFilter;

    const matchSkills =
      selectedSkills.length === 0 ||
      (j.skills && selectedSkills.some((s) => j.skills.includes(s)));

    const budgetAmount = j.budgetAmount || parseInt((j.budget || "").replace(/\D/g, "")) || 100000;
    const matchBudget =
      budgetFilter === "All" ||
      (budgetFilter === "Under ₹50,000" && budgetAmount < 50000) ||
      (budgetFilter === "₹50,000 - ₹1,50,000" && budgetAmount >= 50000 && budgetAmount <= 150000) ||
      (budgetFilter === "₹1,50,000+" && budgetAmount > 150000);

    return matchSearch && matchCategory && matchLocation && matchSkills && matchBudget;
  });

  return (
    <div className="fl-tab-content fade-in">
      <div className="fl-page-header">
        <div>
          <h1 className="fl-page-title">Browse Available Jobs</h1>
          <p className="fl-subtitle">
            Explore {filteredJobs.length} live freelance projects posted by verified clients
          </p>
        </div>
      </div>

      <div className="fl-browse-layout">
        {/* Left Filter Panel */}
        <aside className="fl-filter-panel">
          <div className="fl-filter-header">
            <h3 className="fl-filter-title">Filters</h3>
            {(category !== "All" ||
              locationFilter !== "All" ||
              budgetFilter !== "All" ||
              selectedSkills.length > 0) && (
              <button
                className="fl-clear-btn"
                onClick={() => {
                  setCategory("All");
                  setLocationFilter("All");
                  setBudgetFilter("All");
                  setSelectedSkills([]);
                }}
              >
                Clear
              </button>
            )}
          </div>

          <div className="fl-filter-group">
            <label>Category</label>
            <select
              className="fl-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="fl-filter-group">
            <label>Location</label>
            <select
              className="fl-select"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="All">All Locations</option>
              <option value="Remote">Remote Only</option>
              <option value="India">India</option>
              <option value="USA">United States</option>
              <option value="UK">United Kingdom</option>
            </select>
          </div>

          <div className="fl-filter-group">
            <label>Budget Range (₹ INR)</label>
            <select
              className="fl-select"
              value={budgetFilter}
              onChange={(e) => setBudgetFilter(e.target.value)}
            >
              <option value="All">Any Budget</option>
              <option value="Under ₹50,000">Under ₹50,000</option>
              <option value="₹50,000 - ₹1,50,000">₹50,000 - ₹1,50,000</option>
              <option value="₹1,50,000+">₹1,50,000+</option>
            </select>
          </div>

          <div className="fl-filter-group">
            <label>Skills ({selectedSkills.length} selected)</label>
            <div className="fl-skill-tags">
              {SKILLS_LIST.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`fl-skill-tag ${selectedSkills.includes(s) ? "active" : ""}`}
                  onClick={() => toggleSkill(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Jobs Listing */}
        <div className="fl-jobs-main">
          <div className="fl-search-bar">
            <span>🔍</span>
            <input
              className="fl-search-input"
              placeholder="Search jobs by title, skills, client, or problem description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="fl-search-clear" onClick={() => setSearch("")}>
                ✕
              </button>
            )}
          </div>

          <div className="fl-jobs-list">
            {filteredJobs.map((job) => {
              const isApplied = appliedJobIds.includes(job.id);
              const isNewlyPosted = job.postedDate === "Just now";

              return (
                <div key={job.id} className="fl-job-card">
                  <div className="fl-job-top">
                    <div className="fl-job-client-info">
                      <div className="fl-client-av">{job.clientAvatar || job.client[0]}</div>
                      <div>
                        <div className="fl-client-name">{job.client}</div>
                        <div className="fl-posted">
                          📅 {job.postedDate} · 📂 {job.category}
                        </div>
                      </div>
                    </div>
                    <div className="fl-job-badges">
                      {isNewlyPosted && <span className="fl-new-badge">✨ NEW</span>}
                      {job.urgent && <span className="fl-urgent">🔥 Urgent</span>}
                      <span className="fl-open">{job.status}</span>
                    </div>
                  </div>

                  <h3 className="fl-job-title">{job.title}</h3>
                  <p className="fl-job-desc">{job.description}</p>

                  <div className="fl-job-skills">
                    {job.skills &&
                      job.skills.map((s) => (
                        <span key={s} className="fl-chip">
                          {s}
                        </span>
                      ))}
                  </div>

                  <div className="fl-job-meta">
                    <span>💰 {job.budget} ({job.budgetType || "Fixed"})</span>
                    <span>📍 {job.location}</span>
                    <span>📅 Due {job.deadline}</span>
                    <span>👥 {job.proposals || 0} proposals</span>
                  </div>

                  <div className="fl-job-actions">
                    <button
                      className="fl-btn-outline"
                      onClick={() => setSelectedJob(job)}
                    >
                      View Details
                    </button>
                    {isApplied ? (
                      <button className="fl-btn-applied" disabled>
                        ✓ Applied
                      </button>
                    ) : (
                      <button
                        className="fl-btn-primary"
                        onClick={() => {
                          setSelectedJob(job);
                          setShowProposal(true);
                        }}
                      >
                        Apply Now →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredJobs.length === 0 && (
              <div className="fl-empty-box">
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
                <h3 style={{ color: "#E2E8F0" }}>No jobs match your filter</h3>
                <p style={{ color: "#64748B" }}>Try clearing some filters or searching with different keywords.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ApplicationsTab({ applications }) {
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedApp, setSelectedApp] = useState(null);

  const filteredApps =
    statusFilter === "All"
      ? applications
      : applications.filter((a) => a.status === statusFilter);

  return (
    <div className="fl-tab-content fade-in">
      <div className="fl-page-header">
        <div>
          <h1 className="fl-page-title">My Applications</h1>
          <p className="fl-subtitle">
            Track all submitted proposals and their review status in real time
          </p>
        </div>
      </div>

      {/* Status Bar */}
      <div className="fl-status-bar">
        {["All", "Applied", "Under Review", "Shortlisted", "Accepted", "Rejected"].map((s) => {
          const count =
            s === "All"
              ? applications.length
              : applications.filter((a) => a.status === s).length;
          const color = STATUS_CLR[s] || "#635BFF";

          return (
            <button
              key={s}
              className={`fl-status-pill-outline ${statusFilter === s ? "active" : ""}`}
              style={{
                borderColor: statusFilter === s ? color : "rgba(255,255,255,0.1)",
                color: statusFilter === s ? "#fff" : "#94A3B8"
              }}
              onClick={() => setStatusFilter(s)}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: color
                }}
              ></div>
              <span>{s}</span>
              <strong>{count}</strong>
            </button>
          );
        })}
      </div>

      <div className="fl-app-cards">
        {filteredApps.map((a) => {
          const color = STATUS_CLR[a.status] || "#3B82F6";
          return (
            <div key={a.id} className="fl-app-card">
              <div className="fl-app-card-l">
                <div
                  className="fl-app-av"
                  style={{ background: `${color}20`, color: color }}
                >
                  {a.jobTitle[0]}
                </div>
                <div>
                  <h3 className="fl-app-job">{a.jobTitle}</h3>
                  <div className="fl-app-meta">
                    <span>👤 Client: {a.clientName}</span>
                    <span>📅 Submitted: {a.appliedDate}</span>
                    <span>💰 Proposed Bid: <strong>{a.expectedPrice}</strong></span>
                    <span>⏱ Delivery: <strong>{a.estimatedTimeline}</strong></span>
                  </div>
                  {a.coverLetter && (
                    <p className="fl-app-cover-preview">
                      &quot;{a.coverLetter.slice(0, 140)}...&quot;
                    </p>
                  )}
                </div>
              </div>
              <div className="fl-app-card-r">
                <div
                  className="fl-status-badge-lg"
                  style={{
                    background: `${color}18`,
                    color: color,
                    border: `1.5px solid ${color}50`
                  }}
                >
                  ● {a.status}
                </div>
                <button
                  className="fl-btn-sm"
                  onClick={() => setSelectedApp(a)}
                >
                  View Proposal Details
                </button>
              </div>
            </div>
          );
        })}

        {filteredApps.length === 0 && (
          <div className="fl-empty-box">
            <div style={{ fontSize: "3rem" }}>📋</div>
            <h3 style={{ color: "#E2E8F0" }}>No applications found</h3>
            <p style={{ color: "#64748B" }}>
              {statusFilter === "All"
                ? "Browse available jobs to submit your first proposal."
                : `No applications with status "${statusFilter}".`}
            </p>
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {selectedApp && (
        <div className="fl-overlay" onClick={() => setSelectedApp(null)}>
          <div className="fl-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fl-modal-hdr">
              <h2>Proposal Details</h2>
              <button
                className="fl-modal-close"
                onClick={() => setSelectedApp(null)}
              >
                ✕
              </button>
            </div>
            <div className="fl-job-summary">
              <div className="fl-sum-title">{selectedApp.jobTitle}</div>
              <div className="fl-sum-meta">
                <span>👤 Client: {selectedApp.clientName}</span>
                <span>📅 Applied: {selectedApp.appliedDate}</span>
              </div>
            </div>
            <div className="fl-sub-details" style={{ margin: "1rem 0" }}>
              <div>
                <span>Bid Amount:</span>
                <strong>{selectedApp.expectedPrice}</strong>
              </div>
              <div>
                <span>Est. Completion:</span>
                <strong>{selectedApp.estimatedTimeline}</strong>
              </div>
              <div>
                <span>Status:</span>
                <strong style={{ color: STATUS_CLR[selectedApp.status] }}>
                  {selectedApp.status}
                </strong>
              </div>
            </div>
            <div style={{ marginTop: "1rem" }}>
              <h4 style={{ color: "#E2E8F0", marginBottom: "0.5rem" }}>
                Cover Letter
              </h4>
              <p
                style={{
                  background: "rgba(255,255,255,0.03)",
                  padding: "1rem",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  color: "#94A3B8",
                  lineHeight: 1.6
                }}
              >
                {selectedApp.coverLetter}
              </p>
            </div>
            <div className="fl-modal-actions" style={{ marginTop: "1.5rem" }}>
              <button
                className="fl-btn-primary"
                onClick={() => setSelectedApp(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActiveProjectsTab({ activeProjects }) {
  return (
    <div className="fl-tab-content fade-in">
      <div className="fl-page-header">
        <div>
          <h1 className="fl-page-title">Active Projects</h1>
          <p className="fl-subtitle">
            Current ongoing contracts with clients and milestone progress
          </p>
        </div>
      </div>

      <div className="fl-proj-grid">
        {activeProjects.map((p) => (
          <div key={p.id} className="fl-proj-card">
            <div className="fl-proj-top">
              <div className="fl-proj-icon">⚡</div>
              <div className="fl-proj-status-active">● In Progress</div>
            </div>
            <h3>{p.title}</h3>
            <div className="fl-proj-client">👤 Client: {p.client}</div>
            {p.milestone && (
              <div className="fl-proj-milestone">📍 {p.milestone}</div>
            )}
            <div className="fl-proj-meta-grid">
              <div>
                <span>Contract Value</span>
                <strong>{p.budget}</strong>
              </div>
              <div>
                <span>Deadline</span>
                <strong style={{ fontSize: "0.78rem" }}>{p.deadline}</strong>
              </div>
              <div>
                <span>Days Remaining</span>
                <strong style={{ color: "#F59E0B" }}>{p.daysLeft || 14} days</strong>
              </div>
            </div>
            <div className="fl-prog-section">
              <div className="fl-prog-hdr">
                <span>Milestone Completion</span>
                <span>{p.progress}%</span>
              </div>
              <div className="fl-prog-bar">
                <div
                  className="fl-prog-fill"
                  style={{ width: `${p.progress}%` }}
                ></div>
              </div>
            </div>
            <div className="fl-proj-actions">
              <button
                className="fl-btn-outline"
                onClick={() => toast.success(`Viewing workspace for ${p.title}`)}
              >
                Project Workspace
              </button>
              <button
                className="fl-btn-primary"
                onClick={() => toast.success(`Opened chat with ${p.client}`)}
              >
                Message Client
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompletedTab({ completedProjects }) {
  return (
    <div className="fl-tab-content fade-in">
      <div className="fl-page-header">
        <div>
          <h1 className="fl-page-title">Completed Projects</h1>
          <p className="fl-subtitle">
            Past successfully delivered projects and client reviews
          </p>
        </div>
      </div>

      <div className="fl-proj-grid">
        {completedProjects.map((p) => (
          <div key={p.id} className="fl-proj-card completed">
            <div className="fl-proj-top">
              <div className="fl-proj-icon">✅</div>
              <div className="fl-proj-status-done">Completed & Paid</div>
            </div>
            <h3>{p.title}</h3>
            <div className="fl-proj-client">👤 Client: {p.client}</div>
            <div className="fl-proj-done-meta">
              <span>💰 Earned: {p.amount}</span>
              <span>📅 {p.completedDate}</span>
              <Stars rating={p.rating} />
            </div>
            {p.review && (
              <p className="fl-proj-review">&quot;{p.review}&quot;</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function EarningsTab() {
  const maxE = Math.max(...EARNINGS_MONTHS.map((e) => e.amount));
  return (
    <div className="fl-tab-content fade-in">
      <div className="fl-page-header">
        <div>
          <h1 className="fl-page-title">Earnings & Invoicing (INR)</h1>
          <p className="fl-subtitle">
            Detailed breakdown of your gross revenue, monthly trends, and payouts in Rupees
          </p>
        </div>
        <button
          className="fl-btn-primary"
          onClick={() => toast.success("Payout request of ₹1,45,000 submitted to bank account!")}
        >
          Withdraw Funds (₹1,45,000) →
        </button>
      </div>

      <div className="fl-earn-cards">
        {[
          { l: "Total Earned", v: "₹34,80,000", i: "💰", s: "All time gross" },
          { l: "This Month", v: "₹2,85,000", i: "📅", s: "October 2026" },
          { l: "Available for Payout", v: "₹1,45,000", i: "⏳", s: "Ready to transfer" },
          { l: "Withdrawn to Bank", v: "₹30,50,000", i: "🏦", s: "Direct IMPS/NEFT" }
        ].map((c, i) => (
          <div key={i} className="fl-earn-card">
            <div className="fl-earn-icon">{c.i}</div>
            <div className="fl-earn-val">{c.v}</div>
            <div className="fl-earn-lbl">{c.l}</div>
            <div className="fl-earn-sub">{c.s}</div>
          </div>
        ))}
      </div>

      <div className="fl-card">
        <div className="fl-card-header">
          <h3>Monthly Earnings Performance</h3>
        </div>
        <div className="fl-chart big">
          {EARNINGS_MONTHS.map((e, i) => (
            <div key={i} className="fl-chart-col big">
              <div className="fl-chart-amt">₹{e.amount.toLocaleString("en-IN")}</div>
              <div
                className="fl-chart-bar big"
                style={{ height: `${(e.amount / maxE) * 160}px` }}
              ></div>
              <span className="fl-chart-lbl">{e.month}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="fl-card">
        <div className="fl-card-header">
          <h3>Recent Financial Ledger</h3>
        </div>
        {[
          { t: "Global E-Commerce Milestone 2", c: "TechVentures India", a: "+₹1,20,000", d: "Oct 4", type: "in" },
          { t: "SaaS Analytics & Billing Platform", c: "FinTech Prime", a: "+₹3,15,000", d: "Sep 30", type: "in" },
          { t: "Bank Transfer Payout (HDFC)", c: "HDFC Bank Ltd.", a: "-₹2,50,000", d: "Sep 25", type: "out" },
          { t: "Healthcare Provider Scheduling", c: "HealthFirst Labs", a: "+₹1,85,000", d: "Aug 28", type: "in" }
        ].map((tx, i) => (
          <div key={i} className="fl-txn-row">
            <div className={`fl-txn-icon ${tx.type}`}>
              {tx.type === "in" ? "↓" : "↑"}
            </div>
            <div className="fl-txn-info">
              <div className="fl-txn-title">{tx.t}</div>
              <div className="fl-txn-sub">
                {tx.c} · {tx.d}
              </div>
            </div>
            <div className={`fl-txn-amt ${tx.type}`}>{tx.a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MessagesTab() {
  const [activeChat, setActiveChat] = useState("TechVentures India");
  const [reply, setReply] = useState("");
  const [threads, setThreads] = useState({
    "TechVentures India": [
      { from: "client", text: "Hi Alex! We received your proposal for the E-commerce platform. Can you explain your plan for Razorpay integration?" },
      { from: "me", text: "Hello! Absolutely. I plan to use Razorpay Standard Checkout with automated webhook signature validation to ensure instant orders." },
      { from: "client", text: "Sounds solid. When could you kick off phase 1?" }
    ],
    "HealthFirst Labs": [
      { from: "client", text: "Alex, thanks for submitting the deliverables. We tested the auth flows and they are lightning fast!" }
    ],
    "StartupHub Global": [
      { from: "client", text: "Welcome to the project! We have sent over the design tokens and Figma files." }
    ]
  });

  const send = () => {
    if (!reply.trim()) return;
    const currentList = threads[activeChat] || [];
    setThreads({
      ...threads,
      [activeChat]: [...currentList, { from: "me", text: reply }]
    });
    setReply("");
    setTimeout(() => {
      setThreads((prev) => ({
        ...prev,
        [activeChat]: [
          ...(prev[activeChat] || []),
          { from: "client", text: "Thanks for the quick update! We are reviewing this right now." }
        ]
      }));
    }, 1200);
  };

  return (
    <div className="fl-tab-content fade-in">
      <div className="fl-page-header">
        <h1 className="fl-page-title">Direct Client Messages</h1>
      </div>
      <div className="fl-msg-layout">
        <div className="fl-msg-list">
          {Object.keys(threads).map((name) => {
            const list = threads[name];
            const last = list[list.length - 1];
            return (
              <div
                key={name}
                className={`fl-msg-item ${activeChat === name ? "active" : ""}`}
                onClick={() => setActiveChat(name)}
              >
                <div className="fl-msg-av">{name[0]}</div>
                <div className="fl-msg-body">
                  <div className="fl-msg-name">{name}</div>
                  <div className="fl-msg-last">{last?.text}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="fl-msg-chat-pane">
          <div className="fl-msg-chat-hdr">
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div className="fl-msg-av sm">{activeChat[0]}</div>
              <div>
                <strong>{activeChat}</strong>
                <div style={{ fontSize: "0.72rem", color: "#10B981" }}>● Active Client</div>
              </div>
            </div>
          </div>
          <div className="fl-msg-bubbles">
            {(threads[activeChat] || []).map((m, idx) => (
              <div key={idx} className={`fl-msg-bubble-wrap ${m.from}`}>
                <div className="fl-msg-bubble">{m.text}</div>
              </div>
            ))}
          </div>
          <div className="fl-msg-input-wrap">
            <input
              className="fl-input"
              placeholder="Type your message to client..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button className="fl-btn-primary" onClick={send}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationsTab({ notifications, onMarkAllRead }) {
  return (
    <div className="fl-tab-content fade-in">
      <div className="fl-page-header">
        <div>
          <h1 className="fl-page-title">Notifications</h1>
          <p className="fl-subtitle">Live alerts about job status updates, payments, and client messages</p>
        </div>
        <button className="fl-btn-outline" onClick={onMarkAllRead}>
          Mark all as read
        </button>
      </div>
      <div className="fl-notif-list">
        {notifications.map((n) => (
          <div key={n.id} className={`fl-notif-item ${!n.read ? "unread" : ""}`}>
            <div className="fl-notif-icon">{n.icon}</div>
            <div className="fl-notif-body">
              <div className="fl-notif-title">{n.title}</div>
              <div className="fl-notif-msg">{n.message}</div>
              <div className="fl-notif-time">{n.time}</div>
            </div>
            {!n.read && <div className="fl-notif-dot"></div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileTab() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "Alex Johnson",
    title: "Senior Full-Stack Engineer & Cloud Architect",
    location: "Bengaluru / Remote",
    rate: "₹2,500/hr",
    bio: "Passionate full-stack engineer with 6+ years of production experience building high-scale SaaS web applications, e-commerce engines, and high-performance cloud APIs. Specializes in React, Node.js, TypeScript, and AWS architecture.",
    resumeName: "Alex_Johnson_FullStack_Resume_2026.pdf",
    resumeSize: "2.4 MB",
    resumeUploaded: "Uploaded Oct 1, 2026"
  });

  const [skills, setSkills] = useState([
    { name: "React", pct: 95 },
    { name: "Node.js", pct: 92 },
    { name: "TypeScript", pct: 90 },
    { name: "MongoDB", pct: 88 },
    { name: "AWS & Docker", pct: 85 },
    { name: "Razorpay Payments", pct: 90 }
  ]);

  const [newSkill, setNewSkill] = useState("");
  const [selectedPortfolioModal, setSelectedPortfolioModal] = useState(null);

  const portfolioItems = [
    {
      title: "Global E-Commerce Microservices Engine",
      category: "Web Development",
      tech: "React · Node.js · Razorpay · Redis",
      metric: "₹3.5 Cr+ Annual GMV processed",
      desc: "Designed and implemented a distributed multi-vendor e-commerce platform with automated webhooks, custom cart state caching, and localized tax calculations.",
      color: "#635BFF"
    },
    {
      title: "Real-time Telemetry & Cloud Analytics Dashboard",
      category: "Data Science & Web",
      tech: "TypeScript · D3.js · WebSockets · AWS",
      metric: "50,000+ Concurrent Live Users",
      desc: "Enterprise operational intelligence dashboard capable of rendering 100k data points per second with zero browser lag using HTML5 Canvas.",
      color: "#10B981"
    },
    {
      title: "Cross-Platform Event Management Suite",
      category: "Mobile & Backend",
      tech: "React Native · Firebase · GraphQL",
      metric: "99.98% Crash-free rate",
      desc: "Native iOS/Android application deployed for 12 technology summits with real-time push alerts and offline QR ticket validation.",
      color: "#F59E0B"
    }
  ];

  const handleResumeSimulate = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfile((prev) => ({
        ...prev,
        resumeName: file.name,
        resumeSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        resumeUploaded: "Just now"
      }));
      toast.success(`Resume uploaded: ${file.name}`);
    }
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setSkills([...skills, { name: newSkill.trim(), pct: 85 }]);
      setNewSkill("");
      toast.success(`Added ${newSkill.trim()} to your skills!`);
    }
  };

  return (
    <div className="fl-tab-content fade-in">
      <div className="fl-page-header">
        <div>
          <h1 className="fl-page-title">My Freelancer Profile</h1>
          <p className="fl-subtitle">
            Manage your public presentation, skills, experience, portfolio, and resume
          </p>
        </div>
        <button
          className="fl-btn-primary"
          onClick={() => {
            setIsEditing(!isEditing);
            if (isEditing) toast.success("Profile changes saved successfully!");
          }}
        >
          {isEditing ? "✓ Save Profile Changes" : "✏️ Edit Profile"}
        </button>
      </div>

      <div className="fl-profile-layout">
        {/* Left Column */}
        <div className="fl-profile-left">
          <div className="fl-profile-card-box">
            <div className="fl-profile-av-wrap">
              <div className="fl-profile-av">AJ</div>
              <div className="fl-avail-dot"></div>
            </div>
            {isEditing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.75rem" }}>
                <input
                  className="fl-input"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
                <input
                  className="fl-input"
                  value={profile.title}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                />
                <input
                  className="fl-input"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                />
              </div>
            ) : (
              <>
                <h2 className="fl-prof-name">{profile.name}</h2>
                <div className="fl-prof-title">{profile.title}</div>
                <div className="fl-prof-loc">📍 {profile.location}</div>
              </>
            )}

            <div style={{ margin: "0.75rem 0" }}>
              <Stars rating={4.95} />
            </div>

            <div className="fl-prof-stats">
              <div>
                <strong>143</strong>
                <span>Completed</span>
              </div>
              <div>
                <strong>99%</strong>
                <span>Success Rate</span>
              </div>
              <div>
                <strong>6 yrs</strong>
                <span>Experience</span>
              </div>
            </div>
          </div>

          {/* Resume Upload Section */}
          <div className="fl-profile-card-box">
            <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              📄 Resume & Documents
            </h3>
            <div className="fl-resume-box">
              <div className="fl-resume-icon">📑</div>
              <div className="fl-resume-info">
                <strong>{profile.resumeName}</strong>
                <span>{profile.resumeSize} · {profile.resumeUploaded}</span>
              </div>
            </div>
            <label className="fl-upload-btn-label">
              <span>📤 Upload New Resume (PDF / DOCX)</span>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                style={{ display: "none" }}
                onChange={handleResumeSimulate}
              />
            </label>
          </div>

          {/* Quick Experience Info */}
          <div className="fl-profile-card-box">
            <h3>Work Experience</h3>
            <div className="fl-exp-item">
              <strong>Senior Full-Stack Consultant</strong>
              <span>Freelance · 2022 - Present</span>
              <p>Architected 30+ client web apps with modern cloud infrastructure.</p>
            </div>
            <div className="fl-exp-item" style={{ marginTop: "0.75rem" }}>
              <strong>Lead Frontend Engineer</strong>
              <span>CloudScale Tech · 2020 - 2022</span>
              <p>Maintained company design system and React component libraries.</p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="fl-profile-right">
          <div className="fl-profile-card-box">
            <h3>About Me & Expertise</h3>
            {isEditing ? (
              <textarea
                className="fl-textarea"
                rows={4}
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              />
            ) : (
              <p className="fl-bio">{profile.bio}</p>
            )}
          </div>

          <div className="fl-profile-card-box">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3>Skills & Proficiency</h3>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  className="fl-input sm"
                  placeholder="Add a new skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSkill()}
                />
                <button className="fl-btn-sm" onClick={addSkill}>
                  + Add
                </button>
              </div>
            </div>
            <div className="fl-skills-list">
              {skills.map((s) => (
                <div key={s.name} className="fl-skill-row">
                  <span className="fl-skill-name">{s.name}</span>
                  <div className="fl-skill-track">
                    <div className="fl-skill-fill" style={{ width: `${s.pct}%` }}></div>
                  </div>
                  <span className="fl-skill-pct">{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio Section */}
          <div className="fl-profile-card-box">
            <div className="fl-card-header">
              <h3>Featured Portfolio ({portfolioItems.length})</h3>
            </div>
            <div className="fl-portfolio-grid">
              {portfolioItems.map((p, idx) => (
                <div
                  key={idx}
                  className="fl-portfolio-card"
                  onClick={() => setSelectedPortfolioModal(p)}
                >
                  <div
                    className="fl-portfolio-thumb"
                    style={{ borderTop: `4px solid ${p.color}` }}
                  >
                    <span className="fl-port-badge">{p.category}</span>
                    <h4>{p.title}</h4>
                    <span className="fl-port-metric">{p.metric}</span>
                  </div>
                  <div className="fl-port-footer">
                    <span>{p.tech}</span>
                    <button className="fl-btn-sm">Inspect</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Client Reviews */}
          <div className="fl-profile-card-box">
            <h3>Verified Client Reviews (87)</h3>
            {[
              {
                client: "TechVentures India",
                rating: 5,
                date: "Sep 2026",
                text: "Alex delivered our complete microservices platform 4 days ahead of schedule. Code is clean, well-commented, and tested."
              },
              {
                client: "FinTech Prime",
                rating: 5,
                date: "Aug 2026",
                text: "Brilliant architectural guidance on our payments integration. Zero payment bugs since deployment."
              }
            ].map((rv, i) => (
              <div key={i} className="fl-review-item">
                <div className="fl-review-hdr">
                  <div className="fl-review-av">{rv.client[0]}</div>
                  <div>
                    <div className="fl-review-client">{rv.client}</div>
                    <Stars rating={rv.rating} />
                  </div>
                  <div className="fl-review-date">{rv.date}</div>
                </div>
                <p className="fl-review-text">{rv.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Portfolio Preview Modal */}
      {selectedPortfolioModal && (
        <div className="fl-overlay" onClick={() => setSelectedPortfolioModal(null)}>
          <div className="fl-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fl-modal-hdr">
              <h2>{selectedPortfolioModal.title}</h2>
              <button
                className="fl-modal-close"
                onClick={() => setSelectedPortfolioModal(null)}
              >
                ✕
              </button>
            </div>
            <div
              style={{
                background: "rgba(99,91,255,0.08)",
                border: "1px solid rgba(99,91,255,0.2)",
                padding: "1rem",
                borderRadius: "10px",
                marginBottom: "1rem"
              }}
            >
              <div style={{ color: "#635BFF", fontWeight: 700, fontSize: "0.85rem" }}>
                {selectedPortfolioModal.category}
              </div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fff", margin: "0.3rem 0" }}>
                {selectedPortfolioModal.metric}
              </div>
              <div style={{ color: "#94A3B8", fontSize: "0.82rem" }}>
                Tech: {selectedPortfolioModal.tech}
              </div>
            </div>
            <p style={{ color: "#CBD5E1", fontSize: "0.9rem", lineHeight: 1.6 }}>
              {selectedPortfolioModal.desc}
            </p>
            <div className="fl-modal-actions" style={{ marginTop: "1.5rem" }}>
              <button
                className="fl-btn-primary"
                onClick={() => setSelectedPortfolioModal(null)}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProposalModal({ job, onClose, onSubmitProposal }) {
  const [expectedPrice, setExpectedPrice] = useState("");
  const [estimatedTimeline, setEstimatedTimeline] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!expectedPrice || !estimatedTimeline || !coverLetter) {
      toast.error("Please fill out all required fields!");
      return;
    }

    onSubmitProposal({
      jobId: job.id,
      expectedPrice,
      estimatedTimeline,
      coverLetter
    });
    setSubmitted(true);
    toast.success("Proposal submitted successfully to client!");
  };

  if (submitted) {
    return (
      <div className="fl-overlay" onClick={onClose}>
        <div className="fl-modal" onClick={(e) => e.stopPropagation()}>
          <div className="fl-success-box">
            <div className="fl-success-icon">🚀</div>
            <h2>Proposal Submitted!</h2>
            <p>
              Your proposal for <strong>{job.title}</strong> has been submitted.
              The client (<strong>{job.client}</strong>) has been notified and will review your bid.
            </p>
            <div className="fl-sub-details">
              <div>
                <span>Bid Amount:</span>
                <strong>{expectedPrice.startsWith("₹") ? expectedPrice : `₹${expectedPrice}`}</strong>
              </div>
              <div>
                <span>Estimated Time:</span>
                <strong>{estimatedTimeline}</strong>
              </div>
            </div>
            <p style={{ fontSize: "0.8rem", color: "#64748B", marginTop: "0.75rem" }}>
              You can track this under <strong>My Applications</strong>.
            </p>
            <button className="fl-btn-primary" onClick={onClose}>
              Done & Return
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fl-overlay" onClick={onClose}>
      <div className="fl-modal" onClick={(e) => e.stopPropagation()}>
        <div className="fl-modal-hdr">
          <h2>Apply for Job & Submit Proposal</h2>
          <button className="fl-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="fl-job-summary">
          <div className="fl-sum-title">{job.title}</div>
          <div className="fl-sum-meta">
            <span>👤 Client: {job.client}</span>
            <span>💰 Budget: {job.budget}</span>
            <span>📅 Deadline: {job.deadline}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="fl-prop-form">
          <div className="fl-form-row">
            <div className="fl-form-group">
              <label>Expected Price (₹ INR) *</label>
              <input
                required
                className="fl-input"
                placeholder="e.g. 145000"
                value={expectedPrice}
                onChange={(e) => setExpectedPrice(e.target.value)}
              />
            </div>
            <div className="fl-form-group">
              <label>Estimated Completion Time *</label>
              <input
                required
                className="fl-input"
                placeholder="e.g. 2.5 weeks"
                value={estimatedTimeline}
                onChange={(e) => setEstimatedTimeline(e.target.value)}
              />
            </div>
          </div>

          <div className="fl-form-group">
            <label>Cover Letter & Solution Proposal *</label>
            <textarea
              required
              className="fl-textarea"
              rows={5}
              placeholder="Explain why you are the best fit, your relevant past projects, and your execution timeline..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
          </div>

          <div className="fl-form-group">
            <label>Attached Resume / Portfolio</label>
            <div className="fl-file-drop">
              📎 Auto-attached: <strong>Alex_Johnson_FullStack_Resume_2026.pdf</strong> (2.4 MB)
            </div>
          </div>

          <div className="fl-modal-actions">
            <button type="button" className="fl-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="fl-btn-primary">
              Submit Proposal Now →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function JobDetailModal({ job, onClose, onApply, isApplied }) {
  return (
    <div className="fl-overlay" onClick={onClose}>
      <div className="fl-modal wide" onClick={(e) => e.stopPropagation()}>
        <div className="fl-modal-hdr">
          <h2>Job Opportunity Details</h2>
          <button className="fl-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="fl-jd-top">
          <div className="fl-jd-client-info">
            <div className="fl-client-av lg">{job.clientAvatar || job.client[0]}</div>
            <div>
              <div className="fl-jd-cname">{job.client}</div>
              <div className="fl-posted">Posted {job.postedDate} · Verified Client</div>
            </div>
          </div>
          {job.urgent && <span className="fl-urgent">🔥 Urgent Hiring</span>}
        </div>

        <h2 className="fl-jd-title">{job.title}</h2>

        <div className="fl-jd-badges">
          <span className="fl-jd-badge cat">{job.category}</span>
          <span className="fl-jd-badge">📍 {job.location}</span>
          <span className="fl-jd-badge">💰 {job.budget} ({job.budgetType || "Fixed"})</span>
          <span className="fl-jd-badge">⏱ Status: {job.status}</span>
        </div>

        <div className="fl-jd-sec">
          <h4>Problem & Scope of Work</h4>
          <p>{job.description}</p>
        </div>

        <div className="fl-jd-sec">
          <h4>Required Skills & Expertise</h4>
          <div className="fl-job-skills">
            {job.skills &&
              job.skills.map((s) => (
                <span key={s} className="fl-chip">
                  {s}
                </span>
              ))}
          </div>
        </div>

        <div className="fl-jd-meta-grid">
          <div>
            <span>📅 Delivery Deadline</span>
            <strong>{job.deadline}</strong>
          </div>
          <div>
            <span>👥 Proposals Received</span>
            <strong>{job.proposals || 0}</strong>
          </div>
          <div>
            <span>💼 Contract Type</span>
            <strong>{job.budgetType || "Fixed Price"}</strong>
          </div>
          <div>
            <span>📍 Location Preference</span>
            <strong>{job.location}</strong>
          </div>
        </div>

        <div className="fl-modal-actions">
          <button className="fl-btn-outline" onClick={onClose}>
            Back
          </button>
          {isApplied ? (
            <button className="fl-btn-applied" disabled>
              ✓ Proposal Already Submitted
            </button>
          ) : (
            <button className="fl-btn-primary" onClick={onApply}>
              Apply for this Job →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FreelancerDashboard() {
  const [tab, setTab] = useState("overview");
  const [selectedJob, setSelectedJob] = useState(null);
  const [showProposal, setShowProposal] = useState(false);

  const {
    jobs,
    applications,
    activeProjects,
    completedProjects,
    notifications,
    submitApplication,
    markNotificationsRead
  } = useMarketplaceStore();

  const flNotifs = notifications.freelancer || [];
  const unreadCount = flNotifs.filter((n) => !n.read).length;

  const setActiveTab = (t) => {
    setTab(t);
    setSelectedJob(null);
    setShowProposal(false);
  };

  const appliedJobIds = applications.map((a) => a.jobId);

  const renderTab = () => {
    switch (tab) {
      case "overview":
        return (
          <OverviewTab
            setActiveTab={setActiveTab}
            jobs={jobs}
            applications={applications}
            activeProjects={activeProjects}
            completedProjects={completedProjects}
          />
        );
      case "browse":
        return (
          <BrowseJobsTab
            jobs={jobs}
            applications={applications}
            setSelectedJob={setSelectedJob}
            setShowProposal={setShowProposal}
          />
        );
      case "applications":
        return <ApplicationsTab applications={applications} />;
      case "active":
        return <ActiveProjectsTab activeProjects={activeProjects} />;
      case "completed":
        return <CompletedTab completedProjects={completedProjects} />;
      case "earnings":
        return <EarningsTab />;
      case "messages":
        return <MessagesTab />;
      case "notifications":
        return (
          <NotificationsTab
            notifications={flNotifs}
            onMarkAllRead={() => markNotificationsRead("freelancer")}
          />
        );
      case "profile":
        return <ProfileTab />;
      default:
        return (
          <OverviewTab
            setActiveTab={setActiveTab}
            jobs={jobs}
            applications={applications}
            activeProjects={activeProjects}
            completedProjects={completedProjects}
          />
        );
    }
  };

  return (
    <div className="fl-dashboard-wrapper">
      {/* Universal Top Dashboard Switcher */}
      <DashboardSwitcher currentDashboard="freelancer" />

      <div className="fl-dashboard">
        <Sidebar
          active={tab}
          setActive={setActiveTab}
          unread={unreadCount}
          activeProjectsCount={activeProjects.length}
          applicationsCount={applications.length}
        />

        <main className="fl-main">
          <div className="fl-topbar">
            <div className="fl-topbar-left">
              <span className="fl-topbar-badge">FREELANCER VIEW</span>
              <span className="fl-topbar-title">
                {tab.charAt(0).toUpperCase() + tab.slice(1).replace("-", " ")}
              </span>
            </div>
            <div className="fl-topbar-right">
              <button
                className="fl-topbar-btn"
                onClick={() => setActiveTab("notifications")}
                title="Notifications"
              >
                🔔
                {unreadCount > 0 && <span className="fl-top-badge">{unreadCount}</span>}
              </button>
              <div
                className="fl-topbar-av"
                onClick={() => setActiveTab("profile")}
                title="View Profile"
              >
                AJ
              </div>
            </div>
          </div>

          <div className="fl-content">{renderTab()}</div>
        </main>

        {selectedJob && !showProposal && (
          <JobDetailModal
            job={selectedJob}
            isApplied={appliedJobIds.includes(selectedJob.id)}
            onClose={() => setSelectedJob(null)}
            onApply={() => setShowProposal(true)}
          />
        )}

        {selectedJob && showProposal && (
          <ProposalModal
            job={selectedJob}
            onClose={() => {
              setSelectedJob(null);
              setShowProposal(false);
            }}
            onSubmitProposal={(proposalData) => {
              submitApplication({
                jobId: selectedJob.id,
                expectedPrice: proposalData.expectedPrice,
                estimatedTimeline: proposalData.estimatedTimeline,
                coverLetter: proposalData.coverLetter
              });
            }}
          />
        )}
      </div>
    </div>
  );
}
