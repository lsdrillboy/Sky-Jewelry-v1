import '../App.css';
import SectionHeader from './SectionHeader';
import { useI18n } from '../i18n';

type Props = {
  title: string;
  subtitle?: string;
  bullets?: string[];
  note?: string;
  onBack: () => void;
};

export default function InfoSection({ title, subtitle, bullets = [], note, onBack }: Props) {
  const { t } = useI18n();

  return (
    <div className="screen">
      <button className="back-fab" type="button" onClick={onBack} aria-label={t('common.menu')}>
        <span />
      </button>
      <div className="hero">
        <SectionHeader align="center" title={title} subtitle={subtitle} />
      </div>
      <div className="panel">
        <div className="chips-grid">
          {bullets.map((item) => (
            <div className="chip" key={item}>
              {item}
            </div>
          ))}
        </div>
        {note ? <p className="muted mt-12">{note}</p> : null}
      </div>
    </div>
  );
}
