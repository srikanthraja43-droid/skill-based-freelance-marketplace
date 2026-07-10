import { useEffect, useState } from "react";
import api from "../api/axios";
import Spinner from "../components/ui/Spinner";
import toast from "react-hot-toast";

const TABS = ["overview","users","verifications"];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/admin/stats").then(({ data }) => { setStats(data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === "users") {
      api.get(`/admin/users?search=${search}`).then(({ data }) => setUsers(data.data)).catch(() => toast.error("Could not load users"));
    }
    if (activeTab === "verifications") {
      api.get("/admin/verifications").then(({ data }) => setVerifications(data.data)).catch(() => toast.error("Could not load verifications"));
    }
  }, [activeTab, search]);

  const banUser = async (id, isActive) => {
    try {
      await api.patch(`/admin/users/${id}/ban`);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: !u.isActive } : u));
      toast.success(isActive ? "User banned" : "User activated");
    } catch { toast.error("Failed"); }
  };

  const reviewVerif = async (id, status) => {
    const note = status === "rejected" ? prompt("Reason for rejection?") : "";
    try {
      await api.patch(`/admin/verifications/${id}`, { status, adminNote: note });
      setVerifications(prev => prev.filter(v => v._id !== id));
      toast.success(`Verification ${status}`);
    } catch { toast.error("Failed"); }
  };

  if (loading) return <Spinner text="Loading admin panel..." />;

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers, color: "var(--accent)", icon: "👥" },
    { label: "Providers", value: stats?.totalProviders, color: "var(--success)", icon: "🛠️" },
    { label: "Clients", value: stats?.totalClients, color: "#3b82f6", icon: "👤" },
    { label: "Total Bookings", value: stats?.totalBookings, color: "var(--warning)", icon: "📋" },
    { label: "Pending Verifications", value: stats?.pendingVerifications, color: "var(--error)", icon: "⚠️" },
  ];

  return (
    <div className="container" style={{paddingTop:"2rem", paddingBottom:"3rem"}}>
      <div style={{marginBottom:"1.5rem"}}>
        <h1 style={{fontSize:"1.75rem", fontWeight:800}}>Admin Dashboard</h1>
        <p className="text-secondary">Platform overview and management</p>
      </div>

      <div className="tab-bar" style={{marginBottom:"1.5rem"}}>
        {TABS.map(tab => <button key={tab} className={`tab-btn ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
          {tab === "verifications" && stats?.pendingVerifications > 0 && <span className="badge badge-error" style={{marginLeft:"0.5rem"}}>{stats.pendingVerifications}</span>}
        </button>)}
      </div>

      {activeTab === "overview" && (
        <div className="fade-in">
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:"1rem", marginBottom:"2rem"}}>
            {statCards.map(s => (
              <div key={s.label} className="card" style={{textAlign:"center", position:"relative", overflow:"hidden"}}>
                <div style={{fontSize:"2rem", marginBottom:"0.25rem"}}>{s.icon}</div>
                <div style={{fontSize:"2.5rem", fontWeight:900, color:s.color}}>{s.value ?? 0}</div>
                <div className="text-secondary" style={{fontSize:"0.82rem"}}>{s.label}</div>
              </div>
            ))}
          </div>
          {stats?.bookingStatusMap && (
            <div className="card">
              <h3 style={{marginBottom:"1rem"}}>Booking Status Breakdown</h3>
              {Object.entries(stats.bookingStatusMap).map(([status, count]) => (
                <div key={status} style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0.6rem 0", borderBottom:"1px solid var(--border)"}}>
                  <span style={{textTransform:"capitalize"}}>{status}</span>
                  <div style={{display:"flex", alignItems:"center", gap:"1rem"}}>
                    <div style={{width:120, background:"var(--bg-elevated)", borderRadius:4, overflow:"hidden", height:6}}>
                      <div style={{width:`${(count/(stats.totalBookings||1))*100}%`, height:"100%", background:"var(--accent)"}} />
                    </div>
                    <span style={{fontWeight:700, minWidth:32, textAlign:"right"}}>{count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "users" && (
        <div className="fade-in">
          <div style={{marginBottom:"1rem"}}>
            <input className="form-input" placeholder="Search users by name or email..." value={search} onChange={e => setSearch(e.target.value)} style={{maxWidth:400}} />
          </div>
          <div className="card" style={{overflow:"auto"}}>
            <table className="admin-table">
              <thead><tr><th>User</th><th>Role</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td><div style={{display:"flex", alignItems:"center", gap:"0.75rem"}}>{u.avatar ? <img src={u.avatar} className="avatar avatar-sm" alt="" /> : <div className="avatar avatar-sm">{u.name?.[0]}</div>}<div><strong>{u.name}</strong><div style={{fontSize:"0.78rem", color:"var(--text-muted)"}}>{u.email}</div></div></div></td>
                    <td><span className={`badge badge-${u.role === "provider" ? "success" : u.role === "admin" ? "error" : "accent"}`}>{u.role}</span></td>
                    <td style={{color:"var(--text-secondary)", fontSize:"0.85rem"}}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td><span className={`badge badge-${u.isActive ? "success" : "error"}`}>{u.isActive ? "Active" : "Banned"}</span></td>
                    <td>{u.role !== "admin" && <button className={`btn btn-sm ${u.isActive ? "btn-danger" : "btn-secondary"}`} onClick={() => banUser(u._id, u.isActive)}>{u.isActive ? "Ban" : "Activate"}</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <p className="text-secondary" style={{padding:"1.5rem"}}>No users found.</p>}
          </div>
        </div>
      )}

      {activeTab === "verifications" && (
        <div className="fade-in">
          {verifications.length === 0 ? (
            <div className="empty-state card"><div className="empty-icon">✅</div><h3>All caught up!</h3><p className="text-secondary">No pending verification requests.</p></div>
          ) : verifications.map(v => (
            <div key={v._id} className="card" style={{marginBottom:"1rem", display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"1rem", flexWrap:"wrap"}}>
              <div>
                <div style={{display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"0.5rem"}}>
                  {v.userId?.avatar ? <img src={v.userId.avatar} alt="" className="avatar" /> : <div className="avatar">{v.userId?.name?.[0]}</div>}
                  <div><strong>{v.userId?.name}</strong><div style={{fontSize:"0.8rem", color:"var(--text-muted)"}}>{v.userId?.email}</div></div>
                </div>
                <p style={{fontSize:"0.85rem", color:"var(--text-secondary)"}}>ID Type: <strong>{v.idDocumentType}</strong></p>
                {v.skillDocumentDescription && <p style={{fontSize:"0.85rem", color:"var(--text-secondary)"}}>Skill Doc: {v.skillDocumentDescription}</p>}
                <p style={{fontSize:"0.78rem", color:"var(--text-muted)", marginTop:"0.25rem"}}>Submitted: {new Date(v.createdAt).toLocaleDateString()}</p>
                <div style={{display:"flex", gap:"0.75rem", marginTop:"0.75rem"}}>
                  <a href={v.idDocumentUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">View ID Doc</a>
                  {v.skillDocumentUrl && <a href={v.skillDocumentUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">View Skill Doc</a>}
                </div>
              </div>
              <div style={{display:"flex", gap:"0.75rem"}}>
                <button className="btn btn-primary btn-sm" onClick={() => reviewVerif(v._id, "approved")}>✓ Approve</button>
                <button className="btn btn-danger btn-sm" onClick={() => reviewVerif(v._id, "rejected")}>✕ Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
