import React from 'react'
// import {
//   ipcRenderer
// } from 'electron'
import {
  ProgressBar
} from 'react-bootstrap'

const Progress = React.createClass({
  displayName: 'Progress',

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

export default Progress
