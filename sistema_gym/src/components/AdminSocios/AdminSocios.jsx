import "./AdminSocios.css"
import "../AdminClasesForm/AdminClasesForm.css"
import { useEffect, useState } from "react"
import { apiGet, apiPost, apiPut, apiDelete } from "../../utils/api.js"
import { useAuth } from "../../context/AuthContext.jsx"
import ModalCredenciales from "../Modals/ModalCredenciales.jsx"
import ModalElegirPlan from "../Modals/ModalElegirPlan.jsx"

const VACIO = {
  nombre: "",
  apellido: "",
  dni: "",
  email: "",
  telefono: "",
  direccion: "",
  plan_id: "",
  fecha_inicio: "",
  notas: "",
}

//Arma el cuerpo completo que exige el PUT a partir de un socio de la lista
const datosDesdeSocio = (s, estado) => ({
  nombre: s.user.nombre,
  apellido: s.user.apellido,
  dni: s.user.dni,
  email: s.user.email,
  telefono: s.user.telefono,
  direccion: s.user.direccion,
  plan_id: s.plan_id,
  estado,
  fecha_inicio: s.fecha_inicio,
  notas: s.notas,
})

export default function AdminSocios() {
  const { refresh } = useAuth()
  const [socios, setSocios] = useState([])
  const [planes, setPlanes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [msg, setMsg] = useState("")
  const [busqueda, setBusqueda] = useState("")

  // manejo de alta/edición
  const [modo, setModo] = useState(null)
  const [socioSel, setSocioSel] = useState(null)
  const [frm, setFrm] = useState(VACIO)
  const [guardando, setGuardando] = useState(false)

  // credenciales del alta, se muestran una sola vez
  const [credenciales, setCredenciales] = useState(null)

  // socio a reactivar cuyo plan está dado de baja
  const [reactivando, setReactivando] = useState(null)

  //Traduce el error de la API a un mensaje para mostrar
  const manejarError = (err) => {
    if (err.status === 401) return refresh()
    if (err.status === 403) return setMsg("No tenés permiso para gestionar socios.")
    if (err.errors) return setMsg(Object.values(err.errors)[0][0])
    //Sin status no hubo respuesta de la API (servidor caído, sin red)
    if (err.status && err.message) return setMsg(err.message)
    setMsg("No se pudo conectar con el servidor. Intenta nuevamente más tarde.")
  }

  useEffect(() => {
    Promise.all([apiGet("/socios"), apiGet("/planes")])
      .then(([resSocios, resPlanes]) => {
        setSocios(resSocios.socios)
        setPlanes(resPlanes.planes)
      })
      .catch(manejarError)
      .finally(() => setCargando(false))
  }, [])

  //Alta: solo planes activos. Edición: activos más el plan actual del socio
  const planesDisponibles = planes.filter(
    (p) => p.activo || (modo === "editar" && p.id === socioSel?.plan_id)
  )

  //Filtro en el front por nombre, apellido o DNI
  const texto = busqueda.trim().toLowerCase()
  const sociosFiltrados = texto
    ? socios.filter((s) =>
        `${s.user.nombre} ${s.user.apellido}`.toLowerCase().includes(texto) ||
        s.user.dni.includes(texto)
      )
    : socios

  const reemplazar = (socio) =>
    setSocios((prev) => prev.map((s) => (s.id === socio.id ? socio : s)))

  const abrirAlta = () => {
    setModo("alta")
    setSocioSel(null)
    setFrm(VACIO)
    setMsg("")
  }

  const abrirEdicion = (s) => {
    setModo("editar")
    setSocioSel(s)
    setFrm({
      nombre: s.user.nombre,
      apellido: s.user.apellido,
      dni: s.user.dni,
      email: s.user.email,
      telefono: s.user.telefono ?? "",
      direccion: s.user.direccion ?? "",
      plan_id: s.plan_id,
      fecha_inicio: s.fecha_inicio,
      notas: s.notas ?? "",
    })
    setMsg("")
  }

  const cerrar = () => {
    setModo(null)
    setSocioSel(null)
  }

  const guardar = async (e) => {
    e.preventDefault()
    setMsg("")
    setGuardando(true)

    //Campos opcionales vacíos se mandan como null
    const datos = {
      nombre: frm.nombre,
      apellido: frm.apellido,
      dni: frm.dni,
      email: frm.email,
      telefono: frm.telefono || null,
      direccion: frm.direccion || null,
      plan_id: Number(frm.plan_id),
      notas: frm.notas || null,
    }

    try {
      if (modo === "alta") {
        //Sin fecha, el back usa la fecha del día
        if (frm.fecha_inicio) datos.fecha_inicio = frm.fecha_inicio
        const res = await apiPost("/socios", datos)
        setSocios((prev) => [...prev, res.socio])
        setCredenciales({ socio: res.socio, password: res.password_temporal })
      } else {
        //El PUT exige el socio completo: el estado no cambia desde el formulario
        const res = await apiPut(`/socios/${socioSel.id}`, {
          ...datos,
          estado: socioSel.estado,
          fecha_inicio: frm.fecha_inicio,
        })
        reemplazar(res.socio)
      }
      cerrar()
    } catch (err) {
      manejarError(err)
    } finally {
      setGuardando(false)
    }
  }

  const darDeBaja = async (s) => {
    if (!confirm(`¿Dar de baja a ${s.user.nombre} ${s.user.apellido}? Se cerrará su sesión en la app.`)) return
    setMsg("")

    try {
      await apiDelete(`/socios/${s.id}`)
      setSocios((prev) => prev.map((x) => (x.id === s.id ? { ...x, estado: "inactivo" } : x)))
      if (socioSel?.id === s.id) cerrar()
    } catch (err) {
      manejarError(err)
    }
  }

  //Si su plan está dado de baja, primero tiene que elegir uno activo
  const reactivar = (s) => {
    if (!s.plan.activo) return setReactivando(s)
    if (!confirm(`¿Reactivar a ${s.user.nombre} ${s.user.apellido}?`)) return
    enviarReactivacion(s, s.plan_id)
  }

  const enviarReactivacion = async (s, planId) => {
    setMsg("")
    setReactivando(null)

    try {
      const res = await apiPut(`/socios/${s.id}`, { ...datosDesdeSocio(s, "activo"), plan_id: planId })
      reemplazar(res.socio)
      if (socioSel?.id === s.id) cerrar()
    } catch (err) {
      manejarError(err)
    }
  }

  return (
    <>
      <section className="admin-header-tools">
        <h2>Gestión de Socios</h2>
        <button className="btn-add" onClick={abrirAlta}>➕ Agregar Socio</button>
      </section>

      {msg && <p className="error">{msg}</p>}

      <input
        className="buscador-socios"
        type="search"
        placeholder="Buscar por nombre o DNI"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <div className="socios-section">
        {cargando ? (
          <p className="empty">Cargando socios...</p>
        ) : socios.length === 0 ? (
          <p className="empty">No hay socios registrados actualmente.</p>
        ) : sociosFiltrados.length === 0 ? (
          <p className="empty">Ningún socio coincide con la búsqueda.</p>
        ) : (
          <table className="socios-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>DNI</th>
                <th>Email</th>
                <th>Plan</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sociosFiltrados.map((s) => (
                <tr key={s.id}>
                  <td>{s.user.nombre}</td>
                  <td>{s.user.apellido}</td>
                  <td>{s.user.dni}</td>
                  <td>{s.user.email}</td>
                  <td>
                    {s.plan.nombre}
                    {!s.plan.activo && <span className="plan-inactivo">(plan inactivo)</span>}
                  </td>
                  <td>{s.estado === "activo" ? "Activo" : "Inactivo"}</td>
                  <td>
                    <button className="btn-view" onClick={() => abrirEdicion(s)}>Editar</button>{" "}
                    {s.estado === "activo" ? (
                      <button className="btn-view" onClick={() => darDeBaja(s)}>Dar de baja</button>
                    ) : (
                      <button className="btn-view" onClick={() => reactivar(s)}>Reactivar</button>
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
          <h2>{modo === "alta" ? "Agregar Socio" : "Modificar Socio"}</h2>
          <form onSubmit={guardar}>
            <div className="fila-2">
              <input
                placeholder="Nombre"
                value={frm.nombre}
                onChange={(e) => setFrm({ ...frm, nombre: e.target.value })}
                required
              />
              <input
                placeholder="Apellido"
                value={frm.apellido}
                onChange={(e) => setFrm({ ...frm, apellido: e.target.value })}
                required
              />
            </div>
            <div className="fila-2">
              <input
                placeholder="DNI"
                value={frm.dni}
                onChange={(e) => setFrm({ ...frm, dni: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={frm.email}
                onChange={(e) => setFrm({ ...frm, email: e.target.value })}
                required
              />
            </div>
            <div className="fila-2">
              <input
                placeholder="Teléfono (opcional)"
                value={frm.telefono}
                onChange={(e) => setFrm({ ...frm, telefono: e.target.value })}
              />
              <input
                placeholder="Dirección (opcional)"
                value={frm.direccion}
                onChange={(e) => setFrm({ ...frm, direccion: e.target.value })}
              />
            </div>
            <div className="fila-2">
              <select
                value={frm.plan_id}
                onChange={(e) => setFrm({ ...frm, plan_id: e.target.value })}
                required
              >
                <option value="">Elegí un plan</option>
                {planesDisponibles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} (${p.precio}){p.activo ? "" : " — inactivo"}
                  </option>
                ))}
              </select>
              <label>
                Fecha de inicio{modo === "alta" && " (vacío = hoy)"}
                <input
                  type="date"
                  value={frm.fecha_inicio}
                  onChange={(e) => setFrm({ ...frm, fecha_inicio: e.target.value })}
                  required={modo === "editar"}
                />
              </label>
            </div>
            <input
              placeholder="Notas (opcional)"
              value={frm.notas}
              onChange={(e) => setFrm({ ...frm, notas: e.target.value })}
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

      {credenciales && (
        <ModalCredenciales
          socio={credenciales.socio}
          password={credenciales.password}
          onClose={() => setCredenciales(null)}
        />
      )}

      {reactivando && (
        <ModalElegirPlan
          socio={reactivando}
          planes={planes.filter((p) => p.activo)}
          onConfirm={(planId) => enviarReactivacion(reactivando, planId)}
          onClose={() => setReactivando(null)}
        />
      )}
    </>
  )
}
