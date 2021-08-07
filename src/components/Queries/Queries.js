import React from 'react'
import { withCookies } from 'react-cookie'
import { API } from '../../Api'
import './Queries.css'
import { BellIcon, ArrowIcon, SyncIcon } from './Icons.js'
import { PageNav } from './QueriesNav.js'
import strings from '../../res/strings'
import { Autocomplete } from './Autocomplete'

export class PageHeader extends React.Component {
  render () {
    return (
      <div>
        <header className='page--header'>
          <p className='header__logo'>
            <span>Stock</span> Engine
          </p>
        </header>
        <PageNav />
      </div>
    )
  }
}

export class QueryInput extends React.Component {
  constructor (props) {
    super(props)

    this.state = { query: '' }
  }

  handleChange = (event) => {
    this.setState({ query: event.target.value })
  }

  handleSubmit = (e) => {
    e.preventDefault()
    API.sendQuery(this.props.cookies, this.state.query)
      .then(this.props.callback)
  }

  render () {
    return (
      <form className='query-form'>
        <Autocomplete companies={API.getCompaniesAutocomplete()} keywords={API.getKeywordsAutocomplete()} />
        <button id='btn-query' onClick={this.handleSubmit}>{strings.queries.send}</button>
      </form>
    )
  }
}

export class QueryListHeader extends React.Component {
  render () {
    return (
      <h3 className='queryList-header'>
        {strings.queries.history}
      </h3>
    )
  }
}
export class QueryListName extends React.Component {
  render () {
    return (
      <div className='queryList-names-box'>
        <h3 className='queryList-names'>
          {strings.queries.queries}
        </h3>
        <h3 className='queryList-names'>
          {strings.queries.alerts}
        </h3>
      </div>
    )
  }
}

export class QueryList extends React.Component {
  render () {
    return (
      <ul>
        <div className='queryList-element'>
          {
            this.props.data.map(el =>
              <li key={el.id}>
                <QueryListElement element={el} callback={this.props.callback} cookies={this.props.cookies} />
              </li>
            )
          }
        </div>
      </ul>
    )
  }
}

class QueryListElement extends React.Component {
  constructor (props) {
    super(props)

    this.state = { showDetails: false }
    this.detailsRef = React.createRef()
  }

    finishState = new Set(['DONE', 'FAILED'])
    waitingState = new Set(['QUEUED', 'IN_PROGRESS'])

    toggleWatch = () => {
      const el = this.props.element
      const watchToggled = 1 - el.watch
      API.watchQuery(this.props.cookies, el.id, watchToggled)
        .then(this.props.callback)
    }

    rerun = () => {
      const el = this.props.element
      API.rerunQuery(this.props.cookies, el.id)
        .then(this.props.callback)
    }

    showDetails = () => {
      this.setState(state => { return { showDetails: !state.showDetails } })
    }

    refreshQueryState = () => {
      // console.log(`Refreshing query ${this.props.element.name}`)
      API.getQuery(this.props.cookies, this.props.element.id).then(this.props.callback)
    }

    removeRefreshInterval = () => {
      console.log(`Removing interval for query ${this.props.element.name}`)
      clearInterval(this.state.intervalID)
    }

    setRefreshInterval = () => {
      console.log(`Query ${this.props.element.name} is ongoing, setting interval for results...`)
      this.setState({ intervalID: setInterval(this.refreshQueryState, 500) })
    }

    componentDidMount () {
      const el = this.props.element
      if (this.waitingState.has(el.state)) {
        console.log(`Query ${el.name} state is ${el.state}`)
        this.setRefreshInterval()
      }
    }

    componentDidUpdate (prevProps, prevState, snapshot) {
      const el = this.props.element
      const currentQueryState = el.state
      const previousQueryState = prevProps.element.state

      if (currentQueryState !== previousQueryState) {
        console.log(`Query ${el.name} state has changed from ${previousQueryState} to ${currentQueryState}`)
        if (this.finishState.has(currentQueryState)) { this.removeRefreshInterval() } else if (this.finishState.has(previousQueryState) && this.waitingState.has(currentQueryState)) {
          this.setRefreshInterval()
        }
      }
    }

    componentWillUnmount () {
      this.removeRefreshInterval()
    }

    render () {
      const el = this.props.element
      const details = this.state.showDetails ? 'Details' : ''

      return (
        <div>
          <span>{el.name}</span><span>{el.query}</span>
          <span>{el.state}</span>
          <span>{details}</span>
          <div className='query-icons-box'>
            <BellIcon handleClick={this.toggleWatch} />
            <SyncIcon handleClick={this.rerun} />
            <ArrowIcon handleClick={this.showDetails} />
          </div>
        </div>
      )
    }
}

class Queries extends React.Component {
  render () {
    return (
      <div id='queries'>
        <QueryList data={this.props.data} callback={this.props.callback} cookies={this.props.cookies} />
        <QueryInput callback={this.refresh} cookies={this.props.cookies} />
      </div>
    )
  }
}

export default withCookies(Queries)
