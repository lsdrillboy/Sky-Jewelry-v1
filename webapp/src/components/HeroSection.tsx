import '../App.css';

type Props = {
  onStart: () => void;
  onCatalog: () => void;
};

export function HeroSection({ onStart, onCatalog }: Props) {
  return (
    <div className="hero">
      {/* Eye Crystal with White Sapphire */}
      <div className="eye-crystal">
        <div className="eye-outer">
          <div className="eye-inner">
            <div className="sapphire-core"></div>
            <div className="crystal-rays">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="ray"
                  style={{
                    transform: `rotate(${i * 30}deg)`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="starfield">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="star"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Text Content */}
      <div className="hero-content">
        <div className="hero-brand">SKY JEWELRY</div>
        <h1>STONES THAT HEAR YOUR SOUL</h1>
      </div>

      {/* Action Buttons */}
      <div className="hero-actions">
        <button className="button" onClick={onStart}>
          ✨ Начать
        </button>
        <button className="button ghost" onClick={onCatalog}>
          💎 Каталог
        </button>
      </div>
    </div>
  );
}

export default HeroSection;

