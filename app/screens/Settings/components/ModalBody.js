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
} from '../../../actions'

function SettingFieldGroupCheckbox({ id, label, help, ...props }) {
  return (
    <FormGroup controlId={id}>
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
  },

  render() {
    return (
      <div className="modal-body" >
        <SettingFieldGroupCheckbox
          label="Display Uncaught Species"
          checked={this.props.showSpeciesWithZeroPokemon}
          help="If you have no Mew, this will display them when enabled."
          onClick={this.handleToggleShowAllSpecies}
          id="displayUncaught"
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
  showSpeciesWithZeroPokemon: state.settings.showSpeciesWithZeroPokemon
})), (dispatch => bindActionCreators({
  toggleShowSpeciesWithZeroPokemon,
  resetAllSettings,
  checkAndDeleteCredentials,
}, dispatch)))(ModalBody)
