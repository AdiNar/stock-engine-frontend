import React from 'react'
import './Icons.css'
import SyncSvg from '../../images/icons/sync-icon.svg'
import ArrowSvg from '../../images/icons/arrow-down-icon.svg'
import BellSvg from '../../images/icons/bell-icon.svg'
import '../../images/icons/state-in-progress-loader.css'
import '../../images/icons/state-queued-loader.css'

export class BellIcon extends React.Component {
  render () {
    return (
      <img
        width={16} height={16}
        src={BellSvg} className='query-icons' alt=''
        onClick={this.props.handleClick}
      />
    // There is a BellSlashIcon for next version of the page
    )
  }
}

export class SyncIcon extends React.Component {
  render () {
    return (
      <img
        width={16} height={16}
        src={SyncSvg} className='query-icons' alt=''
        onClick={this.props.handleClick}
      />
    )
  }
}

export class ArrowIcon extends React.Component {
  constructor (props) {
    super(props)
    this.state = { isToggleOn: true }
  }

  handleClick = (e) => {
    this.setState(prevState => ({
      isToggleOn: !prevState.isToggleOn
    }))
    this.props.handleClick(e)
  }

  render () {
    return (
      <img
        width={16} height={16}
        src={ArrowSvg} id='ArrowSvg' onClick={this.handleClick}
        className={this.state.isToggleOn ? 'query-icons' : 'query-icons arrow-rotate'} alt=''
      />
    )
  }
}

export class CssIcon extends React.Component {
  render () {
    return (
      <div className={this.props.name}>
        <div />
        <div />
        <div />
        <div />
      </div>
    )
  }
}
