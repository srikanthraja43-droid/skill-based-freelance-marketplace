import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectUser, selectIsAuth, selectRole } from "../../features/auth/authSlice";
import { disconnectSocket } from "../../socket/socket";
import api from "../../api/axios";
import { useState } from "react";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectUser);
  const isAuth = useSelector(selectIsAuth);
  const role = useSelector(selectRole);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try { await api.post("/auth/logout"); } catch {}
    disconnectSocket();
    dispatch(logout());
    navigate("/");
  };

  const navLinks = {
    client: [{ to: "/search", label: "Find Services" }, { to: "/bookings", label: "My Bookings" }, { to: "/messages", label: "Messages" }],
    provider: [{ to: "/dashboard", label: "Dashboard" }, { to: "/bookings", label: "Bookings" }, { to: "/messages", label: "Messages" }],
    admin: [{ to: "/admin", label: "Admin Panel" }],
  };
  const links = navLinks[role] || [];

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">⚡</span>
          <span className="text-gradient">SkillMarket</span>
        </Link>

        <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
          {isAuth && links.map(l => (
            <Link key={l.to} to={l.to} className={`nav-link ${location.pathname === l.to ? "active" : ""}`} onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          ))}
          {!isAuth && (<>
            <Link to="/search" className="nav-link">Browse</Link>
            <Link to="/login" className="btn btn-ghost btn-sm" onClick={() => setMenuOpen(false)}>Log in</Link>
            <Link to="/signup" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>Sign up</Link>
          </>)}
          {isAuth && (
            <div className="nav-user">
              <Link to={role === "provider" ? "/dashboard" : "/profile"} className="nav-avatar-link">
                {user?.avatar ? <img src={user.avatar} alt={user.name} className="avatar avatar-sm" /> : <div className="avatar avatar-sm">{user?.name?.[0]?.toUpperCase()}</div>}
                <span className="nav-username">{user?.name?.split(" ")[0]}</span>
              </Link>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}
