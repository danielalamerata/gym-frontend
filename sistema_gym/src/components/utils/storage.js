export const LS = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback }
    catch { return fallback }
  },
  set(key, val) { localStorage.setItem(key, JSON.stringify(val)) }
}
//Utilidades para el manejo de datos usuarios
export const uid = (p = "id") => p + "_" + Math.random().toString(36).slice(2, 9)

export const findUserByEmailOrDni = (ident) => {
  const users = LS.get("users", [])
  return users.find(u =>
    u.email.toLowerCase() === String(ident).toLowerCase() ||
    u.dni === String(ident)
  )
}

export const getPlan = (id) => LS.get("planes", []).find(p => p.id === id)
export const getClase = (id) => LS.get("clases", []).find(c => c.id === id)
export const getUserReservasActivas = (uid) =>
  LS.get("reservas", []).filter(r => r.idUsuario === uid && r.estado === "Activa")
