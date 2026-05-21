import "./MiPlan.css"
import { useEffect, useMemo, useState } from "react"
import { LS } from "../../utils/storage.js"
import ModalConfirmacion from "../Modals/ModalConfirmacion.jsx"
import { useAuth } from "../../context/AuthContext.jsx"

const s = (v) => String(v)

export default function MiPlan() {
  const { user, updateUserPlan } = useAuth()
  const planes = LS.get("planes", [])

  //el plan actual es el que coincide con el id del usuario
  const planActual = useMemo(
    () => planes.find((p) => s(p.id) === s(user?.planId)),
    [planes, user?.planId]
  )

  const [modal, setModal] = useState(null) // "confirmar" | "selector" | "cancelar"
  const [nuevoPlanId, setNuevoPlanId] = useState("")

  //mostrar solo planes distintos al actual
  const opcionesCambio = useMemo(() => {
    if (!user) return []
    return planes.filter((p) => s(p.id) !== s(user.planId))
  }, [planes, user])

  //preselecciona si aún no hay elección
  useEffect(() => {
    if (modal === "selector" && !nuevoPlanId) {
      setNuevoPlanId(opcionesCambio[0]?.id ? s(opcionesCambio[0].id) : "")
    }
  }, [modal, opcionesCambio, nuevoPlanId])

  const abrirCambio = () => setModal("confirmar")
  const abrirCancelacion = () => setModal("cancelar")
  const cerrarModal = () => { setModal(null); setNuevoPlanId("") }
  const confirmarCambio = () => setModal("selector")

  const guardarNuevoPlan = () => {
    if (!nuevoPlanId) {
      alert("Debes seleccionar un plan válido.")
      return
    }
    // guarda el id elegido (string)
    updateUserPlan(s(nuevoPlanId))
    alert("✅ Plan actualizado correctamente.")
    cerrarModal()
  }

  const confirmarCancelacion = () => {
    alert("Tu plan fue cancelado. Tu cuenta será dada de baja.")

    //Recuperar todas las reservas
    const allReservas = LS.get("reservas", [])
    const reservasUsuario = allReservas.filter(r => r.idUsuario === user.id)

    //Si tiene reservas, devolver cupos a las clases que corresponde (solo si la reserva estaba activa)
    if (reservasUsuario.length > 0) {
      const clases = LS.get("clases", [])
      reservasUsuario.forEach(r => {
        const i = clases.findIndex(c => c.id === r.idClase)
        if (i >= 0 && r.estado === "Activa") {
          //incrementar cupos disponibles sin superar el máximo
          const max = typeof clases[i].cupos === 'number' ? clases[i].cupos : Infinity
          clases[i].cuposDisp = Math.min((clases[i].cuposDisp || 0) + 1, max)
        }
      })
      LS.set("clases", clases)
    }

    //Eliminar todas las reservas del usuario 
    LS.set("reservas", allReservas.filter(r => r.idUsuario !== user.id))

    //Eliminar el usuario
    LS.set("users", LS.get("users", []).filter((u) => u.id !== user.id))

    //Limpiar sesión y recargar para que la UI refleje los cambios
    LS.set("session_user", null) // usa la misma clave que tu AuthContext
    window.location.reload()
  }

  return (
    <div className="plan-section">
      <h2>Información sobre tu plan actual</h2>

      <div className="plan-card">
        <table className="plan-table">
          <thead>
            <tr>
              <th>Plan</th>
              <th>Clases/Semana</th>
              <th>Precio</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{planActual?.nombre || "—"}</td>
              <td>{planActual?.max_clases ?? 0}</td>
              <td>{planActual?.precio != null ? `$${planActual.precio}` : "—"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="plan-actions">
        <button className="btn-change" onClick={abrirCambio}>Cambiar de plan</button>
        <button className="btn-cancel" onClick={abrirCancelacion}>Cancelar plan</button>
      </div>

      {/*Confirmación inicial */}
      {modal === "confirmar" && (
        <ModalConfirmacion tipo="cambiar" onConfirm={confirmarCambio} onClose={cerrarModal} />
      )}

      {/*Selector de un nuevo plan */}
      {modal === "selector" && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Selecciona un nuevo plan</h3>
            <select
              className="plan-select"
              value={nuevoPlanId}
              onChange={(e) => setNuevoPlanId(s(e.target.value))}
            >
              {opcionesCambio.length === 0 && <option value="">No hay otros planes</option>}
              {opcionesCambio.map((p) => (
                <option key={p.id} value={s(p.id)}>
                  {p.nombre} — {p.max_clases} clases/semana{p.precio ? ` — $${p.precio}` : " — —"}
                </option>
              ))}
            </select>

            <div className="modal-actions">
              <button className="btn-confirm" onClick={guardarNuevoPlan}>Confirmar cambio</button>
              <button className="btn-cancelar" onClick={cerrarModal}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/*Cancelar plan */}
      {modal === "cancelar" && (
        <ModalConfirmacion tipo="cancelar" onConfirm={confirmarCancelacion} onClose={cerrarModal} />
      )}
    </div>
  )
}
