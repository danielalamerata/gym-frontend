import "./AdminSocios.css"
import { LS } from "../../utils/storage.js"

export default function AdminSocios() {
  const socios = LS.get("users", []).filter(u => u.rol === "user")

  return (
    <div className="socios-section">
      <h2>Lista de participantes</h2>

      {socios.length === 0 ? (
        <p className="empty">No hay socios registrados actualmente.</p>
      ) : (
        <table className="socios-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>DNI</th>
              <th>Email</th>
              <th>Dirección</th>
            </tr>
          </thead>
          <tbody>
            {socios.map((s) => (
              <tr key={s.id}>
                <td>{s.nombre}</td>
                <td>{s.apellido}</td>
                <td>{s.dni}</td>
                <td>{s.email}</td>
                <td>{s.direccion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}