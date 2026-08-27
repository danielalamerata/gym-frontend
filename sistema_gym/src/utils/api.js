const BASE_URL = "http://127.0.0.1:8000/api"

export async function apiPost(endpoint, data) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(data),
  })

  const json = await res.json()

  if (!res.ok) {
    throw { status: res.status, ...json }
  }

  return json
}
