const logoUrl =
  'https://kyxztleagpawfhkvxvwa.supabase.co/storage/v1/object/sign/Cover/logogo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wMGI3NGEwZi1jMTViLTRmYzQtYWIzMS0yMzdiMTE3OGY0MWEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJDb3Zlci9sb2dvZ28ucG5nIiwiaWF0IjoxNzY1MzQ2ODc1LCJleHAiOjE3OTY4ODI4NzV9.EJMm8s1YUK6cfIO-y3x7S04GrJ4IX_SP5CnHRf9I5zE';
import '../App.css';
import stoneIcon from '../assets/icon-stone.svg';
import ringIcon from '../assets/icon-ring.svg';
import { useI18n } from '../i18n';

type Props = {
  onStart: () => void;
  onCatalog: () => void;
};

export function HeroSection({ onStart, onCatalog }: Props) {
  const { t } = useI18n();

  return (
    <div className="hero cover-hero">
      <div className="hero-logo">
        <div className="hero-logo-glow" />
        <div className="hero-logo-frame">
          <img src={logoUrl} alt={t('hero.logoAlt')} />
        </div>
      </div>

      {/* Text Content */}
      <div className="hero-content">
        <div className="hero-brand">{t('hero.brand')}</div>
        <h1>{t('hero.title')}</h1>
      </div>

      {/* Action Buttons */}
      <div className="hero-actions">
        <button className="button nav-button nav-primary" onClick={onStart}>
          <img className="btn-icon" src={stoneIcon} alt="" />
          {t('hero.start')}
        </button>
        <button className="button nav-button nav-muted" onClick={onCatalog}>
          <img className="btn-icon" src={ringIcon} alt="" />
          {t('hero.catalog')}
        </button>
      </div>
    </div>
  );
}

export default HeroSection;








