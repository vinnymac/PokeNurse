import React, {
  PropTypes
} from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {
  FormGroup,
  Checkbox,
  HelpBlock,
} from 'react-bootstrap'

import {
  toggleShowSpeciesWithZeroPokemon,
  resetAllSettings,
  checkAndDeleteCredentials,
  toggleAutoLogin,
} from '../../../actions'

function SettingFieldGroupCheckbox({ label, help, ...props }) {
  return (
    <FormGroup>
      <Checkbox {...props} >
        {label}
      </Checkbox>
      {help && <HelpBlock>{help}</HelpBlock>}
    </FormGroup>
  )
}

SettingFieldGroupCheckbox.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  help: PropTypes.string,
}

const ModalBody = React.createClass({
  displayName: 'ModalBody',

  propTypes: {
    toggleShowSpeciesWithZeroPokemon: PropTypes.func.isRequired,
    resetAllSettings: PropTypes.func.isRequired,
    checkAndDeleteCredentials: PropTypes.func.isRequired,
    showSpeciesWithZeroPokemon: PropTypes.bool.isRequired,
    toggleAutoLogin: PropTypes.func.isRequired,
    autoLogin: PropTypes.bool.isRequired,
  },

  render() {
    return (
      <div className="modal-body" >
        <SettingFieldGroupCheckbox
          label="Display Uncaught Species"
          checked={this.props.showSpeciesWithZeroPokemon}
          help="If you have no Mew, this will display them when enabled."
          onChange={this.handleToggleShowAllSpecies}
          id="displayUncaught"
        />
        <SettingFieldGroupCheckbox
          label="Automatically Login"
          checked={this.props.autoLogin}
          help="Authenticate with saved credentials on launch."
          onChange={this.handleToggleAutoLogin}
          id="autoLogin"
        />
        <div className="form-group">
          <button
            type="button"
            className="btn btn-danger"
            onClick={this.handleDeleteCredentials}
          >
            Delete Stored Login Credentials
          </button>
        </div>
        <div className="form-group">
          <button
            type="button"
            className="btn btn-danger"
            onClick={this.handleReset}
          >
            Reset All Settings
          </button>
        </div>
      </div>
    )
  },

  handleToggleAutoLogin() {
    this.props.toggleAutoLogin()
  },

  handleToggleShowAllSpecies() {
    this.props.toggleShowSpeciesWithZeroPokemon()
  },

  handleReset() {
    this.props.resetAllSettings()
  },

  handleDeleteCredentials() {
    this.props.checkAndDeleteCredentials()
  },
})


export default connect((state => ({
  showSpeciesWithZeroPokemon: state.settings.showSpeciesWithZeroPokemon,
  autoLogin: state.settings.autoLogin,
})), (dispatch => bindActionCreators({
  toggleShowSpeciesWithZeroPokemon,
  resetAllSettings,
  checkAndDeleteCredentials,
  toggleAutoLogin,
}, dispatch)))(ModalBody)
