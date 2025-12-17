import '../App.css';
import { useMemo, useState } from 'react';
import { catalogTypes } from '../data/themes';
import type { Product, Stone } from '../types';
import searchIcon from '../assets/icon-search.svg';
import backIcon from '../assets/icon-arrow-left.svg';

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
  favorites: Set<number>;
  onToggleFavorite: (product: Product) => void;
  onOrder: (product: Product) => void;
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
  favorites,
  onToggleFavorite,
  onOrder,
  onBack,
}: Props) {
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set());

  const toggleExpanded = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const sortedProducts = useMemo(() => products, [products]);

  return (
    <div className="screen">
      <div className="hero">
        <div className="app-header">
          <div className="logo-mark" />
          <div className="app-header-text">
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
            <img className="btn-icon" src={searchIcon} alt="" />
            Применить
          </button>
          <button className="button ghost" onClick={onBack}>
            <img className="btn-icon" src={backIcon} alt="" />
            В меню
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
        {!loading && !products.length ? <p className="muted">Не нашел украшения под этот фильтр.</p> : null}
        <div className="catalog-grid">
          {sortedProducts.map((product) => {
            const image = product.main_photo_url ?? product.photo_url ?? '';
            const isExpanded = expanded.has(product.id);
            const isFav = favorites.has(product.id);
            const price = formatPrice(product);
            return (
              <div key={product.id} className="card product-card premium-product">
                <div className="product-cover">
                  {image ? <img src={image} alt={product.name} loading="lazy" /> : <div className="product-placeholder">Фото скоро</div>}
                  {product.type ? <span className="floating-badge product-type">{product.type}</span> : null}
                  <div className="product-overlay" />
                </div>
                <div className="product-body">
                  <div className="product-headline">
                    <h3>{product.name}</h3>
                    {price ? <div className="product-price">{price.replace('BHT', 'THB')}</div> : null}
                  </div>
                  <p className={`muted product-description ${isExpanded ? 'expanded' : ''}`}>
                    {product.description ?? 'Описание появится позже.'}
                  </p>
                  {product.description ? (
                    <button className="link-button" onClick={() => toggleExpanded(product.id)}>
                      {isExpanded ? 'Свернуть ▲' : 'Показать больше ▼'}
                    </button>
                  ) : null}
                  <div className="product-actions">
                    <button
                      className={`button ghost minimal fav ${isFav ? 'active' : ''}`}
                      onClick={() => onToggleFavorite(product)}
                    >
                      {isFav ? '♥ В избранном' : '♡ В избранное'}
                    </button>
                    <button className="button minimal primary" onClick={() => onOrder(product)}>
                      Заказать
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Catalog;
