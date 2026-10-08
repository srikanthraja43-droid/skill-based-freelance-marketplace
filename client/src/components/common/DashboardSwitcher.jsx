import { Link, useLocation } from "react-router-dom";
import { useMarketplaceStore } from "../../utils/marketplaceStore";
import toast from "react-hot-toast";
import "./DashboardSwitcher.css";

export default function DashboardSwitcher({ currentDashboard }) {
  const location = useLocation();
  const { jobs, applications, resetToDefaults } = useMarketplaceStore();

  const handleReset = () => {
    resetToDefaults();
    toast.success("Marketplace demo data reset to initial state!");
  };

  const navItems = [
    {
      id: "freelancer",
      path: "/freelancer-dashboard",
      icon: "⚡",
      name: "1. Freelancer Portal",
      desc: "Find & Apply for Jobs",
      badge: `${jobs.length} Jobs`
    },
    {
      id: "client",
      path: "/client-dashboard",
      icon: "🏢",
      name: "2. Client / Owner Portal",
      desc: "Post Jobs & Review Bids",
      badge: `${applications.length} Applicants`
    },
    {
      id: "selection",
      path: "/selection-dashboard",
      icon: "🎯",
      name: "3. Talent Selection Portal",
      desc: "Filter, Compare & Hire",
      badge: "Smart Match"
    }
  ];

  return (
    <header className={`dash-global-bar theme-${currentDashboard}`}>
      <div className="dash-global-left">
        <Link to="/dashboards" className="dash-portal-hub-link" title="Return to Portal Overview">
          <span className="dash-portal-icon">❖</span>
          <span className="dash-portal-label">Marketplace Hub</span>
        </Link>
        <span className="dash-divider">/</span>
        <div className="dash-switcher-tabs">
          {navItems.map((item) => {
            const isActive = currentDashboard === item.id || location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`dash-switcher-btn ${isActive ? "active" : ""}`}
              >
                <span className="dash-btn-icon">{item.icon}</span>
                <span className="dash-btn-name">{item.name}</span>
                {item.badge && <span className="dash-btn-badge">{item.badge}</span>}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="dash-global-right">
        <div className="dash-sync-indicator" title="Changes in one dashboard automatically update the other two in real time">
          <span className="dash-pulse-dot"></span>
          <span className="dash-sync-text">Live Synced Across 3 Dashboards</span>
        </div>
        <button
          onClick={handleReset}
          className="dash-reset-btn"
          title="Reset sample jobs, applications & talent to initial demo state"
        >
          🔄 Reset Demo
        </button>
        <Link to="/" className="dash-home-btn" title="Back to Main Landing Page">
          🏠 Home
        </Link>
      </div>
    </header>
  );
}
