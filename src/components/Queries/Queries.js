import React from 'react'
import { withCookies } from 'react-cookie'
import { API } from '../../Api'
import { BellIcon, ArrowIcon, SyncIcon, CssIcon } from './Icons.js'
import { PageNav } from './QueriesNav.js'
import strings from '../../res/strings'
import { Autocomplete, QueryRegex } from './Autocomplete'
import './Queries.scss'
import CheckLgSvg from '../../images/icons/check-lg.svg'
import ExclamationCircleSvg from '../../images/icons/exclamation-circle.svg'

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
    this.autocompleteRef = React.createRef()
  }

  handleSubmit = (e) => {
    e.preventDefault()
    API.sendQuery(this.props.cookies, this.state.query)
      .then(this.props.callback)
  }

  queryListener = (query) => {
    this.setState({ query: query })
  }

  render () {
    return (
      <div className='query-input'>
        <Autocomplete
          ref={this.autocompleteRef}
          companies={API.getCompaniesAutocomplete()}
          keywords={API.getKeywordsAutocomplete()}
          queryListener={this.queryListener}
        />
        <a role='button' onClick={this.handleSubmit} className='query-send-button'>
          {strings.queries.send}
        </a>
      </div>
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

export class QueryList extends React.Component {
  constructor (props) {
    super(props)

    this.lastItem = React.createRef()
  }

  scrollToBottom = () => {
    this.lastItem.current.scrollIntoView({ behavior: 'smooth' })
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (this.props.withInput && this.props.data.length !== prevProps.data.length) {
      this.scrollToBottom()
    }
  }

  render () {
    return (
      <div className='queryList'>
        <div className='d-flex justify-content-center'>
          <h3 className='queryList-names'>
            {this.props.name}
          </h3>
        </div>
        <ul className='list-group border list-group-flush'>
          {
              this.props.data.map(el =>
                <li ref={this.lastItem} className='list-group-item' key={el.id}>
                  <QueryListElement element={el} callback={this.props.callback} cookies={this.props.cookies} />
                </li>
              )
            }
        </ul>

        {this.props.withInput &&
          <QueryInput callback={this.props.callback} cookies={this.props.cookies} />}
      </div>
    )
  }
}

const QueryState = {
  DONE: 'DONE',
  FAILED: 'FAILED',
  QUEUED: 'QUEUED',
  IN_PROGRESS: 'IN_PROGRESS'
}

const QueryStateIcon = {
  DONE: <img src={CheckLgSvg} alt='' className='query-icons' />,
  FAILED: <img src={ExclamationCircleSvg} alt='' className='query-icons' />,
  QUEUED: <CssIcon name='state-queued-loader' />,
  IN_PROGRESS: <CssIcon name='state-in-progress-loader' />
}

class QueryListElement extends React.Component {
  constructor (props) {
    super(props)

    this.state = { showDetails: false, mouseIn: false }
    this.detailsRef = React.createRef()
  }

    finishState = new Set([QueryState.DONE, QueryState.FAILED])
    waitingState = new Set([QueryState.QUEUED, QueryState.IN_PROGRESS])

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
      API.getQuery(this.props.cookies, this.props.element.id).then(this.props.callback)
    }

    removeRefreshInterval = () => {
      clearInterval(this.state.intervalID)
    }

    setRefreshInterval = () => {
      this.setState({ intervalID: setInterval(this.refreshQueryState, 500) })
    }

    componentDidMount () {
      const el = this.props.element
      if (this.waitingState.has(el.state)) {
        this.setRefreshInterval()
      }
    }

    componentDidUpdate (prevProps, prevState, snapshot) {
      const el = this.props.element
      const currentQueryState = el.state
      const previousQueryState = prevProps.element.state

      if (currentQueryState !== previousQueryState) {
        if (this.finishState.has(currentQueryState)) { this.removeRefreshInterval() } else if (this.finishState.has(previousQueryState) && this.waitingState.has(currentQueryState)) {
          this.setRefreshInterval()
        }
      }
    }

    componentWillUnmount () {
      this.removeRefreshInterval()
    }

    handleOnMouseEnter = () => {
      this.setState({ mouseIn: true })
    }

    handleOnMouseLeave = () => {
      this.setState({ mouseIn: false })
    }

    render () {
      const el = this.props.element
      const details = this.state.showDetails ? 'Details' : ''

      return (
        <div
          onMouseEnter={this.handleOnMouseEnter}
          onMouseLeave={this.handleOnMouseLeave}
          className='container'
        >
          <div className='row justify-content-between'>
            <div className='col-md-auto'>
              <span style={{ color: 'gray' }}>{el.name}</span>
              {QueryRegex.colorQuery(el.query)}
              {details}
            </div>
            <div className='float-right icon-group' role='group'>
              <div className={`icon ${this.state.mouseIn ? '' : 'invisible'}`}>
                <ArrowIcon handleClick={this.showDetails} isToggledOn={this.state.showDetails} />
              </div>
              <div className={`icon ${this.state.mouseIn ? '' : 'invisible'}`}>
                <SyncIcon handleClick={this.rerun} />
              </div>
              <div className={`icon ${this.state.mouseIn ? '' : 'no-border'}`}>
                <BellIcon handleClick={this.toggleWatch} isToggledOn={el.watch} />
              </div>
              <div className={`icon disabled ${this.state.mouseIn ? '' : 'no-border'}`}>
                {QueryStateIcon[el.state]}
              </div>
            </div>
          </div>
        </div>
      )
    }
}

class Queries extends React.Component {
  render () {
    return (
      <div id='queries' className='col-xxl-4 col-xl-6'>
        <QueryList
          withInput={this.props.withInput}
          name={this.props.name} data={this.props.data}
          callback={this.props.callback} cookies={this.props.cookies}
        />
      </div>
    )
  }
}

export default withCookies(Queries)
