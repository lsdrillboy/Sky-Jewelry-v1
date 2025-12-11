import '../App.css';
import HeroSection from './HeroSection';

type Props = {
  onStart: () => void;
  onCatalog: () => void;
};

export function Cover({ onStart, onCatalog }: Props) {
  return (
    <div className="screen cover-grid">
      {/* Premium Hero Block with Eye Crystal */}
      <HeroSection onStart={onStart} onCatalog={onCatalog} />

      {/* Description */}
      <div className="hero-description">
        <p className="muted lead-text">
          Я помогу найти камень, который отзовётся на твою душу, и создам украшение — личное, как амулет.
        </p>
      </div>

      {/* Flow Cards */}
      <div className="panel flow-panel">
        <div className="subtitle">Flow</div>
        <div className="grid two">
          <div className="card flow-card">
            <div className="flow-icon flow-icon-img profile" />
            <div className="floating-badge">1</div>
            <h3>Точка входа</h3>
            <p className="muted">Опираемся на твою дату рождения и состояние, чтобы считать твой текущий энергетический код.</p>
          </div>
          <div className="card flow-card">
            <div className="flow-icon flow-icon-img stone" />
            <div className="floating-badge">2</div>
            <h3>Подбор камня</h3>
            <p className="muted">Выбираем минералы, которые поддержат тебя в текущем запросе: деньги, любовь, защита, путь.</p>
          </div>
          <div className="card flow-card">
            <div className="flow-icon flow-icon-img ring" />
            <div className="floating-badge">3</div>
            <h3>Каталог украшений</h3>
            <p className="muted">Показываем готовые украшения с подобранными камнями — можно сразу выбрать то, что откликается.</p>
          </div>
          <div className="card flow-card">
            <div className="flow-icon flow-icon-img custom" />
            <div className="floating-badge">4</div>
            <h3>Индивидуальный проект</h3>
            <p className="muted">Создаём украшение под тебя: ты описываешь запрос — мастер собирает личный амулет.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cover;
