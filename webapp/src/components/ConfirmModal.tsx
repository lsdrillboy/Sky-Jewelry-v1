import '../App.css';

type Props = {
  title: string;
  text: string;
  onClose: () => void;
};

export default function ConfirmModal({ title, text, onClose }: Props) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card confirm-modal" onClick={(event) => event.stopPropagation()}>
        <div className="confirm-icon" aria-hidden>
          <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="2.2" />
            <path
              d="M17 24.5l5 5 9-10"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3 className="confirm-title">{title}</h3>
        <p className="muted confirm-text">{text}</p>
        <button className="button minimal primary full confirm-action" type="button" onClick={onClose}>
          Ок
        </button>
      </div>
    </div>
  );
}
