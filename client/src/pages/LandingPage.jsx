import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuth, selectRole } from "../features/auth/authSlice";

const CATEGORIES = [
  { icon: "🔧", name: "Plumbing" }, { icon: "⚡", name: "Electrical" }, { icon: "🪚", name: "Carpentry" },
  { icon: "🧹", name: "Cleaning" }, { icon: "🎨", name: "Painting" }, { icon: "📚", name: "Tutoring" },
  { icon: "💻", name: "IT Support" }, { icon: "📷", name: "Photography" }, { icon: "🌿", name: "Gardening" }, { icon: "🐾", name: "Pet Care" },
];

const STATS = [{ value: "10K+", label: "Verified Providers" }, { value: "50K+", label: "Jobs Completed" }, { value: "4.9★", label: "Avg Rating" }, { value: "200+", label: "Cities Covered" }];

const HOW_IT_WORKS = [
  { step: "01", title: "Search Local Pros", desc: "Enter your location and the skill you need. We find verified providers within your radius." },
  { step: "02", title: "Compare & Book", desc: "View profiles, portfolios, ratings and pricing. Book directly with a single click." },
  { step: "03", title: "Get It Done", desc: "Chat with your provider, track progress, and rate the service when complete." },
];

export default function LandingPage() {
  const isAuth = useSelector(selectIsAuth);
  const role = useSelector(selectRole);

  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg-glow" />
        <div className="container hero-content">
          <div className="hero-badge"><span className="badge badge-accent">🌟 Hyperlocal Marketplace</span></div>
          <h1 className="hero-title">Find Skilled Pros <br /><span className="text-gradient">Near You</span></h1>
          <p className="hero-desc">Connect with verified local tradespeople, tutors, and freelancers in minutes — not hours. Real people, real skills, right in your neighborhood.</p>
          <div className="hero-actions">
            {isAuth && role === "client" && <Link to="/search" className="btn btn-primary btn-lg">Find Services Now</Link>}
            {isAuth && role === "provider" && <Link to="/dashboard" className="btn btn-primary btn-lg">Go to Dashboard</Link>}
            {!isAuth && (<>
              <Link to="/signup" className="btn btn-primary btn-lg">Get Started Free</Link>
              <Link to="/search" className="btn btn-secondary btn-lg">Browse Providers</Link>
            </>)}
          </div>
          <div className="hero-stats">
            {STATS.map(s => <div key={s.label} className="hero-stat"><span className="stat-value text-gradient">{s.value}</span><span className="stat-label">{s.label}</span></div>)}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section" style={{paddingTop: "4rem"}}>
        <div className="container">
          <div className="section-header">
            <h2>Browse by Category</h2>
            <p className="text-secondary">Everything from home repairs to personal tutoring</p>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map(cat => (
              <Link to={`/search?category=${cat.name}`} key={cat.name} className="category-card">
                <span className="cat-icon">{cat.icon}</span>
                <span className="cat-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p className="text-secondary">Three simple steps to get any job done</p>
          </div>
          <div className="grid-3">
            {HOW_IT_WORKS.map(step => (
              <div key={step.step} className="how-card card">
                <div className="how-step">{step.step}</div>
                <h3>{step.title}</h3>
                <p style={{color: "var(--text-secondary)", marginTop: "0.5rem", fontSize: "0.9rem"}}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Provider CTA */}
      {!isAuth && (
        <section className="section provider-cta">
          <div className="container">
            <div className="cta-card card">
              <div className="cta-content">
                <h2>Are You a Skilled Professional?</h2>
                <p>Join thousands of providers earning on their own schedule. Set your rates, choose your area, get verified.</p>
                <Link to="/signup?role=provider" className="btn btn-primary btn-lg">Join as Provider</Link>
              </div>
              <div className="cta-illustration">🛠️</div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
