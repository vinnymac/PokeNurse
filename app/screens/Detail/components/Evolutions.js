import React, {
  PropTypes
} from 'react'

const QuickMove = React.createClass({
  displayName: 'Evolutions',

  propTypes: {
    evolvesTo: PropTypes.node.isRequired
  },

  render() {
    const {
      evolvesTo
    } = this.props

    if (!evolvesTo) return null

    const evolutions = evolvesTo.split('/')

    const title = evolutions.length > 1 ? 'Evolutions' : 'Evolution'

    const evolveInfoItems = evolutions.map((evolve) => {
      const evolution = evolve.toLowerCase()

      return (
        <div className="pokemon-evolve-info-item">
          <div className={`pokemon-sprite ${evolution}`} />
          <div className="pokemon-evolve-info-item-title">{evolution}</div>
        </div>
      )
    })

    return (
      <div id="pokemon_evolve_info">
        <div className="pokemon-evolve-info-title">{title}</div>
        {evolveInfoItems}
      </div>
    )
  },

})

export default QuickMove
