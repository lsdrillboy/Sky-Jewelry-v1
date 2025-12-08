import '../App.css';
import type { Stone } from '../types';
import backIcon from '../assets/icon-arrow-left.svg';

type Props = {
  stones: Stone[];
  loading: boolean;
  onSearch: (query: string) => void;
  onBack: () => void;
};

export function StoneLibrary({ stones, loading, onSearch, onBack }: Props) {
  return (
    <div className="screen">
      <div className="hero">
        <div className="app-header">
          <div className="logo-mark" />
          <div>
            <div className="tiny">Энергия камней</div>
            <h1>Справочник минералов</h1>
            <p className="muted" style={{ margin: 0 }}>
              Краткие заметки о том, что усиливает каждый камень.
            </p>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="subtitle">Поиск</div>
        <input className="input" placeholder="Например: турмалин, защита, любовь" onChange={(e) => onSearch(e.target.value)} />
      </div>

      <div className="panel">
        <div className="subtitle">Камни</div>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="spinner" style={{ width: 30, height: 30 }} />
            <div className="muted">Загружаю...</div>
          </div>
        ) : null}
        <div className="grid two">
          {stones.map((stone) => (
            <div key={stone.id} className="card stone-card">
              <h3>{stone.name_ru}</h3>
              <p className="muted" style={{ minHeight: 48 }}>
                {stone.description_short ?? 'Описание появится позже.'}
              </p>
              {stone.themes?.length ? (
                <div className="chips">
                  {stone.themes.map((theme) => (
                    <span key={theme} className="tag">
                      {theme}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className="button ghost" onClick={onBack}>
          <img className="btn-icon" src={backIcon} alt="" />
          В меню
        </button>
      </div>
    </div>
  );
}

export default StoneLibrary;
