import React, {
  PropTypes
} from 'react'
import { ipcRenderer } from 'electron'

const AUTH_METHODS = {
  ptc: 'ptc',
  google: 'google'
}

const Login = React.createClass({
  propTypes: {
    credentials: PropTypes.object
  },

  getInitialState() {
    return {
      authMethod: this.props.credentials.method || AUTH_METHODS.google
    }
  },

  render() {
    const {
      credentials
    } = this.props

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
            <span className="glyphicon glyphicon-user" aria-hidden="true" />
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
            <span className="glyphicon glyphicon-lock" aria-hidden="true" />
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
              defaultChecked={credentials.success || false}
              ref={(c) => { this.rememberMe = c }}
            />
            {" Remember me"}
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
    const method = this.state.authMethod

    if (this.username.value === '' || this.password.value === '') {
      ipcRenderer.send('error-message', 'Missing username and/or password')
      return
    }

    if (this.rememberMe.checked) {
      ipcRenderer.send('save-account-credentials', method, this.username.value, this.password.value)
    } else {
      ipcRenderer.send('check-and-delete-credentials')
    }

    ipcRenderer.send('pokemon-login', method, this.username.value, this.password.value)
  }
})

export default Login
