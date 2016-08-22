import React from 'react'
import { ipcRenderer } from 'electron'

import LoginForm from './components/LoginFormContainer'

const Login = React.createClass({
  getInitialState() {
    return { credentials: ipcRenderer.sendSync('get-account-credentials') }
  },

  render() {
    return (
      <div>
        <header className="header">
          <h1>PokéNurse</h1>
          <h4>A tool for Pokémon Go to aid in transferring and evolving Pokémon</h4>
        </header>

        <LoginForm credentials={this.state.credentials} />
      </div>
    )
  }
})

export default Login
