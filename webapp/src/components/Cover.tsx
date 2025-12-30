import '../App.css';
import HeroSection from './HeroSection';
import type { Screen } from '../types';
import { useI18n } from '../i18n';

type Props = {
  onStart: () => void;
  onCatalog: () => void;
  onNavigate: (screen: Screen) => void;
};

const flowSteps: { key: 'profile' | 'stone' | 'catalog' | 'custom'; step: number; screen: Screen; icon: 'profile' | 'stone' | 'ring' | 'custom' }[] = [
  { key: 'profile', step: 1, screen: 'profile', icon: 'profile' },
  { key: 'stone', step: 2, screen: 'stone', icon: 'stone' },
  { key: 'catalog', step: 3, screen: 'catalog', icon: 'ring' },
  { key: 'custom', step: 4, screen: 'custom', icon: 'custom' },
];

export function Cover({ onStart, onCatalog, onNavigate }: Props) {
  const { t } = useI18n();

  return (
    <div className="screen cover-grid">
      {/* Premium Hero Block with Eye Crystal */}
      <HeroSection onStart={onStart} onCatalog={onCatalog} />

      {/* Description */}
      <div className="hero-description">
        <p className="muted lead-text">
          {t('cover.lead')}
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
                    <h3>{t(`cover.steps.${item.key}.title`)}</h3>
                  </div>
                  <div className="flow-card-actions">
                    <div className="flow-chevron" aria-hidden />
                  </div>
                </div>
                <p className="muted flow-card-text">{t(`cover.steps.${item.key}.text`)}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Cover;
