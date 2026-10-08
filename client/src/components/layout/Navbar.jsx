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
  const [navSearch, setNavSearch] = useState("");

  const handleLogout = async () => {
    try { await api.post("/auth/logout"); } catch {}
    disconnectSocket();
    dispatch(logout());
    navigate("/");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(navSearch.trim())}`);
    } else {
      navigate("/search");
    }
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
        <div className="navbar-left">
          <Link to="/" className="navbar-brand">
            <svg className="brand-icon-svg" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 2L32 10.0718V25.9282L18 34L4 25.9282V10.0718L18 2Z" fill="#635BFF"/>
              <path d="M18 8L26 12.6188V21.8542L18 26.473L10 21.8542V12.6188L18 8Z" fill="white" fillOpacity="0.25"/>
              <path d="M18 13.5L22 15.8094V20.4281L18 22.7375L14 20.4281V15.8094L18 13.5Z" fill="white"/>
            </svg>
            <span className="brand-title">SkillHive</span>
          </Link>

          <div className="navbar-nav">
            <Link to="/dashboards" className="nav-item-dropdown" style={{ color: "var(--accent)", fontWeight: 700 }}>
              ❖ 3 Dashboards Hub
            </Link>
            <Link to="/freelancer-dashboard" className="nav-item-dropdown">
              ⚡ Freelancer
            </Link>
            <Link to="/client-dashboard" className="nav-item-dropdown">
              🏢 Client
            </Link>
            <Link to="/selection-dashboard" className="nav-item-dropdown">
              🎯 Talent Match
            </Link>
          </div>
        </div>

        {/* Search Input Bar in Navbar */}
        <form className="navbar-search" onSubmit={handleSearchSubmit}>
          <span className="navbar-search-icon">🔍</span>
          <input
            type="text"
            className="navbar-search-input"
            placeholder="Search skills, services or talent..."
            value={navSearch}
            onChange={(e) => setNavSearch(e.target.value)}
          />
          <button type="submit" className="navbar-search-btn">➔</button>
        </form>

        <div className="navbar-actions">
          <Link to="/dashboards" className="btn btn-primary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
            <span>⚡</span> Open Dashboards
          </Link>
          {!isAuth ? (
            <Link to="/signup?role=provider" className="seller-link">Become a Seller</Link>
          ) : (
            <div className="nav-user">
              {links.map(l => (
                <Link key={l.to} to={l.to} className={`nav-link ${location.pathname === l.to ? "active" : ""}`}>
                  {l.label}
                </Link>
              ))}
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

        {/* Mobile menu dropdown */}
        <div className={`navbar-links-mobile ${menuOpen ? "open" : ""}`}>
          <Link to="/search" onClick={() => setMenuOpen(false)}>Categories</Link>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How It Works</a>
          <Link to="/signup?role=provider" onClick={() => setMenuOpen(false)}>Become a Seller</Link>
          {isAuth && (
            <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
          )}
        </div>
      </div>
    </nav>
  );
}

