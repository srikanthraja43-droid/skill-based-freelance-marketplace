import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../features/auth/authSlice";
import { connectSocket } from "../socket/socket";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function SignupPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const defaultRole = params.get("role") || "client";
  const [form, setForm] = useState({ name: "", email: "", password: "", role: defaultRole, phone: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/signup", form);
      dispatch(setCredentials(data));
      connectSocket(data.accessToken);
      toast.success("Account created!");
      navigate(form.role === "provider" ? "/dashboard" : "/search", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card" style={{maxWidth: 460}}>
        <div className="auth-header">
          <div className="auth-logo">⚡</div>
          <h1>Join SkillMarket</h1>
          <p className="text-secondary">Create your free account today</p>
        </div>

        <div className="role-toggle">
          <button type="button" className={`role-btn ${form.role === "client" ? "active" : ""}`} onClick={() => setForm({...form, role: "client"})}>🔍 I need a service</button>
          <button type="button" className={`role-btn ${form.role === "provider" ? "active" : ""}`} onClick={() => setForm({...form, role: "provider"})}>🛠️ I provide services</button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" type="text" placeholder="John Doe" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Phone (optional)</label>
            <input className="form-input" type="tel" placeholder="+91 9876543210" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Min 6 characters" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{width:"100%"}} disabled={loading}>
            {loading ? <span className="spinner" /> : `Create ${form.role === "provider" ? "Provider" : "Client"} Account`}
          </button>
        </form>
        <p className="auth-footer">Already have an account? <Link to="/login" className="auth-link">Sign in</Link></p>
      </div>
    </div>
  );
}
