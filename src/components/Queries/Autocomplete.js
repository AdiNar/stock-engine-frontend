import { autocomplete } from '@algolia/autocomplete-js'
import '@algolia/autocomplete-theme-classic'
import './Autocomplete.css'
import React from 'react'
import { html } from 'htm/preact'
import strings from '../../res/strings'

export class Autocomplete extends React.Component {
    static INPUT_REGEX = '.*?([a-z]*?)([ ,()]{0,1})[ ]*([a-z0-9]*)$'
    static KEYWORDS_REGEX = '(select|from|as)'

    static concatenateQueryWithAutocomplete (query, label) {
      const queryMatch = query.toLowerCase().match(Autocomplete.INPUT_REGEX)

      if (queryMatch) {
        const previousWord = queryMatch[1]
        const divider = queryMatch[2]
        const currentWord = queryMatch[3]

        let queryWithoutCurrentWord = query.substring(0, query.length - currentWord.length).trim()

        console.log(`queryWithout: ${queryWithoutCurrentWord}, previous: ${previousWord},
          divider: ${divider}, current: ${currentWord}, label: ${label},`)

        if (divider === '' || previousWord.match(Autocomplete.KEYWORDS_REGEX)) {
          queryWithoutCurrentWord += ' '
        } else if (divider.match('^[ )]$')) {
          queryWithoutCurrentWord += ', '
        }

        return queryWithoutCurrentWord + label
      }
    }

    constructor (props) {
      super(props)

      this.autocompleteRef = React.createRef()
      this.previousQuery = undefined
      this.previousItems = undefined
    }

    componentDidMount () {
      const ths = this

      autocomplete({
        container: this.autocompleteRef.current,
        openOnFocus: true,
        placeholder: 'Placeholder',
        getSources: function ({ query }) {
          return ths.props.companies.then(companiesList => {
            return ths.props.keywords.then(keywordsList => {
              const [, , currentWord, lst] = ths.getProperSuggestions(query, companiesList, keywordsList)
              return ths.previousSources = [ // eslint-disable-line
                {
                  sourceId: 'elements',
                  getItems () {
                    if (ths.previousQuery === query) return ths.previousItems
                    ths.previousQuery = query

                    return ths.previousItems = lst.filter(({ label }) => // eslint-disable-line
                      label.toLowerCase().includes(currentWord)
                    ).sort((aRaw, bRaw) => {
                      const a = aRaw.label.toLowerCase()
                      const b = bRaw.label.toLowerCase()

                      const qa = a.search(currentWord)
                      const qb = b.search(currentWord)

                      if (qa !== qb) {
                        return qa - qb
                      }

                      return a.localeCompare(b)
                    })
                  },
                  getItemInputValue ({ item }) {
                    return Autocomplete.concatenateQueryWithAutocomplete(query, item.label) || item.label
                  },
                  templates: {
                    item ({ item }) {
                      return html`
                        <div class="aa-ItemWrapper">
                            <div class="aa-ItemContent">
                                <div class="aa-ItemContentBody">
                                    <div class="aa-ItemContentTitle">
                                        ${item.label}
                                    </div>
                                    <div class="aa-ItemContentDescription">
                                        ${item.description}
                                    </div>
                                </div>
                            </div>
                        </div>`
                    }
                  }
                }
              ]
            })
          })
        }
      })
    }

    render () {
      return (<div ref={this.autocompleteRef} />)
    }

    getProperSuggestions (query, companiesList, keywordsList) {
      query = query.toLowerCase()
      const queryMatch = query.match(Autocomplete.INPUT_REGEX)
      const defaultResponse = ['', '', '', [{ label: 'SELECT ', description: strings.queries.example }]]
      if (queryMatch) {
        const previousWord = queryMatch[1]
        const divider = queryMatch[2]
        const currentWord = queryMatch[3]

        if (query === currentWord) {
          return defaultResponse
        }

        if (previousWord === 'as') {
          // Whatever it is, it should be word select
          return ['', '', '', []]
        }

        return [previousWord, divider, currentWord, previousWord === 'from' ? companiesList : keywordsList]
      }

      return defaultResponse
    }
}

export class QueryRegex {
  static QUERY_REGEX = '(select) (.+) (from) (\\S+)( on .*)?'

  static colorQuery (query) {
    const match = query.toLowerCase().match(QueryRegex.QUERY_REGEX)

    if (!match) return query

    const [, , fields, , stock, condition] = match

    const queryList = [
      { label: 'SELECT ', color: 'blue', id: 1 },
      { label: fields, color: 'orange', id: 2 },
      { label: ' FROM ', color: 'blue', id: 3 },
      { label: stock, color: 'orange', id: 4 }
    ]

    if (condition) {
      queryList.push({ label: ' ON ', color: 'blue', id: 5 }, { label: condition, color: 'orange', id: 6 })
    }

    return (
      <div>
        {
            queryList.map(({ label, color, id }) =>
              <span key={id} style={{ color: color }}>{label}</span>)
        }
      </div>
    )
  }
}
