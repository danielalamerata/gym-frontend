import "./UserDashboard.css"
import { useState } from "react"
import UserSidebar from "../UserSidebar/UserSidebar.jsx"
import BuscarClases from "../BuscarClases/BuscarClases.jsx"
import MisReservas from "../MisReservas/MisReservas.jsx"
import MiPlan from "../Miplan/MiPlan.jsx"
import CalculadoraMacros from "../CalculadoraMacros/CalculadoraMacros.jsx"
import { useAuth } from "../../context/AuthContext.jsx"

export default function UserDashboard() {
  const { user, logout } = useAuth()
  const [seccion, setSeccion] = useState("buscar")

  const fechaActual = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long"
  })

  return (
    <div className="dashboard-container">
      <UserSidebar onSelect={setSeccion} active={seccion} onLogout={logout} />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Bienvenido, {user.nombre}</h1>
          <p>{fechaActual}</p>
        </header>

        {seccion === "buscar" && <BuscarClases />}
        {seccion === "misclases" && <MisReservas />}
        {seccion === "miplan" && <MiPlan />}
        {seccion === "macros" && <CalculadoraMacros />}
      </main>
    </div>
  )
}
