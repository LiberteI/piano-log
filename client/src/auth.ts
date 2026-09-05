const accessTokenKey = 'piano-log-access-token'

export function getAccessToken() {
  return sessionStorage.getItem(accessTokenKey)
}

export function setAccessToken(accessToken: string) {
  sessionStorage.setItem(accessTokenKey, accessToken)
}

export function clearAccessToken() {
  sessionStorage.removeItem(accessTokenKey)
}
