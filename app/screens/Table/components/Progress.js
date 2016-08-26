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

    if (!progress.selectedPokemon) return null

    let currentPosition = 0

    if (progress.current) {
      const index = progress.selectedPokemon.findIndex((p) => p.id === progress.current.id)
      currentPosition = index + 1
    }

    const now = (currentPosition / progress.selectedPokemon.length) * 100

    return (
      <ProgressBar
        active
        now={now}
        label={`${now}%`}
      />
    )
  }
})

export default connect(state => ({ progress: state.progress }))(Progress)
