import React from 'react'
import {ipcRenderer} from 'electron'

const AUTH_METHODS = {
  ptc: 'ptc',
  google: 'google'
}

const Login = React.createClass({
  getInitialState () {
    return {
      authMethod: this.props.credentials.method || AUTH_METHODS.google
    }
  },

  render () {
    let {
      credentials
    } = this.props

    return (
      <div className='bg-holder login-holder'>
        <div id='leaves'>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
        </div>
        <div className='main'>
          <form className='container_login'>
            <div className='switch switch--horizontal'>
              <input
                type='radio'
                name='auth-radio'
                id='auth0'
                value={AUTH_METHODS.google}
                checked={this.state.authMethod === AUTH_METHODS.google}
                onChange={this._handleChangeAuth}
              />
              <label htmlFor='auth0'>Google</label>
              <input
                type='radio'
                name='auth-radio'
                id='auth1'
                value={AUTH_METHODS.ptc}
                checked={this.state.authMethod === AUTH_METHODS.ptc}
                onChange={this._handleChangeAuth}
              />
              <label htmlFor='auth1'>PTC</label>
              <span className="toggle-outside"><span className="toggle-inside"></span></span>
            </div>

            <input
              type='text'
              placeholder='Username'
              ref='username'
              onKeyPress={this._handleEnterKey}
              defaultValue={credentials.username || ''}
            />
            <input
              type='password'
              placeholder='Password'
              ref='password'
              onKeyPress={this._handleEnterKey}
              defaultValue={credentials.password || ''}
            />

            <div className='checkbox_container noselect'>
              <input
                type='checkbox'
                id='remember-cb'
                defaultChecked={credentials.success || false}
                ref='rememberMe'
              />
              <label className='pointer' htmlFor='remember-cb'>{" Remember me"}</label>
              <input
                type='button'
                id='login-btn'
                value='Login'
                onClick={this._handleLogin}
              />
            </div>
          </form>
        </div>
      </div>
    )
  },

  _handleChangeAuth (e) {
    this.setState({
      authMethod: e.target.value
    })
  },

  _handleEnterKey (e) {
    if (e.key === 'Enter') this._handleLogin()
  },

  _handleLogin () {
    let method = this.state.authMethod
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
})

export default Login
