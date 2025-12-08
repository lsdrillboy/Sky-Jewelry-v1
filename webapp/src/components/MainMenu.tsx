import '../App.css';
import type { User, Screen } from '../types';
import stoneIcon from '../assets/icon-stone.svg';
import ringIcon from '../assets/icon-ring.svg';
import customIcon from '../assets/icon-custom.svg';
import bookIcon from '../assets/icon-book.svg';
import calendarIcon from '../assets/icon-calendar.svg';

type Props = {
  user: User | null;
  onNavigate: (screen: Screen) => void;
  onChangeBirthdate: () => void;
};

function formatDate(date?: string | null) {
  if (!date) return null;
  const parts = date.split('-');
  if (parts.length !== 3) return date;
  return `${parts[2]}.${parts[1]}.${parts[0]}`;
}

export function MainMenu({ user, onNavigate, onChangeBirthdate }: Props) {
  const birthdate = formatDate(user?.birthdate);

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
      </div>

      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <div className="subtitle">Твой профиль</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="pill">ID: {user?.telegram_id ?? '—'}</span>
              <span className="pill">Имя: {user?.first_name ?? '—'}</span>
              <span className="pill">
                Дата рождения: {birthdate ?? 'не указана'}
              </span>
              <span className="pill">Число пути: {user?.life_path ?? '—'}</span>
            </div>
          </div>
          <button className="button ghost" onClick={onChangeBirthdate}>
            <img className="btn-icon" src={calendarIcon} alt="" />
            Изменить дату
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="subtitle">Навигация</div>
        <div className="menu-grid nav-grid">
          <button className="button full nav-button nav-primary" onClick={() => onNavigate('stone')}>
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
        </div>
      </div>
    </div>
  );
}

export default MainMenu;
