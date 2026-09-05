const apiBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? ''

export function apiUrl(path: string) {
  return `${apiBaseUrl}${path}`
}

console.info('[PianoLog API] Configuration', {
  apiBaseUrl: apiBaseUrl || 'same-origin (Vite development proxy)',
  mode: import.meta.env.MODE,
})

export async function apiFetch(path: string, options?: RequestInit) {
  const url = apiUrl(path)
  const method = options?.method ?? 'GET'

  console.info('[PianoLog API] Request started', { method, url })

  try {
    const response = await fetch(url, options)
    console.info('[PianoLog API] Response received', {
      method,
      url,
      status: response.status,
      ok: response.ok,
    })
    return response
  } catch (error) {
    console.error('[PianoLog API] Request failed', {
      method,
      url,
      error: error instanceof Error ? error.message : error,
    })
    throw error
  }
}
