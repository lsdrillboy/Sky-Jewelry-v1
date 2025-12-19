import '../App.css';
import type { NormalizedStone } from '../utils/stone';

type Props = {
  stone: NormalizedStone | null;
  onClose: () => void;
};

export function StoneDetails({ stone, onClose }: Props) {
  if (!stone) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{stone.name_ru}</h3>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </div>
        {stone.description_short ? <p className="muted">{stone.description_short}</p> : null}
        {stone.description_long ? (
          <div className="stone-fulltext">
            {stone.description_long.split(/\n+/).map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
        ) : null}
        <div className="chips">
          {stone.chakra_list.map((chakra) => (
            <span key={`mc-${chakra}`} className="tag">
              {chakra}
            </span>
          ))}
          {stone.planet_list.map((planet) => (
            <span key={`mp-${planet}`} className="tag">
              {planet}
            </span>
          ))}
          {stone.life_path_list.map((lp) => (
            <span key={`ml-${lp}`} className="tag">
              Путь {lp}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StoneDetails;
