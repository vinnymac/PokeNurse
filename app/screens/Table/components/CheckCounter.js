import React, {
  PropTypes
} from 'react'
import { connect } from 'react-redux'

const CheckCounter = React.createClass({
  displayName: 'CheckCounter',

  propTypes: {
    selectedCount: PropTypes.number.isRequired
  },

  render() {
    const {
      selectedCount
    } = this.props

    return (
      <span>
        Selected: {selectedCount}
      </span>
    )
  }
})

export default connect(state => ({
  selectedCount: state.trainer.selectedCount
}))(CheckCounter)
