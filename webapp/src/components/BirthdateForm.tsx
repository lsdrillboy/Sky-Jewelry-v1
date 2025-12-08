import { useState } from 'react';
import '../App.css';
import type { User } from '../types';
import calendarIcon from '../assets/icon-calendar.svg';
import backIcon from '../assets/icon-arrow-left.svg';

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
          <div>
            <div className="tiny">Профиль</div>
            <h1>Дата рождения</h1>
            <p className="muted" style={{ margin: 0 }}>
              Используется для расчёта числа пути и точного подбора минералов.
            </p>
          </div>
        </div>
      </div>

      <div className="panel">
        <label className="subtitle" htmlFor="birthdate">
          Выбери дату
        </label>
        <input
          id="birthdate"
          className="input"
          type="date"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <p className="muted">Дата сохранится в Supabase и будет использоваться при подборе камней.</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="button" onClick={handleSubmit} disabled={saving || !value}>
            <img className="btn-icon" src={calendarIcon} alt="" />
            {saving ? 'Сохраняю...' : 'Сохранить и продолжить'}
          </button>
          <button className="button ghost" onClick={onBack}>
            <img className="btn-icon" src={backIcon} alt="" />
            В меню
          </button>
        </div>
      </div>
    </div>
  );
}

export default BirthdateForm;
