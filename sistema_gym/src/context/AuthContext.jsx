import { createContext, useContext, useState, useEffect } from "react"
import { apiGet, apiPost, getToken, setToken } from "../utils/api.js"

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  //Mientras se valida el token guardado no se muestra la app
  const [checking, setChecking] = useState(!!getToken())

  //Refresca sesión desde la API
  const refresh = async () => {
    try {
      const res = await apiGet("/me")
      setUser(res.user)
    } catch (err) {
      //Token vencido o revocado
      if (err.status === 401) {
        setToken(null)
        setUser(null)
      }
    }
  }

  useEffect(() => {
    if (getToken()) refresh().finally(() => setChecking(false))
  }, [])

  //Acepta email o DNI. Si falla, lanza el error de la API
  const login = async (ident, password) => {
    const res = await apiPost("/login", { login: ident, password })
    setToken(res.token)
    setUser(res.user)
    return { ok: true, rol: res.user.rol, user: res.user }
  }

  const logout = async () => {
    try {
      await apiPost("/logout")
    } catch {
      //Si el token ya no era válido igual se cierra la sesión local
    }
    setToken(null)
    setUser(null)
  }

  //Actualiza el plan del usuario (solo en memoria hasta migrar Planes)
  const updateUserPlan = (newPlanId) => {
    if (!user) return
    setUser({ ...user, planId: newPlanId })
  }

  if (checking) return null

  return (
    <AuthCtx.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        refresh,
        updateUserPlan,
      }}
    >
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)
