import React, {
  PropTypes,
  Component,
} from 'react'
import {
  ProgressBar
} from 'react-bootstrap'

class Progress extends Component {
  static displayName = 'Progress'

  static propTypes = {
    progress: PropTypes.object
  }

  render() {
    const {
      progress
    } = this.props

    // Indeterminate Progress + Label
    let now = 100
    let label = ''

    // Determinate Progress + Label
    if (progress.selectedPokemon) {
      let currentPosition = 0

      if (progress.current) {
        const index = progress.selectedPokemon.findIndex((p) => p.id === progress.current.id)
        currentPosition = index
      }

      now = (currentPosition / progress.selectedPokemon.length) * 100
      label = `${now.toFixed(0)}%`
    }

    return (
      <ProgressBar
        active
        now={now}
        label={label}
      />
    )
  }
}

export default Progress
