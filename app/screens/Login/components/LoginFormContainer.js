import React, {
  PropTypes
} from 'react'
import { ipcRenderer } from 'electron'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  ProgressBar
} from 'react-bootstrap'

import {
  checkAndDeleteCredentials,
  saveAccountCredentials,
  login
} from '../../../actions'

const AUTH_METHODS = {
  ptc: 'ptc',
  google: 'google'
}

const LoginForm = React.createClass({
  displayName: 'LoginForm',

  propTypes: {
    credentials: PropTypes.object,
    checkAndDeleteCredentials: PropTypes.func.isRequired,
    saveAccountCredentials: PropTypes.func.isRequired,
    login: PropTypes.func.isRequired,
    authenticating: PropTypes.bool.isRequired,
  },

  getInitialState() {
    return {
      authMethod: this.props.credentials.method || AUTH_METHODS.google
    }
  },

  render() {
    const {
      credentials,
      authenticating,
    } = this.props

    if (authenticating) {
      return (
        <div className="container">
          <ProgressBar
            now={100}
            active
            bsStyle="info"
          />
        </div>
      )
    }

    return (
      <div className="container">
        <div className="form-group btn-group" data-toggle="buttons">
          <label
            className="btn btn-info noselect active"
            htmlFor="authGoogle"
            onClick={this.radioLabelClick.bind(this, AUTH_METHODS.google)}
          >
            <input
              type="radio"
              name="auth-radio"
              id="authGoogle"
              ref={(c) => { this[AUTH_METHODS.google] = c }}
              value={AUTH_METHODS.google}
              defaultChecked={this.state.authMethod === AUTH_METHODS.google}
              onChange={this.handleChangeAuth}
            />
            Google
          </label>
          <label
            className="btn btn-info noselect"
            htmlFor="authPTC"
            onClick={this.radioLabelClick.bind(this, AUTH_METHODS.ptc)}
          >
            <input
              type="radio"
              name="auth-radio"
              id="authPTC"
              ref={(c) => { this[AUTH_METHODS.ptc] = c }}
              value={AUTH_METHODS.ptc}
              defaultChecked={this.state.authMethod === AUTH_METHODS.ptc}
              onChange={this.handleChangeAuth}
            />
            Pokémon Trainer Club
          </label>
        </div>

        <div className="form-group input-group">
          <span className="input-group-addon">
            <span className="fa fa-user" aria-hidden="true" />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Username"
            ref={(c) => { this.username = c }}
            onKeyPress={this.handleEnterKey}
            defaultValue={credentials.username || ''}
          />
        </div>

        <div className="form-group input-group">
          <span className="input-group-addon">
            <span className="fa fa-lock" aria-hidden="true" />
          </span>
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            ref={(c) => { this.password = c }}
            onKeyPress={this.handleEnterKey}
            defaultValue={credentials.password || ''}
          />
        </div>

        <div className="form-group">
          <label htmlFor="remember-cb" className="pointer">
            <input
              type="checkbox"
              id="remember-cb"
              defaultChecked={(credentials.password && credentials.username) || false}
              ref={(c) => { this.rememberMe = c }}
            />
            {' Remember me'}
          </label>
          <input
            type="button"
            className="btn btn-success pull-right"
            value="Login"
            onClick={this.handleLogin}
          />
        </div>
      </div>
    )
  },

  radioLabelClick(authMethod) {
    this[authMethod].click()
  },

  handleChangeAuth(e) {
    this.setState({
      authMethod: e.target.value
    })
  },

  handleEnterKey(e) {
    if (e.key === 'Enter') this.handleLogin()
  },

  handleLogin() {
    if (this.props.authenticating) return

    const method = this.state.authMethod

    if (this.username.value === '' || this.password.value === '') {
      ipcRenderer.send('error-message', 'Missing username and/or password')
      return
    }

    const credentials = {
      method,
      username: this.username.value,
      password: this.password.value
    }

    if (this.rememberMe.checked) {
      this.props.saveAccountCredentials(credentials)
    } else {
      this.props.checkAndDeleteCredentials()
    }

    this.props.login(credentials)
  }
})


export default connect((state => ({
  authenticating: state.authenticate.authenticating,
})), (dispatch => bindActionCreators({
  checkAndDeleteCredentials,
  saveAccountCredentials,
  login
}, dispatch)))(LoginForm)
