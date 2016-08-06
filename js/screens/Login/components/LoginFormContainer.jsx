import React from 'react';

const Login = React.createClass({
  render() {
    return (
      <div className="container">
        <div className="form-group btn-group" data-toggle="buttons">
          <label className="btn btn-info active noselect">
            <input type="radio" name="auth-radio" id="auth0" value="google" defaultChecked/>
            Google
          </label>
          <label className="btn btn-info noselect">
            <input type="radio" name="auth-radio" id="auth1" value="ptc"/>
            Pokémon Trainer Club
          </label>
        </div>

        <div className="form-group input-group">
          <span className="input-group-addon"><span className="glyphicon glyphicon-user" aria-hidden="true"></span></span>
          <input type="text" className="form-control" id="username-txt" placeholder="Username"/>
        </div>

        <div className="form-group input-group">
          <span className="input-group-addon"><span className="glyphicon glyphicon-lock" aria-hidden="true"></span></span>
          <input type="password" className="form-control" id="password-txt" placeholder="Password"/>
        </div>

        <div className="form-group">
          <label htmlFor="remember-cb" className="pointer">
            <input type="checkbox" id="remember-cb"/>
            Remember me
          </label>
          <input type="button" className="btn btn-success pull-right" id="login-btn" value="Login"/>
        </div>
      </div>
    );
  }
});

export default Login
