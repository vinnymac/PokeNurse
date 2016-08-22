import React, {
  PropTypes
} from 'react'
import $ from 'jquery'



const CinematicMove = React.createClass({
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

    let chargedMoveBars = []

    for (let i = 0; i < Math.floor(100 / move.energyCost); i++) {
      chargedMoveBars.push(<div key={i} className="pokemon-move-cost-item" style={{ width: `${move.energyCost}px` }} />)
    }

    let chargedMoveTip = `
      Duration: ${move.durationMs}ms <br>
      Dodge Window: ${move.dodgeWindowMs}ms <br>
      Crit Chance: ${move.crit * 100}%
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
          title={chargedMoveTip}
        >
          <div className="pokemon-move-title">{`${move.name}`}</div>
          <div className="pokemon-move-type ${move.type}">{`${move.type}`}</div>
        </div>
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
