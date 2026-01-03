import '../App.css';
import type { User, Screen } from '../types';
import ringIcon from '../assets/icon-ring.svg';
import customIcon from '../assets/icon-custom.svg';
import profileIcon from '../assets/icon-profile.svg';
import stoneIcon from '../assets/icon-stone.svg';
import energyIcon from '../assets/icon-energy.svg';
import reviewsIcon from '../assets/icon-reviews.svg';
import historyIcon from '../assets/icon-history.svg';
import favoritesIcon from '../assets/icon-favorites.svg';
import SectionHeader from './SectionHeader';
import { useI18n } from '../i18n';

type Props = {
  user: User | null;
  onNavigate: (screen: Screen) => void;
  onBackToCover?: () => void;
};

export function MainMenu({ user, onNavigate, onBackToCover }: Props) {
  const { t } = useI18n();
  const displayName = user?.first_name ?? t('mainMenu.guest');

  return (
    <div className="screen">
      {onBackToCover ? (
        <button className="back-fab" type="button" onClick={onBackToCover} aria-label={t('mainMenu.backAria')}>
          <span />
        </button>
      ) : null}
      <div className="hero">
        <div className="app-header">
          <div className="logo-mark" />
          <SectionHeader
            align="center"
            kicker={t('mainMenu.welcome', { name: displayName })}
            title="Sky Jewelry"
            subtitle={t('mainMenu.subtitle')}
          />
        </div>
      </div>

      <div className="panel">
        <div className="subtitle">{t('mainMenu.navigation')}</div>
        <div className="menu-grid nav-grid">
          <button className="button full nav-button" onClick={() => onNavigate('profile')}>
            <img className="nav-icon" src={profileIcon} alt="" />
            <span className="nav-label">{t('mainMenu.items.profile')}</span>
          </button>
          <button className="button full nav-button nav-muted" onClick={() => onNavigate('stone')}>
            <img className="nav-icon" src={stoneIcon} alt="" />
            <span className="nav-label">{t('mainMenu.items.stone')}</span>
          </button>
          <button className="button full nav-button nav-muted" onClick={() => onNavigate('catalog')}>
            <img className="nav-icon" src={ringIcon} alt="" />
            <span className="nav-label">{t('mainMenu.items.catalog')}</span>
          </button>
          <button className="button full nav-button nav-muted" onClick={() => onNavigate('custom')}>
            <img className="nav-icon" src={customIcon} alt="" />
            <span className="nav-label">{t('mainMenu.items.custom')}</span>
          </button>
          <button className="button full nav-button nav-muted" onClick={() => onNavigate('library')}>
            <img className="nav-icon" src={energyIcon} alt="" />
            <span className="nav-label">{t('mainMenu.items.library')}</span>
          </button>
          <button className="button full nav-button nav-muted" onClick={() => onNavigate('reviews')}>
            <img className="nav-icon" src={reviewsIcon} alt="" />
            <span className="nav-label">{t('mainMenu.items.reviews')}</span>
          </button>
          <button className="button full nav-button nav-muted" onClick={() => onNavigate('history')}>
            <img className="nav-icon" src={historyIcon} alt="" />
            <span className="nav-label">{t('mainMenu.items.history')}</span>
          </button>
          <button className="button full nav-button nav-muted" onClick={() => onNavigate('favorites')}>
            <img className="nav-icon" src={favoritesIcon} alt="" />
            <span className="nav-label">{t('mainMenu.items.favorites')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default MainMenu;
