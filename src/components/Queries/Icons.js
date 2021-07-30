import React from 'react'
import './Icons.css'
import SyncSvg from '../../images/icons/sync-icon.svg'
import ArrowSvg from '../../images/icons/arrow-down-icon.svg'
import BellSvg from '../../images/icons/bell-icon.svg'

export class BellIcon extends React.Component {
  render () {
    return (
      <img
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
        src={ArrowSvg} id='ArrowSvg' onClick={this.handleClick}
        className={this.state.isToggleOn ? 'query-icons' : 'arrow-rotate'} alt=''
      />
    )
  }
}
