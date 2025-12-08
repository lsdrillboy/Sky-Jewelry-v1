import eyeLogo from '../assets/eye-logo.svg';
import '../App.css';
import stoneIcon from '../assets/icon-stone.svg';
import ringIcon from '../assets/icon-ring.svg';

type Props = {
  onStart: () => void;
  onCatalog: () => void;
};

export function HeroSection({ onStart, onCatalog }: Props) {
  return (
    <div className="hero">
      <div className="hero-logo">
        <div className="hero-logo-glow" />
        <img src={eyeLogo} alt="Sky Jewelry eye logo" />
      </div>

      {/* Text Content */}
      <div className="hero-content">
        <div className="hero-brand">SKY JEWELRY</div>
        <h1>STONES THAT HEAR YOUR SOUL</h1>
      </div>

      {/* Action Buttons */}
      <div className="hero-actions">
        <button className="button nav-button nav-primary" onClick={onStart}>
          <img className="btn-icon" src={stoneIcon} alt="" />
          Начать
        </button>
        <button className="button nav-button nav-muted" onClick={onCatalog}>
          <img className="btn-icon" src={ringIcon} alt="" />
          Каталог
        </button>
      </div>
    </div>
  );
}

export default HeroSection;
