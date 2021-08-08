import React from 'react'
import { withCookies } from 'react-cookie'
import { API } from '../../Api'
import { BellIcon, ArrowIcon, SyncIcon, CssIcon } from './Icons.js'
import { PageNav } from './QueriesNav.js'
import strings from '../../res/strings'
import { Autocomplete, QueryRegex } from './Autocomplete'
import './Queries.css'
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
      <form className=''>
        <Autocomplete companies={API.getCompaniesAutocomplete()} keywords={API.getKeywordsAutocomplete()} />
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

export class QueryList extends React.Component {
  render () {
    return (
      <div className=''>
        <div className='d-flex justify-content-center'>
          <h3 className='queryList-names'>
            {this.props.name}
          </h3>
        </div>
        <ul className='d-flex justify-content-start'>
          <div className='queryList list-group w-100'>
            {
              this.props.data.map(el =>
                <li className='list-group-item queryList-element' key={el.id}>
                  <QueryListElement element={el} callback={this.props.callback} cookies={this.props.cookies} />
                </li>
              )
            }
            <li className='query-input list-group-item queryList-element'>
              <QueryInput callback={this.refresh} cookies={this.props.cookies} />
            </li>
          </div>
        </ul>
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
              <span>{el.name}</span>
              {QueryRegex.colorQuery(el.query)}
              {details}
            </div>
            {this.state.mouseIn
              ? (
                <div className='float-right col-md-auto btn-group mr-2 no-right-padding' role='group'>
                  <div className='btn btn-secondary'>
                    <SyncIcon handleClick={this.rerun} />
                  </div>
                  <div className='btn btn-secondary'>
                    <ArrowIcon handleClick={this.showDetails} />
                  </div>
                  <div className='btn btn-secondary'>
                    <BellIcon handleClick={this.toggleWatch} />
                  </div>
                  <div className='btn btn-secondary disabled'>
                    {QueryStateIcon[el.state]}
                  </div>
                </div>
                )
              : (
                <div className='float-right col-md-auto mr-2' role='group'>
                  <div className='btn btn-secondary no-border'>
                    <BellIcon handleClick={this.toggleWatch} />
                  </div>
                  <div className='btn btn-secondary no-border'>
                    {QueryStateIcon[el.state]}
                  </div>
                </div>
                )}
          </div>
        </div>
      )
    }
}

class Queries extends React.Component {
  render () {
    return (
      <div id='queries' className='col-lg-4 col-md-5 col-sm-6'>
        <QueryList
          name={this.props.name} data={this.props.data}
          callback={this.props.callback} cookies={this.props.cookies}
        />
      </div>
    )
  }
}

export default withCookies(Queries)
