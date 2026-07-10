import { useState } from "react";
import StarRating from "./StarRating";
import api from "../../api/axios";
import toast from "react-hot-toast";

const TAGS = ["Professional","On-time","Great quality","Good value","Friendly","Would recommend"];

export default function ReviewModal({ booking, onClose, onSuccess }) {
  const [form, setForm] = useState({ rating: 0, comment: "", tags: [] });
  const [loading, setLoading] = useState(false);

  const toggleTag = (tag) => setForm(f => ({ ...f, tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.rating === 0) { toast.error("Please select a rating"); return; }
    setLoading(true);
    try {
      await api.post("/reviews", { bookingId: booking._id, ...form });
      toast.success("Review submitted!");
      onSuccess?.();
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal fade-in">
        <div className="modal-header">
          <h2 className="modal-title">Leave a Review</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <p style={{color:"var(--text-secondary)", marginBottom:"1.5rem", fontSize:"0.9rem"}}>How was your experience for: <strong>{booking.service}</strong></p>
        <form onSubmit={handleSubmit} style={{display:"flex", flexDirection:"column", gap:"1.25rem"}}>
          <div>
            <label className="form-label" style={{marginBottom:"0.75rem", display:"block"}}>Rating *</label>
            <StarRating rating={form.rating} size={32} interactive onChange={(r) => setForm(f => ({...f, rating: r}))} />
          </div>
          <div className="form-group">
            <label className="form-label">What went well? (optional)</label>
            <div style={{display:"flex", flexWrap:"wrap", gap:"0.5rem"}}>
              {TAGS.map(tag => <button type="button" key={tag} className={`tag ${form.tags.includes(tag) ? "active" : ""}`} onClick={() => toggleTag(tag)}>{tag}</button>)}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Your Review *</label>
            <textarea className="form-input form-textarea" placeholder="Share your experience with this provider..." value={form.comment} onChange={e => setForm(f => ({...f, comment: e.target.value}))} required />
          </div>
          <div style={{display:"flex", gap:"0.75rem"}}>
            <button type="button" className="btn btn-secondary" style={{flex:1}} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{flex:1}} disabled={loading || form.rating === 0}>
              {loading ? <span className="spinner" /> : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
