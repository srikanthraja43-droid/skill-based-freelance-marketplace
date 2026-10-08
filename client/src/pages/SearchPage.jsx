import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import ProviderCard from "../components/ui/ProviderCard";
import Spinner from "../components/ui/Spinner";
import toast from "react-hot-toast";
import AIMatchModal from "../components/ui/AIMatchModal";

const CATEGORIES = ["All","Plumbing","Electrical","Carpentry","Cleaning","Painting","Gardening","Tutoring","Photography","Cooking","Moving","IT Support","Beauty & Wellness","Fitness & Training","Pet Care","Other"];
const SORT_OPTIONS = [{ value: "avgRating", label: "Top Rated" }, { value: "price_asc", label: "Price: Low to High" }, { value: "price_desc", label: "Price: High to Low" }, { value: "reviews", label: "Most Reviewed" }];
const FEATURED_TALENT = [
  { name: "Rohit Sharma", verified: true, title: "Full Stack Developer", rating: "4.9", reviews: "85", location: "From India", rate: "$25 /hr", avatar: "/images/rohit.png" },
  { name: "Sneha Patel", verified: true, title: "UI/UX Designer", rating: "4.8", reviews: "60", location: "From India", rate: "$20 /hr", avatar: "/images/sneha.png" },
  { name: "Arjun Verma", verified: true, title: "Digital Marketer", rating: "4.8", reviews: "70", location: "From India", rate: "$18 /hr", avatar: "/images/arjun.png" },
  { name: "Priya Singh", verified: true, title: "Content Writer", rating: "4.8", reviews: "45", location: "From India", rate: "$18 /hr", avatar: "/images/priya.png" },
];

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [showAI, setShowAI] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "map"
  const [expressMode, setExpressMode] = useState(false);

  const [filters, setFilters] = useState({
    skill: params.get("skill") || "",
    category: params.get("category") || "",
    lat: "", lng: "", radius: "15",
    minRate: "", maxRate: "", minRating: "",
    sort: "avgRating", page: 1,
  });

  const search = useCallback(async (f = filters) => {
    setLoading(true);
    try {
      const q = new URLSearchParams(Object.fromEntries(Object.entries(f).filter(([,v]) => v !== "" && v !== null)));
      const { data } = await api.get(`/providers/search?${q}`);
      setProviders(data.data);
      setPagination(data.pagination);
    } catch { toast.error("Search failed"); } finally { setLoading(false); }
  }, []);

  useEffect(() => { search(); }, []);

  const handleGeolocate = () => {
    if (!navigator.geolocation) { toast.error("Geolocation not supported"); return; }
    navigator.geolocation.getCurrentPosition(pos => {
      const newF = { ...filters, lat: pos.coords.latitude.toString(), lng: pos.coords.longitude.toString() };
      setFilters(newF);
      search(newF);
      toast.success("GPS Location detected!");
    }, () => toast.error("Could not get location"));
  };

  const handleFilterChange = (key, val) => setFilters(prev => ({ ...prev, [key]: val, page: 1 }));
  const handleSearch = (e) => { e.preventDefault(); search(filters); };
  const resetFilters = () => {
    const resetF = { skill: "", category: "", lat: "", lng: "", radius: "50", minRate: "", maxRate: "", minRating: "", sort: "avgRating", page: 1 };
    setFilters(resetF);
    setExpressMode(false);
    search(resetF);
  };

  const filteredProviders = expressMode
    ? providers.filter(p => p.avgRating >= 4.7)
    : providers;

  return (
    <div className="search-page">
      <div className="search-hero">
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h1 style={{ margin: 0 }}>Find Local Experts</h1>
              <p className="text-secondary" style={{ marginTop: "0.2rem" }}>
                Hyperlocal freelancers with verified skills & GPS distance matching
              </p>
            </div>
            <button
              className="btn btn-primary"
              style={{ background: "linear-gradient(135deg, #635BFF 0%, #7C3AED 100%)", fontWeight: 700, padding: "0.75rem 1.25rem" }}
              onClick={() => setShowAI(true)}
            >
              ✨ SkillHive AI Match
            </button>
          </div>

          <form className="search-bar" onSubmit={handleSearch}>
            <input className="form-input search-input" placeholder="Search by skill (e.g. electrician, tutor, developer...)" value={filters.skill} onChange={e => handleFilterChange("skill", e.target.value)} />
            <button type="button" className="btn btn-secondary" onClick={handleGeolocate} title="Use my GPS location">📍 Near Me</button>
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>
      </div>

      <div className="container search-layout">
        {/* Sidebar Filters */}
        <aside className="search-filters card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>Filters</h3>
            <span className="badge badge-accent">Live GPS</span>
          </div>
          
          <div className="divider" />
          
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-input form-select" value={filters.category} onChange={e => handleFilterChange("category", e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c === "All" ? "" : c}>{c}</option>)}
            </select>
          </div>

          {/* Express Emergency Dispatch Toggle */}
          <div style={{ background: "#EEF2FF", border: "1px solid #C7D2FE", borderRadius: "10px", padding: "0.75rem", margin: "0.5rem 0" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.85rem", fontWeight: 700, color: "#4338CA" }}>
              <input
                type="checkbox"
                checked={expressMode}
                onChange={(e) => setExpressMode(e.target.checked)}
              />
              ⚡ 2-Hour Express Dispatch
            </label>
            <span style={{ fontSize: "0.72rem", color: "#6366F1", display: "block", marginTop: "0.2rem" }}>
              Filter top-rated rapid response pros
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Radius: {filters.radius} km</label>
            <input type="range" min="1" max="50" value={filters.radius} onChange={e => handleFilterChange("radius", e.target.value)} className="range-input" />
          </div>

          <div className="form-group">
            <label className="form-label">Min Rating</label>
            <select className="form-input form-select" value={filters.minRating} onChange={e => handleFilterChange("minRating", e.target.value)}>
              <option value="">Any Rating</option>
              {[4, 3, 2].map(r => <option key={r} value={r}>{r}+ Stars</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Price Range (₹/hr)</label>
            <div style={{display:"flex", gap:"0.5rem"}}>
              <input className="form-input" type="number" placeholder="Min" value={filters.minRate} onChange={e => handleFilterChange("minRate", e.target.value)} />
              <input className="form-input" type="number" placeholder="Max" value={filters.maxRate} onChange={e => handleFilterChange("maxRate", e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Sort By</label>
            <select className="form-input form-select" value={filters.sort} onChange={e => handleFilterChange("sort", e.target.value)}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
            <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => search(filters)}>Apply Filters</button>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={resetFilters}>Reset</button>
          </div>
        </aside>

        {/* Results */}
        <div className="search-results">
          <div className="results-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p className="text-secondary" style={{ margin: 0 }}>
              {pagination ? `${filteredProviders.length} providers found` : "Loading..."}
            </p>

            {/* Map / Grid View Switch */}
            <div className="role-toggle" style={{ margin: 0 }}>
              <button
                className={`role-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
                style={{ padding: "0.35rem 0.85rem", fontSize: "0.8rem" }}
              >
                📱 Grid
              </button>
              <button
                className={`role-btn ${viewMode === "map" ? "active" : ""}`}
                onClick={() => setViewMode("map")}
                style={{ padding: "0.35rem 0.85rem", fontSize: "0.8rem" }}
              >
                🗺️ Radius Map
              </button>
            </div>
          </div>

          {loading ? <Spinner text="Searching providers..." /> : filteredProviders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No providers found</h3>
              <p className="text-secondary">Try adjusting your filters, expanding the radius, or browsing featured talent below.</p>
              <div className="empty-state-actions">
                <button className="btn btn-primary" onClick={resetFilters}>Clear Filters</button>
                <Link to="/" className="btn btn-secondary">Explore Featured Talent</Link>
              </div>

              <div className="empty-state-featured">
                <div className="section-top-bar" style={{ marginBottom: "0.5rem" }}>
                  <h3 className="section-title" style={{ fontSize: "1.1rem" }}>Featured Talent</h3>
                  <Link to="/" className="section-view-all" style={{ fontSize: "0.825rem" }}>
                    View more →
                  </Link>
                </div>

                <div className="talent-cards-grid">
                  {FEATURED_TALENT.map((t) => (
                    <Link key={t.name} to={`/search?q=${encodeURIComponent(t.name)}`} className="talent-mini-card">
                      <img src={t.avatar} alt={t.name} className="talent-avatar" />
                      <div className="talent-name-wrap">
                        <span className="talent-name">{t.name}</span>
                        {t.verified && <span className="talent-check">✓</span>}
                      </div>
                      <span className="talent-title">{t.title}</span>
                      <div className="talent-rating">
                        <span style={{ color: "#F59E0B" }}>★</span> {t.rating} <span style={{ color: "#94A3B8" }}>({t.reviews})</span>
                      </div>
                      <span className="talent-location">{t.location}</span>
                      <span className="talent-price">{t.rate}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : viewMode === "grid" ? (
            <div className="providers-grid">
              {filteredProviders.map(p => <ProviderCard key={p._id} provider={p} />)}
            </div>
          ) : (
            /* MAP VIEW DISPLAY */
            <div className="card fade-in" style={{ padding: "1.5rem", background: "#FFFFFF" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1.1rem", color: "#0F172A", margin: 0 }}>
                  🗺️ Interactive Hyperlocal Radius Map
                </h3>
                <span className="badge badge-success">GPS Radius: {filters.radius} km</span>
              </div>

              <div
                style={{
                  height: "380px",
                  background: "linear-gradient(180deg, #F1F5F9 0%, #E2E8F0 100%)",
                  borderRadius: "16px",
                  border: "1px solid #CBD5E1",
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Central Radius Visual */}
                <div
                  style={{
                    position: "absolute",
                    width: "260px",
                    height: "260px",
                    borderRadius: "50%",
                    border: "2px solid #635BFF",
                    background: "rgba(99, 91, 255, 0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#635BFF", background: "#FFFFFF", padding: "0.2rem 0.6rem", borderRadius: "999px" }}>
                    📍 Your Center Point ({filters.radius}km)
                  </span>
                </div>

                {/* Freelancer Map Pins */}
                {filteredProviders.map((p, idx) => {
                  const user = p.userId || {};
                  const offsets = [
                    { top: "25%", left: "30%" },
                    { top: "60%", left: "65%" },
                    { top: "35%", left: "70%" },
                    { top: "65%", left: "35%" },
                    { top: "45%", left: "50%" },
                  ];
                  const pos = offsets[idx % offsets.length];

                  return (
                    <div
                      key={p._id}
                      style={{
                        position: "absolute",
                        top: pos.top,
                        left: pos.left,
                        transform: "translate(-50%, -50%)",
                        background: "#FFFFFF",
                        border: "2px solid #635BFF",
                        borderRadius: "12px",
                        padding: "0.4rem 0.75rem",
                        boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        zIndex: 10,
                      }}
                      onClick={() => window.location.href = `/provider/${user._id}`}
                    >
                      <span style={{ fontSize: "1.1rem" }}>👤</span>
                      <div>
                        <strong style={{ fontSize: "0.825rem", display: "block", color: "#0F172A", lineHeight: 1.1 }}>
                          {user.name}
                        </strong>
                        <span style={{ fontSize: "0.725rem", color: "#635BFF", fontWeight: 700 }}>
                          ₹{p.hourlyRate}/hr • {p.category}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {pagination && pagination.pages > 1 && (
            <div className="pagination">
              {Array.from({ length: pagination.pages }, (_, i) => (
                <button key={i} className={`btn btn-sm ${filters.page === i + 1 ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => { const nf = {...filters, page: i+1}; setFilters(nf); search(nf); }}>{i + 1}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Assistant Modal */}
      {showAI && <AIMatchModal providers={providers} onClose={() => setShowAI(false)} />}
    </div>
  );
}

