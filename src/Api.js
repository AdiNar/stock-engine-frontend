import { getDefaultHeaders, setToken } from './utils'

function getJson (promise) {
  return promise.then((res) => {
    if (res.ok) {
      return res.json()
    }
    return Promise.reject(res)
  })
}

export class API {
  static async login (user, pass, cookies) {
    return getJson(window.fetch(process.env.REACT_APP_API_URL + '/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: user, password: pass })
    })).then(json => {
      setToken(json.access_token, cookies)
      return Promise.resolve()
    })
  }

  static async getQueryHistory (cookies) {
    return this.getList(cookies, 'query')
  }

  static async getAlerts (cookies) {
    return this.getList(cookies, 'query/watch')
  }

  static async call (cookies, url, body, method) {
    const values = {
      method: method,
      headers: getDefaultHeaders(cookies)
    }

    if (body) {
      values.body = JSON.stringify(body)
    }

    return window.fetch(process.env.REACT_APP_API_URL + '/api/' + url, values)
  }

  static async getList (cookies, url, body) {
    return getJson(this.get(cookies, url, body))
  }

  static async get (cookies, url, body) {
    return this.call(cookies, url, body, 'GET')
  }

  static async registerFCM (cookies, currentToken) {
    return this.call(cookies, 'register_fcm', { fcm_token: currentToken }, 'POST')
  }

  static async sendQuery (cookies, queryString) {
    return getJson(this.call(cookies, 'query',
      { query: queryString }, 'POST'))
  }

  static async watchQuery (cookies, queryId, watch) {
    return this.call(cookies, 'query/watch/' + queryId + '?watch=' + watch, {}, 'POST')
  }
}
