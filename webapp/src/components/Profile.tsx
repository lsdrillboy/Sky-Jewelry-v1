import { useEffect, useMemo, useState } from 'react';
import '../App.css';
import type { User } from '../types';
import calendarIcon from '../assets/icon-calendar.svg';
import backIcon from '../assets/icon-arrow-left.svg';

type Props = {
  user: User | null;
  onSaveBirthdate: (birthdate: string) => Promise<void> | void;
  onBack: () => void;
};

function normalize(date?: string | null) {
  if (!date) return '';
  return date.slice(0, 10);
}

function formatDateHuman(date?: string | null) {
  if (!date) return '—';
  const [y, m, d] = date.slice(0, 10).split('-');
  if (!y || !m || !d) return date;
  return `${d}.${m}.${y}`;
}

function formatUsername(username?: string | null) {
  if (!username) return '—';
  return username.startsWith('@') ? username : `@${username}`;
}

function lifePathDescription(value?: number | null) {
  if (!value) return 'Добавь дату рождения, чтобы узнать свой путь.';
  const map: Record<number, string> = {
    1: 'Путь лидерства и инициативы.',
    2: 'Путь баланса и дипломатии.',
    3: 'Путь творчества и самовыражения.',
    4: 'Путь структуры и силы.',
    5: 'Путь перемен и свободы.',
    6: 'Путь заботы и гармонии.',
    7: 'Путь интуиции и знаний.',
    8: 'Путь реализации и энергии.',
    9: 'Путь служения и мудрости.',
    11: 'Путь вдохновения и идей.',
    22: 'Путь созидания и масштаба.',
  };
  return map[value] ?? 'Твоя энергетика активируется после указания даты рождения.';
}

export default function Profile({ user, onSaveBirthdate, onBack }: Props) {
  const [birthdate, setBirthdate] = useState(() => normalize(user?.birthdate));
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const hasBirthdate = Boolean(user?.birthdate);

  useEffect(() => {
    setBirthdate(normalize(user?.birthdate));
  }, [user?.birthdate]);

  const handleSave = async () => {
    if (!birthdate) return;
    setSaving(true);
    try {
      await onSaveBirthdate(birthdate);
      setNote('Дата обновлена и сохранена в Supabase.');
    } finally {
      setSaving(false);
    }
  };

  const fullName = useMemo(
    () => [user?.first_name, user?.last_name].filter(Boolean).join(' ') || '—',
    [user?.first_name, user?.last_name],
  );
  const fallbackLogo =
    'https://kyxztleagpawfhkvxvwa.supabase.co/storage/v1/object/sign/Cover/logogo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wMGI3NGEwZi1jMTViLTRmYzQtYWIzMS0yMzdiMTE3OGY0MWEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJDb3Zlci9sb2dvZ28ucG5nIiwiaWF0IjoxNzY1NTEzNTU0LCJleHAiOjE3OTcwNDk1NTR9.9TdJwuwKWZeh6bREP2ei8FwDjTT-hbhJxF4DMDyBpf4';
  const avatarUrl = user?.photo_url ?? fallbackLogo;

  return (
    <div className="screen">
      <div className="hero profile-hero-card">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar-circle">
            <img src={avatarUrl} alt="" />
          </div>
          <div className="profile-avatar-glow" />
        </div>
        <div className="profile-hero-copy">
          <div className="profile-hero-kicker">Моя энергетическая карта</div>
          <h1 className="profile-hero-title">Sky Jewelry Profile</h1>
          <p className="muted" style={{ margin: 0 }}>
            Подбор камней и украшений по твоей энергии. Профиль синхронизирован с Telegram.
          </p>
          {!hasBirthdate ? (
            <div className="profile-hero-hint">
              Укажи дату рождения, чтобы я смог подобрать твои камни.
            </div>
          ) : null}
        </div>
      </div>

      <div className="panel">
        <div className="subtitle">Твои идентификаторы</div>
        <div className="identity-grid">
          <div className="identity-card">
            <div className="identity-label">Telegram ID</div>
            <div className="identity-value">{user?.telegram_id ?? '—'}</div>
          </div>
          <div className="identity-card">
            <div className="identity-label">Username</div>
            <div className="identity-value">{formatUsername(user?.username)}</div>
          </div>
          <div className="identity-card wide">
            <div className="identity-label">Имя</div>
            <div className="identity-value">{fullName}</div>
          </div>
          <div className="identity-card wide">
            <div className="identity-label">Внутренний ID Sky Jewelry</div>
            <div className="identity-value">{user?.id ?? '—'}</div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="subtitle">Энергетический блок</div>
        <div className="energy-grid">
          <div className="energy-card">
            <div className="energy-label">Дата рождения</div>
            <div className="energy-value">{formatDateHuman(user?.birthdate)}</div>
            <div className="energy-actions">
              <input
                className="input"
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
              />
              <button className="button ghost" disabled={!birthdate || saving} onClick={handleSave}>
                <img className="btn-icon" src={calendarIcon} alt="" />
                {saving ? 'Сохраняю...' : 'Обновить'}
              </button>
            </div>
          </div>
          <div className="energy-card">
            <div className="energy-label">Число пути</div>
            <div className="energy-value">{user?.life_path ?? '—'}</div>
            <p className="muted" style={{ margin: '6px 0 0' }}>
              {lifePathDescription(user?.life_path)}
            </p>
          </div>
        </div>
        {note ? (
          <p className="muted profile-note" style={{ marginTop: 12 }}>
            {note}
          </p>
        ) : null}
        <div className="trust-note">
          Эти данные используются только для персонального подбора камней и не передаются третьим лицам.
        </div>
        <div className="profile-actions">
          <button className="button ghost" onClick={onBack}>
            <img className="btn-icon" src={backIcon} alt="" />
            В меню
          </button>
        </div>
      </div>
    </div>
  );
}
