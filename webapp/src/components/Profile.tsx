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
  const hasLifePath = hasBirthdate && typeof user?.life_path === 'number';
  const usernameValue = formatUsername(user?.username);
  const telegramId = user?.telegram_id ? String(user.telegram_id) : '—';

  useEffect(() => {
    setBirthdate(normalize(user?.birthdate));
  }, [user?.birthdate]);

  const handleSave = async () => {
    if (!birthdate) return;
    setSaving(true);
    try {
      await onSaveBirthdate(birthdate);
      setNote('Данные обновлены.');
    } catch (err) {
      // toast об ошибке уже ставится выше
      setNote(null);
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
  const avatarBackground = `radial-gradient(circle at 40% 40%, rgba(216, 177, 92, 0.18), rgba(0, 0, 0, 0.75)), url(${avatarUrl})`;

  return (
    <div className="screen">
      <div className="hero profile-hero-card">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar-circle" style={{ backgroundImage: avatarBackground }} />
          <div className="profile-avatar-glow" />
        </div>
        <div className="profile-hero-copy">
          <div className="profile-hero-kicker">Моя энергетическая карта</div>
          <h1 className="profile-hero-title">Sky Jewelry Profile</h1>
          <p className="muted profile-hero-text">
            Персональный подбор камней и украшений по твоей энергии — рекомендации, которые раскрывают твой стиль и состояние.
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
            <div className="identity-row">
              <div className="identity-label">Telegram ID</div>
            </div>
            <div className="identity-value" title={telegramId}>
              {telegramId}
            </div>
          </div>
          <div className="identity-card">
            <div className="identity-row">
              <div className="identity-label">Username</div>
            </div>
            <div className="identity-value" title={usernameValue}>
              {usernameValue}
            </div>
          </div>
          <div className="identity-card wide">
            <div className="identity-label">Имя</div>
            <div className="identity-value" title={fullName}>
              {fullName}
            </div>
          </div>
        </div>
      </div>

      <div className="panel energy-panel">
        <div className="subtitle">Энергетический блок</div>
        <div className="energy-stack">
          <div className="energy-card energy-input-card">
            <div className="energy-label">Дата рождения</div>
            <div className="energy-input-line">
              <input
                className="input energy-date-input"
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                placeholder="ДД.ММ.ГГГГ"
              />
              <button
                className="button minimal energy-primary-btn"
                disabled={!birthdate || saving}
                onClick={handleSave}
              >
                <img className="btn-icon" src={calendarIcon} alt="" />
                {saving ? 'Сохраняю...' : 'Обновить'}
              </button>
            </div>
            {note ? (
              <p className="muted profile-note success mt-8">
                Данные обновлены.
              </p>
            ) : null}
          </div>
          <div className="energy-card energy-result-card">
            <div className="energy-label">Число пути</div>
            <div className="energy-life">
              <div className="energy-life-number">{hasLifePath ? user?.life_path : '—'}</div>
              <p className="muted energy-life-desc">
                {lifePathDescription(user?.life_path)}
              </p>
            </div>
          </div>

          <div className="trust-note trust-note-solid">
            <span className="trust-icon" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <circle cx="12" cy="15" r="1.5" fill="currentColor" />
              </svg>
            </span>
            <span>Эти данные используются только для персонального подбора камней и не передаются третьим лицам.</span>
          </div>

          <div className="profile-actions compact">
            <button className="button minimal ghost menu-back" onClick={onBack}>
              <img className="btn-icon" src={backIcon} alt="" />
              В меню
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
