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
        <span className="ib">
          Species: {this.handleSpeciesRecount(monsters)}
        </span>
        {' | '}
        <span className="ib">
          Pokemon: {this.handlePokemonCounter(monsters)}
        </span>
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
