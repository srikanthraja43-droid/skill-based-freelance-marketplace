import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../features/auth/authSlice";
import { connectSocket } from "../socket/socket";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      dispatch(setCredentials(data));
      connectSocket(data.accessToken);
      toast.success("Welcome back!");
      const redirect = data.user.role === "admin" ? "/admin" : data.user.role === "provider" ? "/dashboard" : from === "/" ? "/search" : from;
      navigate(redirect, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="42" height="42" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 2L32 10.0718V25.9282L18 34L4 25.9282V10.0718L18 2Z" fill="#635BFF"/>
              <path d="M18 8L26 12.6188V21.8542L18 26.473L10 21.8542V12.6188L18 8Z" fill="white" fillOpacity="0.25"/>
              <path d="M18 13.5L22 15.8094V20.4281L18 22.7375L14 20.4281V15.8094L18 13.5Z" fill="white"/>
            </svg>
          </div>
          <h1>Welcome back</h1>
          <p style={{ color: "#64748B", marginTop: "0.4rem" }}>Sign in to your SkillHive account</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{width:"100%"}} disabled={loading}>
            {loading ? <span className="spinner" /> : "Sign In"}
          </button>
        </form>
        <p className="auth-footer">
          Do not have an account? <Link to="/signup" className="auth-link">Create one</Link>
        </p>
      </div>
    </div>
  );
}
