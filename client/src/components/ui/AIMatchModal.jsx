import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "./Spinner";
import toast from "react-hot-toast";

export default function AIMatchModal({ providers, onClose }) {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState(null);

  const handleAIAnalyze = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setAnalyzing(true);

    setTimeout(() => {
      // Intelligent matching algorithm based on prompt keywords
      const queryLower = prompt.toLowerCase();

      const scored = providers.map((p) => {
        let score = 70;
        const cat = (p.category || "").toLowerCase();
        const skills = (p.skills || []).map((s) => s.toLowerCase());
        const bio = (p.bio || "").toLowerCase();

        if (cat && queryLower.includes(cat)) score += 20;
        skills.forEach((s) => {
          if (queryLower.includes(s)) score += 8;
        });
        if (bio && queryLower.includes(bio)) score += 5;
        if (p.avgRating >= 4.8) score += 5;

        score = Math.min(score, 99);

        return { ...p, matchScore: score };
      });

      scored.sort((a, b) => b.matchScore - a.matchScore);
      setRecommendations(scored.slice(0, 3));
      setAnalyzing(false);
      toast.success("AI Analysis Complete! 3 matches found.");
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal fade-in"
        style={{ maxWidth: "560px", background: "#FFFFFF" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.5rem" }}>⚡</span>
            <div>
              <h3 className="modal-title" style={{ color: "#0F172A", margin: 0 }}>
                SkillHive AI Assistant
              </h3>
              <p className="text-secondary" style={{ fontSize: "0.8rem", margin: 0 }}>
                Describe your requirement & let AI recommend top freelancers
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleAIAnalyze} style={{ marginTop: "1rem" }}>
          <div className="form-group">
            <label className="form-label">What project or repair do you need?</label>
            <textarea
              className="form-input form-textarea"
              placeholder="e.g., I need a licensed electrician to inspect my home circuit breaker, or I need an e-commerce website designed in Figma & React..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "0.75rem", background: "linear-gradient(135deg, #635BFF 0%, #7C3AED 100%)", fontWeight: 700 }}
            disabled={analyzing || !prompt.trim()}
          >
            {analyzing ? <Spinner text="SkillHive AI Analyzing..." /> : "✨ Run AI Smart Match"}
          </button>
        </form>

        {/* AI Recommendations Output */}
        {recommendations && (
          <div style={{ marginTop: "1.5rem" }} className="fade-in">
            <h4 style={{ fontSize: "0.95rem", color: "#0F172A", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              🏆 Top AI Recommended Freelancers
            </h4>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {recommendations.map((p) => {
                const user = p.userId || {};
                return (
                  <div
                    key={p._id}
                    style={{
                      background: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      borderRadius: "12px",
                      padding: "0.85rem 1rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                      <div className="avatar">{user.name?.[0]}</div>
                      <div>
                        <strong style={{ fontSize: "0.9rem", color: "#0F172A" }}>{user.name}</strong>
                        <div style={{ fontSize: "0.78rem", color: "#64748B" }}>
                          {p.category} • ₹{p.hourlyRate}/hr
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span className="badge badge-success" style={{ fontWeight: 800 }}>
                        {p.matchScore}% Match
                      </span>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/provider/${user._id}`)}
                      >
                        Book
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
