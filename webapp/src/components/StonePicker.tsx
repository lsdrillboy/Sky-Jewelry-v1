import '../App.css';
import { themes as themeList } from '../data/themes';
import type { Stone, StonePickerResult } from '../types';

type Props = {
  result: StonePickerResult | null;
  loading: boolean;
  lifePath: number | null | undefined;
  onPick: (theme: string) => Promise<void> | void;
  onOpenCatalog: (stoneId: number) => void;
  onBack: () => void;
};

export function StonePicker({ result, loading, lifePath, onPick, onOpenCatalog, onBack }: Props) {
  return (
    <div className="screen">
      <div className="hero">
        <div className="app-header">
          <div className="logo-mark" />
          <div>
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
        <div className="chips">
          {themeList.map((theme) => (
            <button key={theme.code} className="chip" onClick={() => onPick(theme.code)}>
              <span>{theme.emoji}</span>
              <span>{theme.label}</span>
            </button>
          ))}
        </div>
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
        {result && (
          <div className="grid two">
            {result.stones.map((stone: Stone, idx) => (
              <div key={stone.id} className="card stone-card">
                <div className="floating-badge">{idx === 0 ? 'главный' : 'дополнительный'}</div>
                {stone.photo_url ? <img src={stone.photo_url} alt={stone.name_ru} /> : null}
                <h3>{stone.name_ru}</h3>
                <p className="muted" style={{ minHeight: 48 }}>
                  {stone.description_short ?? 'Описание появится позже.'}
                </p>
                <button className="button ghost" onClick={() => onOpenCatalog(stone.id)}>
                  💍 Показать украшения с этим камнем
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className="button ghost" onClick={onBack}>
          ⬅️ В меню
        </button>
      </div>
    </div>
  );
}

export default StonePicker;
