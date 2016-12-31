import React, {
  PropTypes
} from 'react'

import utils from '../../../utils'

const QuickMove = React.createClass({
  displayName: 'Evolutions',

  propTypes: {
    evolutionIds: PropTypes.node.isRequired
  },

  render() {
    const {
      evolutionIds,
    } = this.props

    if (!evolutionIds) return null

    const title = evolutionIds.length > 1 ? 'Evolutions' : 'Evolution'

    const evolveInfoItems = evolutionIds.map((id) => {
      const name = utils.getName(id)
      const evolution = name.toLowerCase()

      return (
        <div
          key={id}
          className="pokemon-evolve-info-item"
        >
          <div className="pokemon-sprite">
            <img
              alt={`${evolution} sprite`}
              className="pokemon-avatar-sprite"
              src={`./imgs/pokemonSprites/${id || 0}.png`}
            />
          </div>
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
