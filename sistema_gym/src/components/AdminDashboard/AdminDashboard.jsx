import "./AdminDashboard.css"
import { useState } from "react"
import { LS } from "../../utils/storage.js"
import { useAuth } from "../../context/AuthContext.jsx"

import AdminSidebar from "../AdminSidebar/AdminSidebar.jsx"
import AdminSocios from "../AdminSocios/AdminSocios.jsx"
import AdminClasesForm from "../AdminClasesForm/AdminClasesForm.jsx"
import ClaseDetalles from "../ClaseDetalles/ClaseDetalles.jsx"

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const [seccion, setSeccion] = useState("clases")

  // manejo de alta/detalle de clases
  const [modo, setModo] = useState(null)
  const [claseSel, setClaseSel] = useState(null)
  const clases = LS.get("clases", [])

  const fechaActual = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  // handlers
  const abrirAlta = () => {
    setModo("alta")
    setClaseSel(null)
  }

  const abrirDetalles = (clase) => {
    setModo("detalles")
    setClaseSel(clase)
  }

  const cerrar = () => {
    setModo(null)
    setClaseSel(null)
  }

  return (
    <div className="admin-container">
      <AdminSidebar active={seccion} onSelect={setSeccion} onLogout={logout} />

      <main className="admin-main">
        <header className="admin-header">
          <h1>Bienvenido {user.nombre}</h1>
          <p>{fechaActual}</p>
        </header>

        {/* SECCIÓN CLASES */}
        {seccion === "clases" && (
          <>
            <section className="admin-header-tools">
              <h2>Gestión de Clases</h2>
              <button className="btn-add" onClick={abrirAlta}>➕ Agregar Clase</button>
            </section>

            <section className="admin-clases">
              {clases.length === 0 ? (
                <p className="empty">No hay clases cargadas</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Clase</th>
                      <th>Instructor</th>
                      <th>Días</th>
                      <th>Horario</th>
                      <th>Cupos</th>
                      <th>Disponibles</th>
                      <th>% Ocupación</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {clases.map(c => {
                      const reservas = LS.get("reservas", []).filter(r => r.idClase === c.id)
                      const total = reservas.filter(r => r.estado === "Activa").length
                      const porcentaje = ((total / c.cupos) * 100).toFixed(0)

                      return (
                        <tr key={c.id}>
                          <td><code>{c.id}</code></td>
                          <td>{c.nombre}</td>
                          <td>{c.instructor}</td>
                          <td>{c.dias.join(", ")}</td>
                          <td>{c.horario}</td>
                          <td>{c.cupos}</td>
                          <td>{c.cuposDisp}</td>
                          <td>
                            <span
                              className={`ocupacion ${porcentaje > 80 ? "alta" : porcentaje > 50 ? "media" : "baja"}`}
                            >
                              {porcentaje}%
                            </span>
                          </td>
                          <td>
                            <button className="btn-view" onClick={() => abrirDetalles(c)}>
                              Ver detalles
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </section>

            {modo === "alta" && <AdminClasesForm modo="alta" onClose={cerrar} />}
            {modo === "detalles" && <ClaseDetalles clase={claseSel} onClose={cerrar} />}
          </>
        )}

        {/* SECCIÓN SOCIOS */}
        {seccion === "socios" && <AdminSocios />}
      </main>
    </div>
  )
}
