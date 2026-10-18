import "../AdminSocios/AdminSocios.css"
import "../AdminClasesForm/AdminClasesForm.css"
import { useEffect, useState } from "react"
import { apiGet, apiPost, apiPut, apiDelete } from "../../utils/api.js"
import { useAuth } from "../../context/AuthContext.jsx"

const VACIO = { nombre: "", frecuencia_semanal: "", precio: "" }

export default function AdminPlanes() {
  const { refresh } = useAuth()
  const [planes, setPlanes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [msg, setMsg] = useState("")

  // manejo de alta/edición
  const [modo, setModo] = useState(null)
  const [planSel, setPlanSel] = useState(null)
  const [frm, setFrm] = useState(VACIO)
  const [guardando, setGuardando] = useState(false)

  //Traduce el error de la API a un mensaje para mostrar
  const manejarError = (err) => {
    if (err.status === 401) return refresh()
    if (err.status === 403) return setMsg("No tenés permiso para gestionar planes.")
    if (err.errors) return setMsg(Object.values(err.errors)[0][0])
    //Sin status no hubo respuesta de la API (servidor caído, sin red)
    if (err.status && err.message) return setMsg(err.message)
    setMsg("No se pudo conectar con el servidor. Intenta nuevamente más tarde.")
  }

  useEffect(() => {
    apiGet("/planes")
      .then((res) => setPlanes(res.planes))
      .catch(manejarError)
      .finally(() => setCargando(false))
  }, [])

  const abrirAlta = () => {
    setModo("alta")
    setPlanSel(null)
    setFrm(VACIO)
    setMsg("")
  }

  const abrirEdicion = (plan) => {
    setModo("editar")
    setPlanSel(plan)
    setFrm({
      nombre: plan.nombre,
      frecuencia_semanal: plan.frecuencia_semanal ?? "",
      precio: plan.precio,
    })
    setMsg("")
  }

  const cerrar = () => {
    setModo(null)
    setPlanSel(null)
  }

  const guardar = async (e) => {
    e.preventDefault()
    setMsg("")
    setGuardando(true)

    //frecuencia vacía = pase libre
    const datos = {
      nombre: frm.nombre,
      frecuencia_semanal: frm.frecuencia_semanal === "" ? null : Number(frm.frecuencia_semanal),
      precio: frm.precio,
    }

    try {
      if (modo === "alta") {
        const res = await apiPost("/planes", datos)
        setPlanes((prev) => [...prev, res.plan])
      } else {
        const res = await apiPut(`/planes/${planSel.id}`, datos)
        setPlanes((prev) => prev.map((p) => (p.id === res.plan.id ? res.plan : p)))
      }
      cerrar()
    } catch (err) {
      manejarError(err)
    } finally {
      setGuardando(false)
    }
  }

  const darDeBaja = async (plan) => {
    if (!confirm(`¿Dar de baja el plan "${plan.nombre}"? Dejará de estar disponible para los socios.`)) return
    setMsg("")

    try {
      await apiDelete(`/planes/${plan.id}`)
      setPlanes((prev) => prev.map((p) => (p.id === plan.id ? { ...p, activo: false } : p)))
      if (planSel?.id === plan.id) cerrar()
    } catch (err) {
      manejarError(err)
    }
  }

  const reactivar = async (plan) => {
    if (!confirm(`¿Reactivar el plan "${plan.nombre}"? Volverá a estar disponible para los socios.`)) return
    setMsg("")

    try {
      const res = await apiPut(`/planes/${plan.id}`, {
        nombre: plan.nombre,
        frecuencia_semanal: plan.frecuencia_semanal,
        precio: plan.precio,
        activo: true,
      })
      setPlanes((prev) => prev.map((p) => (p.id === res.plan.id ? res.plan : p)))
    } catch (err) {
      manejarError(err)
    }
  }

  return (
    <>
      <section className="admin-header-tools">
        <h2>Gestión de Planes</h2>
        <button className="btn-add" onClick={abrirAlta}>➕ Agregar Plan</button>
      </section>

      {msg && <p className="error">{msg}</p>}

      <div className="socios-section">
        {cargando ? (
          <p className="empty">Cargando planes...</p>
        ) : planes.length === 0 ? (
          <p className="empty">No hay planes cargados</p>
        ) : (
          <table className="socios-table">
            <thead>
              <tr>
                <th>Plan</th>
                <th>Frecuencia semanal</th>
                <th>Precio</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {planes.map((p) => (
                <tr key={p.id}>
                  <td>{p.nombre}</td>
                  <td>{p.frecuencia_semanal ?? "Pase libre"}</td>
                  <td>${p.precio}</td>
                  <td>{p.activo ? "Activo" : "Inactivo"}</td>
                  <td>
                    {p.activo ? (
                      <>
                        <button className="btn-view" onClick={() => abrirEdicion(p)}>Editar</button>{" "}
                        <button className="btn-view" onClick={() => darDeBaja(p)}>Dar de baja</button>
                      </>
                    ) : (
                      <button className="btn-view" onClick={() => reactivar(p)}>Reactivar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modo && (
        <div className="admin-form">
          <h2>{modo === "alta" ? "Crear Plan" : "Modificar Plan"}</h2>
          <form onSubmit={guardar}>
            <input
              placeholder="Nombre del plan"
              value={frm.nombre}
              onChange={(e) => setFrm({ ...frm, nombre: e.target.value })}
              required
            />
            <input
              type="number"
              min="1"
              placeholder="Clases por semana (vacío = pase libre)"
              value={frm.frecuencia_semanal}
              onChange={(e) => setFrm({ ...frm, frecuencia_semanal: e.target.value })}
            />
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Precio"
              value={frm.precio}
              onChange={(e) => setFrm({ ...frm, precio: e.target.value })}
              required
            />

            <div className="acciones">
              <button type="submit" className="btn-primario" disabled={guardando}>
                {guardando ? "Guardando..." : modo === "alta" ? "Crear" : "Guardar cambios"}
              </button>
              <button type="button" className="btn-secundario" onClick={cerrar}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
