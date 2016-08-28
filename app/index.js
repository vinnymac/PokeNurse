import React, {
  PropTypes
} from 'react'
import ReactDOM from 'react-dom'
import {
  ipcRenderer
} from 'electron'
import {
  Provider,
  connect
} from 'react-redux'
import {
  bindActionCreators
} from 'redux'

import {
  login
} from './actions'

import store from './store'
import Login from './screens/Login'
import Table from './screens/Table'

require('./css/pokenurse.css')

const App = React.createClass({
  propTypes: {
    login: PropTypes.func.isRequired,
    authenticate: PropTypes.object.isRequired
  },

  componentDidMount() {
    ipcRenderer.on('pokemon-logged-in', () => {
      this.props.login()
    })
  },

  render() {
    if (this.props.authenticate.loggedIn) return (<Table />)

    return (<Login />)
  }
})

const ConnectedApp = connect((state => ({
  authenticate: state.authenticate
})), (dispatch =>
  bindActionCreators({ login }, dispatch)
))(App)

ReactDOM.render(<Provider store={store}><ConnectedApp /></Provider>, document.getElementById('content'))
