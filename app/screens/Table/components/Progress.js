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
    progress: PropTypes.object
  },

  render() {
    const {
      progress
    } = this.props

    return (
      <ProgressBar
        now={progress.now}
        label={`${progress.now}%`}
      />
    )
  }
})

export default connect(state => ({ progress: state.progress }))(Progress)
