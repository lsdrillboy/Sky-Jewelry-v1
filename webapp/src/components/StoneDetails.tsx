import type { ReactNode } from 'react';
import '../App.css';
import {
  getStoneChakraLabel,
  getStoneDescriptionLong,
  getStoneDescriptionShort,
  getStoneName,
  getStonePlanetLabel,
  type NormalizedStone,
} from '../utils/stone';
import { useI18n } from '../i18n';

type Props = {
  stone: NormalizedStone | null;
  onClose: () => void;
};

const hasLetters = (value: string) => /[A-Za-z\u0410-\u042f\u0430-\u044f]/.test(value);

const isHeadingLine = (value: string) => {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed || !hasLetters(trimmed)) return false;
  return trimmed === trimmed.toUpperCase();
};

const renderStoneLong = (text: string) => {
  const lines = text.split('\n');
  const blocks: ReactNode[] = [];
  let listItems: string[] = [];
  let index = 0;

  const flushList = () => {
    if (!listItems.length) return;
    const items = listItems;
    listItems = [];
    const listKey = index++;
    blocks.push(
      <ul key={`list-${listKey}`} className="stone-list">
        {items.map((item, itemIndex) => (
          <li key={`item-${listKey}-${itemIndex}`}>{item}</li>
        ))}
      </ul>,
    );
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }
    const bulletMatch = /^[-\u2022]\s+(.+)$/.exec(trimmed);
    if (bulletMatch) {
      listItems.push(bulletMatch[1]);
      return;
    }
    flushList();
    if (isHeadingLine(trimmed)) {
      blocks.push(
        <h4 key={`heading-${index++}`} className="stone-section-title">
          {trimmed}
        </h4>,
      );
      return;
    }
    blocks.push(<p key={`para-${index++}`}>{trimmed}</p>);
  });

  flushList();
  return blocks;
};

export function StoneDetails({ stone, onClose }: Props) {
  const { t, locale } = useI18n();
  if (!stone) return null;
  const stoneName = getStoneName(stone, locale);
  const stoneShort = getStoneDescriptionShort(stone, locale);
  const stoneLong = getStoneDescriptionLong(stone, locale);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card stone-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{stoneName}</h3>
          <button className="icon-button" type="button" onClick={onClose} aria-label={t('common.close')}>
            ✕
          </button>
        </div>
        {stoneShort ? (
          <p className="stone-subtitle">{stoneShort}</p>
        ) : null}
        {stoneLong ? (
          <div className="stone-fulltext">{renderStoneLong(stoneLong)}</div>
        ) : null}
        <div className="chips">
          {stone.chakra_list.map((chakra) => (
            <span key={`mc-${chakra}`} className="tag">
              {getStoneChakraLabel(chakra, locale)}
            </span>
          ))}
          {stone.planet_list.map((planet) => (
            <span key={`mp-${planet}`} className="tag">
              {getStonePlanetLabel(planet, locale)}
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
