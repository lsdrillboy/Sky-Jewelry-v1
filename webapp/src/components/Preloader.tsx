import '../App.css';

type Props = {
  text?: string;
};

export function Preloader({ text = 'Stones that hear your soul...' }: Props) {
  return (
    <div className="preloader">
      <div className="orb" />
      <div className="panel shadowed narrow">
        <div className="tiny">Sky Jewelry</div>
        <h3 className="mt-6 mb-8">Загружаю твою Вселенную</h3>
        <p className="muted mb-12">
          {text}
        </p>
        <div className="spinner" />
      </div>
    </div>
  );
}

export default Preloader;
