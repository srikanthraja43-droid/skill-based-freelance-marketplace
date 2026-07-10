import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function BookingModal({ provider, onClose }) {
  const navigate = useNavigate();
  const u = provider.userId || {};
  const [form, setForm] = useState({ service: "", scheduledDate: "", scheduledTime: "10:00", estimatedHours: 1, notes: "" });
  const [loading, setLoading] = useState(false);
  const totalPrice = provider.hourlyRate * form.estimatedHours;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/bookings", {
        providerId: u._id,
        category: provider.category,
        price: totalPrice,
        ...form,
      });
      toast.success("Booking request sent!");
      onClose();
      navigate("/bookings");
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal fade-in">
        <div className="modal-header">
          <h2 className="modal-title">Book {u.name}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div style={{marginBottom:"1rem", padding:"1rem", background:"var(--bg-elevated)", borderRadius:"var(--radius-md)", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <span style={{color:"var(--text-secondary)"}}>Rate: ₹{provider.hourlyRate}/hr</span>
          <span style={{fontWeight:700, color:"var(--accent)"}}>Total: ₹{totalPrice}</span>
        </div>
        <form onSubmit={handleSubmit} style={{display:"flex", flexDirection:"column", gap:"1rem"}}>
          <div className="form-group">
            <label className="form-label">Service Description *</label>
            <textarea className="form-input form-textarea" placeholder="Describe what you need done..." value={form.service} onChange={e => setForm({...form, service: e.target.value})} required />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input className="form-input" type="date" min={new Date().toISOString().split("T")[0]} value={form.scheduledDate} onChange={e => setForm({...form, scheduledDate: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Time *</label>
              <input className="form-input" type="time" value={form.scheduledTime} onChange={e => setForm({...form, scheduledTime: e.target.value})} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Estimated Hours: {form.estimatedHours}h</label>
            <input type="range" min="0.5" max="10" step="0.5" value={form.estimatedHours} onChange={e => setForm({...form, estimatedHours: parseFloat(e.target.value)})} className="range-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Additional Notes</label>
            <textarea className="form-input form-textarea" style={{minHeight:70}} placeholder="Any specific requirements..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
          </div>
          <div style={{display:"flex", gap:"0.75rem"}}>
            <button type="button" className="btn btn-secondary" style={{flex:1}} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{flex:1}} disabled={loading}>
              {loading ? <span className="spinner" /> : "Confirm Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
