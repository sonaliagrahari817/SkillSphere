import "./Toast.css"

function Toast({ message, type = "success", onClose }) {
  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-icon">
        {type === "success" ? "✓" : "!"}
      </span>

      <span className="toast-message">
        {message}
      </span>

      <button
        type="button"
        onClick={onClose}
        className="toast-close"
      >
        ×
      </button>
    </div>
  )
}

export default Toast