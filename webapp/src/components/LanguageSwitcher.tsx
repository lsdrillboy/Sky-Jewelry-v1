import '../App.css';
import { useI18n } from '../i18n';

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="language-switcher" role="group" aria-label={t('language.label')}>
      <button
        type="button"
        className={`language-pill${locale === 'ru' ? ' active' : ''}`}
        onClick={() => setLocale('ru')}
        aria-label={t('language.switchToRu')}
        aria-pressed={locale === 'ru'}
      >
        {t('language.ru')}
      </button>
      <button
        type="button"
        className={`language-pill${locale === 'en' ? ' active' : ''}`}
        onClick={() => setLocale('en')}
        aria-label={t('language.switchToEn')}
        aria-pressed={locale === 'en'}
      >
        {t('language.en')}
      </button>
    </div>
  );
}
