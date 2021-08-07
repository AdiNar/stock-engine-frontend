import { unmountComponentAtNode } from 'react-dom'
import { getToken } from './utils'
import { API } from './Api'
import { Autocomplete } from './components/Queries/Autocomplete'

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

it('Should properly parse autocomplete input', () => {
  const testRegex = (query, expectedPreviousWord, expectedDivider, expectedCurrentWord) => {
    const [, previousWord, divider, currentWord] = query.match(Autocomplete.INPUT_REGEX)
    assert.strictEqual(previousWord, expectedPreviousWord, 'previous')
    assert.strictEqual(divider, expectedDivider, 'divider')
    assert.strictEqual(currentWord, expectedCurrentWord, 'current')
  }

  testRegex('select close', 'select', ' ', 'close')
  testRegex('select close as', 'close', ' ', 'as')
  testRegex('select close as sth from', 'sth', ' ', 'from')
  testRegex('select close as sth from sth', 'from', ' ', 'sth')
  testRegex('select add(', 'add', '(', '')
  testRegex('select add(close,', 'close', ',', '')
  testRegex('select add(close,op', 'close', ',', 'op')
  testRegex('select add(close,open)', 'open', ')', '')
})

it('Should properly concatenate query with autocomplete', () => {
  const testRegex = (query, label, expected) => {
    const result = Autocomplete.concatenateQueryWithAutocomplete(query, label)
    assert.strictEqual(result, expected)
  }

  testRegex('select add(', 'close', 'select add(close')
  testRegex('select ', 'add(', 'select add(')
  testRegex('select close from ', 'stock', 'select close from stock')
  testRegex('select add(close ', 'open', 'select add(close, open')
  testRegex('select add(close, open)', 'close', 'select add(close, open), close')
  testRegex('select add(close,open)', 'close', 'select add(close,open), close')
})
