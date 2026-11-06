import { apiGetArchivo } from "./api.js"

export const METODOS_PAGO = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  debito: "Débito",
  credito: "Crédito",
  mercado_pago: "Mercado Pago",
}

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

//Las fechas se parten a mano: new Date("AAAA-MM-DD") las toma en UTC y en Argentina retrocede un día
export const formatMes = (fecha) => {
  const [anio, mes] = fecha.split("-")
  return `${MESES[Number(mes) - 1]} ${anio}`
}

export const formatFecha = (fecha) => {
  if (!fecha) return "—"
  const [anio, mes, dia] = fecha.split("-")
  return `${dia}/${mes}/${anio}`
}

export const formatMonto = (monto) =>
  monto === null ? "—" : Number(monto).toLocaleString("es-AR", { style: "currency", currency: "ARS" })

//Fecha de hoy en la hora local, en AAAA-MM-DD
export const hoy = () => {
  const d = new Date()
  const mes = String(d.getMonth() + 1).padStart(2, "0")
  const dia = String(d.getDate()).padStart(2, "0")
  return `${d.getFullYear()}-${mes}-${dia}`
}

//Pide el recibo y lo guarda en la compu. Si la API responde con error, lo lanza
export async function descargarRecibo(endpoint, pagoId) {
  const { blob, nombre } = await apiGetArchivo(endpoint)

  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  //Mismo formato de nombre que usa el back, por si el header no se puede leer
  link.download = nombre ?? `recibo-${String(pagoId).padStart(6, "0")}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
