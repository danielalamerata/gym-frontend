import { useState } from "react"
import { alimentos } from "../../data/foodData.js"
import "./CalculadoraMacros.css"

export default function CalculadoraMacros() {
  const [nombre, setNombre] = useState("")
  const [cantidad, setCantidad] = useState("")
  const [comida, setComida] = useState([])
  const [totales, setTotales] = useState({
    proteinas: 0,
    carbos: 0,
    grasas: 0,
    calorias: 0
  })

  const agregar = () => {
    if (!nombre || !cantidad) return alert("Completá alimento y cantidad")

    const item = alimentos[nombre]
    if (!item) return alert("Alimento no encontrado")

    const factor = cantidad / 100
    const nuevosTotales = {
      proteinas: totales.proteinas + item.proteinas * factor,
      carbos: totales.carbos + item.carbohidratos * factor,
      grasas: totales.grasas + item.grasas * factor,
      calorias: totales.calorias + item.calorias * factor
    }

    setComida([...comida, { nombre, cantidad }])
    setTotales(nuevosTotales)
    setCantidad("")
  }

  const reset = () => {
    setComida([])
    setTotales({ proteinas: 0, carbos: 0, grasas: 0, calorias: 0 })
  }

  return (
    <div className="macro-card">
      <h2>Calculadora de Macronutrientes</h2>

      <div className="inputs">
        <select value={nombre} onChange={e => setNombre(e.target.value)}>
          <option value="">Seleccionar alimento</option>
          {Object.keys(alimentos).map(key => (
            <option key={key} value={key}>{key}</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Cantidad (g)"
          value={cantidad}
          onChange={e => setCantidad(e.target.value)}
        />

        <button onClick={agregar}>Agregar</button>
        <button onClick={reset} className="btn-reset">Reset</button>
      </div>

      {comida.length > 0 && (
        <table>
          <thead>
            <tr><th>Alimento</th><th>Cantidad</th></tr>
          </thead>
          <tbody>
            {comida.map((c, i) => (
              <tr key={i}>
                <td>{c.nombre}</td>
                <td>{c.cantidad} g</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="totales">
        <h3>Totales</h3>
        <p>🍗 Proteínas: {totales.proteinas.toFixed(1)} g</p>
        <p>🥔 Carbohidratos: {totales.carbos.toFixed(1)} g</p>
        <p>🥑 Grasas: {totales.grasas.toFixed(1)} g</p>
        <p>🔥 Calorías: {totales.calorias.toFixed(0)} kcal</p>
      </div>
    </div>
  )
}
