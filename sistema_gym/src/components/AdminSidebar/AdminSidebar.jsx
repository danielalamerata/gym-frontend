import "./AdminSidebar.css"

export default function AdminSidebar({ active, onSelect, onLogout }) {
  const opciones = [
    { id: "clases", label: "Clases" },
    { id: "socios", label: "Socios" },
    { id: "planes", label: "Planes" },
  ]

  return (
    <aside className="admin-sidebar">
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