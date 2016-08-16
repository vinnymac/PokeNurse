import React from 'react'
import ReactDOM from 'react-dom'
import {ipcRenderer} from 'electron'

import Login from './js/screens/Login'
import Table from './js/screens/Table'

const App = React.createClass({
  getInitialState () {
    return {loggedIn: false}
  },

  componentDidMount () {
    ipcRenderer.on('pokemon-logged-in', () => {
      console.log('LOGGED IN SUCCESSFULLY!')

      this.setState({loggedIn: true})
    })
  },

  render () {
    if (this.state.loggedIn) {
      return (<Table />)
    } else {
      return (<Login />)
    }
  }
})

ReactDOM.render(<App />, document.getElementById('content'))
