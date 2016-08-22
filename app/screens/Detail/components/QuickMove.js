import React, {
  PropTypes
} from 'react'
import $ from 'jquery'

const QuickMove = React.createClass({
  propTypes: {
    move: PropTypes.object.isRequired,
    myMove: PropTypes.object.isRequired,
  },

  componentDidMount() {
    $(this.tooltip).tooltip()
  },
  componentDidUpdate() {
    $(this.tooltip).tooltip()
  },

  render() {
    const {
      move,
      myMove
    } = this.props

    let fastMoveTip = `
      Move Duration: ${move.durationMs}ms <br>
      Damage Window: ${move.damageWindowMs}ms <br>
      No STAB DPS: ${move.dps} <br>
      Energy Gain(EG): ${move.energyGain} <br>
      EGPS: ${move.energyGainPerSecond}
    `
    const thisMove = move === myMove ? 'pokemon-move-item mine' : 'pokemon-move-item notmine'

    return (
      <div className={thisMove}>
        <div
          className="pokemon-move-item-text-area"
          ref={(c) => { this.tooltip = c }}
          data-toggle="tooltip"
          data-placement="right"
          data-html="true"
          title={fastMoveTip}
        >
          <div className="pokemon-move-title">{`${move.name}`}</div>
          <div className="pokemon-move-type ${move.type}">{`${move.type}`}</div>
        </div>
        <div className="pokemon-move-cost" />
        <div className="pokemon-move-damage">
          {`${move.power}`}
        </div>
      </div>
    )
  },

})

export default QuickMove
