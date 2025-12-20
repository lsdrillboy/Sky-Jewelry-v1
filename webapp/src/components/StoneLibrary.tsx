import { useMemo, useState } from 'react';
import '../App.css';
import type { Stone } from '../types';
import { normalizeStone, type NormalizedStone } from '../utils/stone';
import StoneDetails from './StoneDetails';
import backIcon from '../assets/icon-arrow-left.svg';
import SectionHeader from './SectionHeader';

type Props = {
  stones: Stone[];
  loading: boolean;
  onSearch: (query: string) => void;
  onBack: () => void;
};

export function StoneLibrary({ stones, loading, onSearch, onBack }: Props) {
  const [openedId, setOpenedId] = useState<number | null>(null);
  const [selected, setSelected] = useState<NormalizedStone | null>(null);

  const toggle = (id: number) => {
    setOpenedId((prev) => (prev === id ? null : id));
  };

  const isEmpty = !loading && stones.length === 0;
  const displayStones = useMemo(() => stones.map(normalizeStone), [stones]);

  return (
    <div className="screen">
      <div className="hero">
        <div className="app-header">
          <div className="logo-mark" />
          <SectionHeader
            align="center"
            kicker="Энергия камней"
            title="Справочник минералов"
            subtitle="Краткие заметки о том, что усиливает каждый камень."
          />
        </div>
      </div>

      <div className="panel">
        <div className="subtitle">Поиск</div>
        <input className="input" placeholder="Например: турмалин, защита, любовь" onChange={(e) => onSearch(e.target.value)} />
      </div>

      <div className="panel">
        <div className="subtitle">Камни</div>
        {loading ? (
          <div className="inline-row">
            <div className="spinner small" />
            <div className="muted">Загружаю...</div>
          </div>
        ) : null}
        <div className="stone-accordion">
          {isEmpty ? (
            <div className="muted mb-10">Не удалось загрузить список камней. Попробуй позже.</div>
          ) : null}
          {displayStones.map((stone) => {
            const opened = openedId === stone.id;
            return (
              <div key={stone.id} className={`stone-item ${opened ? 'opened' : ''}`}>
                <button className="stone-head" onClick={() => toggle(stone.id)}>
                  <div className="stone-head-left">
                    <div
                      className="stone-chip crystal-icon small"
                      style={{ ['--stone-color' as string]: stone.color ?? '#d6a85a' }}
                    />
                    <span className="stone-title">{stone.name_ru}</span>
                  </div>
                  <span className="stone-toggle">{opened ? '−' : '+'}</span>
                </button>
                {opened ? (
                  <div className="stone-body">
                    <p className="muted">{stone.description_short ?? 'Описание появится позже.'}</p>
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
                    <button className="stone-cta" type="button" onClick={() => setSelected(stone)}>
                      Подробнее
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="action-row">
        <button className="button ghost" onClick={onBack}>
          <img className="btn-icon" src={backIcon} alt="" />
          В меню
        </button>
      </div>

      <StoneDetails stone={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

export default StoneLibrary;
