import '../App.css';
import backIcon from '../assets/icon-arrow-left.svg';
import SectionHeader from './SectionHeader';

type Props = {
  title: string;
  subtitle?: string;
  bullets?: string[];
  note?: string;
  onBack: () => void;
};

export default function InfoSection({ title, subtitle, bullets = [], note, onBack }: Props) {
  return (
    <div className="screen">
      <div className="hero">
        <SectionHeader align="center" title={title} subtitle={subtitle} />
      </div>
      <div className="panel">
        <div className="chips-grid">
          {bullets.map((item) => (
            <div className="chip" key={item}>
              {item}
            </div>
          ))}
        </div>
        {note ? <p className="muted mt-12">{note}</p> : null}
        <div className="mt-14">
          <button className="button minimal ghost menu-back" onClick={onBack}>
            <img className="btn-icon" src={backIcon} alt="" />
            В меню
          </button>
        </div>
      </div>
    </div>
  );
}
