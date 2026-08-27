import "./Register.css"
import SidebarLogin from "../SideBarLogin/SideBarLogin.jsx"
import { useState } from "react"
import { apiPost } from "../../utils/api.js"

export default function Register({ onRoute }) {
  const [msg, setMsg] = useState("")
  const [loading, setloading ] = useState(false)
  const [frm, setFrm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    dni: "",
    telefono: "",
    direccion: "",
    password: "",
    pasword_confirmation: "",

  })

const handleSubmit = async (e) => {
    e.preventDefault()
    setMsg("")
    setloading(true)

    try {
      await apiPost("/register",{
        name: `${frm.nombre} ${frm.apellido}`,
        nombre: frm.nombre,
        apellido: frm.apellido,
        email: frm.email,
        dni: frm.dni,
        telefono: frm.telefono,
        direccion: frm.direccion,
        password: frm.password,
        password_confirmation: frm.password_confirmation,
      })
      
      alert("Registro exitoso. Por favor, inicia sesión para continuar.")
      onRoute("login")
    } catch (err) {
      if (err.errors){
        const primerError = Object.values(err.errors)[0][0]
        setMsg(primerError)
      } else {
      setMsg("No se pudo conectar con el servidor. Intenta nuevamente más tarde.")
    }
    } finally {
      setloading(false)
    }
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

            <label>Telefono</label>
            <input value={frm.telefono} onChange={(e) => setFrm({ ...frm, telefono: e.target.value })} />

            <label>Dirección</label>
            <input value={frm.direccion} onChange={(e) => setFrm({ ...frm, direccion: e.target.value })} />

            <label>Contraseña</label>
            <input type="password" value={frm.password} onChange={(e) => setFrm({ ...frm, password: e.target.value })} required />

            <label>Confirmar Contraseña</label>
            <input type="password" value={frm.password_confirmation} onChange={(e) => setFrm({ ...frm, password_confirmation: e.target.value })} required />

            <button type="submit" className="btn-register" disabled={loading}>
              {loading ? "Registrando..." : "Registrarse"}
            </button>
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
