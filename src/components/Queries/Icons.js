import React from 'react'
import './Icons.css'
import SyncSvg from '../../images/icons/sync-icon.svg'
import ArrowSvg from '../../images/icons/arrow-down-icon.svg'
import BellSvg from '../../images/icons/bell-icon.svg'
import BellSlashSvg from '../../images/icons/bell-slash-fill.svg'
import '../../images/icons/state-in-progress-loader.css'
import '../../images/icons/state-queued-loader.css'

export class BellIcon extends React.Component {
  constructor (props) {
    super(props)

    this.state = { rotate: false }
  }

  handleClick = (e) => {
    this.setState({ rotate: true })

    const intervalId = setInterval(() => {
      this.setState({ rotate: false })
      clearInterval(intervalId)
    }, 1000)

    this.props.handleClick(e)
  }

  render () {
    const className = 'query-icons ' + (this.state.rotate ? 'rotateBell' : '')

    return (
      <img
        width={16} height={16}
        src={this.props.isToggledOn ? BellSvg : BellSlashSvg} className={className} alt=''
        onClick={this.handleClick}
      />
    )
  }
}

export class SyncIcon extends React.Component {
  constructor (props) {
    super(props)

    this.state = { rotate: false }
  }

  handleClick = (e) => {
    this.setState({ rotate: true })

    const intervalId = setInterval(() => {
      this.setState({ rotate: false })
      clearInterval(intervalId)
    }, 1000)

    this.props.handleClick(e)
  }

  render () {
    const className = 'query-icons ' + (this.state.rotate ? 'rotate' : '')

    return (
      <img
        width={16} height={16}
        src={SyncSvg} className={className} alt=''
        onClick={this.handleClick}
      />
    )
  }
}

export class ArrowIcon extends React.Component {
  render () {
    return (
      <img
        width={24} height={24}
        src={ArrowSvg} onClick={this.props.handleClick}
        className={'query-icons ' + (this.props.isToggledOn ? 'arrow-rotate' : '')} alt=''
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
