import "./ModalConfirmacion.css"

export default function ModalConfirmacion({ tipo, onConfirm, onClose }) {
  const texto =
    tipo === "cambiar"
      ? "¿Estás seguro que deseas cambiar tu plan?"
      : "¿Seguro que deseas cancelar tu plan? Perderás tu suscripción y deberás registrarte nuevamente."

  const btnTexto = tipo === "cambiar" ? "Confirmar cambio" : "Confirmar cancelación"

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Confirmación</h3>
        <p>{texto}</p>
        <div className="modal-actions">
          <button className="btn-confirm" onClick={onConfirm}>{btnTexto}</button>
          <button className="btn-cancelar" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  )
}
