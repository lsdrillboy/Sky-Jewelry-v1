import { useState } from 'react';
import '../App.css';
import { catalogTypes } from '../data/themes';
import type { CustomRequestPayload, Stone } from '../types';
import sendIcon from '../assets/icon-send.svg';
import backIcon from '../assets/icon-arrow-left.svg';

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

  const handleSubmit = () => {
    onSubmit({
      stones: selectedStones,
      type,
      budget_from: budgetFrom ? Number(budgetFrom) : null,
      budget_to: budgetTo ? Number(budgetTo) : null,
      comment,
    });
  };

  return (
    <div className="screen">
      <div className="hero">
        <div className="app-header">
          <div className="logo-mark" />
          <div>
            <div className="tiny">Индивидуальное украшение</div>
            <h1>Соберём под твой запрос</h1>
            <p className="muted" style={{ margin: 0 }}>
              Выбери камни, тип украшения и бюджет. Мастер получит заявку в Telegram.
            </p>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="subtitle">Камни</div>
        <select
          className="input"
          multiple
          size={6}
          value={selectedStones.map(String)}
          onChange={(e) => {
            const options = Array.from(e.target.selectedOptions).map((o) => Number(o.value));
            setSelectedStones(options);
          }}
        >
          {stones.map((stone) => (
            <option key={stone.id} value={stone.id}>
              {stone.name_ru}
            </option>
          ))}
        </select>
        <p className="muted" style={{ marginTop: 6 }}>
          Выбери один или несколько камней. На телефоне список откроется во всплывающем окне.
        </p>
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
            <div style={{ display: 'flex', gap: 8 }}>
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
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="button" onClick={handleSubmit} disabled={loading}>
            <img className="btn-icon" src={sendIcon} alt="" />
            {loading ? 'Отправляю...' : 'Отправить заявку'}
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

export default CustomRequest;
