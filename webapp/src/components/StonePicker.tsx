import '../App.css';
import { useMemo, useState } from 'react';
import { themes as themeList } from '../data/themes';
import type { StonePickerResult } from '../types';
import ringIcon from '../assets/icon-ring.svg';
import backIcon from '../assets/icon-arrow-left.svg';
import { normalizeStone, type NormalizedStone } from '../utils/stone';
import StoneDetails from './StoneDetails';

type Props = {
  result: StonePickerResult | null;
  loading: boolean;
  lifePath: number | null | undefined;
  onPick: (theme: string) => Promise<void> | void;
  onOpenCatalog: (stoneId: number) => void;
  onBack: () => void;
};

export function StonePicker({ result, loading, lifePath, onPick, onOpenCatalog, onBack }: Props) {
  const [selected, setSelected] = useState<NormalizedStone | null>(null);
  const normalizedResult = useMemo(
    () => (result ? { ...result, stones: result.stones.map(normalizeStone) } : null),
    [result],
  );

  return (
    <div className="screen">
      <div className="hero center-hero">
        <div className="app-header">
          <div className="logo-mark" />
          <div className="app-header-text">
            <div className="tiny">Подбор камня</div>
            <h1>С каким запросом работаешь?</h1>
            <p className="muted" style={{ margin: '4px 0 0' }}>
              Я посмотрю камни, которые лучше всего поддержат тебя сейчас.
            </p>
          </div>
          {lifePath ? <div className="pill">Число пути: {lifePath}</div> : null}
        </div>
      </div>

      <div className="panel">
        <div className="subtitle">Выбери тему</div>
        <select
          className="input"
          onChange={(e) => e.target.value && onPick(e.target.value)}
          defaultValue=""
        >
          <option value="" disabled>
            Выбери тему под запрос
          </option>
          {themeList.map((theme) => (
            <option key={theme.code} value={theme.code}>
              {theme.label}
            </option>
          ))}
        </select>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
            <div className="spinner" style={{ width: 30, height: 30 }} />
            <div className="muted">Собираю рекомендации...</div>
          </div>
        ) : (
          <p className="muted" style={{ marginTop: 10 }}>
            Темы можно менять — подберу новые связки камней.
          </p>
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
                  <h3 style={{ margin: 0 }}>{stone.name_ru}</h3>
                </div>
                <p className="muted" style={{ minHeight: 48 }}>
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
                <div style={{ display: 'grid', gap: 10, width: '100%' }}>
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

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className="button" onClick={onBack}>
          <img className="btn-icon" src={backIcon} alt="" />
          В меню
        </button>
      </div>

      <StoneDetails stone={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

export default StonePicker;
