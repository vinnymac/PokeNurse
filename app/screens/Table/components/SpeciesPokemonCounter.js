import React, {
  PropTypes
} from 'react'

const SpeciesPokemonCounter = React.createClass({
  displayName: 'SpeciesCounter',

  propTypes: {
    monsters: PropTypes.object.isRequired
  },

  render() {
    const {
      monsters
    } = this.props

    return (
      <span>
        <p>
          <span>
          Species: {this.handleSpeciesRecount(monsters)}
          </span>
        </p>
        <p>
          <span>
            Pokemon: {this.handlePokemonCounter(monsters)}
          </span>
        </p>
      </span>
    )
  },

  handleSpeciesRecount(monsters) {
    let counter = 0
    for (let i = 0; i < monsters.species.length; i++) {
      const species = monsters.species[i]
      if (species.count > 0) {
        counter += 1
      }
    }

    return counter
  },

  handlePokemonCounter(monsters) {
    let counter = 0
    for (let i = 0; i < monsters.species.length; i++) {
      const species = monsters.species[i]
      if (species.count > 0) {
        counter += species.pokemon.length
      }
    }

    return counter + monsters.eggs.length
  }

})

export default SpeciesPokemonCounter
