import './RegisterSection.css'
import React from 'react'
import strings from '../../../res/strings'

class RegisterSection extends React.Component {
  render () {
    return (
      <div className='register' id='register__section'>
        <section className='register__section--header'>
          <h2>{strings.registration.header}</h2>
        </section>
        <section className='register__section--form'>
          <p>
            {strings.registration.description}
          </p>
          <p>
            {strings.registration.about}
          </p>
        </section>
      </div>
    )
  }
}

export default RegisterSection
