import React, {
  PropTypes
} from 'react'
import ReactDOM from 'react-dom'
import {
  Provider,
  connect
} from 'react-redux'

import store from './store'
import Login from './screens/Login'
import Table from './screens/Table'

require('./css/pokenurse.css')

const App = React.createClass({
  propTypes: {
    authenticate: PropTypes.object.isRequired
  },

  render() {
    if (this.props.authenticate.loggedIn) return (<Table />)

    return (<Login />)
  }
})

const ConnectedApp = connect((state => ({
  authenticate: state.authenticate
})))(App)

ReactDOM.render(<Provider store={store}><ConnectedApp /></Provider>, document.getElementById('content'))
