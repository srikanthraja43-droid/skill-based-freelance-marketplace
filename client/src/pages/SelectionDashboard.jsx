import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import "./SelectionDashboard.css";
import {
  getFreelancers, getJobs, CATEGORIES, SKILLS_OPTIONS
} from "../data/freelanceData";

const NAV_ITEMS = [
  { id: "find", icon: "🔍", label: "Find Freelancers", new: true },
  { id: "shortlisted", icon: "⭐", label: "Shortlisted", badge: null },
  { id: "compare", icon: "⚖️", label: "Compare" },
  { id: "messages", icon: "💬", label: "Messages", badge: 2 },
  { id: "analytics", icon: "📊", label: "Analytics" },
];

const MOCK_MESSAGES = [
  { id: "m1", from: "Arjun Sharma", avatar: "AS", preview: "Ready to start Monday!", time: "5m ago", msgs: [
    { out: false, text: "Thank you for the work request!" },
    { out: true, text: "Your profile is exactly what we need." },
    { out: false, text: "Ready to start Monday!" },
  ]},
  { id: "m2", from: "Priya Nair", avatar: "PN", preview: "Here's my portfolio link", time: "1h ago", msgs: [
    { out: false, text: "Hello! Thank you for considering me." },
    { out: false, text: "Here's my portfolio link: priya.design" },
  ]},
];

const AVAIL_COLORS = { available: "rgba(16,185,129,0.15)", busy: "rgba(245,158,11,0.12)", unavailable: "rgba(239,68,68,0.12)" };
const AVAIL_GRADIENTS = [
  "linear-gradient(135deg,#8B5CF6,#EC4899)",
  "linear-gradient(135deg,#06B6D4,#3B82F6)",
  "linear-gradient(135deg,#10B981,#06B6D4)",
  "linear-gradient(135deg,#F59E0B,#EF4444)",
  "linear-gradient(135deg,#8B5CF6,#3B82F6)",
  "linear-gradient(135deg,#EC4899,#8B5CF6)",
  "linear-gradient(135deg,#F59E0B,#8B5CF6)",
  "linear-gradient(135deg,#10B981,#3B82F6)",
  "linear-gradient(135deg,#06B6D4,#10B981)",
  "linear-gradient(135deg,#EF4444,#8B5CF6)",
];

function Stars({ rating, size = "0.85rem" }) {
  const n = Math.round(rating);
  return (
    <span className="sd-stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= n ? "#F59E0B" : "#2D3A4F", fontSize: size }}>
          {i <= n ? "★" : "☆"}
        </span>
      ))}
    </span>
  );
}

export default function SelectionDashboard() {
  const [activeNav, setActiveNav] = useState("find");
  const [freelancers] = useState(() => getFreelancers());
  const [shortlisted, setShortlisted] = useState(["f1", "f3"]);
  const [compareList, setCompareList] = useState([]);
  const [filters, setFilters] = useState({ category: "All", availability: "all", minRating: 0, maxBudget: 0, experience: 0, skills: [] });
  const [searchQ, setSearchQ] = useState("");
  const [activeMsg, setActiveMsg] = useState(MOCK_MESSAGES[0]);
  const [chatInput, setChatInput] = useState("");
  const [profileModal, setProfileModal] = useState(null);
  const [compareModal, setCompareModal] = useState(false);
  const [workRequestModal, setWorkRequestModal] = useState(null);
  const [workRequest, setWorkRequest] = useState({ title: "", description: "", budget: "", deadline: "" });

  const filteredFreelancers = useMemo(() => {
    return freelancers.filter(fl => {
      const qMatch = !searchQ || fl.name.toLowerCase().includes(searchQ.toLowerCase()) ||
        fl.title.toLowerCase().includes(searchQ.toLowerCase()) ||
        fl.skills.some(s => s.toLowerCase().includes(searchQ.toLowerCase()));
      const catMatch = filters.category === "All" || fl.category === filters.category;
      const availMatch = filters.availability === "all" || fl.availability === filters.availability;
      const ratingMatch = fl.rating >= filters.minRating;
      const budgetMatch = !filters.maxBudget || fl.hourlyRate <= filters.maxBudget;
      const expMatch = fl.experience >= filters.experience;
      const skillMatch = filters.skills.length === 0 || filters.skills.every(s => fl.skills.includes(s));
      return qMatch && catMatch && availMatch && ratingMatch && budgetMatch && expMatch && skillMatch;
    });
  }, [freelancers, searchQ, filters]);

  function toggleShortlist(id) {
    setShortlisted(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
    const fl = freelancers.find(f => f.id === id);
    toast.success(shortlisted.includes(id) ? `Removed ${fl.name} from shortlist` : `⭐ ${fl.name} shortlisted!`);
  }

  function toggleCompare(id) {
    if (compareList.includes(id)) {
      setCompareList(prev => prev.filter(c => c !== id));
    } else {
      if (compareList.length >= 3) { toast.error("You can compare up to 3 freelancers"); return; }
      setCompareList(prev => [...prev, id]);
      toast.success("Added to comparison!");
    }
  }

  function handleWorkRequest(fl) {
    setWorkRequestModal(fl);
    setWorkRequest({ title: "", description: "", budget: fl.proposedPrice || fl.minBudget, deadline: "" });
  }

  function submitWorkRequest() {
    if (!workRequest.title.trim() || !workRequest.description.trim()) {
      toast.error("Please fill in all required fields."); return;
    }
    toast.success(`🎉 Work request sent to ${workRequestModal.name}!`);
    setWorkRequestModal(null);
  }

  const compareFreelancers = compareList.map(id => freelancers.find(f => f.id === id)).filter(Boolean);

  function renderContent() {
    switch (activeNav) {
      case "find": return renderFind();
      case "shortlisted": return renderShortlisted();
      case "compare": return renderCompareSection();
      case "messages": return renderMessages();
      case "analytics": return renderAnalytics();
      default: return renderFind();
    }
  }

  function renderFind() {
    return (
      <div className="sd-browse-layout">
        {/* Filter Panel */}
        <div className="sd-filter-panel">
          <div className="sd-filter-title">
            <span>🎛️ Filters</span>
            <button className="sd-clear-filters" onClick={() => setFilters({ category: "All", availability: "all", minRating: 0, maxBudget: 0, experience: 0, skills: [] })}>Clear All</button>
          </div>

          <div className="sd-filter-group">
            <div className="sd-filter-label">Category</div>
            <select className="sd-filter-select" value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="sd-filter-group">
            <div className="sd-filter-label">Availability</div>
            <div className="sd-filter-chips">
              {[["all","All"],["available","Available"],["busy","Busy"]].map(([v, l]) => (
                <button key={v} className={`sd-filter-chip ${filters.availability === v ? "active" : ""}`} onClick={() => setFilters(f => ({ ...f, availability: v }))}>{l}</button>
              ))}
            </div>
          </div>

          <div className="sd-filter-group">
            <div className="sd-filter-label">Min. Rating</div>
            <div className="sd-filter-chips">
              {[0, 3, 4, 4.5].map(r => (
                <button key={r} className={`sd-filter-chip ${filters.minRating === r ? "active" : ""}`} onClick={() => setFilters(f => ({ ...f, minRating: r }))}>
                  {r === 0 ? "Any" : `${r}+ ★`}
                </button>
              ))}
            </div>
          </div>

          <div className="sd-filter-group">
            <div className="sd-filter-label">Max Hourly Rate ($)</div>
            <div className="sd-filter-chips">
              {[[0,"Any"],[30,"≤ $30"],[50,"≤ $50"],[100,"≤ $100"]].map(([v, l]) => (
                <button key={v} className={`sd-filter-chip ${filters.maxBudget === v ? "active" : ""}`} onClick={() => setFilters(f => ({ ...f, maxBudget: v }))}>{l}</button>
              ))}
            </div>
          </div>

          <div className="sd-filter-group">
            <div className="sd-filter-label">Min. Experience (yrs)</div>
            <div className="sd-filter-chips">
              {[[0,"Any"],[2,"2+"],[4,"4+"],[6,"6+"]].map(([v, l]) => (
                <button key={v} className={`sd-filter-chip ${filters.experience === v ? "active" : ""}`} onClick={() => setFilters(f => ({ ...f, experience: v }))}>{l}</button>
              ))}
            </div>
          </div>

          <div className="sd-filter-group">
            <div className="sd-filter-label">Skills</div>
            <div className="sd-filter-chips">
              {["React","Python","Figma","Node.js","Flutter","AWS","WordPress"].map(s => (
                <button key={s} className={`sd-filter-chip ${filters.skills.includes(s) ? "active" : ""}`} onClick={() => setFilters(f => ({ ...f, skills: f.skills.includes(s) ? f.skills.filter(x => x !== s) : [...f.skills, s] }))}>{s}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Freelancer Grid */}
        <div className="sd-grid-area">
          <div className="sd-section-header">
            <div>
              <div className="sd-section-title">{filteredFreelancers.length} Freelancers Found</div>
              <div className="sd-section-sub">Select up to 3 to compare side-by-side</div>
            </div>
            {compareList.length > 0 && (
              <button className="sd-btn sd-btn-primary" onClick={() => { setCompareModal(true); }}>
                ⚖️ Compare ({compareList.length})
              </button>
            )}
          </div>

          {filteredFreelancers.length === 0 ? (
            <div className="sd-empty"><div className="sd-empty-icon">🔍</div><div className="sd-empty-text">No freelancers match your filters. Try adjusting them.</div></div>
          ) : (
            <div className="sd-freelancer-grid">
              {filteredFreelancers.map((fl, idx) => {
                const isShortlisted = shortlisted.includes(fl.id);
                const isComparing = compareList.includes(fl.id);
                return (
                  <div key={fl.id} className={`sd-freelancer-card ${isComparing ? "selected" : ""}`}>
                    <div style={{ position: "absolute", top: "1rem", right: "1rem", display: "flex", gap: "0.4rem" }}>
                      <div className={`sd-checkbox-btn ${isComparing ? "checked" : ""}`} onClick={() => toggleCompare(fl.id)} title="Add to compare">
                        {isComparing ? "✓" : ""}
                      </div>
                    </div>
                    <div className="sd-card-header">
                      <div className={`sd-fl-avatar ${fl.availability}`} style={{ background: AVAIL_GRADIENTS[idx % AVAIL_GRADIENTS.length] }}>
                        {fl.avatar}
                        <div className={`sd-avail-dot ${fl.availability}`} />
                      </div>
                      <div className="sd-fl-info">
                        <div className="sd-fl-name">{fl.name} {fl.isVerified && <span>✅</span>}</div>
                        <div className="sd-fl-title">{fl.title}</div>
                        <div className="sd-fl-location">📍 {fl.location}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                          <Stars rating={fl.rating} size="0.8rem" />
                          <span style={{ fontSize: "0.72rem", color: "#94A3B8" }}>{fl.rating} ({fl.reviewCount})</span>
                        </div>
                      </div>
                    </div>
                    <div className="sd-card-skills">
                      {fl.skills.slice(0, 5).map(s => <span key={s} className="sd-skill-pill">{s}</span>)}
                      {fl.skills.length > 5 && <span className="sd-skill-pill">+{fl.skills.length - 5}</span>}
                    </div>
                    <div className="sd-card-stats">
                      <div className="sd-stat-mini">
                        <div className="sd-stat-mini-val" style={{ color: "#F59E0B" }}>{fl.experience}y</div>
                        <div className="sd-stat-mini-lbl">Exp.</div>
                      </div>
                      <div className="sd-stat-mini">
                        <div className="sd-stat-mini-val" style={{ color: "#10B981" }}>{fl.completedProjects}</div>
                        <div className="sd-stat-mini-lbl">Jobs</div>
                      </div>
                      <div className="sd-stat-mini">
                        <div className="sd-stat-mini-val" style={{ color: "#8B5CF6" }}>{fl.rating}</div>
                        <div className="sd-stat-mini-lbl">Rating</div>
                      </div>
                      <div className="sd-stat-mini">
                        <div className="sd-stat-mini-val" style={{ color: "#06B6D4" }}>{fl.reviewCount}</div>
                        <div className="sd-stat-mini-lbl">Reviews</div>
                      </div>
                    </div>
                    <div className="sd-card-bottom">
                      <div>
                        <div className="sd-rate">${fl.hourlyRate}<span style={{ fontSize: "0.7rem", fontWeight: 400, color: "var(--sd-text-muted)" }}>/hr</span></div>
                        <div className="sd-delivery">⏱ {fl.deliveryTime}</div>
                      </div>
                      <div style={{ padding: "0.3rem 0.75rem", borderRadius: "8px", fontSize: "0.72rem", fontWeight: 600, background: AVAIL_COLORS[fl.availability] || "rgba(255,255,255,0.05)", color: fl.availability === "available" ? "var(--sd-green)" : fl.availability === "busy" ? "var(--sd-amber)" : "var(--sd-red)" }}>
                        ● {fl.availability.charAt(0).toUpperCase() + fl.availability.slice(1)}
                      </div>
                    </div>
                    <div className="sd-card-actions">
                      <button className="sd-btn sd-btn-ghost sd-btn-sm" onClick={() => setProfileModal(fl)}>👤 Profile</button>
                      <button className={`sd-btn sd-btn-sm ${isShortlisted ? "sd-btn-amber" : "sd-btn-ghost"}`} onClick={() => toggleShortlist(fl.id)}>
                        {isShortlisted ? "⭐ Shortlisted" : "☆ Shortlist"}
                      </button>
                      <button className="sd-btn sd-btn-primary sd-btn-sm" onClick={() => handleWorkRequest(fl)}>Request →</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderShortlisted() {
    const sls = freelancers.filter(f => shortlisted.includes(f.id));
    return (
      <div>
        <div className="sd-section-header">
          <div><div className="sd-section-title">Shortlisted Freelancers</div><div className="sd-section-sub">{sls.length} freelancers saved</div></div>
          {sls.length > 1 && <button className="sd-btn sd-btn-primary" onClick={() => { setCompareList(sls.slice(0,3).map(f=>f.id)); setCompareModal(true); }}>⚖️ Compare All</button>}
        </div>
        {sls.length === 0 ? (
          <div className="sd-empty"><div className="sd-empty-icon">⭐</div><div className="sd-empty-text">No shortlisted freelancers yet. Browse and shortlist your favorites!</div></div>
        ) : sls.map((fl, idx) => (
          <div key={fl.id} className="sd-shortlist-item">
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: AVAIL_GRADIENTS[idx % AVAIL_GRADIENTS.length], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>{fl.avatar}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{fl.name} {fl.isVerified && "✅"}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--sd-text-muted)", marginTop: "2px" }}>{fl.title} · ⭐ {fl.rating}</div>
              <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                {fl.skills.slice(0, 4).map(s => <span key={s} className="sd-skill-pill">{s}</span>)}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontWeight: 800, color: "var(--sd-green)", fontSize: "1rem" }}>${fl.hourlyRate}/hr</div>
              <div style={{ fontSize: "0.72rem", color: "var(--sd-text-muted)", marginTop: "2px" }}>{fl.availability}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", flexShrink: 0 }}>
              <button className="sd-btn sd-btn-primary sd-btn-sm" onClick={() => handleWorkRequest(fl)}>Request →</button>
              <button className="sd-btn sd-btn-ghost sd-btn-sm" onClick={() => setProfileModal(fl)}>View Profile</button>
              <button className="sd-btn sd-btn-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444" }} onClick={() => toggleShortlist(fl.id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  function renderCompareSection() {
    if (compareFreelancers.length < 2) {
      return (
        <div>
          <div className="sd-section-header"><div className="sd-section-title">Compare Freelancers</div></div>
          <div className="sd-empty">
            <div className="sd-empty-icon">⚖️</div>
            <div className="sd-empty-text" style={{ marginBottom: "1rem" }}>Select 2–3 freelancers from the Browse tab to compare them side-by-side.</div>
            <button className="sd-btn sd-btn-primary" onClick={() => setActiveNav("find")}>Browse Freelancers →</button>
          </div>
        </div>
      );
    }
    return (
      <div>
        <div className="sd-section-header">
          <div><div className="sd-section-title">Comparing {compareFreelancers.length} Freelancers</div></div>
          <button className="sd-btn sd-btn-ghost sd-btn-sm" onClick={() => setCompareList([])}>Clear</button>
        </div>
        {renderCompareTable(compareFreelancers)}
      </div>
    );
  }

  function renderCompareTable(fls) {
    const rows = [
      { label: "Category", fn: f => f.category },
      { label: "Experience", fn: f => `${f.experience} years`, winner: fls => fls.reduce((a, b) => (b.experience > a.experience ? b : a), fls[0]).id },
      { label: "Rating", fn: f => `⭐ ${f.rating} (${f.reviewCount} reviews)`, winner: fls => fls.reduce((a, b) => (b.rating > a.rating ? b : a), fls[0]).id },
      { label: "Completed Projects", fn: f => f.completedProjects, winner: fls => fls.reduce((a, b) => (b.completedProjects > a.completedProjects ? b : a), fls[0]).id },
      { label: "Hourly Rate", fn: f => `$${f.hourlyRate}/hr`, winner: fls => fls.reduce((a, b) => (b.hourlyRate < a.hourlyRate ? b : a), fls[0]).id },
      { label: "Delivery Time", fn: f => f.deliveryTime },
      { label: "Location", fn: f => f.location },
      { label: "Languages", fn: f => f.languages.join(", ") },
      { label: "Availability", fn: f => <span style={{ color: f.availability === "available" ? "var(--sd-green)" : "var(--sd-amber)" }}>● {f.availability}</span> },
      { label: "Verified", fn: f => f.isVerified ? "✅ Verified" : "⬜ Unverified" },
    ];
    return (
      <div style={{ overflowX: "auto" }}>
        <table className="sd-compare-table">
          <thead>
            <tr>
              <th>Feature</th>
              {fls.map((fl, i) => (
                <th key={fl.id} className="sd-compare-fl-head">
                  <div className="sd-compare-fl-avatar" style={{ background: AVAIL_GRADIENTS[i % AVAIL_GRADIENTS.length] }}>{fl.avatar}</div>
                  <div className="sd-compare-fl-name">{fl.name}</div>
                  <div className="sd-compare-fl-title">{fl.title}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.label}>
                <td style={{ color: "var(--sd-text-muted)", fontSize: "0.78rem", fontWeight: 600, whiteSpace: "nowrap" }}>{row.label}</td>
                {fls.map(fl => {
                  const isWinner = row.winner && row.winner(fls) === fl.id;
                  return (
                    <td key={fl.id} style={{ textAlign: "center", background: isWinner ? "rgba(16,185,129,0.05)" : "transparent" }}>
                      {row.fn(fl)}
                      {isWinner && <div className="sd-winner-badge">🏆 Best</div>}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr>
              <td style={{ color: "var(--sd-text-muted)", fontSize: "0.78rem", fontWeight: 600 }}>Skills</td>
              {fls.map(fl => (
                <td key={fl.id} style={{ textAlign: "center" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", justifyContent: "center" }}>
                    {fl.skills.slice(0, 4).map(s => <span key={s} className="sd-skill-pill">{s}</span>)}
                  </div>
                </td>
              ))}
            </tr>
            <tr>
              <td></td>
              {fls.map(fl => (
                <td key={fl.id} style={{ textAlign: "center", padding: "1rem" }}>
                  <button className="sd-btn sd-btn-primary" onClick={() => handleWorkRequest(fl)}>🚀 Request This Freelancer</button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  function renderMessages() {
    return (
      <div>
        <div className="sd-section-header"><div className="sd-section-title">Messages</div></div>
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "1rem", height: "500px" }}>
          <div style={{ background: "var(--sd-bg-card-solid)", border: "1px solid var(--sd-border)", borderRadius: "var(--sd-radius)", overflow: "hidden" }}>
            {MOCK_MESSAGES.map(m => (
              <div key={m.id} style={{ padding: "0.875rem", borderBottom: "1px solid var(--sd-border)", cursor: "pointer", background: activeMsg?.id === m.id ? "rgba(139,92,246,0.1)" : "transparent" }} onClick={() => setActiveMsg(m)}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#8B5CF6,#EC4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 700, flexShrink: 0 }}>{m.avatar}</div>
                  <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>{m.from}</span>
                  <span style={{ marginLeft: "auto", fontSize: "0.65rem", color: "var(--sd-text-muted)" }}>{m.time}</span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--sd-text-muted)", marginTop: "3px" }}>{m.preview}</div>
              </div>
            ))}
          </div>
          <div style={{ background: "var(--sd-bg-card-solid)", border: "1px solid var(--sd-border)", borderRadius: "var(--sd-radius)", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "0.875rem", borderBottom: "1px solid var(--sd-border)", fontWeight: 600, fontSize: "0.875rem" }}>{activeMsg?.from}</div>
            <div style={{ flex: 1, padding: "1rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {activeMsg?.msgs.map((m, i) => (
                <div key={i} style={{ maxWidth: "70%", padding: "0.65rem 1rem", borderRadius: m.out ? "14px 4px 14px 14px" : "4px 14px 14px 14px", fontSize: "0.82rem", lineHeight: 1.5, alignSelf: m.out ? "flex-end" : "flex-start", background: m.out ? "linear-gradient(135deg,#8B5CF6,#7C3AED)" : "rgba(255,255,255,0.06)", border: m.out ? "none" : "1px solid var(--sd-border)", color: "var(--sd-text-primary)" }}>{m.text}</div>
              ))}
            </div>
            <div style={{ padding: "0.875rem", borderTop: "1px solid var(--sd-border)", display: "flex", gap: "0.5rem" }}>
              <input style={{ flex: 1, background: "var(--sd-bg-elevated)", border: "1px solid var(--sd-border)", borderRadius: "10px", color: "var(--sd-text-primary)", fontSize: "0.875rem", padding: "0.5rem 0.875rem", fontFamily: "inherit", outline: "none" }} placeholder="Type a message..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && chatInput.trim()) { toast.success("Message sent!"); setChatInput(""); } }} />
              <button className="sd-btn sd-btn-primary sd-btn-sm" onClick={() => { if (chatInput.trim()) { toast.success("Message sent!"); setChatInput(""); } }}>Send</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderAnalytics() {
    const totalFl = freelancers.length;
    const available = freelancers.filter(f => f.availability === "available").length;
    const avgRating = (freelancers.reduce((s, f) => s + f.rating, 0) / totalFl).toFixed(1);
    return (
      <div>
        <div className="sd-section-header"><div className="sd-section-title">Talent Analytics</div></div>
        <div className="sd-stats">
          <div className="sd-stat-card"><div className="sd-stat-icon" style={{ background: "rgba(139,92,246,0.15)" }}>👥</div><div><div className="sd-stat-label">Total Talent</div><div className="sd-stat-value" style={{ color: "#8B5CF6" }}>{totalFl}</div></div></div>
          <div className="sd-stat-card"><div className="sd-stat-icon" style={{ background: "rgba(16,185,129,0.1)" }}>✅</div><div><div className="sd-stat-label">Available Now</div><div className="sd-stat-value" style={{ color: "#10B981" }}>{available}</div></div></div>
          <div className="sd-stat-card"><div className="sd-stat-icon" style={{ background: "rgba(245,158,11,0.1)" }}>⭐</div><div><div className="sd-stat-label">Avg. Rating</div><div className="sd-stat-value" style={{ color: "#F59E0B" }}>{avgRating}</div></div></div>
          <div className="sd-stat-card"><div className="sd-stat-icon" style={{ background: "rgba(6,182,212,0.1)" }}>📌</div><div><div className="sd-stat-label">Shortlisted</div><div className="sd-stat-value" style={{ color: "#06B6D4" }}>{shortlisted.length}</div></div></div>
        </div>
        <div style={{ background: "var(--sd-bg-card-solid)", border: "1px solid var(--sd-border)", borderRadius: "var(--sd-radius-lg)", padding: "1.25rem" }}>
          <div className="sd-section-header"><div className="sd-section-title">Freelancers by Category</div></div>
          {CATEGORIES.filter(c => c !== "All").map(cat => {
            const cnt = freelancers.filter(f => f.category === cat).length;
            const pct = Math.round((cnt / totalFl) * 100);
            return (
              <div key={cat} style={{ marginBottom: "0.875rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: "0.3rem" }}>
                  <span style={{ color: "var(--sd-text-secondary)" }}>{cat}</span>
                  <span style={{ color: "var(--sd-accent3)", fontWeight: 700 }}>{cnt}</span>
                </div>
                <div style={{ height: "8px", background: "rgba(255,255,255,0.04)", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #8B5CF6, #EC4899)", borderRadius: "4px", transition: "width 0.6s ease" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const topbarTitle = NAV_ITEMS.find(n => n.id === activeNav)?.label || "Talent Finder";

  return (
    <div className="sd-root">
      {/* Sidebar */}
      <aside className="sd-sidebar">
        <div className="sd-logo-area">
          <div className="sd-logo-row">
            <div className="sd-logo-icon">🎯</div>
            <div>
              <div className="sd-logo-name">FreelanceHub</div>
              <div className="sd-logo-role">Talent Finder</div>
            </div>
          </div>
          <div className="sd-user-card">
            <div className="sd-user-avatar">TV</div>
            <div>
              <div className="sd-user-name">TechVentures Inc.</div>
              <div className="sd-user-role">Selection Manager</div>
            </div>
          </div>
        </div>
        <nav className="sd-nav">
          <div className="sd-nav-section">
            <div className="sd-nav-label">Discover</div>
            {NAV_ITEMS.slice(0, 3).map(item => (
              <button key={item.id} className={`sd-nav-item ${activeNav === item.id ? "active" : ""}`} onClick={() => setActiveNav(item.id)}>
                <span className="sd-nav-icon">{item.icon}</span>
                {item.label}
                {item.badge && <span className="sd-nav-badge">{item.badge}</span>}
                {item.new && <span className="sd-nav-new">NEW</span>}
              </button>
            ))}
            <div className="sd-nav-label">Tools</div>
            {NAV_ITEMS.slice(3).map(item => (
              <button key={item.id} className={`sd-nav-item ${activeNav === item.id ? "active" : ""}`} onClick={() => setActiveNav(item.id)}>
                <span className="sd-nav-icon">{item.icon}</span>
                {item.label}
                {item.badge && <span className="sd-nav-badge">{item.badge}</span>}
              </button>
            ))}
            <div className="sd-nav-label">Switch</div>
            <a href="/client-dashboard" className="sd-nav-item" style={{ textDecoration: "none" }}><span className="sd-nav-icon">🏢</span>Client Dashboard</a>
            <a href="/freelancer-dashboard" className="sd-nav-item" style={{ textDecoration: "none" }}><span className="sd-nav-icon">⚡</span>Freelancer View</a>
            <a href="/dashboards" className="sd-nav-item" style={{ textDecoration: "none" }}><span className="sd-nav-icon">🔀</span>All Dashboards</a>
          </div>
        </nav>
        {shortlisted.length > 0 && (
          <div style={{ padding: "1rem", borderTop: "1px solid var(--sd-border)" }}>
            <div style={{ fontSize: "0.7rem", color: "var(--sd-text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>Shortlisted</div>
            {freelancers.filter(f => shortlisted.includes(f.id)).slice(0, 3).map((f, i) => (
              <div key={f.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 0.5rem", borderRadius: "8px", marginBottom: "2px" }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: AVAIL_GRADIENTS[i], display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 700, flexShrink: 0 }}>{f.avatar}</div>
                <span style={{ fontSize: "0.75rem", color: "var(--sd-text-secondary)" }}>{f.name}</span>
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Main */}
      <main className="sd-main">
        <div className="sd-topbar">
          <div className="sd-topbar-title">{topbarTitle}</div>
          <div className="sd-search-wrap">
            <span style={{ color: "var(--sd-text-muted)" }}>🔍</span>
            <input placeholder="Search freelancers, skills..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {compareList.length > 0 && (
              <button className="sd-btn sd-btn-primary" onClick={() => setCompareModal(true)}>⚖️ Compare ({compareList.length})</button>
            )}
            <div className="sd-icon-btn">🔔</div>
          </div>
        </div>
        <div className={`sd-content ${compareList.length > 0 ? "with-compare-bar" : ""}`}>
          {renderContent()}
        </div>
      </main>

      {/* Compare Bar */}
      {compareList.length > 0 && (
        <div className="sd-compare-bar">
          <div className="sd-compare-text">⚖️ Comparing {compareList.length}/3 freelancers</div>
          <div className="sd-compare-avatars">
            {compareList.map((id, i) => {
              const fl = freelancers.find(f => f.id === id);
              return (
                <div key={id} className="sd-compare-avatar" style={{ background: AVAIL_GRADIENTS[i % AVAIL_GRADIENTS.length] }} title={fl?.name}>{fl?.avatar}</div>
              );
            })}
          </div>
          <button className="sd-btn sd-btn-primary" onClick={() => setCompareModal(true)}>Compare Now →</button>
          <button className="sd-btn sd-btn-ghost sd-btn-sm" onClick={() => setCompareList([])}>Clear</button>
        </div>
      )}

      {/* Profile Modal */}
      {profileModal && (
        <div className="sd-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setProfileModal(null); }}>
          <div className="sd-modal">
            <div className="sd-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: AVAIL_GRADIENTS[0], display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", fontWeight: 700, flexShrink: 0, boxShadow: "0 0 20px rgba(139,92,246,0.4)" }}>{profileModal.avatar}</div>
                <div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>{profileModal.name} {profileModal.isVerified && "✅"}</div>
                  <div style={{ color: "var(--sd-accent3)", fontSize: "0.85rem", marginTop: "2px" }}>{profileModal.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}><Stars rating={profileModal.rating} /><span style={{ fontSize: "0.78rem", color: "var(--sd-text-muted)" }}>{profileModal.rating} ({profileModal.reviewCount} reviews)</span></div>
                </div>
              </div>
              <button className="sd-close-btn" onClick={() => setProfileModal(null)}>✕</button>
            </div>
            <div className="sd-modal-body">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.875rem", marginBottom: "1.25rem" }}>
                {[{ label: "Experience", value: `${profileModal.experience} yrs`, color: "#F59E0B" },{ label: "Projects", value: profileModal.completedProjects, color: "#10B981" },{ label: "Hourly Rate", value: `$${profileModal.hourlyRate}`, color: "#8B5CF6" },{ label: "Delivery", value: profileModal.deliveryTime, color: "#06B6D4" }].map((s, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--sd-border)", borderRadius: "10px", padding: "0.875rem", textAlign: "center" }}>
                    <div style={{ fontSize: "1rem", fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--sd-text-muted)", marginTop: "3px" }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--sd-text-muted)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Bio</div>
                <p style={{ fontSize: "0.875rem", color: "var(--sd-text-secondary)", lineHeight: 1.7 }}>{profileModal.bio}</p>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--sd-text-muted)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Skills</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {profileModal.skills.map(s => <span key={s} className="sd-skill-pill">{s}</span>)}
                </div>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--sd-text-muted)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Portfolio</div>
                <div className="sd-portfolio-grid">
                  {profileModal.portfolio.map((p, i) => (
                    <div key={i} className="sd-portfolio-item">
                      <div className="sd-portfolio-thumb">📁</div>
                      <div className="sd-portfolio-info">
                        <div className="sd-portfolio-title">{p.title}</div>
                        <div className="sd-portfolio-desc">{p.description}</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginTop: "0.4rem" }}>
                          {p.tech.map(t => <span key={t} className="sd-skill-pill">{t}</span>)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--sd-text-muted)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Client Reviews</div>
                {profileModal.reviews.map((r, i) => (
                  <div key={i} className="sd-review-card">
                    <div className="sd-review-header">
                      <div className="sd-reviewer-avatar">{r.client.slice(0,2)}</div>
                      <div><div className="sd-reviewer-name">{r.client}</div><Stars rating={r.rating} /></div>
                      <div className="sd-review-date">{r.date}</div>
                    </div>
                    <div className="sd-review-text">"{r.comment}"</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="sd-modal-footer">
              <button className="sd-btn sd-btn-ghost" onClick={() => setProfileModal(null)}>Close</button>
              <button className="sd-btn sd-btn-amber" onClick={() => { toggleShortlist(profileModal.id); setProfileModal(null); }}>
                {shortlisted.includes(profileModal.id) ? "Remove Shortlist" : "⭐ Shortlist"}
              </button>
              <button className="sd-btn sd-btn-primary" onClick={() => { handleWorkRequest(profileModal); setProfileModal(null); }}>🚀 Request Work</button>
            </div>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {compareModal && compareFreelancers.length >= 2 && (
        <div className="sd-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setCompareModal(false); }}>
          <div className="sd-modal" style={{ maxWidth: "900px" }}>
            <div className="sd-modal-header">
              <div>
                <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>⚖️ Side-by-Side Comparison</div>
                <div style={{ fontSize: "0.78rem", color: "var(--sd-text-muted)", marginTop: "3px" }}>Compare {compareFreelancers.length} freelancers to find the best match</div>
              </div>
              <button className="sd-close-btn" onClick={() => setCompareModal(false)}>✕</button>
            </div>
            <div className="sd-modal-body" style={{ overflowX: "auto" }}>
              {renderCompareTable(compareFreelancers)}
            </div>
          </div>
        </div>
      )}

      {/* Work Request Modal */}
      {workRequestModal && (
        <div className="sd-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setWorkRequestModal(null); }}>
          <div className="sd-modal" style={{ maxWidth: "600px" }}>
            <div className="sd-modal-header">
              <div>
                <div style={{ fontSize: "1.15rem", fontWeight: 700 }}>🚀 Send Work Request</div>
                <div style={{ fontSize: "0.82rem", color: "var(--sd-accent3)", marginTop: "3px" }}>To: {workRequestModal.name} · {workRequestModal.title}</div>
              </div>
              <button className="sd-close-btn" onClick={() => setWorkRequestModal(null)}>✕</button>
            </div>
            <div className="sd-modal-body">
              <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", padding: "0.875rem", background: "rgba(139,92,246,0.08)", border: "1px solid var(--sd-border)", borderRadius: "12px", marginBottom: "1.25rem" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: AVAIL_GRADIENTS[0], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{workRequestModal.avatar}</div>
                <div>
                  <div style={{ fontWeight: 700 }}>{workRequestModal.name}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--sd-text-muted)" }}>⭐ {workRequestModal.rating} · ${workRequestModal.hourlyRate}/hr · {workRequestModal.deliveryTime}</div>
                </div>
              </div>
              <div className="sd-form-group"><label className="sd-form-label">Project Title *</label><input className="sd-form-input" placeholder="e.g. Build a full-stack web app" value={workRequest.title} onChange={e => setWorkRequest(r => ({ ...r, title: e.target.value }))} /></div>
              <div className="sd-form-group"><label className="sd-form-label">Project Description *</label><textarea className="sd-form-textarea" placeholder="Describe your project, requirements, and expected outcome in detail..." value={workRequest.description} onChange={e => setWorkRequest(r => ({ ...r, description: e.target.value }))} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="sd-form-group"><label className="sd-form-label">Budget (USD)</label><input type="number" className="sd-form-input" placeholder="e.g. 3500" value={workRequest.budget} onChange={e => setWorkRequest(r => ({ ...r, budget: e.target.value }))} /></div>
                <div className="sd-form-group"><label className="sd-form-label">Deadline</label><input type="date" className="sd-form-input" value={workRequest.deadline} onChange={e => setWorkRequest(r => ({ ...r, deadline: e.target.value }))} /></div>
              </div>
            </div>
            <div className="sd-modal-footer">
              <button className="sd-btn sd-btn-ghost" onClick={() => setWorkRequestModal(null)}>Cancel</button>
              <button className="sd-btn sd-btn-primary sd-btn-lg" onClick={submitWorkRequest}>🚀 Send Work Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
