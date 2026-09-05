import { getAccessToken } from './auth.ts'

const apiBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? ''

export function apiUrl(path: string) {
  return `${apiBaseUrl}${path}`
}

export async function apiFetch(path: string, options?: RequestInit) {
  const headers = new Headers(options?.headers)
  const accessToken = getAccessToken()

  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)

  return fetch(apiUrl(path), { ...options, headers })
}
