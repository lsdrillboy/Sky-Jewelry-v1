import '../App.css';
import { useI18n } from '../i18n';

type Props = {
  text?: string;
};

export function Preloader({ text }: Props) {
  const { t } = useI18n();
  const message = text ?? t('preloader.defaultText');

  return (
    <div className="preloader">
      <div className="orb" />
      <div className="panel shadowed narrow">
        <div className="tiny">{t('preloader.tag')}</div>
        <h3 className="mt-6 mb-8">{t('preloader.title')}</h3>
        <p className="muted mb-12">
          {message}
        </p>
        <div className="spinner" />
      </div>
    </div>
  );
}

export default Preloader;
