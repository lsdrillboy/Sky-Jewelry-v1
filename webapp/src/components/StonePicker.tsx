import '../App.css';
import { useMemo, useState } from 'react';
import { themes as themeFallback } from '../data/themes';
import type { StonePickerResult, Theme } from '../types';
import ringIcon from '../assets/icon-ring.svg';
import backIcon from '../assets/icon-arrow-left.svg';
import { normalizeStone, type NormalizedStone } from '../utils/stone';
import StoneDetails from './StoneDetails';
import SectionHeader from './SectionHeader';

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
  const [selected, setSelected] = useState<NormalizedStone | null>(null);
  const normalizedResult = useMemo(
    () => (result ? { ...result, stones: result.stones.map(normalizeStone) } : null),
    [result],
  );
  const themeOptions = themes.length ? themes : themeFallback;
  const isThemeLoading = themesLoading && !themes.length;

  return (
    <div className="screen">
      <div className="hero center-hero">
        <div className="app-header">
          <div className="logo-mark" />
          <SectionHeader
            align="center"
            kicker="Подбор камня"
            title="С каким запросом работаешь?"
            subtitle="Я посмотрю камни, которые лучше всего поддержат тебя сейчас."
          />
          {lifePath ? <div className="pill">Число пути: {lifePath}</div> : null}
        </div>
      </div>

      <div className="panel">
        <div className="subtitle">Выбери тему</div>
        <select
          className="input"
          onChange={(e) => e.target.value && onPick(e.target.value)}
          defaultValue=""
          disabled={isThemeLoading}
        >
          <option value="" disabled>
            {isThemeLoading ? 'Загружаю темы...' : 'Выбери тему под запрос'}
          </option>
          {themeOptions.map((theme) => (
            <option key={theme.code} value={theme.code}>
              {theme.label ?? theme.code}
            </option>
          ))}
        </select>
        {isThemeLoading ? (
          <div className="inline-row mt-12">
            <div className="spinner small" />
            <div className="muted">Загружаю темы...</div>
          </div>
        ) : loading ? (
          <div className="inline-row mt-12">
            <div className="spinner small" />
            <div className="muted">Собираю рекомендации...</div>
          </div>
        ) : (
          <p className="muted mt-10">Темы можно менять — подберу новые связки камней.</p>
        )}
      </div>

      <div className="panel">
        <div className="subtitle">Результат</div>
        {!result && <p className="muted">После выбора темы здесь появятся камни.</p>}
        {normalizedResult && (
          <div className="grid two">
            {normalizedResult.stones.map((stone: NormalizedStone, idx) => (
              <div key={stone.id} className="card stone-card">
                <div className="floating-badge">{idx === 0 ? 'главный' : 'дополнительный'}</div>
                {stone.photo_url ? <img src={stone.photo_url} alt={stone.name_ru} /> : null}
                <div className="stone-meta">
                  <div
                    className="stone-thumb crystal-icon"
                    style={{ ['--stone-color' as string]: stone.color ?? '#d6a85a' }}
                  />
                  <h3>{stone.name_ru}</h3>
                </div>
                <p className="muted min-h-48">
                  {stone.description_short ?? 'Описание появится позже.'}
                </p>
                <div className="chips">
                  {stone.chakra_list.map((chakra) => (
                    <span key={`c-${chakra}`} className="tag">
                      {chakra}
                    </span>
                  ))}
                  {stone.planet_list.map((planet) => (
                    <span key={`p-${planet}`} className="tag">
                      {planet}
                    </span>
                  ))}
                  {stone.life_path_list.map((lp) => (
                    <span key={`l-${lp}`} className="tag">
                      Путь {lp}
                    </span>
                  ))}
                </div>
                <div className="stack">
                  <button className="stone-cta" type="button" onClick={() => onOpenCatalog(stone.id)}>
                    <img className="btn-icon" src={ringIcon} alt="" />
                    Показать украшения с этим камнем
                  </button>
                  <button className="button minimal ghost" type="button" onClick={() => setSelected(stone)}>
                    Подробнее
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="action-row">
        <button className="button minimal ghost menu-back" onClick={onBack}>
          <img className="btn-icon" src={backIcon} alt="" />
          В меню
        </button>
      </div>

      <StoneDetails stone={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

export default StonePicker;
