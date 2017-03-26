import React, {
  PropTypes
} from 'react'
import { ipcRenderer } from 'electron'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  ProgressBar,
  InputGroup,
  FormControl,
  FormGroup,
  OverlayTrigger,
  Tooltip,
  ButtonGroup,
  Button,
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

const hashKeyTooltip = (
  <Tooltip id="hashKeyTooltip">
    This is the only way to interact with the API.
    Hash Keys currently have varying costs based on your Requests per Minute.
  </Tooltip>
)

const apiVersionTooltip = (
  <Tooltip id="apiVersionTooltip">
    Use specific API Version, 0.53 is 5300, 0.57.4 is 5704, etc.
  </Tooltip>
)

class LoginForm extends React.Component {
  static displayName = 'LoginForm'

  static propTypes = {
    credentials: PropTypes.object,
    checkAndDeleteCredentials: PropTypes.func.isRequired,
    saveAccountCredentials: PropTypes.func.isRequired,
    login: PropTypes.func.isRequired,
    authenticating: PropTypes.bool.isRequired,
  }

  state = {
    authMethod: this.props.credentials.method || AUTH_METHODS.google
  }

  render() {
    const {
      credentials,
      authenticating,
    } = this.props

    const isGoogleActive = this.state.authMethod === AUTH_METHODS.google
    const isPTCActive = this.state.authMethod === AUTH_METHODS.ptc

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
        <FormGroup>
          <ButtonGroup data-toggle="buttons">
            <Button
              className="noselect"
              bsStyle="info"
              htmlFor="authGoogle"
              active={isGoogleActive}
              onClick={this.radioLabelClick.bind(this, AUTH_METHODS.google)}
            >
              <input
                type="radio"
                name="auth-radio"
                id="authGoogle"
                ref={(c) => { this[AUTH_METHODS.google] = c }}
                value={AUTH_METHODS.google}
                defaultChecked={isGoogleActive}
                onChange={this.handleChangeAuth}
              />
              Google
            </Button>
            <Button
              className="noselect"
              bsStyle="info"
              htmlFor="authPTC"
              active={isPTCActive}
              onClick={this.radioLabelClick.bind(this, AUTH_METHODS.ptc)}
            >
              <input
                type="radio"
                name="auth-radio"
                id="authPTC"
                ref={(c) => { this[AUTH_METHODS.ptc] = c }}
                value={AUTH_METHODS.ptc}
                defaultChecked={isPTCActive}
                onChange={this.handleChangeAuth}
              />
              Pokémon Trainer Club
            </Button>
          </ButtonGroup>
        </FormGroup>

        <FormGroup>
          <InputGroup>
            <InputGroup.Addon>
              <span className="fa fa-user" aria-hidden="true" />
            </InputGroup.Addon>
            <FormControl
              type="text"
              placeholder="Username"
              ref={(c) => { this.username = c }}
              onKeyPress={this.handleEnterKey}
              defaultValue={credentials.username || ''}
            />
            <InputGroup.Addon>
              <span className="fa fa-lock" aria-hidden="true" />
            </InputGroup.Addon>
            <FormControl
              type="password"
              placeholder="Password"
              ref={(c) => { this.password = c }}
              onKeyPress={this.handleEnterKey}
              defaultValue={credentials.password || ''}
            />
          </InputGroup>
        </FormGroup>

        <FormGroup>
          <InputGroup>
            <InputGroup.Addon>
              <OverlayTrigger placement="right" overlay={hashKeyTooltip}>
                <span className="fa fa-key" aria-hidden="true" />
              </OverlayTrigger>
            </InputGroup.Addon>
            <FormControl
              type="text"
              placeholder="Token required for API interactions"
              ref={(c) => { this.hashKey = c }}
              onKeyPress={this.handleEnterKey}
              defaultValue={credentials.hashingKey || ''}
            />

            <InputGroup.Addon>
              <OverlayTrigger placement="right" overlay={apiVersionTooltip}>
                <span className="fa fa-database" aria-hidden="true" />
              </OverlayTrigger>
            </InputGroup.Addon>
            <FormControl
              type="text"
              placeholder="5704"
              ref={(c) => { this.apiVersion = c }}
              onKeyPress={this.handleEnterKey}
              defaultValue={credentials.apiVersion || ''}
            />
          </InputGroup>
        </FormGroup>

        <FormGroup>
          <label htmlFor="remember-cb" className="pointer">
            <input
              type="checkbox"
              id="remember-cb"
              defaultChecked={(credentials.password && credentials.username) || false}
              ref={(c) => { this.rememberMe = c }}
            />
            {' Remember me'}
          </label>
          <FormControl
            type="button"
            className="btn btn-success pull-right"
            value="Login"
            onClick={this.handleLogin}
            style={{ width: 'auto' }}
          />
        </FormGroup>
      </div>
    )
  }

  radioLabelClick = (authMethod) => {
    const authButtonNode = findDOMNode(this[authMethod])
    authButtonNode.click()
  }

  handleChangeAuth = (e) => {
    this.setState({
      authMethod: e.target.value
    })
  }

  handleEnterKey = (e) => {
    if (e.key === 'Enter') this.handleLogin()
  }

  handleLogin = () => {
    if (this.props.authenticating) return

    const method = this.state.authMethod

    const username = findDOMNode(this.username).value
    const password = findDOMNode(this.password).value
    const hashingKey = findDOMNode(this.hashKey).value
    const rememberMe = findDOMNode(this.rememberMe).checked
    const apiVersion = findDOMNode(this.apiVersion).value

    if (!username) {
      ipcRenderer.send('error-message', 'A username is required to login.')
      return
    }

    if (!password) {
      ipcRenderer.send('error-message', 'A password is required to login.')
      return
    }

    if (!hashingKey) {
      ipcRenderer.send('error-message', 'A hashingKey is required to login.')
      return
    }

    const credentials = {
      method,
      username,
      password,
      hashingKey,
      apiVersion,
    }

    if (rememberMe) {
      this.props.saveAccountCredentials(credentials)
    } else {
      this.props.checkAndDeleteCredentials()
    }

    this.props.login(credentials)
  }
}


export default connect((state => ({
  authenticating: state.authenticate.authenticating,
})), (dispatch => bindActionCreators({
  checkAndDeleteCredentials,
  saveAccountCredentials,
  login
}, dispatch)))(LoginForm)
