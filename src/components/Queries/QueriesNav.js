import React from 'react'
import strings from '../../res/strings'

export class PageNav extends React.Component {
  render () {
    document.addEventListener('DOMContentLoaded', () => {
      const firstAnchor = document.getElementById('firstAnchor')
      const secondAnchor = document.getElementById('SecondAnchor')
      const queries = document.getElementById('queries')
      const alerts = document.getElementById('alerts')

      firstAnchor.addEventListener('click', () => {
        firstAnchor.style.color = 'black'
        secondAnchor.style.color = 'var(--lightGray)'
        queries.style.display = 'initial'
        alerts.style.display = 'none'
      })

      secondAnchor.addEventListener('click', () => {
        firstAnchor.style.color = 'var(--lightGray)'
        secondAnchor.style.color = 'black'
        queries.style.display = 'none'
        alerts.style.display = 'initial'
      })
    })

    return (
      <div>
        <nav className='page--nav'>
          <p id='firstAnchor'>{strings.queries.queries}</p>
          <p id='SecondAnchor'>{strings.queries.alerts}</p>
        </nav>
      </div>
    )
  }
}
