import '../App.css';
import eyeLogo from '../assets/eye-logo.svg';

type Stage =
  | 'init'
  | 'checking'
  | 'connecting'
  | 'done'
  | 'error-auth'
  | 'error-network'
  | 'error-unknown';

type Props = {
  stage: Stage;
  onRetry: () => void;
  onOpenBot?: () => void;
};

function stageText(stage: Stage) {
  switch (stage) {
    case 'checking':
      return { title: 'Sky Jewelry', subtitle: 'Проверяю доступ…' };
    case 'connecting':
      return { title: 'Настраиваю подбор', subtitle: 'Подключаю профиль…' };
    case 'done':
      return { title: 'Готово', subtitle: 'Запускаю приложение' };
    case 'error-auth':
      return {
        title: 'Не удалось войти',
        subtitle: 'Открой мини-приложение через кнопку в чате бота и попробуй снова.',
      };
    case 'error-network':
      return { title: 'Нет соединения', subtitle: 'Проверь интернет и попробуй снова.' };
    case 'error-unknown':
      return { title: 'Что-то пошло не так', subtitle: 'Попробуй повторить запуск.' };
    case 'init':
    default:
      return { title: 'Sky Jewelry', subtitle: 'Запускаю…' };
  }
}

export default function PreAuth({ stage, onRetry, onOpenBot }: Props) {
  const { title, subtitle } = stageText(stage);
  const isError = stage.startsWith('error');

  return (
    <div className="preauth-shell">
      <div className="preauth-glow" />
      <div className="preauth-card">
        <img className="preauth-logo" src={eyeLogo} alt="" />
        <div className="preauth-title">{title}</div>
        <div className="preauth-subtitle">{subtitle}</div>
        {!isError ? (
          <div className="preauth-progress">
            <div className={`preauth-ring ${stage === 'done' ? 'preauth-ring-done' : ''}`}>
              <span />
            </div>
            <div className="tiny">Займёт несколько секунд</div>
          </div>
        ) : (
          <div className="preauth-actions">
            <button className="button" onClick={onRetry}>
              Повторить
            </button>
            {onOpenBot ? (
              <button className="button ghost" onClick={onOpenBot}>
                Открыть в боте
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
