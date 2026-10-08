import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import "./ClientDashboard.css";
import {
  getJobs, getApplications, addJob, updateApplicationStatus,
  CATEGORIES, SKILLS_OPTIONS, STATUS_CONFIG
} from "../data/freelanceData";

const CLIENT_ID = "c1";
const CLIENT_NAME = "TechVentures Inc.";
const CLIENT_AVATAR = "TV";

const NAV_ITEMS = [
  { id: "overview", icon: "📊", label: "Dashboard" },
  { id: "post-job", icon: "➕", label: "Post a Job" },
  { id: "my-jobs", icon: "💼", label: "My Jobs", badge: null },
  { id: "applications", icon: "📥", label: "Applications", badge: null },
  { id: "analytics", icon: "📈", label: "Analytics" },
  { id: "messages", icon: "💬", label: "Messages", badge: 2 },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

const PIPELINE_STEPS = ["draft","published","applications_received","freelancer_selected","in_progress","completed"];
const PIPELINE_LABELS = ["Draft","Published","Applications","Selected","In Progress","Completed"];

const MOCK_MESSAGES = [
  { id: "m1", from: "Arjun Sharma", avatar: "AS", preview: "I can start next Monday!", time: "5m ago", msgs: [
    { out: false, text: "Hi! I saw my application was shortlisted." },
    { out: true, text: "Yes! Your portfolio is impressive." },
    { out: false, text: "I can start next Monday!" },
  ]},
  { id: "m2", from: "Priya Nair", avatar: "PN", preview: "Please check my portfolio link", time: "2h ago", msgs: [
    { out: false, text: "Hello! Just wanted to follow up on my application." },
    { out: true, text: "We're reviewing your proposal." },
    { out: false, text: "Please check my portfolio link — I added new work." },
  ]},
];

const STATUS_OPTIONS = ["draft","published","applications_received","freelancer_selected","in_progress","completed"];

function Stars({ rating }) {
  const n = Math.round(rating || 5);
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= n ? "#F59E0B" : "#CBD5E1", fontSize: "0.85rem" }}>{i <= n ? "★" : "☆"}</span>)}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    draft: "Draft", published: "Published", applications_received: "Receiving Apps",
    freelancer_selected: "Selected", in_progress: "In Progress", completed: "Completed",
    applied: "Applied", under_review: "Under Review", shortlisted: "Shortlisted",
    accepted: "Accepted", rejected: "Rejected",
  };
  const clsMap = {
    published: "published", draft: "draft", applications_received: "applications_received",
    freelancer_selected: "freelancer_selected", in_progress: "in_progress", completed: "completed",
    applied: "published", under_review: "applications_received", shortlisted: "freelancer_selected",
    accepted: "in_progress", rejected: "draft",
  };
  return <span className={`cd-status ${clsMap[status] || "draft"}`}>● {map[status] || status}</span>;
}

const EMPTY_JOB = {
  title: "", description: "", category: "Web Development", skills: [],
  budgetMin: "", budgetMax: "", deadline: "", location: "Remote", isRemote: true,
};

export default function ClientDashboard() {
  const [activeNav, setActiveNav] = useState("overview");
  const [jobs, setJobs] = useState(() => getJobs().filter(j => j.clientId === CLIENT_ID));
  const [allJobs, setAllJobs] = useState(() => getJobs());
  const [applications, setApplications] = useState(() => getApplications());
  const [newJob, setNewJob] = useState({ ...EMPTY_JOB });
  const [skillInput, setSkillInput] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [viewApplicants, setViewApplicants] = useState(null);
  const [activeMsg, setActiveMsg] = useState(MOCK_MESSAGES[0]);
  const [chatInput, setChatInput] = useState("");
  const [jobFilter, setJobFilter] = useState("all");
  const [formErrors, setFormErrors] = useState({});

  function refreshData() {
    setJobs(getJobs().filter(j => j.clientId === CLIENT_ID));
    setAllJobs(getJobs());
    setApplications(getApplications());
  }

  function addSkill(skill) {
    const s = skill.trim();
    if (!s || newJob.skills.includes(s)) return;
    setNewJob(j => ({ ...j, skills: [...j.skills, s] }));
    setSkillInput("");
  }

  function removeSkill(skill) {
    setNewJob(j => ({ ...j, skills: j.skills.filter(s => s !== skill) }));
  }

  function validateJob() {
    const errors = {};
    if (!newJob.title.trim()) errors.title = "Title is required";
    if (!newJob.description.trim()) errors.description = "Description is required";
    if (!newJob.budgetMin) errors.budgetMin = "Min budget required";
    if (!newJob.budgetMax) errors.budgetMax = "Max budget required";
    if (!newJob.deadline) errors.deadline = "Deadline is required";
    if (newJob.skills.length === 0) errors.skills = "At least one skill required";
    return errors;
  }

  function handlePublishJob() {
    const errors = validateJob();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fix the form errors.");
      return;
    }
    addJob({
      title: newJob.title, description: newJob.description,
      category: newJob.category, skills: newJob.skills,
      budget: { min: Number(newJob.budgetMin), max: Number(newJob.budgetMax), currency: "USD" },
      deadline: newJob.deadline, location: newJob.location || "Remote",
      isRemote: newJob.isRemote, status: "published",
      clientId: CLIENT_ID, clientName: CLIENT_NAME, clientAvatar: CLIENT_AVATAR,
      clientRating: 4.8, clientJobsPosted: jobs.length + 1, featured: false,
    });
    refreshData();
    setNewJob({ ...EMPTY_JOB });
    setFormErrors({});
    setActiveNav("my-jobs");
    toast.success("🎉 Job published successfully!");
  }

  function handleSaveDraft() {
    if (!newJob.title.trim()) { toast.error("Please add a job title."); return; }
    addJob({
      ...newJob,
      budget: { min: Number(newJob.budgetMin) || 0, max: Number(newJob.budgetMax) || 0, currency: "USD" },
      status: "draft", clientId: CLIENT_ID, clientName: CLIENT_NAME,
      clientAvatar: CLIENT_AVATAR, clientRating: 4.8, clientJobsPosted: jobs.length + 1,
      skills: newJob.skills, featured: false,
    });
    refreshData();
    setNewJob({ ...EMPTY_JOB });
    toast.success("Draft saved!");
  }

  function handleUpdateStatus(app, newStatus) {
    updateApplicationStatus(app.id, newStatus, newStatus === "accepted" ? "Great fit!" : newStatus === "shortlisted" ? "Promising candidate" : "");
    refreshData();
    toast.success(`Application marked as ${newStatus}.`);
  }

  const filteredJobs = useMemo(() => {
    if (jobFilter === "all") return jobs;
    return jobs.filter(j => j.status === jobFilter);
  }, [jobs, jobFilter]);

  const totalApplicants = applications.filter(a => jobs.some(j => j.id === a.jobId)).length;
  const activeJobs = jobs.filter(j => ["published","applications_received","in_progress"].includes(j.status)).length;
  const completedJobs = jobs.filter(j => j.status === "completed").length;

  function renderContent() {
    switch (activeNav) {
      case "overview": return renderOverview();
      case "post-job": return renderPostJob();
      case "my-jobs": return renderMyJobs();
      case "applications": return renderApplications();
      case "analytics": return renderAnalytics();
      case "messages": return renderMessages();
      case "settings": return renderSettings();
      default: return renderOverview();
    }
  }

  function renderOverview() {
    return (
      <div>
        <div className="cd-stats">
          {[
            { label: "Jobs Posted", value: jobs.length, icon: "💼", color: "#EFF6FF", iconBg: "#2563EB", sub: "+1 this month", subColor: "#2563EB" },
            { label: "Active Jobs", value: activeJobs, icon: "⚡", color: "#ECFDF5", iconBg: "#10B981", sub: "Currently live", subColor: "#10B981" },
            { label: "Total Applicants", value: totalApplicants, icon: "👥", color: "#FFFBEB", iconBg: "#F59E0B", sub: `Across ${jobs.length} jobs`, subColor: "#D97706" },
            { label: "Completed Jobs", value: completedJobs, icon: "✅", color: "#F5F3FF", iconBg: "#7C3AED", sub: "Successfully done", subColor: "#7C3AED" },
          ].map((s, i) => (
            <div key={i} className="cd-stat-card">
              <div className="cd-stat-icon" style={{ background: s.color }}>
                <span style={{ fontSize: "1.3rem" }}>{s.icon}</span>
              </div>
              <div>
                <div className="cd-stat-label">{s.label}</div>
                <div className="cd-stat-value">{s.value}</div>
                <div className="cd-stat-sub" style={{ color: s.subColor }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "1.25rem" }}>
          <div className="cd-card" style={{ padding: "1.25rem" }}>
            <div className="cd-section-header">
              <div><div className="cd-section-title">Recent Job Posts</div></div>
              <button className="cd-topbar-btn cd-btn-outline cd-btn-sm" onClick={() => setActiveNav("my-jobs")}>View All</button>
            </div>
            {jobs.slice(0, 3).map(job => {
              const appCount = applications.filter(a => a.jobId === job.id).length;
              return (
                <div key={job.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.875rem 0", borderBottom: "1px solid var(--cd-card-border)" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{job.title}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--cd-text-muted)", marginTop: "3px" }}>{appCount} applicants · {job.deadline}</div>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
              );
            })}
            <button className="cd-topbar-btn cd-btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "0.875rem" }} onClick={() => setActiveNav("post-job")}>➕ Post New Job</button>
          </div>

          <div className="cd-card" style={{ padding: "1.25rem" }}>
            <div className="cd-section-header"><div className="cd-section-title">Job Status Pipeline</div></div>
            {jobs.slice(0, 4).map(job => (
              <div key={job.id} style={{ marginBottom: "0.875rem" }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.35rem", color: "var(--cd-text)" }}>{job.title.substring(0, 35)}...</div>
                <div className="cd-pipeline" style={{ marginBottom: 0, overflowX: "auto" }}>
                  {PIPELINE_STEPS.map((step, idx) => {
                    const stepIdx = PIPELINE_STEPS.indexOf(job.status);
                    const cls = idx < stepIdx ? "done" : idx === stepIdx ? "active" : "pending";
                    return (
                      <div key={step} className="cd-pipeline-step">
                        {idx > 0 && <span className="cd-pipeline-arrow">›</span>}
                        <div className={`cd-pipeline-node ${cls}`}>{PIPELINE_LABELS[idx]}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderPostJob() {
    return (
      <div>
        <div className="cd-section-header">
          <div><div className="cd-section-title">Post a New Job</div><div className="cd-section-sub">Fill in the details to attract the best freelancers</div></div>
        </div>
        <div className="cd-card" style={{ padding: "1.75rem", maxWidth: "860px" }}>
          <div className="cd-form-group">
            <label className="cd-form-label">Job Title *</label>
            <input
              className="cd-form-input"
              placeholder="e.g. Build a full-stack e-commerce website"
              value={newJob.title}
              onChange={e => { setNewJob(j => ({ ...j, title: e.target.value })); setFormErrors(f => ({ ...f, title: "" })); }}
            />
            {formErrors.title && <span className="cd-form-error">{formErrors.title}</span>}
          </div>
          <div className="cd-form-group">
            <label className="cd-form-label">Describe the Job / Problem *</label>
            <textarea
              className="cd-form-textarea"
              placeholder="Describe the work in detail. What's the problem? What's the expected solution? What technologies should be used?"
              value={newJob.description}
              onChange={e => { setNewJob(j => ({ ...j, description: e.target.value })); setFormErrors(f => ({ ...f, description: "" })); }}
              style={{ minHeight: "160px" }}
            />
            {formErrors.description && <span className="cd-form-error">{formErrors.description}</span>}
          </div>
          <div className="cd-form-row">
            <div className="cd-form-group">
              <label className="cd-form-label">Category *</label>
              <select className="cd-form-select" value={newJob.category} onChange={e => setNewJob(j => ({ ...j, category: e.target.value }))}>
                {CATEGORIES.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="cd-form-group">
              <label className="cd-form-label">Deadline *</label>
              <input type="date" className="cd-form-input" value={newJob.deadline} onChange={e => { setNewJob(j => ({ ...j, deadline: e.target.value })); setFormErrors(f => ({ ...f, deadline: "" })); }} />
              {formErrors.deadline && <span className="cd-form-error">{formErrors.deadline}</span>}
            </div>
          </div>
          <div className="cd-form-group">
            <label className="cd-form-label">Required Skills * {formErrors.skills && <span className="cd-form-error">&nbsp;– {formErrors.skills}</span>}</label>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <select className="cd-form-select" style={{ flex: 1 }} value={skillInput} onChange={e => setSkillInput(e.target.value)}>
                <option value="">Select a skill...</option>
                {SKILLS_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
              <button className="cd-topbar-btn cd-btn-primary" onClick={() => addSkill(skillInput)}>+ Add</button>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <input className="cd-form-input" style={{ flex: 1 }} placeholder="Or type a custom skill..." value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { addSkill(skillInput); } }} />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {newJob.skills.map(s => (
                <span key={s} className="cd-skill-tag-rm" onClick={() => removeSkill(s)}>{s} ✕</span>
              ))}
            </div>
          </div>
          <div className="cd-form-row">
            <div className="cd-form-group">
              <label className="cd-form-label">Minimum Budget (USD) *</label>
              <input type="number" className="cd-form-input" placeholder="e.g. 1000" value={newJob.budgetMin} onChange={e => { setNewJob(j => ({ ...j, budgetMin: e.target.value })); setFormErrors(f => ({ ...f, budgetMin: "" })); }} />
              {formErrors.budgetMin && <span className="cd-form-error">{formErrors.budgetMin}</span>}
            </div>
            <div className="cd-form-group">
              <label className="cd-form-label">Maximum Budget (USD) *</label>
              <input type="number" className="cd-form-input" placeholder="e.g. 5000" value={newJob.budgetMax} onChange={e => { setNewJob(j => ({ ...j, budgetMax: e.target.value })); setFormErrors(f => ({ ...f, budgetMax: "" })); }} />
              {formErrors.budgetMax && <span className="cd-form-error">{formErrors.budgetMax}</span>}
            </div>
          </div>
          <div className="cd-form-row">
            <div className="cd-form-group">
              <label className="cd-form-label">Location</label>
              <input className="cd-form-input" placeholder="e.g. New York, USA" value={newJob.location} onChange={e => setNewJob(j => ({ ...j, location: e.target.value }))} disabled={newJob.isRemote} />
            </div>
            <div className="cd-form-group">
              <label className="cd-form-label">Work Type</label>
              <div className="cd-toggle-row">
                <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>Remote Work</span>
                <div className={`cd-toggle ${newJob.isRemote ? "on" : ""}`} onClick={() => setNewJob(j => ({ ...j, isRemote: !j.isRemote, location: !j.isRemote ? "Remote" : "" }))} />
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--cd-card-border)" }}>
            <button className="cd-topbar-btn cd-btn-outline" onClick={handleSaveDraft}>💾 Save as Draft</button>
            <button className="cd-topbar-btn cd-btn-primary" onClick={handlePublishJob}>🚀 Publish Job</button>
          </div>
        </div>
      </div>
    );
  }

  function renderMyJobs() {
    return (
      <div>
        <div className="cd-section-header">
          <div><div className="cd-section-title">My Jobs</div><div className="cd-section-sub">{filteredJobs.length} of {jobs.length} jobs shown</div></div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="cd-topbar-btn cd-btn-primary" onClick={() => setActiveNav("post-job")}>➕ Post New Job</button>
          </div>
        </div>
        <div className="cd-tabs">
          {[["all","All"],["published","Published"],["applications_received","Receiving Apps"],["in_progress","In Progress"],["completed","Completed"],["draft","Drafts"]].map(([v, l]) => (
            <button key={v} className={`cd-tab ${jobFilter === v ? "active" : ""}`} onClick={() => setJobFilter(v)}>{l}</button>
          ))}
        </div>
        <div className="cd-job-list">
          {filteredJobs.length === 0 ? (
            <div className="cd-empty"><div className="cd-empty-icon">💼</div><div className="cd-empty-text">No jobs in this category. <span style={{ color: "var(--cd-accent)", cursor: "pointer" }} onClick={() => setActiveNav("post-job")}>Post a new job.</span></div></div>
          ) : filteredJobs.map(job => {
            const appCount = applications.filter(a => a.jobId === job.id).length;
            const shortlisted = applications.filter(a => a.jobId === job.id && a.status === "shortlisted").length;
            return (
              <div key={job.id} className="cd-job-card">
                <div className="cd-job-header">
                  <div style={{ flex: 1 }}>
                    <div className="cd-job-category">{job.category}</div>
                    <div className="cd-job-title">{job.title}</div>
                    <div className="cd-job-desc">{job.description}</div>
                    <div className="cd-job-meta">
                      <span className="cd-meta-pill">💵 ${job.budget.min.toLocaleString()} – ${job.budget.max.toLocaleString()}</span>
                      <span className="cd-meta-pill">⏰ {job.deadline}</span>
                      <span className="cd-meta-pill">📍 {job.location}</span>
                      <span className="cd-meta-pill" style={{ background: "#ECFDF5", color: "#059669" }}>👥 {appCount} applicants</span>
                      {shortlisted > 0 && <span className="cd-meta-pill" style={{ background: "#F5F3FF", color: "#7C3AED" }}>⭐ {shortlisted} shortlisted</span>}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.75rem" }}>
                      {job.skills.map(s => <span key={s} className="cd-skill-tag">{s}</span>)}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                    <StatusBadge status={job.status} />
                    <div style={{ fontSize: "0.72rem", color: "var(--cd-text-muted)" }}>Posted {job.postedAt}</div>
                  </div>
                </div>
                <div className="cd-job-actions">
                  <button className="cd-topbar-btn cd-btn-outline cd-btn-xs" onClick={() => setViewApplicants(job)}>
                    📥 View Applicants ({appCount})
                  </button>
                  <a href="/selection-dashboard" className="cd-topbar-btn cd-btn-outline cd-btn-xs" style={{ textDecoration: "none", display: "inline-flex" }}>🎯 Find Freelancers</a>
                  <div className="cd-job-actions-right">
                    <select className="cd-form-select" style={{ padding: "0.3rem 0.65rem", fontSize: "0.72rem" }} value={job.status} onChange={e => { updateApplicationStatus(job.id, e.target.value); refreshData(); toast.success("Status updated!"); }}>
                      {PIPELINE_STEPS.map((s, i) => <option key={s} value={s}>{PIPELINE_LABELS[i]}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderApplications() {
    const clientJobIds = new Set(jobs.map(j => j.id));
    const clientApps = applications.filter(a => clientJobIds.has(a.jobId));
    return (
      <div>
        <div className="cd-section-header">
          <div><div className="cd-section-title">All Applications Received</div><div className="cd-section-sub">{clientApps.length} total applications across your jobs</div></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.875rem", marginBottom: "1.5rem" }}>
          {[["applied","New",clientApps.filter(a=>a.status==="applied").length,"#2563EB","#EFF6FF"],["under_review","Under Review",clientApps.filter(a=>a.status==="under_review").length,"#D97706","#FFFBEB"],["shortlisted","Shortlisted",clientApps.filter(a=>a.status==="shortlisted").length,"#7C3AED","#F5F3FF"],["accepted","Accepted",clientApps.filter(a=>a.status==="accepted").length,"#059669","#ECFDF5"]].map(([s,l,c,col,bg]) => (
            <div key={s} style={{ background:bg, border:`1.5px solid ${col}30`, borderRadius:"12px", padding:"1rem", textAlign:"center" }}>
              <div style={{ fontSize:"1.5rem", fontWeight:800, color:col }}>{c}</div>
              <div style={{ fontSize:"0.72rem", color:col, marginTop:"4px", fontWeight:600 }}>{l}</div>
            </div>
          ))}
        </div>
        {jobs.map(job => {
          const jobApps = applications.filter(a => a.jobId === job.id);
          if (!jobApps.length) return null;
          return (
            <div key={job.id} style={{ marginBottom: "1.75rem" }}>
              <div style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                {job.title} <StatusBadge status={job.status} /> <span style={{ color: "var(--cd-text-muted)", fontSize: "0.78rem" }}>({jobApps.length} apps)</span>
              </div>
              {jobApps.map(app => (
                <div key={app.id} className="cd-applicant-card">
                  <div className="cd-applicant-header">
                    <div className="cd-applicant-avatar">{app.freelancerAvatar}</div>
                    <div style={{ flex: 1 }}>
                      <div className="cd-applicant-name">{app.freelancerName}</div>
                      <div className="cd-applicant-title">{app.freelancerTitle}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="cd-applicant-bid">${app.proposedPrice?.toLocaleString()}</div>
                      <div className="cd-applicant-time">⏱ {app.estimatedTime}</div>
                      <div style={{ marginTop: "0.4rem" }}><StatusBadge status={app.status} /></div>
                    </div>
                  </div>
                  <div className="cd-cover-letter">"{app.coverLetter}"</div>
                  {app.clientNote && <div style={{ fontSize: "0.78rem", color: "var(--cd-text-mid)", fontStyle: "italic", marginBottom: "0.5rem" }}>📝 Note: {app.clientNote}</div>}
                  <div className="cd-applicant-actions">
                    {app.status !== "accepted" && <button className="cd-topbar-btn cd-btn-success cd-btn-xs" onClick={() => handleUpdateStatus(app, "accepted")}>✓ Accept</button>}
                    {app.status !== "shortlisted" && app.status !== "accepted" && <button className="cd-topbar-btn cd-btn-outline cd-btn-xs" onClick={() => handleUpdateStatus(app, "shortlisted")} style={{ borderColor: "#7C3AED", color: "#7C3AED" }}>⭐ Shortlist</button>}
                    {app.status !== "under_review" && app.status !== "accepted" && <button className="cd-topbar-btn cd-btn-outline cd-btn-xs" onClick={() => handleUpdateStatus(app, "under_review")}>🔍 Under Review</button>}
                    {app.status !== "rejected" && <button className="cd-topbar-btn cd-btn-danger cd-btn-xs" onClick={() => handleUpdateStatus(app, "rejected")}>✕ Reject</button>}
                    <div style={{ marginLeft: "auto" }}>
                      <button className="cd-topbar-btn cd-btn-outline cd-btn-xs" onClick={() => setActiveMsg(MOCK_MESSAGES[0]) || setActiveNav("messages")}>💬 Message</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  }

  function renderAnalytics() {
    const total = jobs.length;
    return (
      <div>
        <div className="cd-section-header"><div className="cd-section-title">Analytics & Insights</div></div>
        <div className="cd-stats">
          <div className="cd-stat-card"><div className="cd-stat-icon" style={{ background: "#EFF6FF" }}>📊</div><div><div className="cd-stat-label">Total Jobs</div><div className="cd-stat-value">{total}</div></div></div>
          <div className="cd-stat-card"><div className="cd-stat-icon" style={{ background: "#ECFDF5" }}>✅</div><div><div className="cd-stat-label">Completed</div><div className="cd-stat-value">{completedJobs}</div></div></div>
          <div className="cd-stat-card"><div className="cd-stat-icon" style={{ background: "#FFFBEB" }}>👥</div><div><div className="cd-stat-label">Total Applicants</div><div className="cd-stat-value">{totalApplicants}</div></div></div>
          <div className="cd-stat-card"><div className="cd-stat-icon" style={{ background: "#F5F3FF" }}>💰</div><div><div className="cd-stat-label">Money Spent</div><div className="cd-stat-value">$8,300</div></div></div>
        </div>
        <div className="cd-analytics-grid">
          <div className="cd-chart-card">
            <div className="cd-section-header"><div className="cd-section-title">Jobs by Status</div></div>
            {PIPELINE_STEPS.map((s, i) => {
              const cnt = jobs.filter(j => j.status === s).length;
              const pct = total > 0 ? Math.round((cnt / total) * 100) : 0;
              const colors = ["#64748B","#2563EB","#D97706","#7C3AED","#059669","#94A3B8"];
              return (
                <div key={s} style={{ marginBottom: "0.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem", fontSize: "0.78rem" }}>
                    <span style={{ color: "var(--cd-text-mid)" }}>{PIPELINE_LABELS[i]}</span>
                    <span style={{ fontWeight: 600 }}>{cnt}</span>
                  </div>
                  <div style={{ height: "8px", background: "#F1F5F9", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: colors[i], borderRadius: "4px", transition: "width 0.6s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="cd-chart-card">
            <div className="cd-section-header"><div className="cd-section-title">Monthly Job Posts</div></div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "0.875rem", height: "120px" }}>
              {[{ m: "Jul", v: 1 },{ m: "Aug", v: 2 },{ m: "Sep", v: 3 },{ m: "Oct", v: jobs.length }].map(e => (
                <div key={e.m} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem" }}>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--cd-accent)" }}>{e.v}</span>
                  <div style={{ width: "100%", height: `${(e.v / 4) * 90}px`, background: "linear-gradient(to top, #2563EB, #0EA5E9)", borderRadius: "6px 6px 0 0" }} />
                  <span style={{ fontSize: "0.68rem", color: "var(--cd-text-muted)" }}>{e.m}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderMessages() {
    return (
      <div>
        <div className="cd-section-header"><div className="cd-section-title">Messages</div></div>
        <div className="cd-messages-layout">
          <div className="cd-msg-list">
            {MOCK_MESSAGES.map(m => (
              <div key={m.id} className={`cd-msg-item ${activeMsg?.id === m.id ? "active" : ""}`} onClick={() => setActiveMsg(m)}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #2563EB, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 700, color: "white", flexShrink: 0 }}>{m.avatar}</div>
                  <div className="cd-msg-name">{m.from}</div>
                  <div style={{ marginLeft: "auto", fontSize: "0.65rem", color: "var(--cd-text-muted)" }}>{m.time}</div>
                </div>
                <div className="cd-msg-preview">{m.preview}</div>
              </div>
            ))}
          </div>
          <div className="cd-chat-area">
            <div style={{ padding: "0.875rem", borderBottom: "1px solid var(--cd-card-border)", fontWeight: 600, fontSize: "0.875rem" }}>{activeMsg?.from}</div>
            <div className="cd-chat-msgs">
              {activeMsg?.msgs.map((m, i) => <div key={i} className={`cd-chat-bubble ${m.out ? "cd-bubble-out" : "cd-bubble-in"}`}>{m.text}</div>)}
            </div>
            <div className="cd-chat-input-row">
              <input className="cd-chat-input" placeholder="Type a message..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && chatInput.trim()) { toast.success("Message sent!"); setChatInput(""); } }} />
              <button className="cd-topbar-btn cd-btn-primary cd-btn-sm" onClick={() => { if (chatInput.trim()) { toast.success("Message sent!"); setChatInput(""); } }}>Send</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderSettings() {
    return (
      <div>
        <div className="cd-section-header"><div className="cd-section-title">Account Settings</div></div>
        <div className="cd-card" style={{ padding: "1.5rem", maxWidth: "600px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg, #2563EB, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: 700, color: "white" }}>{CLIENT_AVATAR}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{CLIENT_NAME}</div>
              <div style={{ color: "var(--cd-text-muted)", fontSize: "0.82rem" }}>client@techventures.com</div>
            </div>
          </div>
          <div className="cd-form-group"><label className="cd-form-label">Company Name</label><input className="cd-form-input" defaultValue={CLIENT_NAME} /></div>
          <div className="cd-form-group"><label className="cd-form-label">Email</label><input className="cd-form-input" defaultValue="client@techventures.com" /></div>
          <div className="cd-form-group"><label className="cd-form-label">Phone</label><input className="cd-form-input" defaultValue="+1 (555) 100-2000" /></div>
          <button className="cd-topbar-btn cd-btn-primary" onClick={() => toast.success("Settings saved!")}>Save Changes</button>
        </div>
      </div>
    );
  }

  const topbarTitle = NAV_ITEMS.find(n => n.id === activeNav)?.label || "Dashboard";

  return (
    <div className="cd-root">
      {/* Sidebar */}
      <aside className="cd-sidebar">
        <div className="cd-logo-area">
          <div className="cd-logo-row">
            <div className="cd-logo-icon">🏢</div>
            <div>
              <div className="cd-logo-name">FreelanceHub</div>
              <div className="cd-logo-role">Client Portal</div>
            </div>
          </div>
          <div className="cd-user-row">
            <div className="cd-user-avatar">{CLIENT_AVATAR}</div>
            <div>
              <div className="cd-user-name">{CLIENT_NAME}</div>
              <div className="cd-user-email">client@techventures.com</div>
            </div>
            <div className="cd-verified-badge">✅</div>
          </div>
        </div>
        <nav className="cd-nav">
          <div className="cd-nav-label">Main</div>
          {NAV_ITEMS.slice(0, 4).map(item => (
            <button key={item.id} className={`cd-nav-item ${activeNav === item.id ? "active" : ""}`} onClick={() => setActiveNav(item.id)}>
              <span className="cd-nav-icon">{item.icon}</span>
              {item.label}
              {item.badge && <span className="cd-nav-badge">{item.badge}</span>}
            </button>
          ))}
          <div className="cd-nav-label">Tools</div>
          {NAV_ITEMS.slice(4).map(item => (
            <button key={item.id} className={`cd-nav-item ${activeNav === item.id ? "active" : ""}`} onClick={() => setActiveNav(item.id)}>
              <span className="cd-nav-icon">{item.icon}</span>
              {item.label}
              {item.badge && <span className="cd-nav-badge">{item.badge}</span>}
            </button>
          ))}
          <div className="cd-nav-label">Navigation</div>
          <a href="/selection-dashboard" className="cd-nav-item" style={{ textDecoration: "none" }}><span className="cd-nav-icon">🎯</span>Talent Finder</a>
          <a href="/freelancer-dashboard" className="cd-nav-item" style={{ textDecoration: "none" }}><span className="cd-nav-icon">⚡</span>Freelancer View</a>
          <a href="/dashboards" className="cd-nav-item" style={{ textDecoration: "none" }}><span className="cd-nav-icon">🔀</span>All Dashboards</a>
        </nav>
      </aside>

      {/* Main */}
      <main className="cd-main">
        <div className="cd-topbar">
          <div className="cd-topbar-left">
            <div className="cd-topbar-title">{topbarTitle}</div>
            <div className="cd-topbar-sub">TechVentures Inc. · Client Account</div>
          </div>
          <div className="cd-topbar-right">
            <button className="cd-topbar-btn cd-btn-primary" onClick={() => setActiveNav("post-job")}>➕ Post a Job</button>
            <div className="cd-icon-btn">🔔<span className="cd-notif-dot" /></div>
            <div className="cd-icon-btn" onClick={() => setActiveNav("messages")}>💬</div>
          </div>
        </div>
        <div className="cd-content">{renderContent()}</div>
      </main>

      {/* Applicants Drawer Modal */}
      {viewApplicants && (
        <div className="cd-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setViewApplicants(null); }}>
          <div className="cd-modal">
            <div className="cd-modal-header">
              <div>
                <div className="cd-modal-title">Applicants: {viewApplicants.title}</div>
                <div className="cd-modal-subtitle">{applications.filter(a => a.jobId === viewApplicants.id).length} applications received</div>
              </div>
              <button className="cd-close-btn" onClick={() => setViewApplicants(null)}>✕</button>
            </div>
            <div className="cd-modal-body">
              {applications.filter(a => a.jobId === viewApplicants.id).length === 0 ? (
                <div className="cd-empty"><div className="cd-empty-icon">📭</div><div className="cd-empty-text">No applications yet for this job.</div></div>
              ) : applications.filter(a => a.jobId === viewApplicants.id).map(app => (
                <div key={app.id} className="cd-applicant-card">
                  <div className="cd-applicant-header">
                    <div className="cd-applicant-avatar">{app.freelancerAvatar}</div>
                    <div style={{ flex: 1 }}>
                      <div className="cd-applicant-name">{app.freelancerName}</div>
                      <div className="cd-applicant-title">{app.freelancerTitle}</div>
                      <div style={{ marginTop: "4px" }}><StatusBadge status={app.status} /></div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="cd-applicant-bid">${app.proposedPrice?.toLocaleString()}</div>
                      <div className="cd-applicant-time">⏱ {app.estimatedTime}</div>
                    </div>
                  </div>
                  <div className="cd-cover-letter">"{app.coverLetter}"</div>
                  <div className="cd-applicant-actions">
                    {app.status !== "accepted" && <button className="cd-topbar-btn cd-btn-success cd-btn-xs" onClick={() => { handleUpdateStatus(app, "accepted"); refreshData(); }}>✓ Accept</button>}
                    {app.status !== "shortlisted" && app.status !== "accepted" && <button className="cd-topbar-btn cd-btn-xs" style={{ background: "#F5F3FF", color: "#7C3AED", border: "1.5px solid #DDD6FE" }} onClick={() => { handleUpdateStatus(app, "shortlisted"); refreshData(); }}>⭐ Shortlist</button>}
                    {app.status !== "rejected" && <button className="cd-topbar-btn cd-btn-danger cd-btn-xs" onClick={() => { handleUpdateStatus(app, "rejected"); refreshData(); }}>✕ Reject</button>}
                  </div>
                </div>
              ))}
            </div>
            <div className="cd-modal-footer">
              <button className="cd-topbar-btn cd-btn-outline" onClick={() => setViewApplicants(null)}>Close</button>
              <a href="/selection-dashboard" className="cd-topbar-btn cd-btn-primary" style={{ textDecoration: "none" }}>🎯 Find Freelancers</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
