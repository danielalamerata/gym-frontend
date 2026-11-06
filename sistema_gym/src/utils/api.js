const BASE_URL = "http://127.0.0.1:8000/api"
const TOKEN_KEY = "auth_token"

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request(method, endpoint, data) {
  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  }

  const token = getToken()
  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: data !== undefined ? JSON.stringify(data) : undefined,
  })

  const json = res.status === 204 ? {} : await res.json()

  if (!res.ok) {
    throw { status: res.status, ...json }
  }

  return json
}

export const apiGet = (endpoint) => request("GET", endpoint)
export const apiPost = (endpoint, data) => request("POST", endpoint, data)
export const apiPut = (endpoint, data) => request("PUT", endpoint, data)
export const apiDelete = (endpoint) => request("DELETE", endpoint)

//Pide un archivo (blob). Si falla, la API responde JSON y se lanza igual que en request
export async function apiGetArchivo(endpoint) {
  const headers = { "Accept": "application/json" }

  const token = getToken()
  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${endpoint}`, { headers })

  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    throw { status: res.status, ...json }
  }

  //Solo se puede leer si el back expone el header por CORS; si no, nombre queda en null
  const disposition = res.headers.get("Content-Disposition") ?? ""
  const nombre = disposition.match(/filename="?([^";]+)"?/)?.[1] ?? null

  return { blob: await res.blob(), nombre }
}
