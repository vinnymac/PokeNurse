import React from 'react'
import { ipcRenderer } from 'electron'

const AUTH_METHODS = {
  ptc: 'ptc',
  google: 'google'
}

const Login = React.createClass({
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
            onClick={this._radioLabelClick.bind(this, AUTH_METHODS.google)}
          >
            <input
              type="radio"
              name="auth-radio"
              id="authGoogle"
              ref={AUTH_METHODS.google}
              value={AUTH_METHODS.google}
              defaultChecked={this.state.authMethod === AUTH_METHODS.google}
              onChange={this._handleChangeAuth}
            />
            Google
          </label>
          <label
            className="btn btn-info noselect"
            htmlFor="authPTC"
            onClick={this._radioLabelClick.bind(this, AUTH_METHODS.ptc)}
          >
            <input
              type="radio"
              name="auth-radio"
              id="authPTC"
              ref={AUTH_METHODS.ptc}
              value={AUTH_METHODS.ptc}
              defaultChecked={this.state.authMethod === AUTH_METHODS.ptc}
              onChange={this._handleChangeAuth}
            />
            Pokémon Trainer Club
          </label>
        </div>

        <div className="form-group input-group">
          <span className="input-group-addon"><span className="glyphicon glyphicon-user" aria-hidden="true"></span></span>
          <input
            type="text"
            className="form-control"
            placeholder="Username"
            ref="username"
            onKeyPress={this._handleEnterKey}
            defaultValue={credentials.username || ''}
          />
        </div>

        <div className="form-group input-group">
          <span className="input-group-addon"><span className="glyphicon glyphicon-lock" aria-hidden="true"></span></span>
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            ref="password"
            onKeyPress={this._handleEnterKey}
            defaultValue={credentials.password || ''}
          />
        </div>

        <div className="form-group">
          <label htmlFor="remember-cb" className="pointer">
            <input
              type="checkbox"
              id="remember-cb"
              defaultChecked={credentials.success || false}
              ref="rememberMe"
            />
            {" Remember me"}
          </label>
          <input
            type="button"
            className="btn btn-success pull-right"
            value="Login"
            onClick={this._handleLogin}
          />
        </div>
      </div>
    )
  },

  _radioLabelClick(authMethod) {
    this.refs[authMethod].click()
  },

  _handleChangeAuth(e) {
    this.setState({
      authMethod: e.target.value
    })
  },

  _handleEnterKey(e) {
    if (e.key === 'Enter') this._handleLogin()
  },

  _handleLogin() {
    const method = this.state.authMethod
    let { username, password, rememberMe } = this.refs

    if (username.value === '' || password.value === '') {
      ipcRenderer.send('error-message', 'Missing username and/or password')
      return
    }

    if (rememberMe.checked) {
      ipcRenderer.send('save-account-credentials', method, username.value, password.value)
    } else {
      ipcRenderer.send('check-and-delete-credentials')
    }

    ipcRenderer.send('pokemon-login', method, username.value, password.value)
  }
})

export default Login
