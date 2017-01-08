import React, {
  PropTypes
} from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import {
  updateMonsterSort,
  updateSpecies,
  sortSpecies,
  checkPokemon,
  checkAllBySpecies,
  collapseBySpecies,
  sortAllSpecies,
} from '../../../actions'

import Pokemon from './Pokemon'

const Species = React.createClass({
  displayName: 'PokemonTable',

  propTypes: {
    sortBy: PropTypes.string,
    sortDir: PropTypes.string,
    filterBy: PropTypes.string,
    sortSpecies: PropTypes.func.isRequired,
    monsters: PropTypes.object.isRequired,
    updateMonsterSort: PropTypes.func.isRequired,
    showSpeciesWithZeroPokemon: PropTypes.bool.isRequired,
    updateSpecies: PropTypes.func.isRequired,
    speciesState: PropTypes.object,
    checkPokemon: PropTypes.func.isRequired,
    checkAllBySpecies: PropTypes.func.isRequired,
    collapseBySpecies: PropTypes.func.isRequired,
    sortAllSpecies: PropTypes.func.isRequired,
  },

  render() {
    const {
      monsters
    } = this.props

    return (
      <div className="row">
        <div className="col-md-12">
          {this.getSpeciesBody(monsters.species)}
        </div>
      </div>
    )
  },

  getSpeciesBody(monsterSpecies) {
    const {
      filterBy,
      // showSpeciesWithZeroPokemon,
      speciesState
    } = this.props

    return monsterSpecies.map((specie, i) => {
      // if (!showSpeciesWithZeroPokemon && specie.count < 1) {
      //   return null
      // }
      if (String(specie.name).toLowerCase().indexOf(filterBy) === -1) {
        return null
      }

      const {
        // collapsed,
        pokemonState,
        checkAll,
        sortBy,
        sortDir
      } = speciesState[specie.pokemon_id]

      return this.getPokemonTable(specie, i, sortBy, sortDir, pokemonState, checkAll)
    })
  },

  getPokemonTable(species, index, sortBy, sortDir, pokemonState, checkAll) {
    return (<Pokemon
      sortPokemonBy={this.sortPokemonBy}
      sortBy={sortBy}
      sortDir={sortDir}
      species={species}
      pokemon={species.pokemon}
      speciesIndex={index}
      pokemonState={pokemonState}
      checkAll={checkAll}
      onCheckedChange={this.handleCheckedChange}
      onCheckAll={this.handleCheckAll}
      key={`child${species.pokemon_id}`}
            />)
  },

  getSortDirectionClassName(key) {
    const {
      sortBy,
      sortDir
    } = this.props

    if (sortBy === key) {
      return sortDir === 'ASC' ? 'sorting_asc' : 'sorting_desc'
    }

    return 'sorting'
  },

  sortPokemonBy(sortBy, speciesIndex) {
    this.props.sortSpecies({
      speciesIndex,
      sortBy,
    })
  },

  getSortState(specie) {
    const {
      speciesState
    } = this.props

    const {
      sortBy,
      sortDir
    } = speciesState[specie.pokemon_id]

    return { sortBy, sortDir }
  },

  handleCollapse(specie) {
    this.props.collapseBySpecies(specie)
  },

  handleCheckAll(species) {
    this.props.checkAllBySpecies(species)
  },

  handleCheckedChange(pokemon) {
    this.props.checkPokemon(pokemon)
  },

  handleSortSpecies(newSortBy) {
    this.props.sortAllSpecies(newSortBy)
  },

})

export default connect((state => ({
  showSpeciesWithZeroPokemon: state.settings.showSpeciesWithZeroPokemon,
  speciesState: state.trainer.speciesState,
  monsters: state.trainer.monsters,
})), (dispatch => bindActionCreators({
  updateMonsterSort,
  updateSpecies,
  sortSpecies,
  checkPokemon,
  checkAllBySpecies,
  collapseBySpecies,
  sortAllSpecies,
}, dispatch)))(Species)
