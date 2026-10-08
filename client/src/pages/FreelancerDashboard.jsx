import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import "./FreelancerDashboard.css";
import {
  getJobs, getFreelancers, getApplications, addApplication,
  CATEGORIES, STATUS_CONFIG
} from "../data/freelanceData";

const CURRENT_FREELANCER_ID = "f1";
const CURRENT_FREELANCER = getFreelancers().find(f => f.id === CURRENT_FREELANCER_ID);

const NAV_ITEMS = [
  { id: "overview", icon: "🏠", label: "Overview" },
  { id: "browse", icon: "🔍", label: "Browse Jobs", badge: null },
  { id: "applications", icon: "📋", label: "My Applications", badge: 5 },
  { id: "active", icon: "⚡", label: "Active Projects" },
  { id: "completed", icon: "✅", label: "Completed" },
  { id: "earnings", icon: "💰", label: "Earnings" },
  { id: "messages", icon: "💬", label: "Messages", badge: 2 },
  { id: "notifications", icon: "🔔", label: "Notifications", badge: 3 },
  { id: "profile", icon: "👤", label: "My Profile" },
];

const EARNINGS_DATA = [
  { month: "Jun", usd: 2100 },
  { month: "Jul", usd: 3400 },
  { month: "Aug", usd: 2900 },
  { month: "Sep", usd: 4200 },
  { month: "Oct", usd: 3800 },
];

const MOCK_MESSAGES = [
  { id: "m1", from: "TechVentures Inc.", avatar: "TV", preview: "When can you start?", time: "2m ago", msgs: [
    { out: false, text: "Hi Arjun! Your proposal looks great." },
    { out: true, text: "Thank you! I can start immediately." },
    { out: false, text: "When can you start?" },
  ]},
  { id: "m2", from: "FitLife Studio", avatar: "FL", preview: "Please review the brief", time: "1h ago", msgs: [
    { out: false, text: "We reviewed your portfolio, very impressive!" },
    { out: true, text: "Thanks a lot! Looking forward to working together." },
    { out: false, text: "Please review the brief we sent." },
  ]},
];

const MOCK_NOTIFICATIONS = [
  { id: "n1", type: "shortlisted", icon: "🎉", color: "#8B5CF6", msg: "Your application for E-Commerce Platform was shortlisted!", time: "2 hours ago", read: false },
  { id: "n2", type: "accepted", icon: "✅", color: "#10B981", msg: "Congratulations! You were accepted for Sales Analytics Dashboard!", time: "1 day ago", read: false },
  { id: "n3", type: "message", icon: "💬", color: "#3B82F6", msg: "TechVentures Inc. sent you a new message.", time: "2 days ago", read: true },
];

function Stars({ rating, size = "0.85rem" }) {
  const n = Math.round(rating);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= n ? "#F59E0B" : "#2D3A4F", fontSize: size }}>
          {i <= n ? "★" : "☆"}
        </span>
      ))}
    </span>
  );
}

function StatusBadge({ status }) {
  const config = {
    applied: { label: "Applied", cls: "applied" },
    under_review: { label: "Under Review", cls: "under_review" },
    shortlisted: { label: "Shortlisted", cls: "shortlisted" },
    accepted: { label: "Accepted", cls: "accepted" },
    rejected: { label: "Rejected", cls: "rejected" },
  };
  const c = config[status] || { label: status, cls: "applied" };
  return <span className={`fd-status-badge ${c.cls}`}>● {c.label}</span>;
}

export default function FreelancerDashboard() {
  const [activeNav, setActiveNav] = useState("browse");
  const [jobs, setJobs] = useState(() => getJobs());
  const [applications, setApplications] = useState(() =>
    getApplications().filter(a => a.freelancerId === CURRENT_FREELANCER_ID)
  );
  const [searchQ, setSearchQ] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [budgetFilter, setBudgetFilter] = useState("");
  const [locFilter, setLocFilter] = useState("all");
  const [skillFilter, setSkillFilter] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyModal, setApplyModal] = useState(null);
  const [proposal, setProposal] = useState({ price: "", time: "", cover: "" });
  const [activeMsg, setActiveMsg] = useState(MOCK_MESSAGES[0]);
  const [chatInput, setChatInput] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [profileEdit, setProfileEdit] = useState(false);
  const [profile, setProfile] = useState({ ...CURRENT_FREELANCER });

  const appliedJobIds = new Set(applications.map(a => a.jobId));

  const filteredJobs = useMemo(() => {
    return jobs.filter(j => {
      const qMatch = !searchQ || j.title.toLowerCase().includes(searchQ.toLowerCase()) ||
        j.description.toLowerCase().includes(searchQ.toLowerCase());
      const catMatch = catFilter === "All" || j.category === catFilter;
      const budgetMatch = !budgetFilter || (() => {
        const mid = (j.budget.min + j.budget.max) / 2;
        if (budgetFilter === "lt1000") return mid < 1000;
        if (budgetFilter === "1k3k") return mid >= 1000 && mid < 3000;
        if (budgetFilter === "3k5k") return mid >= 3000 && mid < 5000;
        if (budgetFilter === "gt5k") return mid >= 5000;
        return true;
      })();
      const locMatch = locFilter === "all" || (locFilter === "remote" ? j.isRemote : !j.isRemote);
      const skillMatch = !skillFilter || j.skills.some(s => s.toLowerCase().includes(skillFilter.toLowerCase()));
      return qMatch && catMatch && budgetMatch && locMatch && skillMatch;
    });
  }, [jobs, searchQ, catFilter, budgetFilter, locFilter, skillFilter]);

  function handleApply(job) {
    setApplyModal(job);
    setProposal({ price: job.budget.max, time: "2 weeks", cover: "" });
  }

  function submitProposal() {
    if (!proposal.price || !proposal.time || !proposal.cover.trim()) {
      toast.error("Please fill in all proposal fields.");
      return;
    }
    const newApp = addApplication({
      jobId: applyModal.id,
      freelancerId: CURRENT_FREELANCER_ID,
      freelancerName: profile.name,
      freelancerAvatar: profile.avatar,
      freelancerTitle: profile.title,
      coverLetter: proposal.cover,
      proposedPrice: Number(proposal.price),
      estimatedTime: proposal.time,
    });
    setApplications(prev => [...prev, newApp]);
    const updatedJobs = getJobs();
    setJobs(updatedJobs);
    setApplyModal(null);
    setSelectedJob(null);
    toast.success("🎉 Proposal submitted successfully!");
  }

  function toggleSkill(skill) {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  }

  const maxEarnings = Math.max(...EARNINGS_DATA.map(e => e.usd));

  function renderContent() {
    switch (activeNav) {
      case "overview": return renderOverview();
      case "browse": return renderBrowse();
      case "applications": return renderApplications();
      case "active": return renderActive();
      case "completed": return renderCompleted();
      case "earnings": return renderEarnings();
      case "messages": return renderMessages();
      case "notifications": return renderNotifications();
      case "profile": return renderProfile();
      default: return renderBrowse();
    }
  }

  function renderOverview() {
    return (
      <div>
        <div className="fd-stats">
          {[
            { icon: "📋", color: "#1e3a5f", accent: "#3B82F6", label: "Total Applications", value: applications.length, sub: "+2 this week" },
            { icon: "✅", color: "#083d2a", accent: "#10B981", label: "Active Projects", value: 2, sub: "On track" },
            { icon: "💰", color: "#3d2c09", accent: "#F59E0B", label: "Total Earned", value: "$16,400", sub: "This year" },
            { icon: "⭐", color: "#2e1a5c", accent: "#8B5CF6", label: "Avg. Rating", value: "4.9", sub: `${profile.reviewCount} reviews` },
          ].map((s, i) => (
            <div key={i} className="fd-stat-card">
              <div className="fd-stat-icon" style={{ background: s.color }}>
                <span style={{ fontSize: "1.2rem" }}>{s.icon}</span>
              </div>
              <div>
                <div className="fd-stat-label">{s.label}</div>
                <div className="fd-stat-value" style={{ color: s.accent }}>{s.value}</div>
                <div className="fd-stat-sub">{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
          <div className="fd-profile-card">
            <div className="fd-section-header"><div className="fd-section-title">Recent Applications</div></div>
            {applications.slice(0, 3).map(app => {
              const job = getJobs().find(j => j.id === app.jobId);
              return (
                <div key={app.id} className="fd-app-card" style={{ marginBottom: "0.5rem" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{job?.title || "Job"}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--fd-text-muted)", marginTop: "2px" }}>{job?.clientName}</div>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              );
            })}
            <button className="fd-btn fd-btn-outline fd-btn-sm" style={{ width: "100%", marginTop: "0.5rem", justifyContent: "center" }} onClick={() => setActiveNav("applications")}>View All</button>
          </div>
          <div className="fd-profile-card">
            <div className="fd-section-header"><div className="fd-section-title">Earnings Chart</div></div>
            <div className="fd-earnings-bars">
              {EARNINGS_DATA.map(e => (
                <div key={e.month} className="fd-bar-wrap">
                  <div className="fd-bar-amount">${(e.usd/1000).toFixed(1)}k</div>
                  <div className="fd-bar" style={{ height: `${(e.usd / maxEarnings) * 80}px` }} />
                  <div className="fd-bar-label">{e.month}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderBrowse() {
    return (
      <div>
        <div className="fd-section-header">
          <div>
            <div className="fd-section-title">Browse Jobs</div>
            <div className="fd-section-sub">{filteredJobs.length} jobs found</div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <select className="fd-filter-select" value={locFilter} onChange={e => setLocFilter(e.target.value)}>
              <option value="all">All Locations</option>
              <option value="remote">Remote Only</option>
              <option value="onsite">On-site</option>
            </select>
            <select className="fd-filter-select" value={budgetFilter} onChange={e => setBudgetFilter(e.target.value)}>
              <option value="">Any Budget</option>
              <option value="lt1000">Under $1,000</option>
              <option value="1k3k">$1k – $3k</option>
              <option value="3k5k">$3k – $5k</option>
              <option value="gt5k">$5,000+</option>
            </select>
          </div>
        </div>
        <div className="fd-filters">
          <span className="fd-filter-label">Category:</span>
          <div className="fd-filter-chips">
            {CATEGORIES.map(c => (
              <button key={c} className={`fd-chip ${catFilter === c ? "active" : ""}`} onClick={() => setCatFilter(c)}>{c}</button>
            ))}
          </div>
          <input
            className="fd-filter-select"
            placeholder="🔍 Search skills..."
            value={skillFilter}
            onChange={e => setSkillFilter(e.target.value)}
            style={{ minWidth: "160px" }}
          />
          {(catFilter !== "All" || budgetFilter || locFilter !== "all" || skillFilter) && (
            <button className="fd-btn-clear" onClick={() => { setCatFilter("All"); setBudgetFilter(""); setLocFilter("all"); setSkillFilter(""); }}>✕ Clear</button>
          )}
        </div>
        <div className="fd-jobs-grid">
          {filteredJobs.length === 0 ? (
            <div className="fd-empty">
              <div className="fd-empty-icon">🔍</div>
              <div className="fd-empty-text">No jobs match your filters. Try adjusting them.</div>
            </div>
          ) : filteredJobs.map(job => (
            <div key={job.id} className={`fd-job-card ${job.featured ? "featured" : ""}`}>
              <div className="fd-job-top">
                <div style={{ flex: 1 }}>
                  <div className="fd-job-client">
                    <div className="fd-client-avatar">{job.clientAvatar}</div>
                    <div>
                      <div className="fd-client-name">{job.clientName}</div>
                      <div className="fd-client-rating">★ {job.clientRating} · {job.clientJobsPosted} jobs posted</div>
                    </div>
                  </div>
                  <div className="fd-job-title">{job.title}</div>
                  <div className="fd-job-desc">{job.description}</div>
                  <div className="fd-job-skills">
                    {job.skills.map(s => <span key={s} className="fd-skill-tag">{s}</span>)}
                  </div>
                  <div className="fd-job-meta">
                    <span className="fd-budget-badge">💵 ${job.budget.min.toLocaleString()} – ${job.budget.max.toLocaleString()}</span>
                    <span className="fd-meta-item"><span className="fd-meta-icon">📍</span>{job.location}</span>
                    <span className="fd-meta-item"><span className="fd-meta-icon">⏰</span>Due: {job.deadline}</span>
                    <span className="fd-meta-item"><span className="fd-meta-icon">👥</span>{job.applicantCount} applicants</span>
                    {job.featured && <span className="fd-featured-badge">⭐ Featured</span>}
                  </div>
                </div>
                <div className="fd-job-actions">
                  <button className="fd-btn fd-btn-outline fd-btn-sm" onClick={() => setSelectedJob(job)}>View Details</button>
                  {appliedJobIds.has(job.id) ? (
                    <button className="fd-btn fd-btn-sm" style={{ background: "var(--fd-bg-elevated)", color: "var(--fd-success)", border: "1px solid var(--fd-success)", cursor: "default" }}>✓ Applied</button>
                  ) : (
                    <button className="fd-btn fd-btn-primary fd-btn-sm" onClick={() => handleApply(job)}>Apply Now →</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderApplications() {
    return (
      <div>
        <div className="fd-section-header">
          <div>
            <div className="fd-section-title">My Applications</div>
            <div className="fd-section-sub">Track all your job applications</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "0.75rem", marginBottom: "1.5rem" }}>
          {["applied","under_review","shortlisted","accepted","rejected"].map(s => {
            const cfg = { applied:{lbl:"Applied",c:"#3B82F6"}, under_review:{lbl:"Under Review",c:"#F59E0B"}, shortlisted:{lbl:"Shortlisted",c:"#8B5CF6"}, accepted:{lbl:"Accepted",c:"#10B981"}, rejected:{lbl:"Rejected",c:"#EF4444"} };
            const c = cfg[s];
            const cnt = applications.filter(a => a.status === s).length;
            return (
              <div key={s} style={{ background:"var(--fd-bg-card)", border:"1px solid var(--fd-border)", borderRadius:"12px", padding:"1rem", textAlign:"center" }}>
                <div style={{ fontSize:"1.5rem", fontWeight:800, color:c.c }}>{cnt}</div>
                <div style={{ fontSize:"0.72rem", color:"var(--fd-text-muted)", marginTop:"4px" }}>{c.lbl}</div>
              </div>
            );
          })}
        </div>
        <div className="fd-app-list">
          {applications.length === 0 ? (
            <div className="fd-empty"><div className="fd-empty-icon">📋</div><div className="fd-empty-text">No applications yet. Start applying to jobs!</div></div>
          ) : applications.map(app => {
            const job = getJobs().find(j => j.id === app.jobId);
            return (
              <div key={app.id} className="fd-app-card">
                <div className="fd-client-avatar" style={{ flexShrink: 0 }}>{job?.clientAvatar || "??"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "2px" }}>{job?.title || "Unknown Job"}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--fd-text-muted)" }}>{job?.clientName} · Applied {app.submittedAt}</div>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                  <div style={{ marginTop: "0.75rem", display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.8rem" }}><span style={{ color: "var(--fd-text-muted)" }}>Your bid: </span><span style={{ color: "var(--fd-success)", fontWeight: 700 }}>${app.proposedPrice?.toLocaleString()}</span></span>
                    <span style={{ fontSize: "0.8rem" }}><span style={{ color: "var(--fd-text-muted)" }}>Timeline: </span><span style={{ fontWeight: 600 }}>{app.estimatedTime}</span></span>
                    {app.clientNote && <span style={{ fontSize: "0.8rem", color: "var(--fd-accent2)" }}>💬 "{app.clientNote}"</span>}
                  </div>
                  <div style={{ marginTop: "0.75rem", fontSize: "0.78rem", color: "var(--fd-text-secondary)", fontStyle: "italic", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {app.coverLetter}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderActive() {
    const accepted = applications.filter(a => a.status === "accepted");
    return (
      <div>
        <div className="fd-section-header"><div className="fd-section-title">Active Projects</div><div className="fd-section-sub">{accepted.length} in progress</div></div>
        {accepted.length === 0 ? (
          <div className="fd-empty"><div className="fd-empty-icon">⚡</div><div className="fd-empty-text">No active projects. Get shortlisted and accepted!</div></div>
        ) : accepted.map(app => {
          const job = getJobs().find(j => j.id === app.jobId);
          return (
            <div key={app.id} className="fd-job-card" style={{ marginBottom: "0.875rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div className="fd-job-title">{job?.title}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--fd-text-muted)", marginTop: "4px" }}>Client: {job?.clientName}</div>
                  <div style={{ marginTop: "0.75rem", display: "flex", gap: "1rem" }}>
                    <span style={{ color: "var(--fd-success)", fontWeight: 700 }}>${app.proposedPrice?.toLocaleString()}</span>
                    <span style={{ color: "var(--fd-text-muted)", fontSize: "0.8rem" }}>Due: {job?.deadline}</span>
                  </div>
                </div>
                <div>
                  <StatusBadge status="accepted" />
                  <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--fd-text-muted)", textAlign: "right" }}>Delivery: {app.estimatedTime}</div>
                </div>
              </div>
              <div style={{ marginTop: "1rem", background: "var(--fd-bg-elevated)", borderRadius: "8px", padding: "0.5rem 0.75rem" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--fd-text-muted)", marginBottom: "0.4rem" }}>Progress</div>
                <div style={{ height: "6px", background: "var(--fd-bg)", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "40%", background: "linear-gradient(90deg, var(--fd-accent), var(--fd-accent2))", borderRadius: "3px" }} />
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--fd-accent)", marginTop: "4px" }}>40% Complete</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function renderCompleted() {
    const fl = getFreelancers().find(f => f.id === CURRENT_FREELANCER_ID);
    return (
      <div>
        <div className="fd-section-header"><div className="fd-section-title">Completed Projects</div><div className="fd-section-sub">{fl?.completedProjects} projects completed</div></div>
        {fl?.reviews.map((r, i) => (
          <div key={i} className="fd-review-card">
            <div className="fd-review-header">
              <div className="fd-reviewer-avatar">{r.client.slice(0,2)}</div>
              <div>
                <div className="fd-reviewer-name">{r.client}</div>
                <Stars rating={r.rating} />
              </div>
              <div className="fd-review-date">{r.date}</div>
            </div>
            <div className="fd-review-text">"{r.comment}"</div>
          </div>
        ))}
      </div>
    );
  }

  function renderEarnings() {
    const total = EARNINGS_DATA.reduce((s, e) => s + e.usd, 0);
    return (
      <div>
        <div className="fd-stats">
          {[
            { label: "Total Earned (2026)", value: `$${total.toLocaleString()}`, icon: "💰", color: "#3B82F6" },
            { label: "This Month", value: "$3,800", icon: "📈", color: "#10B981" },
            { label: "Pending Payout", value: "$1,200", icon: "⏳", color: "#F59E0B" },
            { label: "Completed Jobs", value: `${profile.completedProjects}`, icon: "✅", color: "#8B5CF6" },
          ].map((s, i) => (
            <div key={i} className="fd-stat-card">
              <div className="fd-stat-icon" style={{ background: "rgba(59,130,246,0.1)" }}>{s.icon}</div>
              <div><div className="fd-stat-label">{s.label}</div><div className="fd-stat-value" style={{ color: s.color }}>{s.value}</div></div>
            </div>
          ))}
        </div>
        <div className="fd-profile-card" style={{ marginTop: "1.25rem" }}>
          <div className="fd-section-header"><div className="fd-section-title">Monthly Earnings</div></div>
          <div className="fd-earnings-bars" style={{ height: "140px" }}>
            {EARNINGS_DATA.map(e => (
              <div key={e.month} className="fd-bar-wrap">
                <div className="fd-bar-amount">${(e.usd/1000).toFixed(1)}k</div>
                <div className="fd-bar" style={{ height: `${(e.usd / maxEarnings) * 110}px` }} />
                <div className="fd-bar-label">{e.month}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderMessages() {
    return (
      <div>
        <div className="fd-section-header"><div className="fd-section-title">Messages</div></div>
        <div className="fd-messages-layout">
          <div className="fd-msg-list">
            {MOCK_MESSAGES.map(m => (
              <div key={m.id} className={`fd-msg-item ${activeMsg?.id === m.id ? "active" : ""}`} onClick={() => setActiveMsg(m)}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div className="fd-client-avatar" style={{ width: 30, height: 30, fontSize: "0.65rem", borderRadius: "50%" }}>{m.avatar}</div>
                  <div className="fd-msg-name">{m.from}</div>
                  <div style={{ marginLeft: "auto", fontSize: "0.68rem", color: "var(--fd-text-muted)" }}>{m.time}</div>
                </div>
                <div className="fd-msg-preview">{m.preview}</div>
              </div>
            ))}
          </div>
          <div className="fd-chat-area">
            <div style={{ padding: "0.875rem", borderBottom: "1px solid var(--fd-border)", fontWeight: 600, fontSize: "0.875rem" }}>{activeMsg?.from}</div>
            <div className="fd-chat-msgs">
              {activeMsg?.msgs.map((m, i) => (
                <div key={i} className={`fd-chat-bubble ${m.out ? "fd-bubble-out" : "fd-bubble-in"}`}>{m.text}</div>
              ))}
            </div>
            <div className="fd-chat-input-row">
              <input className="fd-chat-input" placeholder="Type a message..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && chatInput.trim()) { toast.success("Message sent!"); setChatInput(""); } }} />
              <button className="fd-btn fd-btn-primary fd-btn-sm" onClick={() => { if (chatInput.trim()) { toast.success("Message sent!"); setChatInput(""); } }}>Send</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderNotifications() {
    return (
      <div>
        <div className="fd-section-header"><div className="fd-section-title">Notifications</div><button className="fd-btn fd-btn-outline fd-btn-sm">Mark all read</button></div>
        {MOCK_NOTIFICATIONS.map(n => (
          <div key={n.id} className="fd-notif-item" style={{ opacity: n.read ? 0.65 : 1 }}>
            <div style={{ fontSize: "1.3rem", flexShrink: 0 }}>{n.icon}</div>
            <div style={{ flex: 1 }}>
              <div className="fd-notif-msg">{n.msg}</div>
              <div className="fd-notif-time">{n.time}</div>
            </div>
            {!n.read && <div className="fd-notif-dot-big" style={{ background: n.color }} />}
          </div>
        ))}
      </div>
    );
  }

  function renderProfile() {
    const fl = getFreelancers().find(f => f.id === CURRENT_FREELANCER_ID);
    return (
      <div>
        <div className="fd-section-header">
          <div><div className="fd-section-title">My Profile</div><div className="fd-section-sub">Your professional freelancer profile</div></div>
          <button className="fd-btn fd-btn-primary fd-btn-sm" onClick={() => setProfileEdit(!profileEdit)}>{profileEdit ? "Save Changes" : "✏️ Edit Profile"}</button>
        </div>
        <div className="fd-profile-grid">
          <div className="fd-profile-card" style={{ textAlign: "center" }}>
            <div className="fd-profile-avatar-lg">{fl.avatar}</div>
            <div className="fd-profile-name">{fl.name}</div>
            <div className="fd-profile-title">{fl.title}</div>
            <div className="fd-profile-stars"><Stars rating={fl.rating} size="1.1rem" /><span className="fd-rating-text">{fl.rating} ({fl.reviewCount} reviews)</span></div>
            <div className="fd-profile-divider" />
            <div className="fd-profile-stat-row"><span className="fd-profile-stat-label">Location</span><span className="fd-profile-stat-value">📍 {fl.location}</span></div>
            <div className="fd-profile-stat-row"><span className="fd-profile-stat-label">Experience</span><span className="fd-profile-stat-value">{fl.experience} years</span></div>
            <div className="fd-profile-stat-row"><span className="fd-profile-stat-label">Hourly Rate</span><span className="fd-profile-stat-value" style={{ color: "var(--fd-success)" }}>${fl.hourlyRate}/hr</span></div>
            <div className="fd-profile-stat-row"><span className="fd-profile-stat-label">Completed</span><span className="fd-profile-stat-value">{fl.completedProjects} projects</span></div>
            <div className="fd-profile-stat-row"><span className="fd-profile-stat-label">Availability</span><span className="fd-profile-stat-value" style={{ color: fl.availability === "available" ? "var(--fd-success)" : "var(--fd-warning)" }}>● {fl.availability}</span></div>
            <div className="fd-profile-divider" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", justifyContent: "center" }}>
              {fl.languages.map(l => <span key={l} className="fd-skill-tag">{l}</span>)}
            </div>
          </div>
          <div>
            <div className="fd-profile-card" style={{ marginBottom: "1rem" }}>
              <div className="fd-section-header"><div className="fd-section-title">Skills & Expertise</div></div>
              <div className="fd-job-skills">
                {fl.skills.map(s => <span key={s} className="fd-skill-tag">{s}</span>)}
              </div>
              <div className="fd-profile-divider" />
              <div className="fd-section-header"><div className="fd-section-title">Bio</div></div>
              <p style={{ fontSize: "0.85rem", color: "var(--fd-text-secondary)", lineHeight: 1.7 }}>{fl.bio}</p>
            </div>
            <div className="fd-profile-card">
              <div className="fd-section-header"><div className="fd-section-title">Portfolio</div></div>
              <div className="fd-portfolio-grid">
                {fl.portfolio.map((p, i) => (
                  <div key={i} className="fd-portfolio-item">
                    <div className="fd-portfolio-thumb">📁</div>
                    <div className="fd-portfolio-info">
                      <div className="fd-portfolio-title">{p.title}</div>
                      <div className="fd-portfolio-desc">{p.description}</div>
                      <div className="fd-portfolio-techs">{p.tech.map(t => <span key={t} className="fd-tech-tag">{t}</span>)}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="fd-profile-divider" />
              <div className="fd-section-header"><div className="fd-section-title">Client Reviews</div></div>
              {fl.reviews.map((r, i) => (
                <div key={i} className="fd-review-card">
                  <div className="fd-review-header">
                    <div className="fd-reviewer-avatar">{r.client.slice(0,2)}</div>
                    <div><div className="fd-reviewer-name">{r.client}</div><Stars rating={r.rating} /></div>
                    <div className="fd-review-date">{r.date}</div>
                  </div>
                  <div className="fd-review-text">"{r.comment}"</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const topbarTitle = NAV_ITEMS.find(n => n.id === activeNav)?.label || "Dashboard";

  return (
    <div className="fd-root">
      {/* Sidebar */}
      <aside className="fd-sidebar">
        <div className="fd-logo">
          <div className="fd-logo-icon">⚡</div>
          <div>
            <div className="fd-logo-text">FreelanceHub</div>
            <div className="fd-logo-sub">Freelancer Portal</div>
          </div>
        </div>
        <div className="fd-user-card">
          <div className="fd-user-avatar">{profile.avatar}</div>
          <div>
            <div className="fd-user-name">{profile.name}</div>
            <div className="fd-user-title">{profile.title}</div>
          </div>
          <div className="fd-online-dot" />
        </div>
        <nav className="fd-nav">
          <div className="fd-nav-section">
            <div className="fd-nav-label">Main Menu</div>
            {NAV_ITEMS.slice(0, 5).map(item => (
              <button key={item.id} className={`fd-nav-item ${activeNav === item.id ? "active" : ""}`} onClick={() => setActiveNav(item.id)}>
                <span className="fd-nav-icon">{item.icon}</span>
                {item.label}
                {item.badge && <span className="fd-nav-badge">{item.badge}</span>}
              </button>
            ))}
          </div>
          <div className="fd-nav-section">
            <div className="fd-nav-label">Finance & Communication</div>
            {NAV_ITEMS.slice(5).map(item => (
              <button key={item.id} className={`fd-nav-item ${activeNav === item.id ? "active" : ""}`} onClick={() => setActiveNav(item.id)}>
                <span className="fd-nav-icon">{item.icon}</span>
                {item.label}
                {item.badge && <span className="fd-nav-badge">{item.badge}</span>}
              </button>
            ))}
          </div>
        </nav>
        <div style={{ padding: "0.75rem 1rem", borderTop: "1px solid var(--fd-border)" }}>
          <a href="/dashboards" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.78rem", color: "var(--fd-text-muted)", textDecoration: "none" }}>
            <span>🔀</span> Switch Dashboard
          </a>
        </div>
      </aside>

      {/* Main */}
      <main className="fd-main">
        <div className="fd-topbar">
          <div className="fd-topbar-title">{topbarTitle}</div>
          <div className="fd-search-wrap">
            <span className="fd-search-icon">🔍</span>
            <input placeholder="Search jobs, skills, clients..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
          </div>
          <div className="fd-topbar-actions">
            <div className="fd-icon-btn" onClick={() => setActiveNav("notifications")}>🔔<span className="fd-notif-dot" /></div>
            <div className="fd-icon-btn" onClick={() => setActiveNav("messages")}>💬</div>
          </div>
        </div>
        <div className="fd-content">{renderContent()}</div>
      </main>

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fd-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setSelectedJob(null); }}>
          <div className="fd-modal">
            <div className="fd-modal-header">
              <div>
                <div style={{ fontSize: "0.78rem", color: "var(--fd-accent2)", marginBottom: "4px" }}>{selectedJob.category}</div>
                <div className="fd-modal-title">{selectedJob.title}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--fd-text-muted)", marginTop: "4px" }}>{selectedJob.clientName} · Posted {selectedJob.postedAt}</div>
              </div>
              <button className="fd-close-btn" onClick={() => setSelectedJob(null)}>✕</button>
            </div>
            <div className="fd-modal-body">
              <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
                <span className="fd-budget-badge">💵 ${selectedJob.budget.min.toLocaleString()} – ${selectedJob.budget.max.toLocaleString()}</span>
                <span className="fd-meta-item">📍 {selectedJob.location}</span>
                <span className="fd-meta-item">⏰ Deadline: {selectedJob.deadline}</span>
                <span className="fd-meta-item">👥 {selectedJob.applicantCount} applicants</span>
                <span className="fd-meta-item">⭐ Client: {selectedJob.clientRating}</span>
              </div>
              <div className="fd-form-label" style={{ marginBottom: "0.5rem" }}>Job Description</div>
              <p style={{ fontSize: "0.875rem", color: "var(--fd-text-secondary)", lineHeight: 1.7, marginBottom: "1.25rem" }}>{selectedJob.description}</p>
              <div className="fd-form-label" style={{ marginBottom: "0.5rem" }}>Required Skills</div>
              <div className="fd-job-skills">{selectedJob.skills.map(s => <span key={s} className="fd-skill-tag">{s}</span>)}</div>
            </div>
            <div className="fd-modal-footer">
              <button className="fd-btn fd-btn-outline" onClick={() => setSelectedJob(null)}>Close</button>
              {appliedJobIds.has(selectedJob.id) ? (
                <button className="fd-btn fd-btn-sm" style={{ background: "var(--fd-bg-elevated)", color: "var(--fd-success)", border: "1px solid var(--fd-success)", cursor: "default" }}>✓ Already Applied</button>
              ) : (
                <button className="fd-btn fd-btn-primary" onClick={() => { setSelectedJob(null); handleApply(selectedJob); }}>Apply for This Job →</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Apply / Proposal Modal */}
      {applyModal && (
        <div className="fd-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setApplyModal(null); }}>
          <div className="fd-modal">
            <div className="fd-modal-header">
              <div>
                <div style={{ fontSize: "0.78rem", color: "var(--fd-accent2)", marginBottom: "4px" }}>Submit Proposal</div>
                <div className="fd-modal-title">{applyModal.title}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--fd-text-muted)", marginTop: "4px" }}>Budget: ${applyModal.budget.min.toLocaleString()} – ${applyModal.budget.max.toLocaleString()}</div>
              </div>
              <button className="fd-close-btn" onClick={() => setApplyModal(null)}>✕</button>
            </div>
            <div className="fd-modal-body">
              <div className="fd-form-row">
                <div className="fd-form-group">
                  <label className="fd-form-label">Your Bid Amount (USD) *</label>
                  <input className="fd-form-input" type="number" placeholder="e.g. 2500" value={proposal.price} onChange={e => setProposal(p => ({ ...p, price: e.target.value }))} />
                  <span className="fd-form-hint">Client budget: ${applyModal.budget.min.toLocaleString()} – ${applyModal.budget.max.toLocaleString()}</span>
                </div>
                <div className="fd-form-group">
                  <label className="fd-form-label">Estimated Delivery Time *</label>
                  <input className="fd-form-input" placeholder="e.g. 2 weeks" value={proposal.time} onChange={e => setProposal(p => ({ ...p, time: e.target.value }))} />
                </div>
              </div>
              <div className="fd-form-group">
                <label className="fd-form-label">Cover Letter / Proposal *</label>
                <textarea className="fd-form-textarea" placeholder="Introduce yourself, explain why you're the best fit, describe your approach..." value={proposal.cover} onChange={e => setProposal(p => ({ ...p, cover: e.target.value }))} style={{ minHeight: "160px" }} />
                <span className="fd-form-hint">{proposal.cover.length}/500 characters · Be specific about your experience with similar projects.</span>
              </div>
              <div style={{ background: "rgba(59,130,246,0.07)", border: "1px solid var(--fd-border)", borderRadius: "10px", padding: "1rem" }}>
                <div style={{ fontSize: "0.78rem", color: "var(--fd-text-muted)", marginBottom: "0.5rem", fontWeight: 600 }}>Your Profile Summary</div>
                <div style={{ display: "flex", gap: "1rem", fontSize: "0.8rem", flexWrap: "wrap" }}>
                  <span>⭐ {profile.rating} rating</span>
                  <span>✅ {profile.completedProjects} completed</span>
                  <span>📍 {profile.location}</span>
                  <span>💰 ${profile.hourlyRate}/hr</span>
                </div>
              </div>
            </div>
            <div className="fd-modal-footer">
              <button className="fd-btn fd-btn-outline" onClick={() => setApplyModal(null)}>Cancel</button>
              <button className="fd-btn fd-btn-primary" onClick={submitProposal}>🚀 Submit Proposal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
