import React from 'react'
import Queries, { PageHeader, QueryListHeader } from '../Queries/Queries'
import NotificationAllow from '../Queries/NotificationAllow'
import { withCookies } from 'react-cookie'
import { API } from '../../Api'
import strings from '../../res/strings'

class Dashboard extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      alerts: [],
      queries: []
    }
  }

  componentDidMount () {
    this.refresh()
  }

  refresh = () => {
    this.refreshQueries()
    this.refreshAlerts()
  }

  refreshAlerts = () => {
    const ths = this
    const { cookies } = this.props
    API.getAlerts(cookies)
      .then((json) => ths.setState({ alerts: json.list }))
  }

  refreshQueries = () => {
    const ths = this
    const { cookies } = this.props
    API.getQueryHistory(cookies)
      .then((json) => ths.setState({ queries: json.list }))
  }

  render () {
    return (
      <div className='main-page'>
        <PageHeader />
        <QueryListHeader />
        <div className='d-flex gap-2 justify-content-center'>
          <Queries name={strings.queries.queries} data={this.state.queries} callback={this.refresh} />
          <Queries name={strings.queries.alerts} data={this.state.alerts} callback={this.refresh} />
          <NotificationAllow />
        </div>
      </div>
    )
  }
}

export default withCookies(Dashboard)
