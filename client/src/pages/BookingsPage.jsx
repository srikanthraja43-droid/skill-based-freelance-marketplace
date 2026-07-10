import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectRole } from "../features/auth/authSlice";
import api from "../api/axios";
import toast from "react-hot-toast";
import Spinner from "../components/ui/Spinner";
import ReviewModal from "../components/ui/ReviewModal";

const STATUS_COLORS = { pending: "warning", accepted: "accent", rejected: "error", "in-progress": "accent", completed: "success", cancelled: "error" };
const TABS = ["all", "pending", "accepted", "in-progress", "completed", "cancelled"];

export default function BookingsPage() {
  const role = useSelector(selectRole);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [reviewBooking, setReviewBooking] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const q = activeTab !== "all" ? `?status=${activeTab}` : "";
      const { data } = await api.get(`/bookings/my${q}`);
      setBookings(data.data);
    } catch { toast.error("Could not load bookings"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, [activeTab]);

  const updateStatus = async (bookingId, status, reason) => {
    try {
      const body = { status };
      if (reason) body[status === "rejected" ? "rejectionReason" : "cancellationReason"] = reason;
      const { data } = await api.patch(`/bookings/${bookingId}/status`, body);
      setBookings(prev => prev.map(b => b._id === bookingId ? data.data : b));
      toast.success(`Booking ${status}`);
    } catch (err) { toast.error(err.response?.data?.message || "Update failed"); }
  };

  return (
    <div className="container" style={{paddingTop:"2rem", paddingBottom:"3rem"}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem"}}>
        <div>
          <h1 style={{fontSize:"1.75rem", fontWeight:800}}>My Bookings</h1>
          <p className="text-secondary">Track and manage your {role === "provider" ? "service requests" : "bookings"}</p>
        </div>
        {role === "client" && <button className="btn btn-primary" onClick={() => navigate("/search")}>+ New Booking</button>}
      </div>

      <div className="tab-bar">
        {TABS.map(tab => <button key={tab} className={`tab-btn ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</button>)}
      </div>

      {loading ? <Spinner text="Loading bookings..." /> : bookings.length === 0 ? (
        <div className="empty-state card" style={{marginTop:"2rem"}}>
          <div className="empty-icon">📋</div>
          <h3>No bookings found</h3>
          <p className="text-secondary">{role === "client" ? "Find a provider and make your first booking!" : "Accept requests from clients to get started."}</p>
          {role === "client" && <button className="btn btn-primary" style={{marginTop:"1rem"}} onClick={() => navigate("/search")}>Browse Providers</button>}
        </div>
      ) : (
        <div style={{display:"flex", flexDirection:"column", gap:"1rem", marginTop:"1.5rem"}}>
          {bookings.map(booking => (
            <div key={booking._id} className="card booking-card fade-in">
              <div className="booking-header">
                <div>
                  <div style={{display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"0.25rem"}}>
                    <h3 style={{fontSize:"1rem", fontWeight:600}}>{booking.service}</h3>
                    <span className={`badge badge-${STATUS_COLORS[booking.status]}`}>{booking.status}</span>
                  </div>
                  <p className="text-secondary" style={{fontSize:"0.85rem"}}>
                    {role === "client" ? `With ${booking.providerId?.name}` : `From ${booking.clientId?.name}`} • {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime}
                  </p>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontWeight:700, fontSize:"1.1rem"}}>₹{booking.price}</div>
                  <div style={{fontSize:"0.8rem", color:"var(--text-muted)"}}>{booking.estimatedHours}h</div>
                </div>
              </div>

              {booking.notes && <p style={{fontSize:"0.85rem", color:"var(--text-secondary)", marginTop:"0.5rem", padding:"0.5rem", background:"var(--bg-elevated)", borderRadius:"var(--radius-sm)"}}>📝 {booking.notes}</p>}

              <div className="booking-actions">
                {role === "provider" && booking.status === "pending" && (<>
                  <button className="btn btn-primary btn-sm" onClick={() => updateStatus(booking._id, "accepted")}>✓ Accept</button>
                  <button className="btn btn-danger btn-sm" onClick={() => { const r = prompt("Reason for rejection?"); if (r) updateStatus(booking._id, "rejected", r); }}>✕ Reject</button>
                </>)}
                {role === "provider" && booking.status === "accepted" && <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(booking._id, "in-progress")}>▶ Start Work</button>}
                {role === "provider" && booking.status === "in-progress" && <button className="btn btn-primary btn-sm" onClick={() => updateStatus(booking._id, "completed")}>✓ Mark Complete</button>}
                {role === "client" && ["pending","accepted"].includes(booking.status) && <button className="btn btn-danger btn-sm" onClick={() => { const r = prompt("Reason?"); if (r !== null) updateStatus(booking._id, "cancelled", r); }}>Cancel</button>}
                {role === "client" && booking.status === "completed" && !booking.isReviewedByClient && <button className="btn btn-primary btn-sm" onClick={() => setReviewBooking(booking)}>⭐ Leave Review</button>}
                <button className="btn btn-ghost btn-sm" onClick={async () => {
                  const otherId = role === "client" ? booking.providerId?._id : booking.clientId?._id;
                  try { const { data } = await api.post("/messages/conversation", { participantId: otherId, bookingId: booking._id }); navigate("/messages", { state: { conversationId: data.data._id } }); }
                  catch { toast.error("Could not open chat"); }
                }}>💬 Chat</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {reviewBooking && <ReviewModal booking={reviewBooking} onClose={() => setReviewBooking(null)} onSuccess={fetchBookings} />}
    </div>
  );
}
