import '../App.css';
import { getStoneDescriptionLong, getStoneDescriptionShort, getStoneName, type NormalizedStone } from '../utils/stone';
import { useI18n } from '../i18n';

type Props = {
  stone: NormalizedStone | null;
  onClose: () => void;
};

export function StoneDetails({ stone, onClose }: Props) {
  const { t, locale } = useI18n();
  if (!stone) return null;
  const stoneName = getStoneName(stone, locale);
  const stoneShort = getStoneDescriptionShort(stone, locale);
  const stoneLong = getStoneDescriptionLong(stone, locale);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{stoneName}</h3>
          <button className="icon-button" type="button" onClick={onClose} aria-label={t('common.close')}>
            ✕
          </button>
        </div>
        {stoneShort ? (
          <p className="muted stone-description">{stoneShort}</p>
        ) : null}
        {stoneLong ? (
          <div className="stone-fulltext">
            {stoneLong.split(/\n+/).map((para, idx) => (
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
              {t('common.pathLabel', { value: lp })}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StoneDetails;
