import "./ModalConfirmacion.css"
import "./ModalCredenciales.css"
import { useState } from "react"

//Para reactivar un socio cuyo plan fue dado de baja: obliga a elegir un plan activo
export default function ModalElegirPlan({ socio, planes, onConfirm, onClose }) {
  const [planId, setPlanId] = useState("")

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Reactivar socio</h3>
        <p>
          El plan de {socio.user.nombre} {socio.user.apellido} ({socio.plan.nombre}) está dado de baja.
          Elegí un plan activo para reactivarlo.
        </p>

        {planes.length === 0 ? (
          <p className="credenciales-aviso">No hay planes activos. Reactivá o creá un plan primero.</p>
        ) : (
          <select className="select-plan" value={planId} onChange={(e) => setPlanId(e.target.value)}>
            <option value="">Elegí un plan</option>
            {planes.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre} (${p.precio})</option>
            ))}
          </select>
        )}

        <div className="modal-actions">
          <button className="btn-confirm" disabled={!planId} onClick={() => onConfirm(Number(planId))}>
            Reactivar
          </button>
          <button className="btn-cancelar" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  )
}
