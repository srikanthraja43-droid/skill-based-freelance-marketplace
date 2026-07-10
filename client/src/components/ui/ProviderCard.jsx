import { Link } from "react-router-dom";
import StarRating from "./StarRating";

export default function ProviderCard({ provider }) {
  const profile = provider;
  const user = provider.userId || {};
  const verifiedBadge = profile.verificationStatus === "verified";

  return (
    <Link to={`/provider/${user._id}`} className="provider-card fade-in">
      <div className="provider-card-header">
        <div className="provider-avatar-wrap">
          {user.avatar ? <img src={user.avatar} alt={user.name} className="avatar avatar-lg" /> : <div className="avatar avatar-lg">{user.name?.[0]?.toUpperCase()}</div>}
          {verifiedBadge && <span className="verified-dot" title="Verified">✓</span>}
        </div>
        <div className="provider-card-info">
          <h3 className="provider-name">{user.name}</h3>
          <span className="badge badge-accent">{profile.category}</span>
          <div className="provider-rating">
            <StarRating rating={profile.avgRating} size={13} />
            <span className="rating-text">{profile.avgRating > 0 ? profile.avgRating.toFixed(1) : "New"} ({profile.reviewCount})</span>
          </div>
        </div>
        <div className="provider-rate">
          <span className="rate-amount">₹{profile.hourlyRate}</span>
          <span className="rate-label">/hr</span>
        </div>
      </div>
      <p className="provider-bio">{profile.bio || "No bio yet."}</p>
      <div className="provider-skills">
        {profile.skills?.slice(0, 4).map(skill => <span key={skill} className="tag">{skill}</span>)}
        {profile.skills?.length > 4 && <span className="tag">+{profile.skills.length - 4}</span>}
      </div>
      <div className="provider-card-footer">
        <span className="provider-location">📍 {user.location?.city || user.location?.address || "Local"}</span>
        <span className="provider-bookings">{profile.totalBookings} completed</span>
      </div>
    </Link>
  );
}
