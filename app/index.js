import React, {
  PropTypes
} from 'react'
import ReactDOM from 'react-dom'
import {
  Provider,
  connect
} from 'react-redux'
import { bindActionCreators } from 'redux'

import store from './store'
import Login from './screens/Login'
import Table from './screens/Table'

import {
  login
} from './actions'

require('./css/pokenurse.css')

const App = React.createClass({
  propTypes: {
    authenticate: PropTypes.object.isRequired,
    autoLogin: PropTypes.bool.isRequired,
    login: PropTypes.func.isRequired,
  },

  componentWillMount() {
    const {
      autoLogin,
      authenticate,
    } = this.props

    const { credentials } = authenticate

    if (autoLogin && credentials.method && credentials.password && credentials.username) {
      this.props.login(credentials)
    }
  },

  render() {
    if (this.props.authenticate.loggedIn) return (<Table />)

    return (<Login />)
  }
})

const ConnectedApp = connect((state => ({
  authenticate: state.authenticate,
  autoLogin: state.settings.autoLogin,
})), (dispatch => bindActionCreators({
  login
}, dispatch)))(App)

ReactDOM.render(<Provider store={store}><ConnectedApp /></Provider>, document.getElementById('content'))
