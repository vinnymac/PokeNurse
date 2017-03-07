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

class Species extends React.Component {
  static displayName = 'Species'

  static propTypes = {
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
  }

  render() {
    const {
      monsters
    } = this.props

    return (
      <div className="row">
        <div className="col-md-12">
          <table className="table table-condensed table-hover display no-footer">
            <thead>
              {this.getSpeciesHeader()}
            </thead>
            <tbody>
              {this.getSpeciesBody(monsters.species)}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  getSpeciesHeader = () =>
    <tr>
      <th />
      <th
        className={this.getSortDirectionClassName('pokemon_id')}
        tabIndex="0"
        rowSpan="1"
        colSpan="1"
        aria-controls="pokemon-data"
        aria-label="Pokédex #: activate to sort column ascending"
        onClick={this.handleSortSpecies.bind(this, 'pokemon_id')}
      >
        Pokédex #
      </th>
      <th>
        Sprite
      </th>
      <th
        className={this.getSortDirectionClassName('name')}
        tabIndex="0"
        rowSpan="1"
        colSpan="1"
        aria-controls="pokemon-data"
        aria-label="Name: activate to sort column ascending"
        onClick={this.handleSortSpecies.bind(this, 'name')}
      >
        Name
      </th>
      <th
        className={this.getSortDirectionClassName('count')}
        tabIndex="0"
        rowSpan="1"
        colSpan="1"
        aria-controls="pokemon-data"
        aria-label="Count: activate to sort column ascending"
        onClick={this.handleSortSpecies.bind(this, 'count')}
      >
        Count
      </th>
      <th
        className={this.getSortDirectionClassName('candy')}
        tabIndex="0"
        rowSpan="1"
        colSpan="1"
        aria-controls="pokemon-data"
        aria-label="Candy: activate to sort column ascending"
        onClick={this.handleSortSpecies.bind(this, 'candy')}
      >
        Candy
      </th>
      <th
        className={this.getSortDirectionClassName('evolves')}
        tabIndex="0"
        rowSpan="1"
        colSpan="1"
        aria-controls="pokemon-data"
        aria-label="Evolves: activate to sort column ascending"
        onClick={this.handleSortSpecies.bind(this, 'evolves')}
      >
        Evolves
      </th>
    </tr>

  getSpeciesBody = (monsterSpecies) => {
    const {
      filterBy,
      showSpeciesWithZeroPokemon,
      speciesState
    } = this.props

    return monsterSpecies.map((specie) => {
      if (!showSpeciesWithZeroPokemon && specie.count < 1) {
        return null
      }
      if (String(specie.name).toLowerCase().indexOf(filterBy) === -1) {
        return null
      }

      const {
        collapsed,
        pokemonState,
        checkAll,
        sortBy,
        sortDir
      } = speciesState[specie.pokemon_id]

      let extraCandyNeededSpan
      let extraPokemonNeededSpan

      if (specie.evolves > 0) {
        const totalCandyNeeded = (specie.candyToEvolve - 1) * specie.count + 1
        const extraCandyNeeded = totalCandyNeeded - specie.candy
        const extraPokemonNeeded = Math.floor((extraCandyNeeded * -1) / (specie.candyToEvolve - 1))

        if (extraCandyNeeded > 0) {
          extraCandyNeededSpan = (
            <span
              className="additional-info"
              alt="Extra candy required to evolve all pokemon"
            >
              {` +${extraCandyNeeded}`}
            </span>
          )
        } else if (extraPokemonNeeded > 0 && extraCandyNeeded < 0) {
          extraPokemonNeededSpan = (
            <span
              className="additional-info"
              alt="Extra pokemon required to use all candy"
            >
              {` +${extraPokemonNeeded}`}
            </span>
          )
        }
      }

      return ([
        <tr
          className={collapsed ? '' : 'shown'}
          key={`header${specie.pokemon_id}`}
        >
          <td
            className={specie.count > 0 ? 'details-control' : ''}
            onClick={this.createCollapseHandler(specie)}
          />
          <td>{specie.pokemon_id}</td>
          <td className="sprites">
            <img
              alt={`${specie.name} sprite`}
              className="pokemon-avatar-sprite"
              src={`./imgs/pokemonSprites/${specie.pokemon_id || 0}.png`}
            />
          </td>
          <td>{specie.name}</td>
          <td>
            <span>
              {specie.count}
            </span>
            {extraPokemonNeededSpan}
          </td>
          <td>
            <span>
              {specie.candy}
            </span>
            {extraCandyNeededSpan}
          </td>
          <td>{specie.evolves}</td>
        </tr>, this.getPokemonTable(specie, sortBy, sortDir, collapsed, pokemonState, checkAll)
      ])
    })
  }

  getPokemonTable = (species, sortBy, sortDir, collapsed, pokemonState, checkAll) => {
    if (collapsed) return null

    return (
      <tr className="child" key={`sub${species.pokemon_id}`}>
        <td colSpan="7">
          <PokemonTable
            sortPokemonBy={this.sortPokemonBy}
            sortBy={sortBy}
            sortDir={sortDir}
            species={species}
            pokemon={species.pokemon}
            getPokemonState={() => pokemonState}
            checkAll={checkAll}
            onCheckedChange={this.handleCheckedChange}
            onCheckAll={this.handleCheckAll}
            key={`child${species.pokemon_id}`}
          />
        </td>
      </tr>
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

  createCollapseHandler = (specie) => () => {
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
})), (dispatch => bindActionCreators({
  updateMonsterSort,
  updateSpecies,
  sortSpecies,
  checkPokemon,
  checkAllBySpecies,
  collapseBySpecies,
  sortAllSpecies,
}, dispatch)))(Species)
