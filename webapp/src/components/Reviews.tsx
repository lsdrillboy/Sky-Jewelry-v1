import { useState } from 'react';
import '../App.css';
import SectionHeader from './SectionHeader';
import { useI18n } from '../i18n';

type Review = {
  author: string;
  text: string;
};

type Props = {
  onBack: () => void;
};

export default function Reviews({ onBack }: Props) {
  const { t, get } = useI18n();
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const reviews = (get('reviews.items') as Review[]) ?? [];

  const toggle = (idx: number) => {
    setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="screen">
      <button className="back-fab" type="button" onClick={onBack} aria-label={t('common.menu')}>
        <span />
      </button>
      <div className="hero center-hero">
        <div className="app-header">
          <div className="logo-mark" />
          <SectionHeader
            align="center"
            kicker={t('reviews.kicker')}
            title={t('reviews.title')}
            subtitle={t('reviews.subtitle')}
          />
        </div>
      </div>

      <div className="panel">
        <div className="review-grid">
          {reviews.map((item, idx) => {
            const isExpanded = expanded[idx] ?? false;
            const canToggle = item.text.length > 180;
            const textClass = `review-text ${isExpanded ? 'expanded' : ''} ${canToggle && !isExpanded ? 'collapsed' : ''}`.trim();
            return (
              <div className="card review-card" key={`${item.author}-${idx}`}>
                <div className="review-author">{item.author}</div>
                <p className={textClass}>{item.text}</p>
                {canToggle ? (
                  <button className="review-toggle" type="button" onClick={() => toggle(idx)}>
                    {isExpanded ? t('reviews.hide') : t('reviews.showMore')}
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
