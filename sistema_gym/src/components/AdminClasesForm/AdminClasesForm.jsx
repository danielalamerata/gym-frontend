import "./AdminClasesForm.css"
import { useState } from "react"
import { LS, uid } from "../../utils/storage.js"

export default function AdminClasesForm({ modo, clase, onClose }) {
  const [frm, setFrm] = useState(
    clase || { nombre: "", instructor: "", dias: [], horario: "", cupos: 10, cuposDisp: 10 }
  )

  const toggleDia = (d) => {
    setFrm(s => s.dias.includes(d) ? { ...s, dias: s.dias.filter(x => x !== d) } : { ...s, dias: [...s.dias, d] })
  }

  const guardar = (e) => {
    e.preventDefault()
    const clases = LS.get("clases", [])
    if (modo === "alta") {
      clases.push({ ...frm, id: uid("cl") })
    } else {
      const i = clases.findIndex(c => c.id === clase.id)
      if (i >= 0) clases[i] = { ...clase, ...frm }
    }
    LS.set("clases", clases)
    alert(modo === "alta" ? "Clase creada" : "Clase actualizada")
    onClose()
  }

  return (
    <div className="admin-form">
      <h2 className = "admin-formh2">{modo === "alta" ? "Crear Clase" : "Modificar Clase"}</h2>
      <form onSubmit={guardar}>
        <input placeholder="Nombre de la clase" value={frm.nombre} onChange={e => setFrm({ ...frm, nombre: e.target.value })} />
        <input placeholder="Instructor" value={frm.instructor} onChange={e => setFrm({ ...frm, instructor: e.target.value })} />
        <input placeholder="Horario" value={frm.horario} onChange={e => setFrm({ ...frm, horario: e.target.value })} />
        <input type="number" placeholder="Cupos" value={frm.cupos} onChange={e => setFrm({ ...frm, cupos: Number(e.target.value) })} />

        <div className="dias">
          {["Lun","Mar","Mie","Jue","Vie","Sab","Dom"].map(d => (
            <label key={d}>
              <input type="checkbox" checked={frm.dias.includes(d)} onChange={() => toggleDia(d)} /> {d}
            </label>
          ))}
        </div>

        <button type="submit">{modo === "alta" ? "Crear" : "Guardar cambios"}</button>
        <button type="button" onClick={onClose}>Cancelar</button>
      </form>
    </div>
  )
}