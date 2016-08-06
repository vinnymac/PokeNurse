import React from 'react'
import ReactDOM from 'react-dom'
import {ipcRenderer} from 'electron'

import LoginFormContainer from './components/LoginFormContainer'

let credentials = ipcRenderer.sendSync('get-account-credentials')

const SignInApp = React.createClass({
  render() {
    return (
      <div>
        <header className="header">
          <h1>PokéNurse</h1>
          <h4>A tool for Pokémon Go to aid in transferring and evolving Pokémon</h4>
        </header>

        <LoginFormContainer credentials = {credentials} />
      </div>
    )
  }
})

ReactDOM.render(<SignInApp />, document.getElementById("content"))
