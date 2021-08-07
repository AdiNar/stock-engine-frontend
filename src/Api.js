import { getDefaultHeaders, setToken } from './utils'
import { FirebaseManager } from './firebaseManager'

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

  static async getQuery (cookies, queryId) {
    return getJson(this.get(cookies, 'query/' + queryId))
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

  static async rerunQuery (cookies, queryId) {
    return this.call(cookies, 'query/rerun/' + queryId, {}, 'POST')
  }

  static async cached (promise, field) {
    const currentValueRaw = localStorage.getItem(field) // eslint-disable-line

    if (currentValueRaw) {
      const currentValue = JSON.parse(currentValueRaw)
      if (currentValue.expireAt >= Date.now()) { return Promise.resolve(currentValue.data) }
    }

    return promise().then(output => {
      const tomorrowDate = Date.now() + 24 * 60 * 1000
      localStorage.setItem(field, JSON.stringify(  // eslint-disable-line
        { expireAt: tomorrowDate, data: output }))
      return Promise.resolve(output)
    })
  }

  static async getFirebaseList (collection, mapper) {
    return this.cached(() => FirebaseManager.firestore().collection(collection).get()
      .then((querySnapshot) => {
        const res = []
        querySnapshot.forEach((doc) => {
          res.push(mapper(doc))
        })
        return Promise.resolve(res)
      }), 'firestore_' + collection)
  }

  static async getCompaniesAutocomplete () {
    return this.getFirebaseList('companies', obj => {
      const indexes = obj.data().indexes
      const indexesFormatted = indexes ? '; ' + Object.keys(indexes).join(', ') : ''
      const branchFormatted = obj.data().branch || ''
      const description = branchFormatted + indexesFormatted
      return { label: obj.id, description: description }
    })
  }

  static async getKeywordsAutocomplete () {
    return this.getFirebaseList('keywords', obj => {
      return { label: obj.id, description: obj.data().def }
    })
  }
}
