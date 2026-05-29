import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle } from "lucide-react";
import "./ConfirmModal.css";

/**
 * Reusable confirmation modal.
 *
 * Props:
 *  - open: boolean
 *  - title: string
 *  - message: string | ReactNode
 *  - confirmLabel: string (default "Confirm")
 *  - cancelLabel: string (default "Cancel")
 *  - variant: "default" | "danger"  (affects the confirm button color)
 *  - icon: ReactNode (overrides the default icon)
 *  - onConfirm: () => void
 *  - onCancel: () => void
 *  - busy: boolean — disables buttons during async work
 */
function ConfirmModal({
  open,
  title = "Are you sure?",
  message = "",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  icon,
  onConfirm,
  onCancel,
  busy = false,
}) {
  const dialogRef = useRef(null);
  const confirmBtnRef = useRef(null);
  const lastFocusedRef = useRef(null);

  // ESC to dismiss, Enter to confirm; lock body scroll while open.
  useEffect(() => {
    if (!open) return;

    lastFocusedRef.current = document.activeElement;

    const handleKey = (e) => {
      if (busy) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel?.();
      } else if (e.key === "Enter") {
        if (document.activeElement?.tagName === "BUTTON") return;
        e.preventDefault();
        onConfirm?.();
      } else if (e.key === "Tab") {
        // simple focus trap between the two buttons
        const focusables = dialogRef.current?.querySelectorAll(
          "button:not([disabled])"
        );
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus the confirm button on the next frame for screen readers / keyboard users
    const t = requestAnimationFrame(() => confirmBtnRef.current?.focus());

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
      cancelAnimationFrame(t);
      lastFocusedRef.current?.focus?.();
    };
  }, [open, busy, onCancel, onConfirm]);

  if (!open) return null;

  const handleBackdropClick = (e) => {
    if (busy) return;
    if (e.target === e.currentTarget) onCancel?.();
  };

  const Icon = icon || <AlertTriangle size={22} />;

  return createPortal(
    <div
      className="modal-overlay"
      onMouseDown={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className={`modal modal--${variant}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-message"
      >
        <button
          type="button"
          className="modal__close"
          onClick={onCancel}
          aria-label="Close dialog"
          disabled={busy}
        >
          <X size={16} />
        </button>

        <div className={`modal__icon modal__icon--${variant}`} aria-hidden="true">
          {Icon}
        </div>

        <h2 id="modal-title" className="modal__title">
          {title}
        </h2>

        {message && (
          <p id="modal-message" className="modal__message">
            {message}
          </p>
        )}

        <div className="modal__actions">
          <button
            type="button"
            className="modal__btn modal__btn--ghost"
            onClick={onCancel}
            disabled={busy}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            className={`modal__btn modal__btn--${variant}`}
            onClick={onConfirm}
            disabled={busy}
            aria-busy={busy}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ConfirmModal;
