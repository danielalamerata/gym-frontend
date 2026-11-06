import "../AdminPagos/AdminPagos.css"
import "../AdminSocios/AdminSocios.css"
import { useEffect, useState } from "react"
import { apiGet } from "../../utils/api.js"
import { descargarRecibo, formatFecha, formatMes, formatMonto } from "../../utils/pagos.js"
import { useAuth } from "../../context/AuthContext.jsx"

const ESTADOS = {
  pagado: "Pagado",
  pendiente: "Pendiente",
  vencido: "Vencido",
}

export default function MisPagos() {
  const { refresh } = useAuth()
  const [pagos, setPagos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [cargaFallida, setCargaFallida] = useState(false)
  const [msg, setMsg] = useState("")
  const [descargando, setDescargando] = useState(null)

  //Traduce el error de la API a un mensaje para mostrar
  const manejarError = (err) => {
    if (err.status === 401) return refresh()
    //Sin status no hubo respuesta de la API (servidor caído, sin red)
    if (err.status && err.message) return setMsg(err.message)
    setMsg("No se pudo conectar con el servidor. Intenta nuevamente más tarde.")
  }

  useEffect(() => {
    apiGet("/mis-pagos")
      .then((res) => setPagos(res.pagos))
      .catch((err) => {
        setCargaFallida(true)
        manejarError(err)
      })
      .finally(() => setCargando(false))
  }, [])

  const bajarRecibo = async (id) => {
    setMsg("")
    setDescargando(id)

    try {
      await descargarRecibo(`/mis-pagos/${id}/recibo`, id)
    } catch (err) {
      manejarError(err)
    } finally {
      setDescargando(null)
    }
  }

  return (
    <>
      <section className="admin-header-tools">
        <h2>Mis Pagos</h2>
      </section>

      {msg && <p className="error">{msg}</p>}

      <div className="socios-section">
        {cargando ? (
          <p className="empty">Cargando pagos...</p>
        ) : cargaFallida ? null : pagos.length === 0 ? (
          <p className="empty">Todavía no tenés pagos registrados.</p>
        ) : (
          <table className="socios-table">
            <thead>
              <tr>
                <th>Mes</th>
                <th>Plan</th>
                <th>Monto</th>
                <th>Mora</th>
                <th>Total</th>
                <th>Vencimiento</th>
                <th>Estado</th>
                <th>Fecha de pago</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((p) => {
                const estado = p.vencido ? "vencido" : p.estado

                return (
                  <tr key={p.id} className={p.vencido ? "pago-vencido" : ""}>
                    <td>{formatMes(p.mes_abonado)}</td>
                    <td>{p.plan.nombre}</td>
                    <td>{formatMonto(p.monto_original)}</td>
                    <td>{formatMonto(p.monto_mora)}</td>
                    <td>{formatMonto(p.total)}</td>
                    <td>{formatFecha(p.fecha_vencimiento)}</td>
                    <td><span className={`pago-estado ${estado}`}>{ESTADOS[estado]}</span></td>
                    <td>{formatFecha(p.fecha_pago)}</td>
                    <td>
                      {p.estado === "pagado" && (
                        <button
                          className="btn-view"
                          disabled={descargando === p.id}
                          onClick={() => bajarRecibo(p.id)}
                        >
                          {descargando === p.id ? "Descargando..." : "Descargar recibo"}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
