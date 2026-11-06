import "./ModalConfirmacion.css"
import "./ModalCredenciales.css"
import { useState } from "react"
import { METODOS_PAGO, formatMes, formatMonto, hoy } from "../../utils/pagos.js"

//El monto no se edita: es el precio del plan guardado en el pago
export default function ModalCobrarPago({ pago, guardando, error, errores, onConfirm, onClose }) {
  const [frm, setFrm] = useState({
    metodo_pago: "",
    monto_mora: "",
    fecha_pago: "",
    notas: pago.notas ?? "",
  })

  const enviar = (e) => {
    e.preventDefault()

    //Las notas siempre se mandan porque el formulario arranca con las que ya tenía el pago
    const datos = { metodo_pago: frm.metodo_pago, notas: frm.notas || null }
    if (frm.monto_mora !== "") datos.monto_mora = frm.monto_mora
    //Sin fecha, el back usa la fecha del día
    if (frm.fecha_pago) datos.fecha_pago = frm.fecha_pago

    onConfirm(datos)
  }

  const errorDe = (campo) =>
    errores[campo] && <span className="cobro-error">{errores[campo][0]}</span>

  return (
    <div className="modal-overlay">
      <div className="modal-card cobro-card">
        <h3>Cobrar pago</h3>

        <dl className="credenciales">
          <dt>Socio</dt>
          <dd>{pago.socio.user.nombre} {pago.socio.user.apellido}</dd>
          <dt>Mes</dt>
          <dd>{formatMes(pago.mes_abonado)}</dd>
          <dt>Plan</dt>
          <dd>{pago.plan.nombre}</dd>
          <dt>Monto</dt>
          <dd>{formatMonto(pago.monto_original)}</dd>
        </dl>

        <form className="cobro-form" onSubmit={enviar}>
          <label>
            Método de pago
            <select
              value={frm.metodo_pago}
              onChange={(e) => setFrm({ ...frm, metodo_pago: e.target.value })}
              required
            >
              <option value="">Elegí un método</option>
              {Object.entries(METODOS_PAGO).map(([valor, texto]) => (
                <option key={valor} value={valor}>{texto}</option>
              ))}
            </select>
            {errorDe("metodo_pago")}
          </label>

          <label>
            Mora (opcional)
            <input
              type="number"
              min="0"
              step="0.01"
              value={frm.monto_mora}
              onChange={(e) => setFrm({ ...frm, monto_mora: e.target.value })}
            />
            {errorDe("monto_mora")}
          </label>

          <label>
            Fecha de pago (vacío = hoy)
            <input
              type="date"
              max={hoy()}
              value={frm.fecha_pago}
              onChange={(e) => setFrm({ ...frm, fecha_pago: e.target.value })}
            />
            {errorDe("fecha_pago")}
          </label>

          <label>
            Notas (opcional)
            <input
              value={frm.notas}
              onChange={(e) => setFrm({ ...frm, notas: e.target.value })}
            />
            {errorDe("notas")}
          </label>

          {error && <p className="credenciales-aviso">{error}</p>}

          <div className="modal-actions">
            <button type="submit" className="btn-confirm" disabled={guardando}>
              {guardando ? "Cobrando..." : "Cobrar"}
            </button>
            <button type="button" className="btn-cancelar" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  )
}
