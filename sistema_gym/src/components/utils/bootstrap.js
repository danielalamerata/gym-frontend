import { LS } from "./storage.js"
//Configuración de localStorage y datos semilla.
export function bootstrap() {
  //si ya inicializamos antes, no hacer nada
  if (LS.get("__seeded__", false)) return

  //Planes de prueba
  const planes = [
    { id: "plan_basic", nombre: "Básico", max_clases: 2 },
    { id: "plan_plus", nombre: "Plus", max_clases: 3 },
    { id: "plan_premium", nombre: "Premium", max_clases: 4 }
  ]

  //Usuario administrador por defecto
  const admin = {
    id: "admin_1",
    dni: "99999999",
    nombre: "Admin",
    apellido: "System",
    direccion: "",
    email: "admin@gym.local",
    pass: "admin123",
    rol: "admin",
    planId: null
  }

  //Clases de ejemplo
  const clases = [
    { id: "cl_1", nombre: "Funcional", instructor: "Mica", dias: ["Lun","Mie"], horario: "18:00", cupos: 12, cuposDisp: 12 },
    { id: "cl_2", nombre: "HIIT", instructor: "Leo", dias: ["Mar","Jue"], horario: "19:00", cupos: 10, cuposDisp: 10 },
    { id: "cl_3", nombre: "Yoga", instructor: "Ana", dias: ["Sab"], horario: "10:00", cupos: 15, cuposDisp: 15 }
  ] 

  //Guardamos en localStorage
  LS.set("planes", planes)
  LS.set("users", [admin])
  LS.set("clases", clases)
  LS.set("reservas", [])
  LS.set("__seeded__", true)
}
