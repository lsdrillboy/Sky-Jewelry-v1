import '../App.css';
import { useMemo, useState } from 'react';
import { themes as themeFallback } from '../data/themes';
import type { StonePickerResult, Theme } from '../types';
import ringIcon from '../assets/icon-ring.svg';
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
  result: StonePickerResult | null;
  loading: boolean;
  themes: Theme[];
  themesLoading: boolean;
  lifePath: number | null | undefined;
  onPick: (theme: string) => Promise<void> | void;
  onOpenCatalog: (stoneId: number) => void;
  onBack: () => void;
};

export function StonePicker({
  result,
  loading,
  themes,
  themesLoading,
  lifePath,
  onPick,
  onOpenCatalog,
  onBack,
}: Props) {
  const { t, locale } = useI18n();
  const [selected, setSelected] = useState<NormalizedStone | null>(null);
  const normalizedResult = useMemo(
    () => (result ? { ...result, stones: result.stones.map(normalizeStone) } : null),
    [result],
  );
  const themeOptions = themes.length ? themes : themeFallback;
  const isThemeLoading = themesLoading && !themes.length;
  const resolveThemeLabel = (theme: Theme | (typeof themeFallback)[number]) => {
    if ('labelKey' in theme && theme.labelKey) return t(theme.labelKey);
    const defaultLabel = 'label' in theme && theme.label ? theme.label : theme.code;
    return t(`themes.${theme.code}`, { defaultValue: defaultLabel });
  };

  return (
    <div className="screen">
      <button className="back-fab" type="button" onClick={onBack} aria-label={t('common.menu')}>
        <span />
      </button>
      <div className="hero center-hero">
        <div className="app-header">
          <div className="logo-mark" />
          <SectionHeader
            align="center"
            kicker={t('stonePicker.kicker')}
            title={t('stonePicker.title')}
            subtitle={t('stonePicker.subtitle')}
          />
          {lifePath ? <div className="pill">{t('common.lifePathLabel', { value: lifePath })}</div> : null}
        </div>
      </div>

      <div className="panel">
        <div className="subtitle">{t('stonePicker.chooseTheme')}</div>
        <select
          className="input"
          onChange={(e) => e.target.value && onPick(e.target.value)}
          defaultValue=""
          disabled={isThemeLoading}
        >
          <option value="" disabled>
            {isThemeLoading ? t('stonePicker.loadingThemes') : t('stonePicker.themePlaceholder')}
          </option>
          {themeOptions.map((theme) => (
            <option key={theme.code} value={theme.code}>
              {resolveThemeLabel(theme)}
            </option>
          ))}
        </select>
        {isThemeLoading ? (
          <div className="inline-row mt-12">
            <div className="spinner small" />
            <div className="muted">{t('stonePicker.loadingThemes')}</div>
          </div>
        ) : loading ? (
          <div className="inline-row mt-12">
            <div className="spinner small" />
            <div className="muted">{t('stonePicker.loadingRecommendations')}</div>
          </div>
        ) : (
          <p className="muted mt-10">{t('stonePicker.canChange')}</p>
        )}
      </div>

      <div className="panel">
        <div className="subtitle">{t('common.result')}</div>
        {!result && <p className="muted">{t('stonePicker.resultEmpty')}</p>}
        {normalizedResult && (
          <div className="grid two">
            {normalizedResult.stones.map((stone: NormalizedStone, idx) => {
              const stoneName = getStoneName(stone, locale);
              const stoneDescription = getStoneDescriptionShort(stone, locale);
              return (
                <div key={stone.id} className="card stone-card">
                  <div className="floating-badge">
                    {idx === 0 ? t('stonePicker.primary') : t('stonePicker.secondary')}
                  </div>
                  {stone.photo_url ? <img src={stone.photo_url} alt={stoneName} /> : null}
                  <div className="stone-meta">
                    <div
                      className="stone-thumb crystal-icon"
                      style={{ ['--stone-color' as string]: stone.color ?? '#d6a85a' }}
                    />
                    <h3>{stoneName}</h3>
                  </div>
                  <p className="muted min-h-48">
                    {stoneDescription ?? t('common.descriptionPlaceholder')}
                  </p>
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
                  <div className="stack">
                    <button className="stone-cta" type="button" onClick={() => onOpenCatalog(stone.id)}>
                      <img className="btn-icon" src={ringIcon} alt="" />
                      {t('stonePicker.showProducts')}
                    </button>
                    <button className="button minimal ghost" type="button" onClick={() => setSelected(stone)}>
                      {t('common.details')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <StoneDetails stone={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

export default StonePicker;
