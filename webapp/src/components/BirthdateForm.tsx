import { useState } from 'react';
import '../App.css';
import type { User } from '../types';
import calendarIcon from '../assets/icon-calendar.svg';
import backIcon from '../assets/icon-arrow-left.svg';
import SectionHeader from './SectionHeader';
import { useI18n } from '../i18n';

type Props = {
  user: User | null;
  onSubmit: (birthdate: string) => Promise<void> | void;
  onBack: () => void;
};

function normalize(date?: string | null) {
  if (!date) return '';
  // expecting yyyy-mm-dd from backend
  return date.slice(0, 10);
}

export function BirthdateForm({ user, onSubmit, onBack }: Props) {
  const { t } = useI18n();
  const [value, setValue] = useState(() => normalize(user?.birthdate));
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!value) return;
    setSaving(true);
    await onSubmit(value);
    setSaving(false);
  };

  return (
    <div className="screen">
      <div className="hero">
        <div className="app-header">
          <div className="logo-mark" />
          <SectionHeader
            align="center"
            kicker={t('birthdate.kicker')}
            title={t('birthdate.title')}
            subtitle={t('birthdate.subtitle')}
          />
        </div>
      </div>

      <div className="panel">
        <label className="subtitle" htmlFor="birthdate">
          {t('birthdate.label')}
        </label>
        <input
          id="birthdate"
          className="input"
          type="date"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <p className="muted">{t('birthdate.note')}</p>
        <div className="action-row">
          <button className="button" onClick={handleSubmit} disabled={saving || !value}>
            <img className="btn-icon" src={calendarIcon} alt="" />
            {saving ? t('common.saving') : t('birthdate.save')}
          </button>
          <button className="button minimal ghost menu-back" onClick={onBack}>
            <img className="btn-icon" src={backIcon} alt="" />
            {t('common.menu')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BirthdateForm;
