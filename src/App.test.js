import { unmountComponentAtNode } from 'react-dom'
import { getToken } from './utils'
import { API } from './Api'

const assert = require('assert')
const BASE_ALERT_COUNT = 2
const BASE_QUERY_COUNT = 4

let container = null
beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  return window.fetch(process.env.REACT_APP_API_URL + '/api/cleanup', { method: 'GET' })
})

afterEach(() => {
  unmountComponentAtNode(container)
  container.remove()
  container = null
})

function logIn () {
  const cookies = new Map()

  return API.login('user', 'user', cookies)
    .then(res => {
      assert.notStrictEqual(getToken(cookies), undefined)
      return cookies
    })
}

it('Should login', () => {
  return logIn()
})

it('Should get queries', () => {
  return logIn().then(
    cookies => API.getQueryHistory(cookies)).then(
    res => assert.strictEqual(res.list.length, BASE_QUERY_COUNT)
  )
})

it('Should get alerts', () => {
  return logIn().then(
    cookies => API.getAlerts(cookies)).then(
    res => assert.strictEqual(res.list.length, BASE_ALERT_COUNT)
  )
})

it('Should make query', () => {
  const query = 'STOCK(close) as test'

  return logIn().then(
    cookies => {
      return API.sendQuery(cookies, query).then(
        () => {
          return API.getQueryHistory(cookies).then(
            res => assert.strictEqual(res.list.length, BASE_QUERY_COUNT + 1))
        }
      )
    })
})

it('Should make alert', () => {
  const query = 'STOCK(close) as test'

  return logIn().then(
    cookies => {
      return API.sendQuery(cookies, query).then(
        json => {
          return API.watchQuery(cookies, json.id, 1).then(
            _ => API.getAlerts(cookies).then(
              res => assert.strictEqual(res.list.length, BASE_ALERT_COUNT + 1)))
        }
      )
    })
})
