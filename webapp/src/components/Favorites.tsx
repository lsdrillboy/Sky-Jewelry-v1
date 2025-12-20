import '../App.css';
import type { Product } from '../types';
import backIcon from '../assets/icon-arrow-left.svg';
import SectionHeader from './SectionHeader';

type Props = {
  products: Product[];
  onBack: () => void;
  onOrder: (product: Product) => void;
  onToggleFavorite: (product: Product) => void;
};

export default function Favorites({ products, onBack, onOrder, onToggleFavorite }: Props) {
  return (
    <div className="screen">
      <div className="hero">
        <SectionHeader
          align="center"
          title="Избранное"
          subtitle="Сохраняй украшения, чтобы вернуться к ним позже."
        />
      </div>
      <div className="panel">
        {!products.length ? <p className="muted">Пока пусто. Добавь украшение из каталога.</p> : null}
        <div className="catalog-grid">
          {products.map((product) => {
            const image = product.main_photo_url ?? product.photo_url ?? '';
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
                  </div>
                  {product.description ? <p className="muted product-description expanded">{product.description}</p> : null}
                  <div className="product-actions">
                    <button className="button ghost minimal fav active" onClick={() => onToggleFavorite(product)}>
                      Убрать
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
        <div className="mt-14">
          <button className="button ghost" onClick={onBack}>
            <img className="btn-icon" src={backIcon} alt="" />
            В меню
          </button>
        </div>
      </div>
    </div>
  );
}
