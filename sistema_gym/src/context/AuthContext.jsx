import { createContext, useContext, useState, useEffect } from "react"
import { LS } from "../utils/storage.js"

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  //Cargamos usuario desde la persistencia
  const [user, setUser] = useState(LS.get("session_user", null))

  //Refresca sesión desde localStorage
  const refresh = () => setUser(LS.get("session_user", null))

  //Guarda sesión cada vez que cambia
  useEffect(() => {
    if (user) LS.set("session_user", user)
  }, [user])

const login = (ident, password) => {
  const users = LS.get("users", [])

  //Validaciones de email-dni y password
  const found = users.find((u) => {
    const sameIdent = (u.email === ident || u.mail === ident || u.dni === ident)
    const samePass  = (u.password === password || u.pass === password)
    return sameIdent && samePass
  })

  if (found) {
    LS.set("session_user", found)
    setUser(found)
    return { ok: true, rol: found.rol || "user", user: found }
  }

  return { ok: false }
}

  const logout = () => {
    LS.set("session_user", null)
    setUser(null)
  }

//ctualiza el plan del usuario 
  const updateUserPlan = (newPlanId) => {
    if (!user) return
    const users = LS.get("users", [])
    const updatedUsers = users.map((u) =>
      u.id === user.id ? { ...u, planId: newPlanId } : u
    )
    LS.set("users", updatedUsers)

    const updatedUser = { ...user, planId: newPlanId }
    LS.set("session_user", updatedUser)
    setUser(updatedUser)
  }

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