import '../App.css';

type Props = {
  onStart: () => void;
};

export function Cover({ onStart }: Props) {
  return (
    <div className="screen cover-grid">
      <div className="hero">
        <div className="app-header">
          <div className="logo-mark" />
          <div>
            <div className="tiny">SKY JEWELRY</div>
            <h1>STONES THAT HEAR YOUR SOUL</h1>
          </div>
          <div className="pill">Telegram</div>
        </div>
        <p className="muted" style={{ maxWidth: 520 }}>
          Бережный подбор минералов по дате рождения и ощущению. Каталог украшений, индивидуальные проекты и связь с
          мастером в одном окне.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="button" onClick={onStart}>
            ✨ Начать
          </button>
          <button className="button ghost" onClick={onStart}>
            Смотреть каталог
          </button>
        </div>
      </div>
      <div className="panel" style={{ display: 'grid', gap: 10 }}>
        <div className="subtitle">Flow</div>
        <div className="grid two">
          <div className="card">
            <div className="floating-badge">1</div>
            <h3>Проверка профиля</h3>
            <p className="muted">Синхронизируемся с Telegram, подтягиваем дату рождения.</p>
          </div>
          <div className="card">
            <div className="floating-badge">2</div>
            <h3>Подбор камня</h3>
            <p className="muted">Выбираем тему запроса и собираем камни через Supabase.</p>
          </div>
          <div className="card">
            <div className="floating-badge">3</div>
            <h3>Каталог</h3>
            <p className="muted">Фильтр по камню и типу украшения, карточки с ценами.</p>
          </div>
          <div className="card">
            <div className="floating-badge">4</div>
            <h3>Индивидуальный проект</h3>
            <p className="muted">Оставляешь заявку — мастер получает уведомление.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cover;
