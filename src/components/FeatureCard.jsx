import "./FeatureCard.css";

function FeatureCard({ index, title, description }) {
  return (
    <div className="feature-card">
      <span className="feature-card__index">{index}</span>
      <h3 className="feature-card__title">{title}</h3>
      <p className="feature-card__desc">{description}</p>
    </div>
  );
}

export default FeatureCard;