import '../App.css';
import backIcon from '../assets/icon-arrow-left.svg';
import SectionHeader from './SectionHeader';
import { useI18n } from '../i18n';

type Props = {
  onBack: () => void;
};

const authorPhoto =
  'https://kyxztleagpawfhkvxvwa.supabase.co/storage/v1/object/sign/Cover/Autor.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wMGI3NGEwZi1jMTViLTRmYzQtYWIzMS0yMzdiMTE3OGY0MWEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJDb3Zlci9BdXRvci5qcGVnIiwiaWF0IjoxNzY1Nzk0NTYxLCJleHAiOjE3OTczMzA1NjF9.cSvZNla8uLWxTvTukrsY6TVNRVji_yIaLFtA0YbXu0o';

export default function BrandStory({ onBack }: Props) {
  const { t, get } = useI18n();
  const storyBlocks = (get('brandStory.blocks') as { title: string; text: string }[]) ?? [];

  return (
    <div className="screen story-screen">
      <div className="hero story-hero">
        <div className="story-hero-text">
          <SectionHeader
            align="left"
            kicker={t('brandStory.kicker')}
            title={t('brandStory.title')}
            subtitle={t('brandStory.subtitle')}
          />
        </div>
        <div className="story-author full">
          <div className="story-photo-frame large full">
            <img className="story-photo" src={authorPhoto} alt={t('brandStory.authorName')} />
            <div className="story-photo-glow" />
          </div>
          <div className="story-author-meta">
            <div className="tiny">{t('brandStory.authorLabel')}</div>
            <div className="story-author-name">{t('brandStory.authorName')}</div>
            <p className="muted story-author-note">
              {t('brandStory.authorNote')}
            </p>
          </div>
        </div>
      </div>

      <div className="panel story-panel">
        <div className="story-grid">
          {storyBlocks.map((block) => (
            <div className="story-card" key={block.title}>
              <div className="story-card-title">{block.title}</div>
              <p className="story-card-text">{block.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-18">
          <button className="button minimal ghost menu-back" onClick={onBack}>
            <img className="btn-icon" src={backIcon} alt="" />
            {t('common.menu')}
          </button>
        </div>
      </div>
    </div>
  );
}
