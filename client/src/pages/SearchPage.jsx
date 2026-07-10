import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import ProviderCard from "../components/ui/ProviderCard";
import Spinner from "../components/ui/Spinner";
import toast from "react-hot-toast";

const CATEGORIES = ["All","Plumbing","Electrical","Carpentry","Cleaning","Painting","Gardening","Tutoring","Photography","Cooking","Moving","IT Support","Beauty & Wellness","Fitness & Training","Pet Care","Other"];
const SORT_OPTIONS = [{ value: "avgRating", label: "Top Rated" }, { value: "price_asc", label: "Price: Low to High" }, { value: "price_desc", label: "Price: High to Low" }, { value: "reviews", label: "Most Reviewed" }];

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(null);
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
      toast.success("Location detected!");
    }, () => toast.error("Could not get location"));
  };

  const handleFilterChange = (key, val) => setFilters(prev => ({ ...prev, [key]: val, page: 1 }));
  const handleSearch = (e) => { e.preventDefault(); search(filters); };

  return (
    <div className="search-page">
      <div className="search-hero">
        <div className="container">
          <h1>Find Local Experts</h1>
          <form className="search-bar" onSubmit={handleSearch}>
            <input className="form-input search-input" placeholder="Search by skill (e.g. plumber, tutor...)" value={filters.skill} onChange={e => handleFilterChange("skill", e.target.value)} />
            <button type="button" className="btn btn-secondary" onClick={handleGeolocate} title="Use my location">📍 Near Me</button>
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>
      </div>

      <div className="container search-layout">
        {/* Sidebar Filters */}
        <aside className="search-filters card">
          <h3>Filters</h3>
          <div className="divider" />
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-input form-select" value={filters.category} onChange={e => handleFilterChange("category", e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c === "All" ? "" : c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Radius: {filters.radius} km</label>
            <input type="range" min="1" max="50" value={filters.radius} onChange={e => handleFilterChange("radius", e.target.value)} className="range-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Min Rating</label>
            <select className="form-input form-select" value={filters.minRating} onChange={e => handleFilterChange("minRating", e.target.value)}>
              <option value="">Any</option>
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
          <button className="btn btn-primary" style={{width:"100%", marginTop:"0.5rem"}} onClick={() => search(filters)}>Apply Filters</button>
        </aside>

        {/* Results */}
        <div className="search-results">
          <div className="results-header">
            <p className="text-secondary">{pagination ? `${pagination.total} providers found` : "Loading..."}</p>
          </div>
          {loading ? <Spinner text="Searching providers..." /> : providers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No providers found</h3>
              <p className="text-secondary">Try adjusting your filters or expanding the radius</p>
            </div>
          ) : (
            <div className="providers-grid">
              {providers.map(p => <ProviderCard key={p._id} provider={p} />)}
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
    </div>
  );
}
