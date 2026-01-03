import { useMemo, useState } from 'react';
import '../App.css';
import type { Stone } from '../types';
import {
  getStoneChakraLabel,
  getStoneDescriptionShort,
  getStoneName,
  getStonePlanetLabel,
  normalizeStone,
  type NormalizedStone,
} from '../utils/stone';
import StoneDetails from './StoneDetails';
import SectionHeader from './SectionHeader';
import { useI18n } from '../i18n';

type Props = {
  stones: Stone[];
  loading: boolean;
  onSearch: (query: string) => void;
  onBack: () => void;
};

export function StoneLibrary({ stones, loading, onSearch, onBack }: Props) {
  const { t, locale } = useI18n();
  const [selected, setSelected] = useState<NormalizedStone | null>(null);

  const isEmpty = !loading && stones.length === 0;
  const displayStones = useMemo(() => stones.map(normalizeStone), [stones]);

  return (
    <div className="screen">
      <button className="back-fab" type="button" onClick={onBack} aria-label={t('common.menu')}>
        <span />
      </button>
      <div className="hero">
        <div className="app-header">
          <div className="logo-mark" />
          <SectionHeader
            align="center"
            kicker={t('library.kicker')}
            title={t('library.title')}
            subtitle={t('library.subtitle')}
          />
        </div>
      </div>

      <div className="panel">
        <div className="subtitle">{t('common.search')}</div>
        <input className="input" placeholder={t('library.searchPlaceholder')} onChange={(e) => onSearch(e.target.value)} />
      </div>

      <div className="panel">
        <div className="subtitle">{t('common.stones')}</div>
        {loading ? (
          <div className="inline-row">
            <div className="spinner small" />
            <div className="muted">{t('common.loading')}</div>
          </div>
        ) : null}
        <div className="stone-accordion">
          {isEmpty ? (
            <div className="muted mb-10">{t('library.loadError')}</div>
          ) : null}
          {displayStones.map((stone) => {
            const stoneName = getStoneName(stone, locale);
            const stoneDescription = getStoneDescriptionShort(stone, locale);
            return (
              <div key={stone.id} className="stone-item">
                <div className="stone-head">
                  <div className="stone-head-left">
                    <div
                      className="stone-chip crystal-icon small"
                      style={{ ['--stone-color' as string]: stone.color ?? '#d6a85a' }}
                    />
                    <div className="stone-head-text">
                      <span className="stone-title">{stoneName}</span>
                      <span className="stone-subtitle">
                        {stoneDescription ?? t('common.descriptionPlaceholder')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="stone-body">
                  <div className="chips">
                      {stone.chakra_list.map((chakra) => (
                        <span key={`c-${chakra}`} className="tag">
                          {getStoneChakraLabel(chakra, locale)}
                        </span>
                      ))}
                      {stone.planet_list.map((planet) => (
                        <span key={`p-${planet}`} className="tag">
                          {getStonePlanetLabel(planet, locale)}
                        </span>
                      ))}
                    {stone.life_path_list.map((lp) => (
                      <span key={`l-${lp}`} className="tag">
                        {t('common.pathLabel', { value: lp })}
                      </span>
                    ))}
                  </div>
                  <button className="stone-cta" type="button" onClick={() => setSelected(stone)}>
                    {t('common.details')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <StoneDetails stone={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

export default StoneLibrary;
