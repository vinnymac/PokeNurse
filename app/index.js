import React from 'react'
import ReactDOM from 'react-dom'
import { ipcRenderer } from 'electron'
import Login from './screens/Login'
import Table from './screens/Table'

require('./css/pokenurse.css')

const App = React.createClass({
  getInitialState() {
    return { loggedIn: false }
  },

  componentDidMount() {
    ipcRenderer.on('pokemon-logged-in', () => {
      this.setState({ loggedIn: true })
    })
  },

  render() {
    if (this.state.loggedIn) return (<Table />)

    return (<Login />)
  }
})

ReactDOM.render(<App />, document.getElementById('content'))
