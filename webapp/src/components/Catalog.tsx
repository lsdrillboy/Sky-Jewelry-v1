import '../App.css';
import { useMemo, useState } from 'react';
import { catalogTypes } from '../data/themes';
import type { Product, Stone } from '../types';
import searchIcon from '../assets/icon-search.svg';
import backIcon from '../assets/icon-arrow-left.svg';
import customIcon from '../assets/icon-custom.svg';
import SectionHeader from './SectionHeader';

type Filters = {
  stone_ids?: number[];
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
  onCustomRequest: () => void;
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
  onCustomRequest,
}: Props) {
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set());
  const selectedStoneIds = filters.stone_ids ?? [];

  const toggleExpanded = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleStone = (id: number) => {
    const next = selectedStoneIds.includes(id)
      ? selectedStoneIds.filter((stoneId) => stoneId !== id)
      : [...selectedStoneIds, id];
    onChangeFilters({
      ...filters,
      stone_ids: next.length ? next : undefined,
    });
  };

  const clearStones = () => {
    onChangeFilters({
      ...filters,
      stone_ids: undefined,
    });
  };

  const sortedProducts = useMemo(() => products, [products]);
  const selectedStoneLabels = useMemo(
    () =>
      stones
        .filter((stone) => selectedStoneIds.includes(stone.id))
        .map((stone) => ({ id: stone.id, label: stone.name_ru })),
    [stones, selectedStoneIds],
  );

  return (
    <div className="screen">
      <div className="hero">
        <div className="app-header">
          <div className="logo-mark" />
          <SectionHeader
            align="center"
            kicker="Каталог"
            title="Украшения с твоими камнями"
            subtitle="Фильтруй по камню и типу. Нажми на карточку, чтобы оставить заявку через бота."
          />
        </div>
      </div>

      <div className="panel">
        <div className="grid two">
          <div>
            <div className="subtitle">Камни</div>
            <div className="input stone-select stone-select-list" role="listbox" aria-multiselectable="true">
              <button
                type="button"
                className={`stone-select-option${selectedStoneIds.length === 0 ? ' selected' : ''}`}
                onClick={clearStones}
                aria-selected={selectedStoneIds.length === 0}
              >
                <span className="stone-select-option-label">Любой</span>
                <span className="stone-select-check" aria-hidden />
              </button>
              {stones.map((stone) => {
                const isSelected = selectedStoneIds.includes(stone.id);
                return (
                  <button
                    key={stone.id}
                    type="button"
                    className={`stone-select-option${isSelected ? ' selected' : ''}`}
                    onClick={() => toggleStone(stone.id)}
                    aria-selected={isSelected}
                  >
                    <span className="stone-select-option-label">{stone.name_ru}</span>
                    <span className="stone-select-check" aria-hidden />
                  </button>
                );
              })}
            </div>
            {selectedStoneLabels.length ? (
              <div className="stone-chip-pills">
                {selectedStoneLabels.map((stone) => (
                  <span key={stone.id} className="stone-chip-pill">
                    {stone.label}
                  </span>
                ))}
              </div>
            ) : null}
            <p className="muted mt-6">Можно выбрать несколько камней — просто нажимай по пунктам.</p>
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
        <div className="action-row mt-10">
          <button className="button minimal primary menu-back" onClick={onRefresh}>
            <img className="btn-icon" src={searchIcon} alt="" />
            Применить
          </button>
          <button className="button minimal ghost menu-back" onClick={onBack}>
            <img className="btn-icon" src={backIcon} alt="" />
            В меню
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="subtitle">Украшения</div>
        {loading ? (
          <div className="inline-row">
            <div className="spinner small" />
            <div className="muted">Загружаю...</div>
          </div>
        ) : null}
        {!loading && !products.length ? (
          <div className="stack">
            <p className="muted">Не нашел украшения под этот фильтр.</p>
            <button className="button minimal primary menu-back" onClick={onCustomRequest}>
              <img className="btn-icon" src={customIcon} alt="" />
              Собрать индивидуально
            </button>
          </div>
        ) : null}
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
