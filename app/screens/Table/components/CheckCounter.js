import React, {
  PropTypes
} from 'react'
import { connect } from 'react-redux'

class CheckCounter extends React.Component {
  static displayName = 'CheckCounter'

  static propTypes = {
    selectedCount: PropTypes.number.isRequired
  }

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
}

export default connect(state => ({
  selectedCount: state.trainer.selectedCount
}))(CheckCounter)
