import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../features/auth/authSlice";
import api from "../api/axios";
import toast from "react-hot-toast";
import Spinner from "../components/ui/Spinner";

export default function VerificationPage() {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    idDocumentType: "Aadhar Card",
    skillDocumentDescription: "",
  });
  const [idFile, setIdFile] = useState(null);
  const [skillFile, setSkillFile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/auth/me");
        setProfile(data.providerProfile);
      } catch (err) {
        toast.error("Could not fetch provider profile status");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idFile) {
      toast.error("Please upload your ID document");
      return;
    }

    setSubmitting(true);
    const fd = new FormData();
    fd.append("idDocumentType", form.idDocumentType);
    fd.append("idDocument", idFile);
    if (form.skillDocumentDescription) {
      fd.append("skillDocumentDescription", form.skillDocumentDescription);
    }
    if (skillFile) {
      fd.append("skillDocument", skillFile);
    }

    try {
      await api.post("/providers/verify", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Verification request submitted!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner text="Loading verification status..." />;

  const status = profile?.verificationStatus || "unverified";

  return (
    <div className="auth-page">
      <div className="auth-card card" style={{ maxWidth: 520, width: "100%" }}>
        <div className="auth-header">
          <div className="auth-logo">🛡️</div>
          <h1>Get Verified</h1>
          <p className="text-secondary">Verify your identity and skills to gain trust and more bookings</p>
        </div>

        {status === "verified" && (
          <div style={{ textAlign: "center", padding: "1.5rem" }}>
            <div style={{ fontSize: "3rem", color: "var(--success)", marginBottom: "1rem" }}>✅</div>
            <h3 style={{ color: "var(--success)" }}>Profile Verified</h3>
            <p className="text-secondary" style={{ marginTop: "0.5rem" }}>
              Your provider profile is fully verified. The verification badge is now active on your public profile card.
            </p>
            <button onClick={() => navigate("/dashboard")} className="btn btn-primary" style={{ marginTop: "1.5rem", width: "100%" }}>
              Go to Dashboard
            </button>
          </div>
        )}

        {status === "pending" && (
          <div style={{ textAlign: "center", padding: "1.5rem" }}>
            <div style={{ fontSize: "3rem", color: "var(--warning)", marginBottom: "1rem" }}>⏳</div>
            <h3 style={{ color: "var(--warning)" }}>Verification Pending</h3>
            <p className="text-secondary" style={{ marginTop: "0.5rem" }}>
              We are currently reviewing your documents. This process usually takes 24-48 hours. We'll update your dashboard status once complete.
            </p>
            <button onClick={() => navigate("/dashboard")} className="btn btn-secondary" style={{ marginTop: "1.5rem", width: "100%" }}>
              Back to Dashboard
            </button>
          </div>
        )}

        {status === "rejected" && (
          <div style={{ textAlign: "center", padding: "1.5rem", background: "rgba(239, 68, 68, 0.1)", borderRadius: "var(--radius-md)", marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "3rem", color: "var(--error)", marginBottom: "0.5rem" }}>⚠️</div>
            <h3 style={{ color: "var(--error)" }}>Verification Rejected</h3>
            <p className="text-secondary" style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
              Please review the instructions and submit valid documents to verify your identity.
            </p>
          </div>
        )}

        {(status === "unverified" || status === "rejected") && (
          <form onSubmit={handleSubmit} className="auth-form" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Select ID Document Type *</label>
              <select
                className="form-input form-select"
                value={form.idDocumentType}
                onChange={(e) => setForm({ ...form, idDocumentType: e.target.value })}
                required
              >
                <option value="Aadhar Card">Aadhar Card</option>
                <option value="PAN Card">PAN Card</option>
                <option value="Driving License">Driving License</option>
                <option value="Passport">Passport</option>
                <option value="Other">Other ID card</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Upload ID Document (Image/PDF) *</label>
              <input
                className="form-input"
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setIdFile(e.target.files[0])}
                required
              />
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                Make sure the photo, name, and details are clearly visible.
              </p>
            </div>

            <div className="divider" style={{ margin: "1rem 0" }} />

            <div className="form-group">
              <label className="form-label">Skill Credentials / Certifications (optional)</label>
              <textarea
                className="form-input form-textarea"
                style={{ minHeight: 70 }}
                placeholder="Describe any professional certificates, degrees or workspace records..."
                value={form.skillDocumentDescription}
                onChange={(e) => setForm({ ...form, skillDocumentDescription: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Upload Skill Certificate (Image/PDF) (optional)</label>
              <input
                className="form-input"
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setSkillFile(e.target.files[0])}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }} disabled={submitting}>
              {submitting ? <span className="spinner" /> : "Submit Verification"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
