import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import "./Toast.css";

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

function Toast({ variant = "info", title, message, onClose }) {
  const Icon = ICONS[variant] || Info;
  return (
    <div className={`toast toast--${variant}`} role="status">
      <div className="toast__icon">
        <Icon size={18} />
      </div>
      <div className="toast__body">
        {title && <div className="toast__title">{title}</div>}
        {message && <div className="toast__message">{message}</div>}
      </div>
      <button
        type="button"
        className="toast__close"
        onClick={onClose}
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default Toast;
