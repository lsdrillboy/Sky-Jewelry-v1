import '../App.css';
import backIcon from '../assets/icon-arrow-left.svg';

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
        <h1 style={{ margin: 0 }}>{title}</h1>
        {subtitle ? <p className="muted" style={{ margin: '6px 0 0' }}>{subtitle}</p> : null}
      </div>
      <div className="panel">
        <div className="chips-grid">
          {bullets.map((item) => (
            <div className="chip" key={item}>
              {item}
            </div>
          ))}
        </div>
        {note ? <p className="muted" style={{ margin: '12px 0 0' }}>{note}</p> : null}
        <div style={{ marginTop: 14 }}>
          <button className="button ghost" onClick={onBack}>
            <img className="btn-icon" src={backIcon} alt="" />
            В меню
          </button>
        </div>
      </div>
    </div>
  );
}
