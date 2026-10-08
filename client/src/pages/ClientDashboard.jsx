import { useState } from "react";
import DashboardSwitcher from "../components/common/DashboardSwitcher";
import { useMarketplaceStore } from "../utils/marketplaceStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./ClientDashboard.css";

const JOB_STATUSES = [
  "Draft",
  "Published",
  "Applications Received",
  "Freelancer Selected",
  "In Progress",
  "Completed"
];

const CATEGORIES = [
  "Web Development",
  "Mobile Development",
  "UI/UX Design",
  "Graphic Design",
  "Content Writing",
  "Digital Marketing",
  "Data Science",
  "DevOps",
  "Video & Animation"
];

const ALL_SKILLS = [
  "React",
  "Node.js",
  "Python",
  "Figma",
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
  "Adobe XD",
  "Stripe",
  "Firebase"
];

function Stars({ rating }) {
  const num = typeof rating === "number" ? rating : parseFloat(rating) || 5;
  return (
    <span className="cl-stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{
            color: i <= Math.floor(num) ? "#F59E0B" : "#CBD5E1",
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

function StatusBadge({ status }) {
  const map = {
    Draft: ["cl-badge cl-badge-gray", "📝"],
    Published: ["cl-badge cl-badge-blue", "🚀"],
    "Applications Received": ["cl-badge cl-badge-purple", "👥"],
    "Freelancer Selected": ["cl-badge cl-badge-green", "✅"],
    "In Progress": ["cl-badge cl-badge-yellow", "⚡"],
    Completed: ["cl-badge cl-badge-emerald", "🏆"]
  };
  const [cls, icon] = map[status] || ["cl-badge cl-badge-gray", "•"];
  return (
    <span className={cls}>
      {icon} {status}
    </span>
  );
}

function Sidebar({ active, setActive, unread, totalJobs, applicantsCount }) {
  const nav = [
    { key: "overview", icon: "⊞", label: "Dashboard Overview" },
    { key: "jobs", icon: "💼", label: "My Posted Jobs", badge: totalJobs },
    { key: "create", icon: "➕", label: "Post New Job" },
    { key: "applicants", icon: "👥", label: "Review Applicants", badge: applicantsCount },
    { key: "active", icon: "⚡", label: "Active Contracts" },
    { key: "completed", icon: "🏆", label: "Completed Projects" },
    { key: "messages", icon: "💬", label: "Messages" },
    { key: "notifications", icon: "🔔", label: "Notifications", badge: unread },
    { key: "profile", icon: "🏢", label: "Company Profile" }
  ];

  return (
    <aside className="cl-sidebar">
      <div className="cl-brand">
        <div className="cl-brand-icon">🏢</div>
        <div>
          <div className="cl-brand-name">FreelanceHub</div>
          <div className="cl-brand-role">Client & Owner Portal</div>
        </div>
      </div>

      <div className="cl-sidebar-profile">
        <div className="cl-sidebar-av">TV</div>
        <div>
          <div className="cl-sidebar-name">TechVentures Inc.</div>
          <div className="cl-sidebar-role">Verified Enterprise Client</div>
        </div>
      </div>

      <nav className="cl-nav">
        {nav.map((item) => (
          <button
            key={item.key}
            className={`cl-nav-item ${active === item.key ? "active" : ""}`}
            onClick={() => setActive(item.key)}
          >
            <span className="cl-nav-icon">{item.icon}</span>
            <span className="cl-nav-label">{item.label}</span>
            {item.badge > 0 && <span className="cl-nav-badge">{item.badge}</span>}
          </button>
        ))}
      </nav>

      <div className="cl-sidebar-footer">
        <button className="cl-footer-create-btn" onClick={() => setActive("create")}>
          + Post a New Job
        </button>
      </div>
    </aside>
  );
}

function OverviewTab({ setActive, jobs, applications, activeProjects, completedProjects, notifs, onSelectApplicant }) {
  const navigate = useNavigate();
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((j) => j.status !== "Completed").length;
  const shortlistedApplicants = applications.filter((a) => a.status === "Shortlisted").length;

  return (
    <div className="cl-fade">
      <div className="cl-page-hdr">
        <div>
          <h1 className="cl-page-title">Client Dashboard Overview</h1>
          <p className="cl-subtitle">
            Manage your project requisitions, receive proposals, and hire vetted talent
          </p>
        </div>
        <button className="cl-btn-primary" onClick={() => setActive("create")}>
          + Post New Job Now
        </button>
      </div>

      {/* Client Workflow Ribbon */}
      <div className="cl-workflow-ribbon">
        <div className="cl-ribbon-title">Client Workflow:</div>
        <div className="cl-ribbon-steps">
          <span className="cl-ribbon-step active">1. Post Job</span>
          <span className="cl-ribbon-arrow">➔</span>
          <span className="cl-ribbon-step active">2. Publish Live</span>
          <span className="cl-ribbon-arrow">➔</span>
          <span className="cl-ribbon-step active">3. Receive Applications</span>
          <span className="cl-ribbon-arrow">➔</span>
          <span className="cl-ribbon-step">4. Review & Compare</span>
          <span className="cl-ribbon-arrow">➔</span>
          <span className="cl-ribbon-step">5. Hire & Kickoff</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="cl-stats-grid">
        <div className="cl-stat-card">
          <div className="cl-stat-icon-wrap" style={{ background: "#EFF6FF" }}>
            💼
          </div>
          <div>
            <div className="cl-stat-value">{totalJobs}</div>
            <div className="cl-stat-label">Total Jobs Posted</div>
            <div className="cl-stat-change pos">+1 this month</div>
          </div>
        </div>

        <div className="cl-stat-card">
          <div className="cl-stat-icon-wrap" style={{ background: "#FFFBEB" }}>
            ⚡
          </div>
          <div>
            <div className="cl-stat-value">{activeJobs}</div>
            <div className="cl-stat-label">Active Open Jobs</div>
            <div className="cl-stat-change pos">Accepting bids</div>
          </div>
        </div>

        <div className="cl-stat-card">
          <div className="cl-stat-icon-wrap" style={{ background: "#F5F3FF" }}>
            👥
          </div>
          <div>
            <div className="cl-stat-value">{applications.length}</div>
            <div className="cl-stat-label">Total Applicants</div>
            <div className="cl-stat-change pos">{shortlistedApplicants} shortlisted</div>
          </div>
        </div>

        <div className="cl-stat-card">
          <div className="cl-stat-icon-wrap" style={{ background: "#ECFDF5" }}>
            🏆
          </div>
          <div>
            <div className="cl-stat-value">{completedProjects.length + 2}</div>
            <div className="cl-stat-label">Completed Projects</div>
            <div className="cl-stat-change pos">100% on-time delivery</div>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="cl-quick-action-grid">
        <div className="cl-quick-action" onClick={() => setActive("create")}>
          <div className="cl-qa-icon">📝</div>
          <div className="cl-qa-label">Post a New Job</div>
          <div className="cl-qa-sub">Step-by-step project wizard</div>
        </div>

        <div className="cl-quick-action" onClick={() => setActive("applicants")}>
          <div className="cl-qa-icon">👥</div>
          <div className="cl-qa-label">Review Applicants</div>
          <div className="cl-qa-sub">{applications.length} proposals waiting</div>
        </div>

        <div
          className="cl-quick-action"
          onClick={() => navigate("/selection-dashboard")}
        >
          <div className="cl-qa-icon">🎯</div>
          <div className="cl-qa-label">Talent Selection Portal</div>
          <div className="cl-qa-sub">Filter & compare candidates side-by-side</div>
        </div>
      </div>

      <div className="cl-overview-2col">
        {/* Recent Jobs */}
        <div className="cl-card">
          <div className="cl-card-hdr">
            <h3>Recent Job Postings</h3>
            <button className="cl-btn-sm" onClick={() => setActive("jobs")}>
              View All ({jobs.length})
            </button>
          </div>
          <div className="cl-jobs-grid">
            {jobs.slice(0, 3).map((job) => (
              <div key={job.id} className="cl-job-card">
                <div className="cl-job-top">
                  <h3 className="cl-job-title">{job.title}</h3>
                  <StatusBadge status={job.status} />
                </div>
                <div className="cl-job-meta">
                  <span>💰 {job.budget}</span>
                  <span>📅 Due {job.deadline}</span>
                  <span>👥 {job.proposals || 0} applicants</span>
                  <span>📍 {job.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="cl-card">
          <div className="cl-card-hdr">
            <h3>Recent Activity & Alerts</h3>
            <button className="cl-btn-sm" onClick={() => setActive("notifications")}>
              View All
            </button>
          </div>
          <div className="cl-notif-feed">
            {notifs.slice(0, 4).map((n) => (
              <div key={n.id} className="cl-notif-feed-item">
                <span className="cl-feed-icon">{n.icon || "🔔"}</span>
                <div>
                  <div className="cl-feed-msg">{n.message || n.msg}</div>
                  <div className="cl-feed-time">{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Waiting Applicants */}
      <div className="cl-card">
        <div className="cl-card-hdr">
          <h3>Top Applicants Waiting for Your Review</h3>
          <button className="cl-btn-primary" onClick={() => setActive("applicants")}>
            Review All Applicants ({applications.length}) →
          </button>
        </div>
        <div className="cl-applicants-list">
          {applications.slice(0, 3).map((ap) => (
            <div key={ap.id} className="cl-applicant-card">
              <div className="cl-ap-av">{ap.freelancerAvatar || ap.freelancerName[0]}</div>
              <div className="cl-ap-info">
                <div className="cl-ap-name">{ap.freelancerName}</div>
                <div className="cl-ap-title">
                  {ap.freelancerTitle} · {ap.freelancerExperience} exp · 📍 {ap.freelancerLocation}
                </div>
                <div className="cl-ap-job-tag">For: {ap.jobTitle}</div>
                <div className="cl-ap-meta">
                  <Stars rating={ap.freelancerRating || 4.9} />
                  <span>({ap.freelancerReviews || 50} reviews)</span>
                  <span>💰 Bid: <strong>{ap.expectedPrice}</strong></span>
                  <span>⏱ Delivery: <strong>{ap.estimatedTimeline}</strong></span>
                </div>
              </div>
              <div className="cl-ap-actions">
                <button
                  className="cl-btn-sm"
                  onClick={() => setActive("applicants")}
                >
                  Review Proposal
                </button>
                <button
                  className="cl-btn-primary"
                  onClick={() => onSelectApplicant(ap.id, "Accepted")}
                >
                  Hire Freelancer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function JobsTab({ setActive, jobs, applications }) {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState("All");

  const filtered =
    filterStatus === "All"
      ? jobs
      : jobs.filter((j) => j.status === filterStatus);

  return (
    <div className="cl-fade">
      <div className="cl-page-hdr">
        <div>
          <h1 className="cl-page-title">My Posted Jobs</h1>
          <p className="cl-subtitle">
            Manage your requisitions, track pipeline stages, and view applicant proposals
          </p>
        </div>
        <button className="cl-btn-primary" onClick={() => setActive("create")}>
          + Post New Job
        </button>
      </div>

      {/* Status Filter Badges */}
      <div className="cl-status-filter-row">
        {["All", ...JOB_STATUSES].map((s) => {
          const count =
            s === "All" ? jobs.length : jobs.filter((j) => j.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`cl-status-filter-btn ${filterStatus === s ? "active" : ""}`}
            >
              {s} ({count})
            </button>
          );
        })}
      </div>

      <div className="cl-jobs-grid">
        {filtered.map((job) => {
          const jobApps = applications.filter((a) => a.jobId === job.id);
          const currentStageIndex = JOB_STATUSES.indexOf(job.status);

          return (
            <div key={job.id} className="cl-job-card detailed">
              <div className="cl-job-top">
                <div>
                  <h3 className="cl-job-title">{job.title}</h3>
                  <div className="cl-job-category-tag">📂 {job.category} · Posted {job.postedDate}</div>
                </div>
                <StatusBadge status={job.status} />
              </div>

              {/* Status Progression Pipeline */}
              <div className="cl-pipeline-tracker">
                {JOB_STATUSES.map((step, idx) => {
                  const isDone = currentStageIndex >= idx;
                  const isCurrent = job.status === step;

                  return (
                    <div
                      key={step}
                      className={`cl-pipeline-step ${isDone ? "done" : ""} ${isCurrent ? "current" : ""}`}
                      title={step}
                    >
                      <div className="cl-step-dot">{isDone ? "✓" : idx + 1}</div>
                      <span className="cl-step-label">{step}</span>
                      {idx < JOB_STATUSES.length - 1 && (
                        <div className="cl-step-line"></div>
                      )}
                    </div>
                  );
                })}
              </div>

              <p className="cl-job-desc">{job.description || job.desc}</p>

              <div className="cl-job-skills">
                {job.skills &&
                  job.skills.map((s) => (
                    <span key={s} className="cl-chip">
                      {s}
                    </span>
                  ))}
              </div>

              <div className="cl-job-meta">
                <span>💰 Budget: <strong>{job.budget}</strong></span>
                <span>📅 Deadline: <strong>{job.deadline}</strong></span>
                <span>📍 Location: <strong>{job.location}</strong></span>
                <span>👥 Applicants: <strong>{job.proposals || jobApps.length}</strong></span>
                <span>⭐ Shortlisted: <strong>{job.shortlisted || 0}</strong></span>
              </div>

              <div className="cl-job-actions">
                <button
                  className="cl-btn-primary"
                  onClick={() => setActive("applicants")}
                >
                  Review Applicants ({job.proposals || jobApps.length})
                </button>
                <button
                  className="cl-btn-accent"
                  onClick={() => navigate("/selection-dashboard")}
                >
                  🎯 Find Best Freelancers
                </button>
                <button
                  className="cl-btn-sm"
                  onClick={() => toast.success(`Editing ${job.title}`)}
                >
                  Edit Details
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="cl-empty-state">
            <div style={{ fontSize: "3rem" }}>💼</div>
            <h3>No jobs found with status &quot;{filterStatus}&quot;</h3>
            <p>Try switching filter tabs or create a new job posting.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CreateJobTab({ onPublishJob, setActive }) {
  const [step, setStep] = useState(1);
  const [published, setPublished] = useState(false);
  const [newlyCreatedJob, setNewlyCreatedJob] = useState(null);

  const [form, setForm] = useState({
    title: "",
    desc: "",
    category: "",
    budget: "",
    budgetType: "Fixed",
    deadline: "",
    location: "Remote",
    skills: ["React", "Node.js"],
    skillInput: "",
    urgent: false
  });

  const addSkill = () => {
    if (form.skillInput.trim() && !form.skills.includes(form.skillInput.trim())) {
      setForm((f) => ({
        ...f,
        skills: [...f.skills, f.skillInput.trim()],
        skillInput: ""
      }));
    }
  };

  const removeSkill = (s) =>
    setForm((f) => ({ ...f, skills: f.skills.filter((x) => x !== s) }));

  const handlePublish = () => {
    if (!form.title || !form.desc || !form.category || !form.budget || !form.deadline) {
      toast.error("Please complete all required fields before publishing!");
      return;
    }

    const created = onPublishJob(form);
    setNewlyCreatedJob(created);
    setPublished(true);
    toast.success("Job published! Now visible to freelancers & in talent selection.");
  };

  if (published) {
    return (
      <div className="cl-fade cl-published-wrap">
        <div className="cl-published-card">
          <div className="cl-pub-icon">🚀</div>
          <h2>Job Successfully Published!</h2>
          <p>
            Your project <strong>{newlyCreatedJob?.title || form.title}</strong> is now live
            in the freelancer marketplace. Freelancers can apply immediately, and you can
            review candidates as proposals come in.
          </p>

          <div className="cl-pub-summary">
            <div>
              <span>Category:</span>
              <strong>{form.category}</strong>
            </div>
            <div>
              <span>Budget:</span>
              <strong>{form.budget}</strong>
            </div>
            <div>
              <span>Deadline:</span>
              <strong>{form.deadline}</strong>
            </div>
            <div>
              <span>Location:</span>
              <strong>{form.location}</strong>
            </div>
          </div>

          <div className="cl-pub-actions">
            <button
              className="cl-btn-outline"
              onClick={() => {
                setPublished(false);
                setStep(1);
                setForm({
                  title: "",
                  desc: "",
                  category: "",
                  budget: "",
                  budgetType: "Fixed",
                  deadline: "",
                  location: "Remote",
                  skills: ["React"],
                  skillInput: "",
                  urgent: false
                });
              }}
            >
              Post Another Job
            </button>
            <button
              className="cl-btn-primary"
              onClick={() => setActive("jobs")}
            >
              View My Jobs →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cl-fade">
      <div className="cl-page-hdr">
        <div>
          <h1 className="cl-page-title">Post a New Job Requirement</h1>
          <p className="cl-subtitle">
            Describe your problem and requirements to attract the most qualified freelancers
          </p>
        </div>
      </div>

      {/* Stepper Wizard Indicator */}
      <div className="cl-wizard-steps">
        {[
          { n: 1, l: "Job Details" },
          { n: 2, l: "Problem & Skills" },
          { n: 3, l: "Budget & Timeline" },
          { n: 4, l: "Review & Publish" }
        ].map((s, i, arr) => (
          <div key={s.n} className="cl-wizard-step-node">
            <div
              className={`cl-step-circle ${step >= s.n ? "active" : ""}`}
              onClick={() => step > s.n && setStep(s.n)}
            >
              {step > s.n ? "✓" : s.n}
            </div>
            <span className={`cl-step-text ${step >= s.n ? "active" : ""}`}>
              {s.l}
            </span>
            {i < arr.length - 1 && (
              <div
                className={`cl-step-connector ${step > s.n ? "active" : ""}`}
              ></div>
            )}
          </div>
        ))}
      </div>

      <div className="cl-card cl-form-card">
        {step === 1 && (
          <div className="cl-fade">
            <h3 className="cl-form-step-title">Step 1: General Job Information</h3>
            <div className="cl-form-group">
              <label className="cl-form-label">Job Title *</label>
              <input
                className="cl-input"
                placeholder="e.g. Architect and Build an E-commerce Web App with Stripe"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <span className="cl-form-hint">Make it specific and outcome-focused.</span>
            </div>

            <div className="cl-form-group">
              <label className="cl-form-label">Category *</label>
              <select
                className="cl-select"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="">Select project category...</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="cl-form-group">
              <label className="cl-form-label">Location / Work Type</label>
              <select
                className="cl-select"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              >
                <option value="Remote">Remote (Anywhere in the world)</option>
                <option value="USA">United States Only</option>
                <option value="UK">United Kingdom</option>
                <option value="India">India</option>
                <option value="Europe">Europe Only</option>
              </select>
            </div>

            <div className="cl-form-group">
              <label className="cl-checkbox-label">
                <input
                  type="checkbox"
                  checked={form.urgent}
                  onChange={(e) => setForm({ ...form, urgent: e.target.checked })}
                />
                <span>🔥 Mark as Urgent Hiring (Higher visibility badge)</span>
              </label>
            </div>

            <div className="cl-form-actions">
              <button
                className="cl-btn-primary"
                disabled={!form.title.trim() || !form.category}
                onClick={() => setStep(2)}
              >
                Next: Problem & Skills →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="cl-fade">
            <h3 className="cl-form-step-title">Step 2: Problem Description & Required Skills</h3>
            <div className="cl-form-group">
              <label className="cl-form-label">Problem Description & Project Scope *</label>
              <textarea
                className="cl-textarea"
                rows={6}
                placeholder="Describe your current problem or objective. What features must be built? What are your acceptance criteria and deliverables?"
                value={form.desc}
                onChange={(e) => setForm({ ...form, desc: e.target.value })}
              />
            </div>

            <div className="cl-form-group">
              <label className="cl-form-label">Required Skills & Technologies *</label>
              <div className="cl-skill-input-wrap">
                <input
                  className="cl-input"
                  placeholder="Type skill name & hit Enter or click Add..."
                  value={form.skillInput}
                  onChange={(e) => setForm({ ...form, skillInput: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && addSkill()}
                />
                <button type="button" className="cl-btn-primary" onClick={addSkill}>
                  + Add Skill
                </button>
              </div>

              <div className="cl-suggested-skills">
                <span className="cl-suggested-label">Suggestions:</span>
                {ALL_SKILLS.filter((s) => !form.skills.includes(s))
                  .slice(0, 8)
                  .map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="cl-suggest-chip"
                      onClick={() => setForm({ ...form, skills: [...form.skills, s] })}
                    >
                      + {s}
                    </button>
                  ))}
              </div>

              {form.skills.length > 0 && (
                <div className="cl-added-skills">
                  {form.skills.map((s) => (
                    <span key={s} className="cl-skill-chip">
                      {s}
                      <button type="button" onClick={() => removeSkill(s)}>
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="cl-form-group">
              <label className="cl-form-label">Supporting Files / Images (Optional)</label>
              <div
                className="cl-file-drop"
                onClick={() => toast.success("Mock file attachment added!")}
              >
                📎 Click or drag & drop design briefs, mockups, or spec PDFs
              </div>
            </div>

            <div className="cl-form-actions">
              <button className="cl-btn-outline" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button
                className="cl-btn-primary"
                disabled={!form.desc.trim() || form.skills.length === 0}
                onClick={() => setStep(3)}
              >
                Next: Budget & Deadline →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="cl-fade">
            <h3 className="cl-form-step-title">Step 3: Budget & Delivery Deadline</h3>
            <div className="cl-form-grid">
              <div className="cl-form-group">
                <label className="cl-form-label">Budget Type</label>
                <select
                  className="cl-select"
                  value={form.budgetType}
                  onChange={(e) => setForm({ ...form, budgetType: e.target.value })}
                >
                  <option value="Fixed">Fixed Price</option>
                  <option value="Hourly">Hourly Rate</option>
                </select>
              </div>

              <div className="cl-form-group">
                <label className="cl-form-label">Expected Budget Range *</label>
                <input
                  className="cl-input"
                  placeholder="e.g. ₹50,000 - ₹80,000 or ₹1,500 - ₹2,500/hr"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                />
              </div>

              <div className="cl-form-group">
                <label className="cl-form-label">Target Completion Deadline *</label>
                <input
                  className="cl-input"
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                />
              </div>
            </div>

            <div className="cl-budget-tip-box">
              <div className="cl-tip-title">💡 Client Recommendation</div>
              <p>
                Setting clear milestones and competitive compensation attracts top-tier senior
                engineers and designers, decreasing hiring cycle times by 40%.
              </p>
            </div>

            <div className="cl-form-actions">
              <button className="cl-btn-outline" onClick={() => setStep(2)}>
                ← Back
              </button>
              <button
                className="cl-btn-primary"
                disabled={!form.budget.trim() || !form.deadline}
                onClick={() => setStep(4)}
              >
                Review & Publish →
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="cl-fade">
            <h3 className="cl-form-step-title">Step 4: Review & Publish Job</h3>
            <div className="cl-review-summary-card">
              <div className="cl-rev-hdr">
                <h4>{form.title || "Untitled Project"}</h4>
                <span className="cl-badge cl-badge-blue">📝 Ready to Publish</span>
              </div>
              <p className="cl-rev-desc">{form.desc}</p>

              <div className="cl-rev-skills">
                {form.skills.map((s) => (
                  <span key={s} className="cl-chip">
                    {s}
                  </span>
                ))}
              </div>

              <div className="cl-rev-metrics">
                <div>
                  <span>Category</span>
                  <strong>{form.category}</strong>
                </div>
                <div>
                  <span>Budget</span>
                  <strong>{form.budget}</strong>
                </div>
                <div>
                  <span>Deadline</span>
                  <strong>{form.deadline}</strong>
                </div>
                <div>
                  <span>Location</span>
                  <strong>{form.location}</strong>
                </div>
              </div>
            </div>

            <div className="cl-form-actions">
              <button className="cl-btn-outline" onClick={() => setStep(3)}>
                ← Back
              </button>
              <button
                className="cl-btn-sm"
                onClick={() => toast.success("Saved as draft.")}
              >
                Save Draft
              </button>
              <button className="cl-btn-primary" onClick={handlePublish}>
                🚀 Publish Job Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ApplicantsTab({ jobs, applications, onUpdateStatus }) {
  const navigate = useNavigate();
  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id || 1);
  const [statusFilter, setStatusFilter] = useState("All");
  const [applicantModal, setApplicantModal] = useState(null);

  const currentJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];
  const jobApplications = applications.filter((a) => a.jobId === currentJob?.id);

  const filteredApps =
    statusFilter === "All"
      ? jobApplications
      : jobApplications.filter((a) => a.status === statusFilter);

  return (
    <div className="cl-fade">
      <div className="cl-page-hdr">
        <div>
          <h1 className="cl-page-title">Review Received Applications</h1>
          <p className="cl-subtitle">
            Evaluate freelancer proposals, cover letters, and select candidates for hire
          </p>
        </div>
      </div>

      {/* Job Selector Tabs */}
      <div className="cl-job-select-tabs">
        {jobs.map((j) => {
          const appCount = applications.filter((a) => a.jobId === j.id).length;
          return (
            <button
              key={j.id}
              className={`cl-job-tab-btn ${selectedJobId === j.id ? "active" : ""}`}
              onClick={() => setSelectedJobId(j.id)}
            >
              <span>{j.title}</span>
              <span className="cl-job-tab-count">{appCount}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Job Overview Header */}
      {currentJob && (
        <div className="cl-card cl-job-hero-card">
          <div className="cl-job-hero-left">
            <h3>{currentJob.title}</h3>
            <div className="cl-job-hero-meta">
              <span>💰 Budget: {currentJob.budget}</span>
              <span>📅 Deadline: {currentJob.deadline}</span>
              <span>👥 {jobApplications.length} Applicants</span>
              <span>📂 {currentJob.category}</span>
            </div>
          </div>
          <div className="cl-job-hero-right">
            <StatusBadge status={currentJob.status} />
            <button
              className="cl-btn-accent"
              onClick={() => navigate("/selection-dashboard")}
            >
              🎯 Open in Talent Selection
            </button>
          </div>
        </div>
      )}

      {/* Filter by Status */}
      <div className="cl-app-filter-pills">
        {["All", "Applied", "Under Review", "Shortlisted", "Accepted", "Rejected"].map((s) => {
          const count =
            s === "All"
              ? jobApplications.length
              : jobApplications.filter((a) => a.status === s).length;
          return (
            <button
              key={s}
              className={`cl-app-pill ${statusFilter === s ? "active" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s} ({count})
            </button>
          );
        })}
      </div>

      {/* Applicants List */}
      <div className="cl-applicants-list">
        {filteredApps.map((ap) => (
          <div key={ap.id} className="cl-applicant-card">
            <div className="cl-ap-av">{ap.freelancerAvatar || ap.freelancerName[0]}</div>
            <div className="cl-ap-info">
              <div className="cl-ap-name">
                {ap.freelancerName}
                {ap.status === "Shortlisted" && (
                  <span className="cl-badge cl-badge-purple">⭐ Shortlisted</span>
                )}
                {ap.status === "Accepted" && (
                  <span className="cl-badge cl-badge-green">✓ Hired</span>
                )}
              </div>
              <div className="cl-ap-title">
                {ap.freelancerTitle} · {ap.freelancerExperience} exp · 📍 {ap.freelancerLocation}
              </div>

              <div className="cl-ap-meta">
                <Stars rating={ap.freelancerRating || 4.9} />
                <span>({ap.freelancerReviews || 50} reviews)</span>
                <span>💰 Proposed Bid: <strong>{ap.expectedPrice}</strong></span>
                <span>⏱ Delivery Time: <strong>{ap.estimatedTimeline}</strong></span>
              </div>

              {ap.coverLetter && (
                <div className="cl-ap-cover-letter">
                  &quot;{ap.coverLetter}&quot;
                </div>
              )}
            </div>

            <div className="cl-ap-actions-column">
              <button
                className="cl-btn-sm"
                onClick={() => setApplicantModal(ap)}
              >
                View Full Proposal
              </button>
              <button
                className="cl-btn-sm"
                onClick={() => {
                  onUpdateStatus(ap.id, "Shortlisted");
                  toast.success(`${ap.freelancerName} shortlisted!`);
                }}
              >
                ⭐ Shortlist
              </button>
              <button
                className="cl-btn-primary"
                onClick={() => {
                  onUpdateStatus(ap.id, "Accepted");
                  toast.success(`Hired ${ap.freelancerName} for this project!`);
                }}
              >
                ✓ Select & Hire
              </button>
              <button
                className="cl-btn-danger"
                onClick={() => {
                  onUpdateStatus(ap.id, "Rejected");
                  toast.error(`Application marked as rejected.`);
                }}
              >
                Decline
              </button>
            </div>
          </div>
        ))}

        {filteredApps.length === 0 && (
          <div className="cl-empty-state">
            <div style={{ fontSize: "3rem" }}>👥</div>
            <h3>No applications in this category</h3>
            <p>
              When freelancers apply from the Freelancer Portal, their proposals will
              appear here automatically.
            </p>
          </div>
        )}
      </div>

      {/* Full Proposal Modal */}
      {applicantModal && (
        <div className="cl-overlay" onClick={() => setApplicantModal(null)}>
          <div className="cl-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cl-modal-hdr">
              <h2>Proposal from {applicantModal.freelancerName}</h2>
              <button
                className="cl-modal-close"
                onClick={() => setApplicantModal(null)}
              >
                ✕
              </button>
            </div>

            <div className="cl-modal-user-row">
              <div className="cl-ap-av lg">{applicantModal.freelancerAvatar}</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>
                  {applicantModal.freelancerName}
                </div>
                <div style={{ color: "#2563EB", fontSize: "0.85rem", fontWeight: 600 }}>
                  {applicantModal.freelancerTitle}
                </div>
                <Stars rating={applicantModal.freelancerRating || 4.9} />
              </div>
            </div>

            <div className="cl-modal-bid-grid">
              <div>
                <span>Proposed Amount:</span>
                <strong>{applicantModal.expectedPrice}</strong>
              </div>
              <div>
                <span>Delivery Time:</span>
                <strong>{applicantModal.estimatedTimeline}</strong>
              </div>
              <div>
                <span>Current Status:</span>
                <strong>{applicantModal.status}</strong>
              </div>
            </div>

            <div style={{ margin: "1.25rem 0" }}>
              <h4 style={{ color: "#0F172A", marginBottom: "0.5rem" }}>Cover Letter</h4>
              <p className="cl-modal-cover-text">{applicantModal.coverLetter}</p>
            </div>

            <div className="cl-modal-actions">
              <button
                className="cl-btn-outline"
                onClick={() => setApplicantModal(null)}
              >
                Close
              </button>
              <button
                className="cl-btn-primary"
                onClick={() => {
                  onUpdateStatus(applicantModal.id, "Accepted");
                  setApplicantModal(null);
                  toast.success(`Hired ${applicantModal.freelancerName}!`);
                }}
              >
                Hire Freelancer Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationsTab({ notifs, onMarkAllRead }) {
  return (
    <div className="cl-fade">
      <div className="cl-page-hdr">
        <div>
          <h1 className="cl-page-title">Client Notifications</h1>
          <p className="cl-subtitle">Real-time alerts for incoming bids and project milestones</p>
        </div>
        <button className="cl-btn-outline" onClick={onMarkAllRead}>
          Mark all as read
        </button>
      </div>

      <div className="cl-notif-feed detailed">
        {notifs.map((n) => (
          <div key={n.id} className={`cl-notif-feed-item ${!n.read ? "unread" : ""}`}>
            <span className="cl-feed-icon">{n.icon || "🔔"}</span>
            <div style={{ flex: 1 }}>
              <div className="cl-feed-title">{n.title || "Notification"}</div>
              <div className="cl-feed-msg">{n.message || n.msg}</div>
              <div className="cl-feed-time">{n.time}</div>
            </div>
            {!n.read && <div className="cl-feed-unread-dot"></div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileTab() {
  return (
    <div className="cl-fade">
      <div className="cl-page-hdr">
        <div>
          <h1 className="cl-page-title">Company Profile</h1>
          <p className="cl-subtitle">Manage your corporate credentials and account settings</p>
        </div>
        <button
          className="cl-btn-primary"
          onClick={() => toast.success("Company profile updated successfully!")}
        >
          Edit Company Profile
        </button>
      </div>

      <div className="cl-profile-grid">
        <div>
          <div className="cl-card" style={{ textAlign: "center" }}>
            <div className="cl-co-avatar">TV</div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0F172A" }}>
              TechVentures Inc.
            </h2>
            <div style={{ fontSize: "0.85rem", color: "#64748B", margin: "0.25rem 0" }}>
              Enterprise SaaS & Mobile Solutions
            </div>
            <div style={{ fontSize: "0.8rem", color: "#64748B" }}>📍 San Francisco, USA</div>

            <div className="cl-co-stats-row">
              <div>
                <strong>8</strong>
                <span>Jobs Posted</span>
              </div>
              <div>
                <strong>₹14,50,000</strong>
                <span>Total Spent</span>
              </div>
              <div>
                <strong>4.9 ★</strong>
                <span>Client Rating</span>
              </div>
            </div>
          </div>

          <div className="cl-card">
            <h3 style={{ fontSize: "0.95rem", fontWeight: 800, marginBottom: "0.75rem" }}>
              Contact Information
            </h3>
            <div className="cl-contact-rows">
              <div>
                <span>📧</span>
                <span>contact@techventures.io</span>
              </div>
              <div>
                <span>🌐</span>
                <span>https://www.techventures.io</span>
              </div>
              <div>
                <span>📞</span>
                <span>+1 (415) 555-0199</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="cl-card">
            <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "0.75rem" }}>
              About TechVentures
            </h3>
            <p style={{ color: "#64748B", fontSize: "0.88rem", lineHeight: 1.7 }}>
              TechVentures Inc. is a venture-backed technology incubator building modern
              cloud-native applications for high-growth startups. We frequently contract
              top-performing independent developers and designers for dedicated feature
              sprints. We offer competitive rates and prompt milestone releases.
            </p>
          </div>

          <div className="cl-card">
            <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "1rem" }}>
              Hiring Preferences
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {["Full-Stack React/Node", "Figma Design Systems", "AWS Cloud", "Python ML", "Kubernetes"].map(
                (pref) => (
                  <span key={pref} className="cl-chip">
                    {pref}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClientDashboard() {
  const [tab, setTab] = useState("overview");

  const {
    jobs,
    applications,
    activeProjects,
    completedProjects,
    notifications,
    postJob,
    updateApplicationStatus,
    markNotificationsRead
  } = useMarketplaceStore();

  const clientNotifs = notifications.client || [];
  const unreadCount = clientNotifs.filter((n) => !n.read).length;

  const setActive = (t) => setTab(t);

  const renderTab = () => {
    switch (tab) {
      case "overview":
        return (
          <OverviewTab
            setActive={setActive}
            jobs={jobs}
            applications={applications}
            activeProjects={activeProjects}
            completedProjects={completedProjects}
            notifs={clientNotifs}
            onSelectApplicant={updateApplicationStatus}
          />
        );
      case "jobs":
        return (
          <JobsTab
            setActive={setActive}
            jobs={jobs}
            applications={applications}
          />
        );
      case "create":
        return <CreateJobTab onPublishJob={postJob} setActive={setActive} />;
      case "applicants":
        return (
          <ApplicantsTab
            jobs={jobs}
            applications={applications}
            onUpdateStatus={updateApplicationStatus}
          />
        );
      case "active":
        return (
          <div className="cl-fade">
            <div className="cl-page-hdr">
              <div>
                <h1 className="cl-page-title">Active Projects & Contracts</h1>
                <p className="cl-subtitle">Ongoing contracts currently in execution</p>
              </div>
            </div>
            <div className="cl-jobs-grid">
              {activeProjects.map((p) => (
                <div key={p.id} className="cl-job-card detailed">
                  <div className="cl-job-top">
                    <h3 className="cl-job-title">{p.title}</h3>
                    <StatusBadge status="In Progress" />
                  </div>
                  <div className="cl-job-meta">
                    <span>👤 Freelancer: {p.freelancerName || "Alex Johnson"}</span>
                    <span>💰 Budget: {p.budget}</span>
                    <span>📅 Due {p.deadline}</span>
                  </div>
                  <div className="cl-progress-wrap">
                    <div className="cl-progress-bar">
                      <div
                        className="cl-progress-fill"
                        style={{ width: `${p.progress || 50}%` }}
                      ></div>
                    </div>
                    <span>{p.progress || 50}% complete</span>
                  </div>
                  <div className="cl-job-actions">
                    <button
                      className="cl-btn-sm"
                      onClick={() => toast.success(`Viewing workspace for ${p.title}`)}
                    >
                      Project Workspace
                    </button>
                    <button
                      className="cl-btn-primary"
                      onClick={() => toast.success("Chat opened with freelancer")}
                    >
                      Message Freelancer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "completed":
        return (
          <div className="cl-fade">
            <div className="cl-page-hdr">
              <div>
                <h1 className="cl-page-title">Completed Projects</h1>
                <p className="cl-subtitle">Successfully finalized engagements</p>
              </div>
            </div>
            <div className="cl-jobs-grid">
              {completedProjects.map((p) => (
                <div key={p.id} className="cl-job-card">
                  <div className="cl-job-top">
                    <h3 className="cl-job-title">{p.title}</h3>
                    <StatusBadge status="Completed" />
                  </div>
                  <div className="cl-job-meta">
                    <span>👤 {p.freelancerName || "Alex Johnson"}</span>
                    <span>💰 Paid: {p.amount}</span>
                    <span>📅 {p.completedDate}</span>
                  </div>
                  <Stars rating={p.rating || 5} />
                </div>
              ))}
            </div>
          </div>
        );
      case "messages":
        return (
          <div className="cl-fade">
            <div className="cl-page-hdr">
              <h1 className="cl-page-title">Client Messaging Center</h1>
            </div>
            <div className="cl-msg-box">
              <div className="cl-msg-sidebar">
                {["Alex Johnson", "Sarah Chen", "Raj Patel"].map((name, i) => (
                  <div
                    key={name}
                    className={`cl-msg-peer ${i === 0 ? "active" : ""}`}
                  >
                    <div className="cl-ap-av sm">{name[0]}</div>
                    <div>
                      <div className="cl-peer-name">{name}</div>
                      <div className="cl-peer-last">Proposal discussion active...</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="cl-msg-chat">
                <div style={{ fontSize: "3rem" }}>💬</div>
                <h3>Active Client Messaging</h3>
                <p style={{ color: "#64748B" }}>
                  Chat directly with candidates to negotiate rates, review milestones, and discuss delivery.
                </p>
              </div>
            </div>
          </div>
        );
      case "notifications":
        return (
          <NotificationsTab
            notifs={clientNotifs}
            onMarkAllRead={() => markNotificationsRead("client")}
          />
        );
      case "profile":
        return <ProfileTab />;
      default:
        return (
          <OverviewTab
            setActive={setActive}
            jobs={jobs}
            applications={applications}
            activeProjects={activeProjects}
            completedProjects={completedProjects}
            notifs={clientNotifs}
            onSelectApplicant={updateApplicationStatus}
          />
        );
    }
  };

  return (
    <div className="cl-dashboard-wrapper">
      {/* Universal Top Dashboard Switcher */}
      <DashboardSwitcher currentDashboard="client" />

      <div className="cl-dashboard">
        <Sidebar
          active={tab}
          setActive={setActive}
          unread={unreadCount}
          totalJobs={jobs.length}
          applicantsCount={applications.length}
        />

        <main className="cl-main">
          <div className="cl-topbar">
            <div className="cl-topbar-left">
              <span className="cl-role-tag">CLIENT & OWNER PORTAL</span>
              <span className="cl-topbar-title">
                {tab.charAt(0).toUpperCase() + tab.slice(1).replace("-", " ")}
              </span>
            </div>
            <div className="cl-topbar-right">
              <button
                className="cl-topbar-btn"
                onClick={() => setActive("notifications")}
                title="Notifications"
              >
                🔔
                {unreadCount > 0 && <span className="cl-top-badge">{unreadCount}</span>}
              </button>
              <div
                className="cl-topbar-av"
                onClick={() => setActive("profile")}
                title="Company Account"
              >
                TV
              </div>
            </div>
          </div>

          <div className="cl-content">{renderTab()}</div>
        </main>
      </div>
    </div>
  );
}
