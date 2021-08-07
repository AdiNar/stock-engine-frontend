import React from 'react'
import { FirebaseManager } from '../../firebaseManager'
import { withCookies } from 'react-cookie'
import strings from '../../res/strings'

class NotificationAllow extends React.Component {
  constructor (props) {
    super(props)

    const { cookies } = this.props
    FirebaseManager.registerMessaging(cookies)
    this.wrapper = React.createRef()
  }

  componentDidMount () {
    if (this.wrapper.current) { this.wrapper.current.addEventListener('click', this.listener) }
  }

  componentWillUnmount () {
    if (this.wrapper.current) { this.wrapper.current.removeEventListener('click', this.listener) }
  }

  listener (_) {
    const { cookies } = this.props
    return FirebaseManager.registerMessaging(cookies)
  }

  render () {
    if (Notification.permission === 'granted') {  // eslint-disable-line
      return null
    } else {
      return (
        <div>
          <span>{strings.notifications.allow_description}</span>
          <button type='button' ref={this.wrapper}>{strings.notifications.allow_button}</button>
        </div>
      )
    }
  }
}

export default withCookies(NotificationAllow)
