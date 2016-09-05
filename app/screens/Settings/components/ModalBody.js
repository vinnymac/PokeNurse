import React, {
  PropTypes
} from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import {
  toggleShowSpeciesWithZeroPokemon,
  resetAllSettings,
  checkAndDeleteCredentials,
} from '../../../actions'

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
        <div className="btn-group">
          <button
            type="button"
            className="btn btn-primary"
            onClick={this.handleToggleShowAllSpecies}
          >
            Toggle Caught Species
          </button>
        </div>
        <div className="btn-group">
          <button
            type="button"
            className="btn btn-danger"
            onClick={this.handleDeleteCredentials}
          >
            Delete Stored Login Credentials
          </button>
        </div>
        <div className="btn-group">
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
