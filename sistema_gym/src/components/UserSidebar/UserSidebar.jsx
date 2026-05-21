import "./UserSidebar.css"

export default function UserSidebar({ onSelect, active, onLogout }) {
  const opciones = [
    { id: "buscar", label: "Buscar clases" },
    { id: "misclases", label: "Mis Clases" },
    { id: "miplan", label: "Mi Plan" },
    { id: "macros", label: "Calculadora de Macros" }
  ]

  return (
    <aside className="user-sidebar">
      <div className="sidebar-header">
        <h2>FIT</h2>
        <h2>MOTION</h2>
      </div>

      <nav>
        {opciones.map(opt => (
          <button
            key={opt.id}
            className={`nav-btn ${active === opt.id ? "active" : ""}`}
            onClick={() => onSelect(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </nav>

      <button className="logout-btn" onClick={onLogout}>Cerrar Sesión</button>
    </aside>
  )
}
