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
    const initialCount = 0

    return monsters.species.reduce((sum, specie) => {
      if (specie.count > 0) {
        return sum + 1
      }

      return sum
    }, initialCount)
  },

  handlePokemonCounter(monsters) {
    const initialCount = monsters.eggs.length

    return monsters.species.reduce((sum, specie) => {
      if (specie.count > 0) {
        return sum + specie.pokemon.length
      }

      return sum
    }, initialCount)
  }

})

export default SpeciesPokemonCounter
