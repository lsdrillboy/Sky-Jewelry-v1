import '../App.css';
import type { User, Screen } from '../types';
import ringIcon from '../assets/icon-ring.svg';
import customIcon from '../assets/icon-custom.svg';
import profileIcon from '../assets/icon-profile.svg';
import stoneIcon from '../assets/icon-stone.svg';
import bookIcon from '../assets/icon-book.svg';

type Props = {
  user: User | null;
  onNavigate: (screen: Screen) => void;
  onBackToCover?: () => void;
};

export function MainMenu({ user, onNavigate, onBackToCover }: Props) {
  return (
    <div className="screen">
      <div className="hero">
        <div className="app-header">
          <div className="logo-mark" />
          <div>
            <div className="tiny">Добро пожаловать, {user?.first_name ?? 'гость'}</div>
            <h1>Sky Jewelry</h1>
          </div>
        </div>
        <p className="muted lead-text" style={{ margin: '10px 0 0' }}>
          Подберу минералы по твоей энергии, покажу украшения Sky Jewelry и помогу собрать индивидуальное изделие.
        </p>
        {onBackToCover ? (
          <div style={{ marginTop: 10 }}>
            <button className="button ghost" onClick={onBackToCover}>
              Вернуться на обложку
            </button>
          </div>
        ) : null}
      </div>

      <div className="panel">
        <div className="subtitle">Навигация</div>
        <div className="menu-grid nav-grid">
          <button className="button full nav-button" onClick={() => onNavigate('profile')}>
            <img className="nav-icon" src={profileIcon} alt="" />
            <span className="nav-label">Мой профиль</span>
          </button>
          <button className="button full nav-button nav-muted" onClick={() => onNavigate('stone')}>
            <img className="nav-icon" src={stoneIcon} alt="" />
            <span className="nav-label">Подбор камня</span>
          </button>
          <button className="button full nav-button nav-muted" onClick={() => onNavigate('catalog')}>
            <img className="nav-icon" src={ringIcon} alt="" />
            <span className="nav-label">Каталог украшений</span>
          </button>
          <button className="button full nav-button nav-muted" onClick={() => onNavigate('custom')}>
            <img className="nav-icon" src={customIcon} alt="" />
            <span className="nav-label">Индивидуальное украшение</span>
          </button>
          <button className="button full nav-button nav-muted" onClick={() => onNavigate('library')}>
            <img className="nav-icon" src={bookIcon} alt="" />
            <span className="nav-label">Энергия камней</span>
          </button>
          <button className="button full nav-button nav-muted" onClick={() => onNavigate('reviews')}>
            <img className="nav-icon" src={bookIcon} alt="" />
            <span className="nav-label">Отзывы</span>
          </button>
          <button className="button full nav-button nav-muted" onClick={() => onNavigate('history')}>
            <img className="nav-icon" src={bookIcon} alt="" />
            <span className="nav-label">История бренда</span>
          </button>
          <button className="button full nav-button nav-muted" onClick={() => onNavigate('favorites')}>
            <img className="nav-icon" src={ringIcon} alt="" />
            <span className="nav-label">Избранное</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default MainMenu;
