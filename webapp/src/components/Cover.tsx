import '../App.css';
import HeroSection from './HeroSection';
import type { Screen } from '../types';

type Props = {
  onStart: () => void;
  onCatalog: () => void;
  onNavigate: (screen: Screen) => void;
};

const flowSteps: { title: string; text: string; step: number; screen: Screen; icon: 'profile' | 'stone' | 'ring' | 'custom' }[] = [
  {
    title: 'Точка входа',
    text: 'Опираемся на твой запрос, текущее состояние и дату рождения, чтобы определить твой энергетический код и подобрать камни точнее.',
    step: 1,
    screen: 'profile',
    icon: 'profile',
  },
  {
    title: 'Подбор камня',
    text: 'Выбираем минералы, которые поддержат тебя в текущем запросе: деньги, любовь, защита, путь.',
    step: 2,
    screen: 'stone',
    icon: 'stone',
  },
  {
    title: 'Каталог украшений',
    text: 'Показываем готовые украшения с подобранными камнями — можно сразу выбрать то, что откликается.',
    step: 3,
    screen: 'catalog',
    icon: 'ring',
  },
  {
    title: 'Индивидуальный проект',
    text: 'Создаём украшение под тебя: ты описываешь запрос — мастер собирает личный амулет.',
    step: 4,
    screen: 'custom',
    icon: 'custom',
  },
];

export function Cover({ onStart, onCatalog, onNavigate }: Props) {
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
        <div className="grid two">
          {flowSteps.map((item) => (
            <button
              key={item.step}
              className="card flow-card flow-card-button"
              type="button"
              onClick={() => onNavigate(item.screen)}
            >
              <div className="flow-card-inner">
                <div className="flow-card-head">
                  <div className="flow-icon-shell">
                    <div className={`flow-icon-img ${item.icon}`} />
                  </div>
                  <div className="flow-card-meta">
                    <h3>{item.title}</h3>
                  </div>
                  <div className="flow-step-pill">{String(item.step).padStart(2, '0')}</div>
                  <div className="flow-chevron" aria-hidden />
                </div>
                <p className="muted flow-card-text">{item.text}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Cover;
