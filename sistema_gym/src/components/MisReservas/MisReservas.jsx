import "./MisReservas.css"
import { useAuth } from "../../context/AuthContext.jsx"
import { LS, getClase, getUserReservasActivas } from "../../utils/storage.js"

export default function MisReservas() {
  const { user, refresh } = useAuth()
  const reservas = getUserReservasActivas(user.id)

  const cancelar = (id) => {
    const all = LS.get("reservas", [])
    const r = all.find(x => x.id === id)
    if (!r) return
    r.estado = "Cancelada"
    LS.set("reservas", all)

    // liberar cupo
    const clases = LS.get("clases", [])
    const i = clases.findIndex(c => c.id === r.idClase)
    if (i >= 0) clases[i].cuposDisp += 1
    LS.set("clases", clases)

    refresh()
  }

  return (
    <div className="reservas-card">
      <h2>Mis reservas</h2>
      {reservas.length === 0 ? (
        <p>No tenés reservas activas</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Clase</th><th>Días</th><th>Horario</th><th>Estado</th><th></th>
            </tr>
          </thead>
          <tbody>
            {reservas.map(r => {
              const c = getClase(r.idClase)
              return (
                <tr key={r.id}>
                  <td>{c?.nombre}</td>
                  <td>{c?.dias.join(", ")}</td>
                  <td>{c?.horario}</td>
                  <td>{r.estado}</td>
                  <td><button className="btn-cancelar" onClick={() => cancelar(r.id)}>Cancelar</button></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
