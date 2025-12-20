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
        <h3 className="confirm-title">{title}</h3>
        <p className="muted confirm-text">{text}</p>
        <button className="button full" type="button" onClick={onClose}>
          Ок
        </button>
      </div>
    </div>
  );
}
