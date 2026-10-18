import "./ModalConfirmacion.css"
import "./ModalCredenciales.css"
import { useState } from "react"

//Muestra una sola vez las credenciales del socio recién creado
export default function ModalCredenciales({ socio, password, onClose }) {
  const [copiado, setCopiado] = useState(false)

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(password)
      setCopiado(true)
    } catch {
      setCopiado(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Socio creado</h3>
        <p>
          Credenciales de {socio.user.nombre} {socio.user.apellido}. Puede ingresar con su email o su DNI.
        </p>

        <dl className="credenciales">
          <dt>Email</dt>
          <dd>{socio.user.email}</dd>
          <dt>DNI</dt>
          <dd>{socio.user.dni}</dd>
          <dt>Contraseña temporal</dt>
          <dd className="credenciales-password">{password}</dd>
        </dl>

        <p className="credenciales-aviso">
          ⚠️ Copiá la contraseña ahora: no se puede volver a ver después de cerrar esta ventana.
        </p>

        <div className="modal-actions">
          <button className="btn-confirm" onClick={copiar}>
            {copiado ? "✔ Copiada" : "Copiar contraseña"}
          </button>
          <button className="btn-cancelar" onClick={onClose}>Ya la copié, cerrar</button>
        </div>
      </div>
    </div>
  )
}
