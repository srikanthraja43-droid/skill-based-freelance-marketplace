export default function StarRating({ rating = 0, max = 5, size = 16, interactive = false, onChange }) {
  return (
    <div className="stars" style={{ fontSize: size }}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < Math.round(rating) ? "star" : "star-empty"}
          style={{ cursor: interactive ? "pointer" : "default" }}
          onClick={() => interactive && onChange && onChange(i + 1)}>★</span>
      ))}
    </div>
  );
}
