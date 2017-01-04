import React, {
  PropTypes
} from 'react'
import {
  times
} from 'lodash'

import Tooltip from '../../Tooltip'

const CinematicMove = React.createClass({
  displayName: 'CinematicMove',

  propTypes: {
    move: PropTypes.object.isRequired,
    myMove: PropTypes.object.isRequired,
  },

  render() {
    const {
      move,
      myMove
    } = this.props

    const chargeMoveStyle = { width: `${move.energy_cost}px` }

    const chargedMoveBars = times(Math.floor(100 / move.energy_cost), (i) =>
      <div key={i} className="pokemon-move-cost-item" style={chargeMoveStyle} />
    )

    const critChance = move.critical_chance * 100

    const chargedMoveTip = (<span>
      {`Duration: ${move.duration_ms}ms`}
      <br />
      {`DPS: ${move.dps.toFixed(2)}`}
      <br />
      {`Dodge Window: ${move.dodge_window_ms}ms`}
      <br />
      {`Crit Chance: ${critChance.toFixed(2)}%`}
    </span>)

    const thisMove = move.movement_id === myMove.movement_id ? 'pokemon-move-item mine' : 'pokemon-move-item notmine'

    return (
      <div className={thisMove}>
        <Tooltip
          wrapperClass="pokemon-move-item-text-area"
          message={chargedMoveTip}
          placement="right"
          id="charged_move_tooltip"
          delayShow={100}
          show
        >
          <div className="pokemon-move-title">{`${move.name}`}</div>
          <div className={`pokemon-move-type ${move.type}`}>{`${move.type}`}</div>
        </Tooltip>
        <div className="pokemon-move-cost">
          {chargedMoveBars}
        </div>
        <div className="pokemon-move-damage">
          {`${move.power}`}
        </div>
      </div>
    )
  },
})

export default CinematicMove
