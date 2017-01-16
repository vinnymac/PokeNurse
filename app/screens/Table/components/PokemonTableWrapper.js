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

import PokemonTable from './PokemonTable'

class PokemonTableWrapper extends React.Component {
  static displayName = 'PokemonTableWrapper'

  static propTypes = {
    sortBy: PropTypes.string,
    sortDir: PropTypes.string,
    filterBy: PropTypes.string,
    sortSpecies: PropTypes.func.isRequired,
    monsters: PropTypes.object.isRequired,
    pokemon: PropTypes.array.isRequired,
    updateMonsterSort: PropTypes.func.isRequired,
    showSpeciesWithZeroPokemon: PropTypes.bool.isRequired,
    updateSpecies: PropTypes.func.isRequired,
    speciesState: PropTypes.object,
    checkPokemon: PropTypes.func.isRequired,
    checkAllBySpecies: PropTypes.func.isRequired,
    collapseBySpecies: PropTypes.func.isRequired,
    sortAllSpecies: PropTypes.func.isRequired,
  }

  render() {
    return (
      <div className="row">
        <div className="col-md-12">
          {this.getSpeciesBody()}
        </div>
      </div>
    )
  }

  getSpeciesBody = () => {
    const {
      speciesState,
      pokemon,
      monsters,
    } = this.props

    const specie = monsters.species[0]

    const {
      checkAll,
      sortBy,
      sortDir
    } = speciesState[specie.pokemon_id]

    return (
      <PokemonTable
        sortPokemonBy={this.sortPokemonBy}
        sortBy={sortBy}
        sortDir={sortDir}
        species={specie}
        pokemon={pokemon}
        getPokemonState={(pid) => speciesState[pid].pokemonState}
        checkAll={checkAll}
        onCheckedChange={this.handleCheckedChange}
        onCheckAll={this.handleCheckAll}
        key={`child${specie.pokemon_id}`}
      />
    )
  }

  getSortDirectionClassName = (key) => {
    const {
      sortBy,
      sortDir
    } = this.props

    if (sortBy === key) {
      return sortDir === 'ASC' ? 'sorting_asc' : 'sorting_desc'
    }

    return 'sorting'
  }

  sortPokemonBy = (sortBy, speciesIndex) => {
    this.props.sortSpecies({
      speciesIndex,
      sortBy,
    })
  }

  getSortState = (specie) => {
    const {
      speciesState
    } = this.props

    const {
      sortBy,
      sortDir
    } = speciesState[specie.pokemon_id]

    return { sortBy, sortDir }
  }

  handleCollapse = (specie) => {
    this.props.collapseBySpecies(specie)
  }

  handleCheckAll = (species) => {
    this.props.checkAllBySpecies(species)
  }

  handleCheckedChange = (pokemon) => {
    this.props.checkPokemon(pokemon)
  }

  handleSortSpecies = (newSortBy) => {
    this.props.sortAllSpecies(newSortBy)
  }
}

export default connect((state => ({
  showSpeciesWithZeroPokemon: state.settings.showSpeciesWithZeroPokemon,
  speciesState: state.trainer.speciesState,
  monsters: state.trainer.monsters,
  // Flatten all species of pokemon into one giant array
  pokemon: state.trainer.monsters.species.reduce((a, b) => a.concat(b.pokemon), []),
})), (dispatch => bindActionCreators({
  updateMonsterSort,
  updateSpecies,
  sortSpecies,
  checkPokemon,
  checkAllBySpecies,
  collapseBySpecies,
  sortAllSpecies,
}, dispatch)))(PokemonTableWrapper)
