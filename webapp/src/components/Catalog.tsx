import '../App.css';
import { catalogTypes } from '../data/themes';
import type { Product, Stone } from '../types';

type Filters = {
  stone_id?: number;
  type?: string | null;
};

type Props = {
  filters: Filters;
  products: Product[];
  stones: Stone[];
  loading: boolean;
  onChangeFilters: (filters: Filters) => void;
  onRefresh: () => void;
  onBack: () => void;
};

function formatPrice(product: Product) {
  const currency = product.currency ?? 'USD';
  if (product.price_min && product.price_max && product.price_min !== product.price_max) {
    return `${product.price_min}–${product.price_max} ${currency}`;
  }
  if (product.price_min) return `${product.price_min} ${currency}`;
  if (product.price) return `${product.price} ${currency}`;
  return 'Цена по запросу';
}

export function Catalog({
  filters,
  products,
  stones,
  loading,
  onChangeFilters,
  onRefresh,
  onBack,
}: Props) {
  return (
    <div className="screen">
      <div className="hero">
        <div className="app-header">
          <div className="logo-mark" />
          <div>
            <div className="tiny">Каталог</div>
            <h1>Украшения с твоими камнями</h1>
            <p className="muted" style={{ margin: 0 }}>
              Фильтруй по камню и типу. Нажми на карточку, чтобы оставить заявку через бота.
            </p>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="grid two">
          <div>
            <div className="subtitle">Камень</div>
            <select
              className="input"
              value={filters.stone_id ?? ''}
              onChange={(e) =>
                onChangeFilters({
                  ...filters,
                  stone_id: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            >
              <option value="">Любой</option>
              {stones.map((stone) => (
                <option key={stone.id} value={stone.id}>
                  {stone.name_ru}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="subtitle">Тип украшения</div>
            <select
              className="input"
              value={filters.type ?? ''}
              onChange={(e) =>
                onChangeFilters({
                  ...filters,
                  type: e.target.value || null,
                })
              }
            >
              <option value="">Любой</option>
              {catalogTypes.map((type) => (
                <option key={type.code} value={type.code}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
          <button className="button" onClick={onRefresh}>
            🔎 Применить
          </button>
          <button className="button ghost" onClick={onBack}>
            ⬅️ В меню
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="subtitle">Украшения</div>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="spinner" style={{ width: 30, height: 30 }} />
            <div className="muted">Загружаю...</div>
          </div>
        ) : null}
        {!loading && !products.length ? <p className="muted">Не нашла украшения под этот фильтр.</p> : null}
        <div className="catalog-grid">
          {products.map((product) => (
            <div key={product.id} className="card product-card">
              {product.main_photo_url || product.photo_url ? (
                <img src={product.main_photo_url ?? product.photo_url!} alt={product.name} />
              ) : null}
              <h3>{product.name}</h3>
              <p className="muted" style={{ minHeight: 44 }}>
                {product.description ?? 'Описание появится позже.'}
              </p>
              <div className="pill">{formatPrice(product)}</div>
              <div className="tiny">Камни: {(product.stone_ids ?? product.stones)?.join(', ') ?? '—'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Catalog;
