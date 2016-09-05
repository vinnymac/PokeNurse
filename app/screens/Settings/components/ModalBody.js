import React, {
  PropTypes
} from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import {
  toggleShowSpeciesWithZeroPokemon
} from '../../../actions'

const ModalBody = React.createClass({
  displayName: 'ModalBody',

  propTypes: {
    toggleShowSpeciesWithZeroPokemon: PropTypes.func.isRequired
  },

  render() {
    return (
      <div className="modal-body" >
        <input
          type="button"
          className="btn btn-primary"
          value="Toggle Caught Species"
          onClick={this.handleToggleShowAllSpecies}
        />
      </div>
    )
  },

  handleToggleShowAllSpecies() {
    this.props.toggleShowSpeciesWithZeroPokemon()
  },
})


export default connect(null, (dispatch => bindActionCreators({
  toggleShowSpeciesWithZeroPokemon
}, dispatch)))(ModalBody)
