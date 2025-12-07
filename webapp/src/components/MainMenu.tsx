import '../App.css';
import type { User, Screen } from '../types';

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
            <h1>Sky Jewelry · WebApp</h1>
          </div>
          <div className="pill">Supabase + Telegram</div>
        </div>
        <p className="muted" style={{ margin: '8px 0 0' }}>
          Подберу камень под запрос, покажу украшения и приму заявку в один клик.
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
            📅 Изменить дату
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="subtitle">Навигация</div>
        <div className="menu-grid">
          <button className="button full" onClick={() => onNavigate('stone')}>
            🔮 Подбор камня
          </button>
          <button className="button full secondary" onClick={() => onNavigate('catalog')}>
            💍 Каталог украшений
          </button>
          <button className="button full secondary" onClick={() => onNavigate('custom')}>
            ✨ Индивидуальное украшение
          </button>
          <button className="button full ghost" onClick={() => onNavigate('library')}>
            📖 Энергия камней
          </button>
        </div>
      </div>
    </div>
  );
}

export default MainMenu;
