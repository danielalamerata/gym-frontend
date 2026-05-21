import "./Login.css"
import SidebarLogin from "../SideBarLogin/SideBarLogin.jsx"
import { useAuth } from "../../context/AuthContext.jsx"
import { useState } from "react"

export default function Login({ onRoute }) {
  const { login } = useAuth()
  const [ident, setIdent] = useState("")
  const [pass, setPass] = useState("")
  const [msg, setMsg] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    const res = login(ident.trim(), pass)
    if (!res.ok) return setMsg("Credenciales inválidas")
    onRoute(res.rol === "admin" ? "admin" : "user")
  }

  return (
    <div className="login-page">
      <SidebarLogin />

      <div className="login-form-container">
        <div className="login-form-box">
          <h1>BIENVENIDO</h1>

          <form onSubmit={handleSubmit}>
            <label>Email</label>
            <input
              type="text"
              value={ident}
              onChange={(e) => setIdent(e.target.value)}
              required
            />

            <label>Contraseña</label>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              required
            />

            <button type="submit" className="btn-login">Iniciar Sesión</button>
          </form>

          {msg && <p className="error">{msg}</p>}

          <p className="register-text">¿Aún no eres usuario?</p>
          <button onClick={() => onRoute("register")} className="btn-register">
            Regístrate
          </button>
        </div>
      </div>
    </div>
  )
}
