// Replaces showDialog / showModalBottomSheet
export default function Modal({ title, onClose, children, actions, sheet = false, wide = false }) {
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={`modal ${sheet ? 'sheet' : ''} ${wide ? 'wide' : ''}`}>
        {title && <h3 className="modal-title">{title}</h3>}
        <div className="modal-body">{children}</div>
        {actions && <div className="modal-actions">{actions}</div>}
      </div>
    </div>
  );
}
