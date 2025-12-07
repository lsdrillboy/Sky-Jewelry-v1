import '../App.css';

type Props = {
  text?: string;
};

export function Preloader({ text = 'Stones that hear your soul...' }: Props) {
  return (
    <div className="preloader">
      <div className="orb" />
      <div className="panel shadowed" style={{ maxWidth: 340 }}>
        <div className="tiny">Sky Jewelry</div>
        <h3 style={{ margin: '6px 0 8px' }}>Загружаю твою Вселенную</h3>
        <p className="muted" style={{ marginBottom: 12 }}>
          {text}
        </p>
        <div className="spinner" />
      </div>
    </div>
  );
}

export default Preloader;
