import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../features/auth/authSlice";
import api from "../api/axios";
import Spinner from "../components/ui/Spinner";
import toast from "react-hot-toast";

const CATEGORIES = ["Plumbing","Electrical","Carpentry","Cleaning","Painting","Gardening","Tutoring","Photography","Cooking","Moving","IT Support","Beauty & Wellness","Fitness & Training","Pet Care","Other"];
const DAYS = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];

export default function ProviderDashboard() {
  const user = useSelector(selectUser);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);
  const [skillInput, setSkillInput] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: me }, { data: st }] = await Promise.all([api.get("/auth/me"), api.get("/bookings/my?limit=5")]);
        setProfile(me.providerProfile);
        setStats({ bookings: st.data, total: st.pagination?.total });
        if (me.providerProfile) {
          const p = me.providerProfile;
          setForm({ bio: p.bio || "", category: p.category || "Other", skills: [...(p.skills || [])], hourlyRate: p.hourlyRate || 0, serviceRadius: p.serviceRadius || 10, experience: p.experience || 0, languages: p.languages?.join(", ") || "English", isAvailable: p.isAvailable !== false, availability: { ...p.availability } });
        } else {
          setForm({ bio: "", category: "Other", skills: [], hourlyRate: 0, serviceRadius: 10, experience: 0, languages: "English", isAvailable: true, availability: { monday:true, tuesday:true, wednesday:true, thursday:true, friday:true, saturday:false, sunday:false, startTime:"09:00", endTime:"18:00" } });
        }
      } catch { toast.error("Could not load dashboard"); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const addSkill = () => {
    if (skillInput.trim() && !form.skills.includes(skillInput.trim())) {
      setForm(f => ({ ...f, skills: [...f.skills, skillInput.trim()] }));
      setSkillInput("");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, languages: form.languages.split(",").map(s => s.trim()) };
      const { data } = await api.post("/providers/profile", payload);
      setProfile(data.data);
      toast.success("Profile updated!");
    } catch (err) { toast.error(err.response?.data?.message || "Save failed"); }
    finally { setSaving(false); }
  };

  const handlePortfolioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    fd.append("caption", prompt("Caption for this image?") || "");
    try {
      await api.post("/providers/portfolio", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Portfolio image added!");
      const { data } = await api.get("/auth/me");
      setProfile(data.providerProfile);
    } catch { toast.error("Upload failed"); }
  };

  if (loading || !form) return <Spinner text="Loading dashboard..." />;

  const statusColor = { pending: "warning", accepted: "accent", rejected: "error", "in-progress": "accent", completed: "success", cancelled: "error" };

  return (
    <div className="container" style={{paddingTop:"2rem", paddingBottom:"3rem"}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem"}}>
        <div><h1 style={{fontSize:"1.75rem", fontWeight:800}}>Provider Dashboard</h1><p className="text-secondary">Manage your profile and bookings</p></div>
        <div style={{display:"flex", gap:"0.75rem", alignItems:"center"}}>
          {profile?.verificationStatus === "verified" && <span className="badge badge-success">✓ Verified</span>}
          {profile?.verificationStatus === "pending" && <span className="badge badge-warning">⏳ Pending Verification</span>}
          {(profile?.verificationStatus === "unverified" || !profile?.verificationStatus) && <a href="/verify" className="btn btn-secondary btn-sm">Get Verified</a>}
        </div>
      </div>

      <div className="tab-bar" style={{marginBottom:"1.5rem"}}>
        {["profile","portfolio","stats"].map(tab => <button key={tab} className={`tab-btn ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</button>)}
      </div>

      {activeTab === "profile" && (
        <form onSubmit={handleSave} className="fade-in">
          <div className="grid-2" style={{gap:"1.5rem"}}>
            <div style={{display:"flex", flexDirection:"column", gap:"1rem"}}>
              <div className="card">
                <h3 style={{marginBottom:"1rem"}}>Basic Info</h3>
                <div style={{display:"flex", flexDirection:"column", gap:"1rem"}}>
                  <div className="form-group"><label className="form-label">Category *</label>
                    <select className="form-input form-select" value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} required>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select></div>
                  <div className="form-group"><label className="form-label">Bio</label>
                    <textarea className="form-input form-textarea" placeholder="Describe your services and experience..." value={form.bio} onChange={e => setForm(f => ({...f, bio: e.target.value}))} /></div>
                  <div className="form-group"><label className="form-label">Hourly Rate (₹) *</label>
                    <input type="number" className="form-input" min="0" value={form.hourlyRate} onChange={e => setForm(f => ({...f, hourlyRate: Number(e.target.value)}))} required /></div>
                  <div className="form-group"><label className="form-label">Experience (years)</label>
                    <input type="number" className="form-input" min="0" value={form.experience} onChange={e => setForm(f => ({...f, experience: Number(e.target.value)}))} /></div>
                  <div className="form-group"><label className="form-label">Service Radius: {form.serviceRadius}km</label>
                    <input type="range" min="1" max="50" className="range-input" value={form.serviceRadius} onChange={e => setForm(f => ({...f, serviceRadius: Number(e.target.value)}))} /></div>
                  <div className="form-group"><label className="form-label">Languages (comma-separated)</label>
                    <input className="form-input" value={form.languages} onChange={e => setForm(f => ({...f, languages: e.target.value}))} /></div>
                </div>
              </div>
            </div>

            <div style={{display:"flex", flexDirection:"column", gap:"1rem"}}>
              <div className="card">
                <h3 style={{marginBottom:"1rem"}}>Skills</h3>
                <div style={{display:"flex", gap:"0.5rem", marginBottom:"0.75rem"}}>
                  <input className="form-input" placeholder="Add a skill..." value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => { if(e.key==="Enter"){e.preventDefault();addSkill();}}} />
                  <button type="button" className="btn btn-secondary btn-sm" onClick={addSkill}>Add</button>
                </div>
                <div style={{display:"flex", flexWrap:"wrap", gap:"0.5rem"}}>
                  {form.skills.map(s => <span key={s} className="tag active" onClick={() => setForm(f => ({...f, skills: f.skills.filter(x => x !== s)}))}>
                    {s} <span style={{marginLeft:"0.25rem", opacity:0.6}}>✕</span>
                  </span>)}
                  {form.skills.length === 0 && <p className="text-muted" style={{fontSize:"0.82rem"}}>No skills added yet</p>}
                </div>
              </div>

              <div className="card">
                <h3 style={{marginBottom:"1rem"}}>Availability</h3>
                <div className="avail-toggle-row">
                  {DAYS.map(d => <label key={d} className="avail-toggle">
                    <input type="checkbox" checked={form.availability?.[d] || false} onChange={e => setForm(f => ({...f, availability: {...f.availability, [d]: e.target.checked}}))} />
                    <span className={`avail-day-chip ${form.availability?.[d] ? "active" : ""}`}>{d.slice(0,3).toUpperCase()}</span>
                  </label>)}
                </div>
                <div className="grid-2" style={{marginTop:"1rem", gap:"0.75rem"}}>
                  <div className="form-group"><label className="form-label">Start Time</label>
                    <input type="time" className="form-input" value={form.availability?.startTime || "09:00"} onChange={e => setForm(f => ({...f, availability: {...f.availability, startTime: e.target.value}}))} /></div>
                  <div className="form-group"><label className="form-label">End Time</label>
                    <input type="time" className="form-input" value={form.availability?.endTime || "18:00"} onChange={e => setForm(f => ({...f, availability: {...f.availability, endTime: e.target.value}}))} /></div>
                </div>
              </div>

              <div className="card" style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
                <div><h4>Available for bookings</h4><p className="text-secondary" style={{fontSize:"0.82rem"}}>Toggle your availability status</p></div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={form.isAvailable} onChange={e => setForm(f => ({...f, isAvailable: e.target.checked}))} />
                  <span className="toggle-slider" />
                </label>
              </div>
            </div>
          </div>
          <div style={{marginTop:"1.5rem", display:"flex", justifyContent:"flex-end"}}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>{saving ? <span className="spinner" /> : "Save Profile"}</button>
          </div>
        </form>
      )}

      {activeTab === "portfolio" && (
        <div className="fade-in">
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem"}}>
            <h3>Portfolio Images</h3>
            <label className="btn btn-primary">
              + Add Image
              <input type="file" accept="image/*" style={{display:"none"}} onChange={handlePortfolioUpload} />
            </label>
          </div>
          {profile?.portfolio?.length === 0 || !profile?.portfolio ? (
            <div className="empty-state card"><p className="text-secondary">No portfolio images yet. Upload your first one!</p></div>
          ) : (
            <div className="portfolio-grid">{profile.portfolio.map((item, i) => (
              <div key={i} className="portfolio-item card">
                <img src={item.url} alt={item.caption} style={{width:"100%", borderRadius:"var(--radius-md)", objectFit:"cover", height:180}} />
                {item.caption && <p style={{fontSize:"0.82rem", color:"var(--text-secondary)", marginTop:"0.5rem"}}>{item.caption}</p>}
                <button className="btn btn-danger btn-sm" style={{marginTop:"0.5rem"}}
                  onClick={async () => { try { const { data } = await api.delete(`/providers/portfolio/${item._id}`); setProfile(data.data); toast.success("Removed"); } catch { toast.error("Failed"); } }}>
                  Remove
                </button>
              </div>
            ))}</div>
          )}
        </div>
      )}

      {activeTab === "stats" && (() => {
        const paidBookings = stats?.bookings?.filter(b => b.paymentStatus === "paid") || [];
        const totalEarnings = paidBookings.reduce((sum, b) => sum + (b.price || 0), 0);
        const escrowBalance = (stats?.bookings?.filter(b => b.paymentStatus !== "paid" && ["accepted", "in-progress"].includes(b.status)) || [])
          .reduce((sum, b) => sum + (b.price || 0), 0);

        return (
          <div className="fade-in">
            <div className="grid-4" style={{marginBottom:"1.5rem"}}>
              <div className="card" style={{textAlign:"center", background: "linear-gradient(135deg, #ECFDF5 0%, #FFFFFF 100%)", border: "1px solid #A7F3D0"}}>
                <div style={{fontSize:"1.75rem", fontWeight:800, color:"#059669"}}>₹{totalEarnings}</div>
                <div style={{fontSize:"0.82rem", fontWeight: 600, color:"#047857", marginTop:"0.25rem"}}>Total Earnings</div>
              </div>
              <div className="card" style={{textAlign:"center", background: "linear-gradient(135deg, #EEF2FF 0%, #FFFFFF 100%)", border: "1px solid #C7D2FE"}}>
                <div style={{fontSize:"1.75rem", fontWeight:800, color:"#4338CA"}}>₹{escrowBalance}</div>
                <div style={{fontSize:"0.82rem", fontWeight: 600, color:"#3730A3", marginTop:"0.25rem"}}>In Escrow</div>
              </div>
              <div className="card" style={{textAlign:"center"}}>
                <div style={{fontSize:"1.75rem", fontWeight:800, color:"var(--accent)"}}>{profile?.avgRating > 0 ? `${profile.avgRating}⭐` : "N/A"}</div>
                <div className="text-secondary" style={{fontSize:"0.82rem", marginTop:"0.25rem"}}>Rating ({profile?.reviewCount || 0} reviews)</div>
              </div>
              <div className="card" style={{textAlign:"center"}}>
                <div style={{fontSize:"1.75rem", fontWeight:800, color:"#0F172A"}}>{profile?.totalBookings || 0}</div>
                <div className="text-secondary" style={{fontSize:"0.82rem", marginTop:"0.25rem"}}>Completed Jobs</div>
              </div>
            </div>

            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3>Recent Client Requests & Payments</h3>
                <span className="badge badge-accent">Live Dashboard</span>
              </div>

              {stats?.bookings?.length === 0 ? <p className="text-secondary">No bookings yet</p> : stats?.bookings?.map(b => (
                <div key={b._id} className="booking-card" style={{padding:"0.85rem", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                  <div>
                    <strong style={{fontSize:"0.9rem", color: "#0F172A"}}>{b.service}</strong>
                    <p className="text-secondary" style={{fontSize:"0.78rem"}}>
                      Client: {b.clientId?.name} • {new Date(b.scheduledDate).toLocaleDateString()} at {b.scheduledTime}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#635BFF" }}>₹{b.price}</div>
                    <span className={`badge badge-${b.paymentStatus === "paid" ? "success" : statusColor[b.status] || "muted"}`}>
                      {b.paymentStatus === "paid" ? "💳 Paid" : b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

    </div>
  );
}
