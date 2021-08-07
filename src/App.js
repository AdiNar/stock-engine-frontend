import './App.css'
import { isAuthenticated } from './utils'
import React from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { FirebaseManager } from './firebaseManager'
import Login from './components/LoginPage/Login'
import Dashboard from './components/Dashboard/Dashboard'
import { withCookies } from 'react-cookie'

FirebaseManager.init()

class App extends React.Component {
  render () {
    const { cookies } = this.props

    if (isAuthenticated(cookies)) {
      return (
        <BrowserRouter>
          <Switch>
            <Route exact path='/'>
              <Dashboard />
            </Route>
          </Switch>
        </BrowserRouter>
      )
    } else {
      return (
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      )
    }
  }
}

export default withCookies(App)
