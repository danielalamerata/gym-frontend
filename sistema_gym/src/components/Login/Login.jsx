import "./Login.css"
import SidebarLogin from "../SideBarLogin/SideBarLogin.jsx"
import { useAuth } from "../../context/AuthContext.jsx"
import { useState } from "react"

export default function Login({ onRoute }) {
  const { login } = useAuth()
  const [ident, setIdent] = useState("")
  const [pass, setPass] = useState("")
  const [msg, setMsg] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMsg("")
    setLoading(true)

    try {
      const res = await login(ident.trim(), pass)
      onRoute(res.rol === "admin" ? "admin" : "user")
    } catch (err) {
      if (err.errors) {
        const primerError = Object.values(err.errors)[0][0]
        setMsg(primerError)
      } else {
        setMsg("No se pudo conectar con el servidor. Intenta nuevamente más tarde.")
      }
    } finally {
      setLoading(false)
    }
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

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? "Ingresando..." : "Iniciar Sesión"}
            </button>
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
