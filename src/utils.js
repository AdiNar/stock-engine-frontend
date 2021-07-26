export function setToken (accessToken, cookies) {
  cookies.set('access_token', accessToken, { secure: true, sameSite: 'lax' })
}

export function getToken (cookies) {
  return cookies.get('access_token')
}

export function isAuthenticated (cookies) {
  return getToken(cookies) !== undefined && getToken(cookies) != null && getToken(cookies) !== 'undefined'
}

export function getDefaultHeaders (cookies) {
  return {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + getToken(cookies)
  }
}

export default isAuthenticated
