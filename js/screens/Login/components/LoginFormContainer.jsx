import React from 'react';
const {ipcRenderer} = require('electron')

let credentials = ipcRenderer.sendSync('get-account-credentials')

const Login = React.createClass({
  render() {
    return (
      <div className="container">
        <div className="form-group btn-group" data-toggle="buttons">
          <label className="btn btn-info active noselect">
            <input type="radio" name="auth-radio" id="auth0" value="google" defaultChecked={credentials.method !== 'ptc'}/>
            Google
          </label>
          <label className="btn btn-info noselect">
            <input type="radio" name="auth-radio" id="auth1" value="ptc" defaultChecked={credentials.method === 'ptc'}/>
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
            defaultValue={credentials.username || ""}
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
            defaultValue={credentials.password || ""}
          />
        </div>

        <div className="form-group">
          <label htmlFor="remember-cb" className="pointer">
            <input
              type="checkbox"
              id="remember-cb"
              defaultChecked={credentials.success}
              ref="rememberMe"
            />
            Remember me
          </label>
          <input
            type="button"
            className="btn btn-success pull-right"
            value="Login"
            onClick = {this._handleLogin}
          />
        </div>
      </div>
    );
  },

  _getAuthMethod () {
    var authMethodRadio = document.getElementsByName('auth-radio')
    for (var i = 0; i < authMethodRadio.length; i++) {
      if (authMethodRadio[i].checked) {
        return authMethodRadio[i].value
      }
    }
    return undefined
  },

  _handleEnterKey (e) {
    if (e.key === "Enter") this._handleLogin()
  },

  _handleLogin () {
    let method = this._getAuthMethod()
    let {username, password, rememberMe} = this.refs

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
});

export default Login
