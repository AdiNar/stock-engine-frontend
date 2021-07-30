import React from 'react'
import Queries, { PageHeader, QueryInput, QueryListHeader, QueryListName } from '../Queries/Queries'
import NotificationAllow from '../Queries/NotificationAllow'
import { withCookies } from 'react-cookie'
import { API } from '../../Api'

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
        <QueryInput callback={this.refreshQueries} cookies={this.props.cookies} />
        <QueryListHeader />
        <QueryListName />
        <div className='main-page-components'>
          <Queries data={this.state.queries} callback={this.refresh} />
          <Queries data={this.state.alerts} callback={this.refresh} />
          <NotificationAllow />
        </div>
      </div>
    )
  }
}

export default withCookies(Dashboard)
