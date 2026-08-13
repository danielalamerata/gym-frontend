# FitMotion — Frontend

Interfaz de FitMotion desarrollada en React. Consume la API del backend en Laravel y muestra una experiencia distinta según si el usuario es administrador o socio.

## Stack

- **React 19 + Vite** — UI y servidor de desarrollo
- **React Router 6** — navegación
- **CSS Modules** — estilos por componente

## Cómo levantar el proyecto

```bash
git clone https://github.com/danielalamerata/gym-frontend.git
cd gym-frontend

npm install
```

Crear el archivo `.env`:

```env
VITE_API_URL=http://localhost:8000/api
```

```bash
npm run dev
```

Corre en `http://localhost:5173`. El backend tiene que estar levantado en paralelo.

## Qué hace cada rol

**Administrador**
- Dashboard con resumen del día y clima
- Gestión de socios — alta, baja y edición
- Definición de planes por frecuencia semanal
- Registro de pagos mensuales y descarga de recibos PDF
- Asignación de rutinas personalizadas por socio

**Socio**
- Dashboard con la rutina del día, estado de pago y clima
- Vista completa de su rutina asignada
- Historial de pagos
- Registro de progreso — peso, medidas y rendimiento
- Calculadora de macros con historial

## Estructura

```
src/
├── components/       — vistas organizadas por módulo
├── context/
│   └── AuthContext.jsx  — manejo global del token y rol
├── services/         — todas las llamadas a la API en un solo lugar
└── utils/            — helpers compartidos
```

## Algunas decisiones que tomé

**Context API en vez de Redux** — el estado global que necesito es básicamente el token y el rol del usuario. Redux sería demasiado para eso.

**Capa de servicios** — todas las llamadas a la API están en `services/` separadas de los componentes. Si cambia un endpoint, lo toco en un solo lugar.

**Responsive** — el admin probablemente usa la app desde la computadora del gimnasio, pero el socio la usa desde el celular. Diseñé pensando en los dos casos.

## Scripts

```bash
npm run dev      # desarrollo con hot reload
npm run build    # build para producción
npm run preview  # preview del build
```

---

Desarrollado por Daniela Lamerata· [Ver backend](https://github.com/danielalamerata/gym-backend)