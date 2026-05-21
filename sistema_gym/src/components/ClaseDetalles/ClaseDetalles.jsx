import "./ClaseDetalles.css"
import { LS } from "../../utils/storage.js"
import { useMemo, useState } from "react"
import AdminClasesForm from "../AdminClasesForm/AdminClasesForm.jsx"

export default function ClaseDetalles({ clase, onClose }) {
  const [modoEditar, setModoEditar] = useState(false)

  //Solo reservas activas de esta clase
  const reservasActivas = useMemo(
    () => LS.get("reservas", []).filter(r => r.idClase === clase.id && r.estado === "Activa"),
    [clase.id]
  )

  const users = LS.get("users", [])

  //(usuario existente)
  const participantes = useMemo(() => {
    return reservasActivas
      .map(r => {
        const u = users.find(u => u.id === r.idUsuario)
        return u ? { ...u, _reservaId: r.id } : null
      })
      .filter(Boolean) // elimina undefined/null
  }, [reservasActivas, users])

  const eliminar = () => {
    // Hacer un bloqueo si existen reservas ACTIVAS
    if (reservasActivas.length > 0) {
      alert("No se puede eliminar: hay reservas activas.")
      return
    }

    // Extraer todas las reservas (activas/canceladas) vinculadas a esta clase
    const reservas = LS.get("reservas", [])
    LS.set("reservas", reservas.filter(r => r.idClase !== clase.id))

    //Quitar la clase
    let clases = LS.get("clases", [])
    clases = clases.filter(c => c.id !== clase.id)
    LS.set("clases", clases)

    alert("Clase eliminada ✅")
    onClose?.()
  }

  if (modoEditar) {
    return <AdminClasesForm modo="modificar" clase={clase} onClose={onClose} />
  }

  return (
    <div className="modal-overlay">
      <div className="clase-detalles">
        <h3>{clase.nombre}</h3>
        <p><strong>Instructor:</strong> {clase.instructor}</p>
        <p><strong>Días:</strong> {clase.dias.join(", ")}</p>
        <p><strong>Horario:</strong> {clase.horario}</p>
        <p><strong>Cupos:</strong> {clase.cuposDisp}/{clase.cupos}</p>

        <h4>Participantes</h4>
        {participantes.length === 0 ? (
          <p>No hay inscriptos</p>
        ) : (
          <ul>
            {participantes.map(u => (
              <li key={u._reservaId}>
                {u.nombre} {u.apellido} — {u.dni}
              </li>
            ))}
          </ul>
        )}

        <div className="actions">
          <button className="btn-close" onClick={onClose}>Cerrar</button>
          <button className="btn-edit" onClick={() => setModoEditar(true)}>Editar</button>
          <button className="btn-delete" onClick={eliminar}>Eliminar</button>
        </div>
      </div>
    </div>
  )
}
