import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser, selectIsAuth } from "../features/auth/authSlice";
import api from "../api/axios";
import StarRating from "../components/ui/StarRating";
import Spinner from "../components/ui/Spinner";
import BookingModal from "../components/ui/BookingModal";
import toast from "react-hot-toast";

export default function ProviderProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const isAuth = useSelector(selectIsAuth);
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [activeTab, setActiveTab] = useState("about");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [{ data: pd }, { data: rv }] = await Promise.all([
          api.get(`/providers/${id}`),
          api.get(`/reviews/provider/${id}`),
        ]);
        setProfile(pd.data);
        setReviews(rv.data);
      } catch { toast.error("Profile not found"); navigate("/search"); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [id]);

  if (loading) return <Spinner text="Loading profile..." />;
  if (!profile) return null;

  const u = profile.userId || {};
  const days = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
  const availDays = days.filter(d => profile.availability?.[d]);

  return (
    <div className="profile-page">
      <div className="container" style={{paddingTop: "2rem"}}>
        <div className="profile-layout">
          {/* Sidebar */}
          <div className="profile-sidebar">
            <div className="card profile-card">
              <div className="profile-avatar-wrap">
                {u.avatar ? <img src={u.avatar} alt={u.name} className="avatar avatar-xl" /> : <div className="avatar avatar-xl">{u.name?.[0]?.toUpperCase()}</div>}
                {profile.verificationStatus === "verified" && <span className="verified-badge">✓ Verified</span>}
              </div>
              <h2 className="profile-name">{u.name}</h2>
              <span className="badge badge-accent">{profile.category}</span>
              <div className="profile-rating">
                <StarRating rating={profile.avgRating} size={18} />
                <span>{profile.avgRating > 0 ? profile.avgRating.toFixed(1) : "New"} ({profile.reviewCount} reviews)</span>
              </div>
              <div className="profile-stats">
                <div className="pstat"><span className="pstat-val">₹{profile.hourlyRate}</span><span className="pstat-label">per hour</span></div>
                <div className="pstat"><span className="pstat-val">{profile.totalBookings}</span><span className="pstat-label">completed</span></div>
                <div className="pstat"><span className="pstat-val">{profile.experience}y</span><span className="pstat-label">experience</span></div>
              </div>
              {isAuth && user?._id !== id && user?.role === "client" && (
                <button className="btn btn-primary" style={{width:"100%", marginTop:"1rem"}} onClick={() => setShowBooking(true)}>Book Now</button>
              )}
              {isAuth && user?._id !== id && (
                <button className="btn btn-secondary" style={{width:"100%", marginTop:"0.5rem"}}
                  onClick={async () => {
                    try {
                      const { data } = await api.post("/messages/conversation", { participantId: id });
                      navigate("/messages", { state: { conversationId: data.data._id } });
                    } catch { toast.error("Could not start chat"); }
                  }}>💬 Message</button>
              )}
            </div>

            <div className="card" style={{marginTop:"1rem"}}>
              <h4>Availability</h4>
              <div className="avail-days">
                {days.map(d => <span key={d} className={`avail-day ${availDays.includes(d) ? "active" : ""}`}>{d.slice(0,3).toUpperCase()}</span>)}
              </div>
              <p style={{fontSize:"0.82rem", color:"var(--text-secondary)", marginTop:"0.5rem"}}>{profile.availability?.startTime} – {profile.availability?.endTime}</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="profile-main">
            <div className="profile-tabs">
              {["about","portfolio","reviews"].map(tab => (
                <button key={tab} className={`tab-btn ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {activeTab === "about" && (
              <div className="tab-content fade-in">
                <div className="card" style={{marginBottom:"1rem"}}>
                  <h3>About</h3>
                  <p style={{marginTop:"0.75rem", color:"var(--text-secondary)", lineHeight:"1.7"}}>{profile.bio || "No bio provided yet."}</p>
                </div>
                <div className="card" style={{marginBottom:"1rem"}}>
                  <h3>Skills</h3>
                  <div className="skills-wrap" style={{marginTop:"0.75rem", display:"flex", flexWrap:"wrap", gap:"0.5rem"}}>
                    {profile.skills?.map(s => <span key={s} className="tag active">{s}</span>)}
                  </div>
                </div>
                <div className="card">
                  <h3>Languages</h3>
                  <div style={{marginTop:"0.75rem", display:"flex", gap:"0.5rem", flexWrap:"wrap"}}>
                    {profile.languages?.map(l => <span key={l} className="badge badge-muted">{l}</span>)}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "portfolio" && (
              <div className="tab-content fade-in">
                {profile.portfolio?.length === 0 ? (
                  <div className="empty-state card"><p className="text-secondary">No portfolio items yet.</p></div>
                ) : (
                  <div className="portfolio-grid">
                    {profile.portfolio?.map((item, i) => (
                      <div key={i} className="portfolio-item card">
                        <img src={item.url} alt={item.caption || `Work ${i+1}`} style={{width:"100%", borderRadius:"var(--radius-md)", objectFit:"cover", height:180}} />
                        {item.caption && <p style={{fontSize:"0.82rem", color:"var(--text-secondary)", marginTop:"0.5rem"}}>{item.caption}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="tab-content fade-in">
                {reviews.length === 0 ? (
                  <div className="empty-state card"><p className="text-secondary">No reviews yet.</p></div>
                ) : reviews.map(r => (
                  <div key={r._id} className="card review-card" style={{marginBottom:"1rem"}}>
                    <div className="review-header">
                      <div className="review-user">
                        {r.reviewerId?.avatar ? <img src={r.reviewerId.avatar} alt="" className="avatar avatar-sm" /> : <div className="avatar avatar-sm">{r.reviewerId?.name?.[0]}</div>}
                        <div><strong>{r.reviewerId?.name}</strong><p style={{fontSize:"0.78rem",color:"var(--text-muted)"}}>{new Date(r.createdAt).toLocaleDateString()}</p></div>
                      </div>
                      <StarRating rating={r.rating} size={14} />
                    </div>
                    <p style={{marginTop:"0.75rem", color:"var(--text-secondary)", fontSize:"0.9rem"}}>{r.comment}</p>
                    {r.tags?.length > 0 && <div style={{display:"flex", gap:"0.5rem", marginTop:"0.5rem", flexWrap:"wrap"}}>{r.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showBooking && <BookingModal provider={profile} onClose={() => setShowBooking(false)} />}
    </div>
  );
}
