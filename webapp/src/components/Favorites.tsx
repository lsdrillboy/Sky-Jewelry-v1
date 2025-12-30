import '../App.css';
import type { Product } from '../types';
import backIcon from '../assets/icon-arrow-left.svg';
import SectionHeader from './SectionHeader';
import { useI18n } from '../i18n';

type Props = {
  products: Product[];
  onBack: () => void;
  onOrder: (product: Product) => void;
  onToggleFavorite: (product: Product) => void;
};

export default function Favorites({ products, onBack, onOrder, onToggleFavorite }: Props) {
  const { t } = useI18n();
  const resolveProductType = (type?: string | null) =>
    type ? t(`types.${type}`, { defaultValue: type }) : null;

  return (
    <div className="screen">
      <div className="hero">
        <SectionHeader
          align="center"
          title={t('favorites.title')}
          subtitle={t('favorites.subtitle')}
        />
      </div>
      <div className="panel">
        {!products.length ? <p className="muted">{t('favorites.empty')}</p> : null}
        <div className="catalog-grid">
          {products.map((product) => {
            const image = product.main_photo_url ?? product.photo_url ?? '';
            const productTypeLabel = resolveProductType(product.type);
            return (
              <div key={product.id} className="card product-card premium-product">
                <div className="product-cover">
                  {image ? <img src={image} alt={product.name} loading="lazy" /> : <div className="product-placeholder">{t('common.photoSoon')}</div>}
                  {productTypeLabel ? <span className="floating-badge product-type">{productTypeLabel}</span> : null}
                  <div className="product-overlay" />
                </div>
                <div className="product-body">
                  <div className="product-headline">
                    <h3>{product.name}</h3>
                  </div>
                  {product.description ? <p className="muted product-description expanded">{product.description}</p> : null}
                  <div className="product-actions">
                    <button className="button ghost minimal fav active" onClick={() => onToggleFavorite(product)}>
                      {t('common.remove')}
                    </button>
                    <button className="button minimal primary" onClick={() => onOrder(product)}>
                      {t('common.order')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-14">
          <button className="button minimal ghost menu-back" onClick={onBack}>
            <img className="btn-icon" src={backIcon} alt="" />
            {t('common.menu')}
          </button>
        </div>
      </div>
    </div>
  );
}
