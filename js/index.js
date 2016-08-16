import React, { Component } from 'react'
import { render } from 'react-dom'
import { ipcRenderer } from 'electron'

import Login from './screens/Login'
import Table from './screens/Table'

class App extends Component {
  constructor () {
    super()
    this.state =  {
      loggedIn: false
    }
  }

  componentDidMount () {
    ipcRenderer.on('pokemon-logged-in', () => {
      console.log('LOGGED IN SUCCESSFULLY!')

      this.setState({loggedIn: true})
    })
  }

  render () {
    if (this.state.loggedIn) {
      return (<Table />)
    } else {
      return (<Login />)
    }
  }
}

render(<App />, document.getElementById('content'))
