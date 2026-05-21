import "./BuscarClases.css"
import { useMemo, useState } from "react"
import { useAuth } from "../../context/AuthContext.jsx"
import { LS, getPlan, uid } from "../../utils/storage.js"

export default function BuscarClases() {
  const { user } = useAuth()

  // Info del plan (usado para mostrar límites en UI)
  const plan = getPlan(user?.planId)

  // Para refrescar la vista luego de reservar/cancelar
  const [refreshKey, setRefreshKey] = useState(0)

  
  const [filtros, setFiltros] = useState({ dia: "", horario: "", tipo: "" })

  // Se leen las clases/horarios desde storage cada render (dependen de refreshKey)
  const clasesAll = useMemo(() => LS.get("clases", []), [refreshKey])

  // Opciones dinámicas de horario según clases cargadas
  const horariosOpts = useMemo(
    () => Array.from(new Set(clasesAll.map((c) => c.horario))).sort(),
    [clasesAll]
  )

  // Resultado filtrado
  const matches = useMemo(() => {
    let arr = [...clasesAll]
    if (filtros.dia) arr = arr.filter((c) => c.dias.includes(filtros.dia))
    if (filtros.horario) arr = arr.filter((c) => c.horario === filtros.horario)
    if (filtros.tipo)
      arr = arr.filter((c) =>
        c.nombre.toLowerCase().includes(filtros.tipo.toLowerCase())
      )
    return arr
  }, [filtros, clasesAll])

  const reservar = (clase) => {
    if (!user) return alert("Debes iniciar sesión.")

    //evitar doble inscripción
    const reservas = LS.get("reservas", [])
    const yaInscripto = reservas.some(
      (r) =>
        r.idUsuario === user.id &&
        r.idClase === clase.id &&
        r.estado === "Activa"
    )
    if (yaInscripto) {
      return alert("Ya estás inscripto en esta clase.")
    }

    //validar cupos
    if (clase.cuposDisp <= 0) return alert("Clase llena.")

    //validar límite del plan
    const planUser = getPlan(user.planId)
    const activasDelUsuario = reservas.filter(
      (r) => r.idUsuario === user.id && r.estado === "Activa"
    ).length
    if (planUser && activasDelUsuario >= planUser.max_clases) {
      return alert("Límite de clases alcanzado para tu plan.")
    }

    //crear reserva
    const nueva = {
      id: uid("res"),
      idUsuario: user.id,
      idClase: clase.id,
      estado: "Activa",
      fecha: new Date().toISOString(),
    }
    LS.set("reservas", [...reservas, nueva])

    //descontar cupo de la clase en storage
    const clases = LS.get("clases", [])
    const actualizadas = clases.map((c) =>
      c.id === clase.id ? { ...c, cuposDisp: Math.max(0, c.cuposDisp - 1) } : c
    )
    LS.set("clases", actualizadas)

    alert("Reserva confirmada ✅")
    // refresco de la UI
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="buscar-card">
      <h2>Buscar clases</h2>

      <div className="filtros">
        <select
          value={filtros.dia}
          onChange={(e) => setFiltros({ ...filtros, dia: e.target.value })}
        >
          <option value="">Día</option>
          {["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"].map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select
          value={filtros.horario}
          onChange={(e) => setFiltros({ ...filtros, horario: e.target.value })}
        >
          <option value="">Horario</option>
          {horariosOpts.map((h) => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>

        <input
          placeholder="Tipo (Yoga, HIIT…)"
          value={filtros.tipo}
          onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
        />
      </div>

      {matches.length === 0 ? (
        <p>No hay clases disponibles</p>
      ) : (
        <table className="buscar-table">
          <thead>
            <tr>
              <th>Clase</th>
              <th>Instructor</th>
              <th>Días</th>
              <th>Horario</th>
              <th>Cupos</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="card-clasesdisponibles">
            {matches.map((c) => (
              <tr key={c.id}>
                <td>{c.nombre}</td>
                <td>{c.instructor}</td>
                <td>{c.dias.join(", ")}</td>
                <td>{c.horario}</td>
                <td>
                  {c.cuposDisp}/{c.cupos}
                </td>
                <td>
                  <button onClick={() => reservar(c)}>Reservar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/*info rápida del plan */}
      {plan && (
        <p style={{ marginTop: 10, opacity: 0.8 }}>
          Tu plan: <strong>{plan.nombre}</strong> — máx.{" "}
          <strong>{plan.max_clases}</strong> clases activas.
        </p>
      )}
    </div>
  )
}
