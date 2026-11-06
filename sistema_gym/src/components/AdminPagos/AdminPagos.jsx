import "./AdminPagos.css"
import "../AdminSocios/AdminSocios.css"
import { useEffect, useState } from "react"
import { apiGet, apiPost } from "../../utils/api.js"
import { METODOS_PAGO, descargarRecibo, formatFecha, formatMes, formatMonto } from "../../utils/pagos.js"
import { useAuth } from "../../context/AuthContext.jsx"
import ModalCobrarPago from "../Modals/ModalCobrarPago.jsx"

export default function AdminPagos() {
  const { refresh } = useAuth()
  const [vista, setVista] = useState("pendientes")
  const [mes, setMes] = useState("")
  const [busqueda, setBusqueda] = useState("")

  const [pagos, setPagos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [cargaFallida, setCargaFallida] = useState(false)
  const [recarga, setRecarga] = useState(0)
  const [msg, setMsg] = useState("")

  // cobro
  const [pagoSel, setPagoSel] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [errorCobro, setErrorCobro] = useState("")
  const [erroresCobro, setErroresCobro] = useState({})
  const [cobrado, setCobrado] = useState(null)

  const [descargando, setDescargando] = useState(null)

  //Traduce el error de la API a un mensaje para mostrar
  const mensajeDeError = (err) => {
    if (err.status === 403) return "No tenés permiso para gestionar pagos."
    if (err.errors) return Object.values(err.errors)[0][0]
    //Sin status no hubo respuesta de la API (servidor caído, sin red)
    if (err.status && err.message) return err.message
    return "No se pudo conectar con el servidor. Intenta nuevamente más tarde."
  }

  const manejarError = (err) => {
    if (err.status === 401) return refresh()
    setMsg(mensajeDeError(err))
  }

  useEffect(() => {
    //Si cambia la vista o el mes antes de que responda, se ignora la respuesta vieja
    let vigente = true
    setCargando(true)
    setCargaFallida(false)

    const endpoint = vista === "pendientes"
      ? "/pagos/pendientes"
      : `/pagos?estado=pagado${mes ? `&mes=${mes}` : ""}`

    apiGet(endpoint)
      .then((res) => {
        if (vigente) setPagos(res.pagos)
      })
      .catch((err) => {
        if (!vigente) return
        setCargaFallida(true)
        manejarError(err)
      })
      .finally(() => {
        if (vigente) setCargando(false)
      })

    return () => { vigente = false }
  }, [vista, mes, recarga])

  const cambiarVista = (nueva) => {
    if (nueva === vista) return
    setVista(nueva)
    setMsg("")
    setCobrado(null)
  }

  //Filtro en el front por nombre, apellido o DNI
  const texto = busqueda.trim().toLowerCase()
  const pagosFiltrados = texto
    ? pagos.filter((p) =>
        `${p.socio.user.nombre} ${p.socio.user.apellido}`.toLowerCase().includes(texto) ||
        p.socio.user.dni.includes(texto)
      )
    : pagos

  const abrirCobro = (p) => {
    setPagoSel(p)
    setErrorCobro("")
    setErroresCobro({})
    setMsg("")
    setCobrado(null)
  }

  const cobrar = async (datos) => {
    setGuardando(true)
    setErrorCobro("")
    setErroresCobro({})

    try {
      const res = await apiPost(`/pagos/${pagoSel.id}/cobrar`, datos)
      setPagos((prev) => prev.filter((p) => p.id !== res.pago.id))
      setCobrado(res.pago)
      setPagoSel(null)
    } catch (err) {
      if (err.status === 401) return refresh()
      if (err.status === 409) {
        //Otro admin se adelantó: se recarga la lista para que el pago desaparezca
        setPagoSel(null)
        setMsg(err.message)
        setRecarga((n) => n + 1)
      } else if (err.status === 422 && err.errors) {
        setErroresCobro(err.errors)
      } else {
        setErrorCobro(mensajeDeError(err))
      }
    } finally {
      setGuardando(false)
    }
  }

  const bajarRecibo = async (id) => {
    setMsg("")
    setDescargando(id)

    try {
      await descargarRecibo(`/pagos/${id}/recibo`, id)
    } catch (err) {
      manejarError(err)
    } finally {
      setDescargando(null)
    }
  }

  const botonRecibo = (id) => (
    <button className="btn-view" disabled={descargando === id} onClick={() => bajarRecibo(id)}>
      {descargando === id ? "Descargando..." : "Descargar recibo"}
    </button>
  )

  const celdasSocio = (p) => (
    <>
      <td>
        {p.socio.user.nombre} {p.socio.user.apellido}
        {p.socio.estado !== "activo" && <span className="plan-inactivo">(dado de baja)</span>}
      </td>
      <td>{p.socio.user.dni}</td>
      <td>{formatMes(p.mes_abonado)}</td>
      <td>{p.plan.nombre}</td>
    </>
  )

  return (
    <>
      <section className="admin-header-tools">
        <h2>Gestión de Pagos</h2>
      </section>

      <div className="pagos-vistas">
        <button
          className={`pagos-vista ${vista === "pendientes" ? "activa" : ""}`}
          onClick={() => cambiarVista("pendientes")}
        >
          Pendientes
        </button>
        <button
          className={`pagos-vista ${vista === "cobrados" ? "activa" : ""}`}
          onClick={() => cambiarVista("cobrados")}
        >
          Cobrados
        </button>
      </div>

      {msg && <p className="error">{msg}</p>}

      {cobrado && (
        <div className="pago-cobrado">
          <span>
            Pago cobrado: {cobrado.socio.user.nombre} {cobrado.socio.user.apellido},{" "}
            {formatMes(cobrado.mes_abonado)}, total {formatMonto(cobrado.total)}.
          </span>
          {botonRecibo(cobrado.id)}
          <button className="pago-cobrado-cerrar" aria-label="Cerrar" onClick={() => setCobrado(null)}>✕</button>
        </div>
      )}

      <div className="pagos-filtros">
        <input
          className="buscador-socios"
          type="search"
          placeholder="Buscar por nombre o DNI"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        {vista === "cobrados" && (
          <label className="pagos-filtro-mes">
            Mes
            <input
              type="month"
              placeholder="AAAA-MM"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
            />
          </label>
        )}
      </div>

      <div className="socios-section">
        {cargando ? (
          <p className="empty">Cargando pagos...</p>
        ) : cargaFallida ? null : pagos.length === 0 ? (
          <p className="empty">
            {vista === "pendientes"
              ? "No hay pagos pendientes."
              : mes ? "No hay pagos cobrados en ese mes." : "Todavía no hay pagos cobrados."}
          </p>
        ) : pagosFiltrados.length === 0 ? (
          <p className="empty">Ningún pago coincide con la búsqueda.</p>
        ) : vista === "pendientes" ? (
          <table className="socios-table">
            <thead>
              <tr>
                <th>Socio</th>
                <th>DNI</th>
                <th>Mes</th>
                <th>Plan</th>
                <th>Monto</th>
                <th>Vencimiento</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pagosFiltrados.map((p) => (
                <tr key={p.id} className={p.vencido ? "pago-vencido" : ""}>
                  {celdasSocio(p)}
                  <td>{formatMonto(p.total)}</td>
                  <td>{formatFecha(p.fecha_vencimiento)}</td>
                  <td>
                    <span className={`pago-estado ${p.vencido ? "vencido" : "pendiente"}`}>
                      {p.vencido ? "Vencido" : "Pendiente"}
                    </span>
                  </td>
                  <td>
                    <button className="btn-view" onClick={() => abrirCobro(p)}>Cobrar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="socios-table">
            <thead>
              <tr>
                <th>Socio</th>
                <th>DNI</th>
                <th>Mes</th>
                <th>Plan</th>
                <th>Monto</th>
                <th>Mora</th>
                <th>Total</th>
                <th>Fecha de pago</th>
                <th>Método</th>
                <th>Notas</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pagosFiltrados.map((p) => (
                <tr key={p.id}>
                  {celdasSocio(p)}
                  <td>{formatMonto(p.monto_original)}</td>
                  <td>{formatMonto(p.monto_mora)}</td>
                  <td>{formatMonto(p.total)}</td>
                  <td>{formatFecha(p.fecha_pago)}</td>
                  <td>{METODOS_PAGO[p.metodo_pago] ?? p.metodo_pago}</td>
                  <td>{p.notas}</td>
                  <td>{botonRecibo(p.id)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagoSel && (
        <ModalCobrarPago
          pago={pagoSel}
          guardando={guardando}
          error={errorCobro}
          errores={erroresCobro}
          onConfirm={cobrar}
          onClose={() => setPagoSel(null)}
        />
      )}
    </>
  )
}
