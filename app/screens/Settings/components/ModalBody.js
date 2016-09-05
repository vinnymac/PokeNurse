import React, {
  PropTypes
} from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import {
  toggleShowSpeciesWithZeroPokemon,
  resetAllSettings,
} from '../../../actions'

const ModalBody = React.createClass({
  displayName: 'ModalBody',

  propTypes: {
    toggleShowSpeciesWithZeroPokemon: PropTypes.func.isRequired,
    resetAllSettings: PropTypes.func.isRequired,
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
})


export default connect(null, (dispatch => bindActionCreators({
  toggleShowSpeciesWithZeroPokemon,
  resetAllSettings,
}, dispatch)))(ModalBody)
