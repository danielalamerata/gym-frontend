import "./AdminClases.css"
import { LS } from "../../utils/storage.js"
import { useState } from "react"
import ModalConfirmacion from "../Modals/ModalConfirmacion.jsx"

export default function AdminClases() {
  const clases = LS.get("clases", [])
  const reservas = LS.get("reservas", [])
  const [modal, setModal] = useState(null)
  const [claseSeleccionada, setClaseSeleccionada] = useState(null)

  const getOcupacion = (idClase) => {
    const total = reservas.filter(r => r.idClase === idClase && r.estado === "Activa").length
    const clase = clases.find(c => c.id === idClase)
    const porcentaje = ((total / clase.cupos) * 100).toFixed(0)
    return { total, porcentaje }
  }

  const eliminarClase = (clase) => {
    setClaseSeleccionada(clase)
    setModal("eliminar")
  }

  const confirmarEliminacion = () => {
    LS.set("clases", clases.filter(c => c.id !== claseSeleccionada.id))
    alert("Clase eliminada correctamente.")
    setModal(null)

  return (
    <div className="admin-clases-section">
      <div className="cards-container">
        {clases.map(c => {
          const { total, porcentaje } = getOcupacion(c.id)
          return (
            <div key={c.id} className="clase-card">
              <h3>{c.nombre}</h3>
              <p><strong>Instructor:</strong> {c.instructor}</p>
              <p><strong>Día:</strong> {c.dias.join(", ")}</p>
              <p><strong>Horario:</strong> {c.horario}</p>
              <p><strong>Capacidad:</strong> {c.cupos}</p>
              <p><strong>Ocupación:</strong> {total} / {c.cupos} ({porcentaje}%)</p>
              <button className="btn-detalles">Ver Detalles</button>
            </div>
          )
        })}
      </div>

      <div className="admin-actions">
        <button className="btn-add">Añadir Clase</button>
        <button className="btn-edit">Editar Clase</button>
        <button className="btn-delete" onClick={() => eliminarClase(clases[0])}>
          Eliminar Clase
        </button>
      </div>

      {modal === "eliminar" && (
        <ModalConfirmacion
          tipo="eliminar"
          onConfirm={confirmarEliminacion}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
  }
}