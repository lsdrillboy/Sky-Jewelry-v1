import '../App.css';

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

function stageText(_stage: Stage) {
  return { title: 'Вход', subtitle: 'Подключаю профиль…' };
}

export default function PreAuth({ stage, onRetry, onOpenBot }: Props) {
  const { title, subtitle } = stageText(stage);
  const logoUrl =
    'https://kyxztleagpawfhkvxvwa.supabase.co/storage/v1/object/sign/Cover/logogo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wMGI3NGEwZi1jMTViLTRmYzQtYWIzMS0yMzdiMTE3OGY0MWEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJDb3Zlci9sb2dvZ28ucG5nIiwiaWF0IjoxNzY1NjgyOTYwLCJleHAiOjE3OTcyMTg5NjB9.8dtOi_KfgKaqFwzz5qi2CBJGsReZ1Ob90QOSRtqQwnk';

  return (
    <div className="preauth-shell">
      <div className="preauth-glow" />
      <div className="preauth-card">
        <div className="preauth-logo" style={{ backgroundImage: `url(${logoUrl})` }} />
        <div className="preauth-title">{title}</div>
        <div className="preauth-subtitle">{subtitle}</div>
        <div className="preauth-progress">
          <div className={`preauth-ring ${stage === 'done' ? 'preauth-ring-done' : ''}`}>
            <span />
          </div>
          <div className="tiny">Займёт несколько секунд</div>
        </div>
      </div>
    </div>
  );
}
