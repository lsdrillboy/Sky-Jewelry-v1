import { useState } from 'react';
import '../App.css';
import { catalogTypes } from '../data/themes';
import type { CustomRequestPayload, Stone } from '../types';
import sendIcon from '../assets/icon-send.svg';
import backIcon from '../assets/icon-arrow-left.svg';
import SectionHeader from './SectionHeader';

type Props = {
  stones: Stone[];
  onSubmit: (payload: CustomRequestPayload) => Promise<void> | void;
  loading: boolean;
  onBack: () => void;
};

export function CustomRequest({ stones, onSubmit, loading, onBack }: Props) {
  const [selectedStones, setSelectedStones] = useState<number[]>([]);
  const [type, setType] = useState<string>('bracelet');
  const [budgetFrom, setBudgetFrom] = useState('');
  const [budgetTo, setBudgetTo] = useState('');
  const [comment, setComment] = useState('');

  const toggleStone = (value: number) => {
    setSelectedStones((prev) => {
      if (prev.includes(value)) {
        return prev.filter((id) => id !== value);
      }
      return [...prev, value];
    });
  };

  const handleSubmit = () => {
    onSubmit({
      stones: selectedStones,
      type,
      budget_from: budgetFrom ? Number(budgetFrom) : null,
      budget_to: budgetTo ? Number(budgetTo) : null,
      comment,
    });
  };

  const selectedStoneLabels = stones
    .filter((stone) => selectedStones.includes(stone.id))
    .map((stone) => ({ id: stone.id, label: stone.name_ru }));

  return (
    <div className="screen">
      <div className="hero center-hero">
        <div className="app-header">
          <div className="logo-mark" />
          <SectionHeader
            align="center"
            kicker="Индивидуальное украшение"
            title="Соберём под твой запрос"
            subtitle="Выбери камни, тип украшения и бюджет. Мастер получит заявку в Telegram."
          />
        </div>
      </div>

      <div className="panel">
        <div className="subtitle">Камни</div>
        <div
          className="input stone-select stone-select-list"
          role="listbox"
          aria-multiselectable="true"
        >
          {stones.map((stone) => {
            const isSelected = selectedStones.includes(stone.id);
            return (
              <button
                key={stone.id}
                type="button"
                className={`stone-select-option${isSelected ? ' selected' : ''}`}
                onClick={() => toggleStone(stone.id)}
                aria-selected={isSelected}
              >
                <span className="stone-select-option-label">{stone.name_ru}</span>
                <span className="stone-select-check" aria-hidden />
              </button>
            );
          })}
        </div>
        {selectedStoneLabels.length ? (
          <div className="stone-chip-pills">
            {selectedStoneLabels.map((stone) => (
              <span key={stone.id} className="stone-chip-pill">
                {stone.label}
              </span>
            ))}
          </div>
        ) : null}
        <p className="muted mt-6">Можно выбрать несколько камней — просто нажимай по пунктам.</p>
      </div>

      <div className="panel">
        <div className="grid two">
          <div>
            <div className="subtitle">Тип</div>
            <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
              {catalogTypes.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label}
                </option>
              ))}
              <option value="other">Другое</option>
            </select>
          </div>
          <div>
            <div className="subtitle">Бюджет</div>
            <div className="input-row">
              <input
                className="input"
                placeholder="от"
                type="number"
                value={budgetFrom}
                onChange={(e) => setBudgetFrom(e.target.value)}
              />
              <input
                className="input"
                placeholder="до"
                type="number"
                value={budgetTo}
                onChange={(e) => setBudgetTo(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div>
          <div className="subtitle">Комментарий</div>
          <textarea
            className="input"
            rows={4}
            placeholder="Опиши запрос, ощущения, цвета, важные детали"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
        <div className="action-row">
          <button className="button minimal primary menu-back" onClick={handleSubmit} disabled={loading}>
            <img className="btn-icon" src={sendIcon} alt="" />
            {loading ? 'Отправляю...' : 'Отправить заявку'}
          </button>
          <button className="button minimal ghost menu-back" onClick={onBack}>
            <img className="btn-icon" src={backIcon} alt="" />
            В меню
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomRequest;
