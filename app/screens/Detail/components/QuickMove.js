import React, {
  PropTypes
} from 'react'

import Tooltip from '../../Tooltip'

const QuickMove = React.createClass({
  displayName: 'QuickMove',

  propTypes: {
    move: PropTypes.object.isRequired,
    myMove: PropTypes.object.isRequired,
  },

  render() {
    const {
      move,
      myMove
    } = this.props

    const fastMoveTip = (<span>
      {`Move Duration: ${move.duration_ms}ms`}
      <br />
      {`Damage Window: ${move.damage_window_end_ms}ms`}
      <br />
      {`DPS: ${move.dps.toFixed(2)}`}
      <br />
      {`Energy Gain: ${move.energy_gain}`}
      <br />
      {`EGPS: ${move.egps.toFixed(2)}`}
    </span>)

    const thisMove = move.movement_id === myMove.movement_id ? 'pokemon-move-item mine' : 'pokemon-move-item notmine'

    return (
      <div className={thisMove}>
        <Tooltip
          wrapperClass="pokemon-move-item-text-area"
          message={fastMoveTip}
          placement="right"
          id="quick_move_tooltip"
          delayShow={100}
          show
        >
          <div className="pokemon-move-title">{`${move.name}`}</div>
          <div className={`pokemon-move-type ${move.type}`}>{`${move.type}`}</div>
        </Tooltip>
        <div className="pokemon-move-cost" />
        <div className="pokemon-move-damage">
          {`${move.power}`}
        </div>
      </div>
    )
  },

})

export default QuickMove
