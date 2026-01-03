import '../App.css';
import type { Screen } from '../types';
import profileIcon from '../assets/icon-profile.svg';
import stoneIcon from '../assets/icon-stone.svg';
import ringIcon from '../assets/icon-ring.svg';
import customIcon from '../assets/icon-custom.svg';
import energyIcon from '../assets/icon-energy.svg';
import reviewsIcon from '../assets/icon-reviews.svg';
import historyIcon from '../assets/icon-history.svg';
import favoritesIcon from '../assets/icon-favorites.svg';
import { useI18n } from '../i18n';

type NavItem = {
  screen: Screen;
  labelKey: string;
  icon: string;
};

const NAV_ITEMS: NavItem[] = [
  { screen: 'profile', labelKey: 'mainMenu.items.profile', icon: profileIcon },
  { screen: 'stone', labelKey: 'mainMenu.items.stone', icon: stoneIcon },
  { screen: 'catalog', labelKey: 'mainMenu.items.catalog', icon: ringIcon },
  { screen: 'custom', labelKey: 'mainMenu.items.custom', icon: customIcon },
  { screen: 'library', labelKey: 'mainMenu.items.library', icon: energyIcon },
  { screen: 'reviews', labelKey: 'mainMenu.items.reviews', icon: reviewsIcon },
  { screen: 'history', labelKey: 'mainMenu.items.history', icon: historyIcon },
  { screen: 'favorites', labelKey: 'mainMenu.items.favorites', icon: favoritesIcon },
];

type Props = {
  active: Screen;
  onNavigate: (screen: Screen) => void;
};

export default function BottomNav({ active, onNavigate }: Props) {
  const { t } = useI18n();

  return (
    <nav className="bottom-nav" aria-label={t('mainMenu.navigation')}>
      {NAV_ITEMS.map((item) => (
        <button
          key={item.screen}
          type="button"
          className={`bottom-nav-button${active === item.screen ? ' active' : ''}`}
          onClick={() => onNavigate(item.screen)}
        >
          <img className="bottom-nav-icon" src={item.icon} alt="" />
          <span className="bottom-nav-label">{t(item.labelKey)}</span>
        </button>
      ))}
    </nav>
  );
}
