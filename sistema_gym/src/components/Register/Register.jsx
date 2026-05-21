import "./Register.css"
import SidebarLogin from "../SideBarLogin/SideBarLogin.jsx"
import { useState } from "react"
import { LS, uid, findUserByEmailOrDni } from "../../utils/storage.js"

export default function Register({ onRoute }) {
  const planes = LS.get("planes", [])
  const [msg, setMsg] = useState("")
  const [frm, setFrm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    dni: "",
    direccion: "",
    pass: "",
    planId: planes[0]?.id || ""
  })

  const validar = () => {
    if (!planes.length) return { ok: false, msg: "No hay planes cargados." }
    if (findUserByEmailOrDni(frm.dni) || findUserByEmailOrDni(frm.email))
      return { ok: false, msg: "DNI o email ya registrado." }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(frm.email))
      return { ok: false, msg: "Email inválido." }
    if (!frm.pass || frm.pass.length < 4)
      return { ok: false, msg: "La contraseña debe tener al menos 4 caracteres." }
    return { ok: true }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const v = validar()
    if (!v.ok) return setMsg(v.msg)

    const users = LS.get("users", [])
    users.push({ id: uid("u"), ...frm, rol: "user" })
    LS.set("users", users)
    alert("Usuario registrado con éxito. Inicia sesión para continuar.")
    onRoute("login")
  }

  return (
    <div className="register-page">
      <SidebarLogin />

      <div className="register-form-container">
        <div className="register-form-box">
          <h1>Registrarse</h1>

          <form onSubmit={handleSubmit}>
            <label>Nombre</label>
            <input value={frm.nombre} onChange={(e) => setFrm({ ...frm, nombre: e.target.value })} required />

            <label>Apellido</label>
            <input value={frm.apellido} onChange={(e) => setFrm({ ...frm, apellido: e.target.value })} required />

            <label>Email</label>
            <input type="email" value={frm.email} onChange={(e) => setFrm({ ...frm, email: e.target.value })} required />

            <label>DNI</label>
            <input value={frm.dni} onChange={(e) => setFrm({ ...frm, dni: e.target.value })} required />

            <label>Dirección</label>
            <input value={frm.direccion} onChange={(e) => setFrm({ ...frm, direccion: e.target.value })} />

            <label>Contraseña</label>
            <input type="password" value={frm.pass} onChange={(e) => setFrm({ ...frm, pass: e.target.value })} required />

            <label>Selecciona un plan</label>
            <select
              value={frm.planId}
              onChange={(e) => setFrm({ ...frm, planId: e.target.value })}
              required
            >
              <option value="">-- Elegir plan --</option>
              {planes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} — máx. {p.max_clases} clases/semana
                </option>
              ))}
            </select>

            <button type="submit" className="btn-register">Regístrate</button>
          </form>

          {msg && <p className="error">{msg}</p>}
          <p className="back-to-login">
            ¿Ya tienes cuenta?{" "}
            <button type="button" className="link-btn" onClick={() => onRoute("login")}>
              Inicia sesión
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
