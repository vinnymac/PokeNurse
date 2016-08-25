import React, {
  PropTypes
} from 'react'
// import {
//   ipcRenderer
// } from 'electron'
import {
  ProgressBar
} from 'react-bootstrap'

import {
  connect
} from 'react-redux'

const Progress = React.createClass({
  displayName: 'Progress',

  propTypes: {
    now: PropTypes.number
  },

  render() {
    const {
      now
    } = this.props

    return (
      <ProgressBar
        now={now}
        label={`${now}%`}
      />
    )
  }
})

export default connect(state => ({ progress: state.progress }))(Progress)
