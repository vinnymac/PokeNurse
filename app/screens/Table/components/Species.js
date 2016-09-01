import React, {
  PropTypes
} from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import every from 'lodash/every'

import {
  updateMonsterSort,
  updateSpecies,
  sortSpecies
} from '../../../actions'

import PokemonTable from './Pokemon'

const Species = React.createClass({
  displayName: 'Species',

  propTypes: {
    updateCheckedCount: PropTypes.func,
    sortBy: PropTypes.string,
    sortDir: PropTypes.string,
    filterBy: PropTypes.string,
    sortSpeciesBy: PropTypes.func,
    sortSpecies: PropTypes.func.isRequired,
    monsters: PropTypes.object.isRequired,
    updateMonsterSort: PropTypes.func.isRequired,
    showSpeciesWithZeroPokemon: PropTypes.bool.isRequired,
    updateSpecies: PropTypes.func.isRequired,
    speciesState: PropTypes.object
  },

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
  },

  getSpeciesHeader() {
    return (<tr>
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
    </tr>)
  },

  getSpeciesBody(monsterSpecies) {
    const {
      filterBy,
      showSpeciesWithZeroPokemon,
      speciesState
    } = this.props

    return monsterSpecies.map((specie, i) => {
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

      return ([
        <tr
          className={collapsed ? '' : 'shown'}
          key={`header${specie.pokemon_id}`}
        >
          <td
            className={specie.count > 0 ? 'details-control' : ''}
            onClick={this.handleCollapse.bind(this, specie)}
          />
          <td>{specie.pokemon_id}</td>
          <td className="sprites">
            <img
              alt="sprite"
              className="pokemon-avatar-sprite"
              src={`./imgs/pokemonSprites/${specie.pokemon_id || 0}.png`}
            />
          </td>
          <td>{specie.name}</td>
          <td>{specie.count}</td>
          <td>{specie.candy}</td>
          <td>{specie.evolves}</td>
        </tr>, this.getPokemonTable(specie, i, sortBy, sortDir, collapsed, pokemonState, checkAll)
      ])
    })
  },

  getPokemonTable(species, index, sortBy, sortDir, collapsed, pokemonState, checkAll) {
    if (collapsed) return null

    return (<PokemonTable
      sortPokemonBy={this.sortPokemonBy}
      sortBy={sortBy}
      sortDir={sortDir}
      species={species}
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

  updateSpeciesState(id, updater) {
    const {
      speciesState
    } = this.props
    const newSpecieState = {}
    const existingSpecieState = speciesState[String(id)]

    newSpecieState[String(id)] = Object.assign(
      {},
      existingSpecieState,
      updater(existingSpecieState)
    )

    return Object.assign({}, speciesState, newSpecieState)
  },

  updatePokemonState(speciesState, pid, updater) {
    const existingPokemonByIdState = speciesState.pokemonState[String(pid)]

    const newPokemonByIdState = {}
    newPokemonByIdState[String(pid)] = Object.assign(
      {},
      existingPokemonByIdState,
      updater(existingPokemonByIdState)
    )
    return Object.assign({}, speciesState.pokemonState, newPokemonByIdState)
  },

  // TODO: This should be an action
  sortPokemonBy(newSortBy, speciesIndex) {
    const {
      speciesState
    } = this.props

    const pokemonId = this.props.monsters.species[speciesIndex].pokemon_id

    const {
      sortBy,
      sortDir
    } = speciesState[pokemonId]

    let newSortDir = null

    if (newSortBy === sortBy) {
      newSortDir = sortDir === 'ASC' ? 'DESC' : 'ASC'
    } else {
      newSortDir = 'DESC'
    }

    this.props.sortSpecies({
      pokemonId,
      sortDir: newSortDir,
      sortBy: newSortBy,
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

  // TODO: This should be an action
  handleCollapse(specie) {
    if (specie.count < 1) return

    this.props.updateMonsterSort({
      species: this.updateSpeciesState(specie.pokemon_id, (speciesState) => {
        const newCollapsed = !speciesState.collapsed

        return { collapsed: newCollapsed }
      })
    })
  },

  // TODO: This should be an action
  handleCheckAll(species) {
    this.props.updateMonsterSort({
      species: this.updateSpeciesState(species.pokemon_id, (speciesState) => {
        const newCheckAllState = !speciesState.checkAll
        const newPokemonState = {}
        const ids = Object.keys(speciesState.pokemonState)

        ids.forEach(id => {
          if (newCheckAllState !== speciesState.pokemonState[id].check) {
            this.props.updateCheckedCount(newCheckAllState ? 1 : -1)
          }

          newPokemonState[id] = Object.assign(
            {},
            speciesState.pokemonState[id],
            { check: newCheckAllState }
          )
        })

        return {
          checkAll: newCheckAllState,
          pokemonState: newPokemonState
        }
      })
    })
  },

  // TODO: This should be an action
  handleCheckedChange(pokemon) {
    this.props.updateMonsterSort({
      speciesState: this.updateSpeciesState(
        String(pokemon.pokemon_id),
        (speciesState) => {
          const updatedPokemonState = this.updatePokemonState(
            speciesState,
            String(pokemon.id),
            (pokemonState) => {
              const newChecked = !pokemonState.check
              this.props.updateCheckedCount(newChecked ? 1 : -1)
              return { check: newChecked }
            }
          )

          return {
            checkAll: every(updatedPokemonState, { check: true }),
            pokemonState: updatedPokemonState
          }
        }
      )
    })
  },

  handleSortSpecies(sortBy) {
    this.props.sortSpeciesBy(sortBy)
  },

  // TODO: This should be an action
  toggleShowAllSpecies() {
    this.props.updateMonsterSort({
      showSpeciesWithZeroPokemon: !this.props.showSpeciesWithZeroPokemon
    })
  }

})

export default connect((state => ({
  showSpeciesWithZeroPokemon: state.trainer.showSpeciesWithZeroPokemon,
  speciesState: state.trainer.speciesState,
})), (dispatch => bindActionCreators({
  updateMonsterSort,
  updateSpecies,
  sortSpecies
}, dispatch)))(Species)
