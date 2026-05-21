import "./SidebarLogin.css"
import imagenGym from '../../assets/mujer-fitness.jpg'

export default function SidebarLogin() {
  return (
    <aside className="sidebar-login">
      <div className="brand">
        <h1>FIT</h1>
        <h1>MOTION</h1>
      </div>
      <img src={imagenGym} alt="Gimnasio" className="login-img" />
    </aside>
  )
}
