import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Login from './components/Login/Login.jsx'
import Register from './components/Register/Register.jsx'
import UserDashboard from './components/UserDashboard/UserDashboard.jsx'
import AdminDashboard from './components/AdminDashboard/AdminDashboard.jsx'
import { bootstrap } from './utils/bootstrap.js'

bootstrap();

const PATHS = {
  login: '/login',
  register: '/register',
  user: '/app',
  admin: '/admin',
}

// Mapea los pathname y setea los estados en route
function pathToRoute(pathname, user) {
  switch (pathname) {
    case PATHS.login: return 'login'
    case PATHS.register: return 'register'
    case PATHS.admin: return user && user.rol === 'admin' ? 'admin' : 'user'
    case PATHS.user: return 'user'
    case '/': 
    default:
      // si entra a raíz, mandalo al que corresponda
      if (!user) return 'login'
      return user.rol === 'admin' ? 'admin' : 'user'
  }
}

// Mapea los estados de route los asgina a pathname
function routeToPath(route) {
  return PATHS[route] ?? PATHS.login
}

export default function App() {
  const { user } = useAuth()
  const [route, setRoute] = useState(user ? (user.rol === "admin" ? "admin" : "user") : "login")


  const location = useLocation()        
  const navigate = useNavigate()        

  //Cuando cambia la URL -> actualiza tu estado `route`
  useEffect(() => {
    const desired = pathToRoute(location.pathname, user)
    if (desired !== route) setRoute(desired)
  }, [location.pathname, user])

  //Cuando cambia `route` (o `user`) -> empuja a la URL
  useEffect(() => {
    const targetPath = routeToPath(
      user ? (route === 'admin' && user.rol !== 'admin' ? 'user' : route) : (route === 'register' ? 'register' : 'login')
    )
    if (location.pathname !== targetPath) {
      navigate(targetPath, { replace: true })
    }
  }, [route, user])

  return (
    <>
      {!user && route === "register" && <Register onRoute={setRoute} />}
      {!user && route !== "register" && <Login onRoute={setRoute} />}

      {user && user.rol === "admin" && route === "admin" && <AdminDashboard />}
      {user && user.rol !== "admin" && route !== "admin" && <UserDashboard />}
    </>
  )
}
