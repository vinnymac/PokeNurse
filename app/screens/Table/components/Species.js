import React from 'react'
import PokemonTable from './Pokemon'

const Species = React.createClass({

  getInitialState() {
    const {
      monsters
    } = this.props

    const species = {}

    const sortBy = 'cp'
    const sortDir = 'DESC'

    for (const specie of monsters.species) {
      species[String(specie.pokemon_id)] = {
        pokemonState: this.getInitialPokemonState(specie),
        checkAll: false,
        collapsed: true,
        sortBy,
        sortDir
      }
    }

    return {
      species
    }
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
    const {
      sortSpeciesBy
    } = this.props

    return (<tr>
      <th></th>
      <th
        className={this.getSortDirectionClassName('pokemon_id')}
        tabIndex="0"
        rowSpan="1"
        colSpan="1"
        aria-controls="pokemon-data"
        aria-label="Pokédex #: activate to sort column ascending"
        onClick={this._handleSortSpecies.bind(this, 'pokemon_id')}
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
        onClick={this._handleSortSpecies.bind(this, 'name')}
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
        onClick={this._handleSortSpecies.bind(this, 'count')}
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
        onClick={this._handleSortSpecies.bind(this, 'candy')}
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
        onClick={this._handleSortSpecies.bind(this, 'evolves')}
      >
        Evolves
      </th>
    </tr>)
  },

  getSpeciesBody(monsterSpecies) {
    const {
      filterBy
    } = this.props

    const speciesState = this.state.species

    return monsterSpecies.map((specie, i) => {
      if (String(specie['name']).toLowerCase().indexOf(filterBy) === -1) {
        return null
      }

      let {
        collapsed,
        pokemonState,
        checkAll,
        sortBy,
        sortDir
      } = speciesState[specie.pokemon_id]

      return ([
        <tr
          className={collapsed ? '' : 'shown'}
          key={'header' + specie.pokemon_id}
        >
          <td
            className="details-control"
            onClick={this.handleCollapse.bind(this, specie.pokemon_id)}
          />
          <td>{specie.pokemon_id}</td>
          <td className="sprites">
            <img
              className="pokemon-avatar-sprite" src={`./imgs/pokemonSprites/${specie.pokemon_id || 0}.png`}
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
      key={'child' + species.pokemon_id}
    />)
  },

  handleCollapse(id, e) {
    this.setState({
      species: this.updateSpeciesState(id, (speciesState) => {
        return {
          collapsed: !speciesState.collapsed
        }
      })
    })
  },


  handleCheckAll(species, e) {
    const id = species.pokemon_id

    this.setState({
      species: this.updateSpeciesState(id, (speciesState) => {
        const newCheckAllState = !speciesState.checkAll
        const newPokemonState = {}

        for (const id in speciesState.pokemonState) {
          newPokemonState[id] = Object.assign({}, speciesState.pokemonState[id], { check: newCheckAllState })
        }

        return {
          checkAll: newCheckAllState,
          pokemonState: newPokemonState
        }
      })
    })
  },

  handleCheckedChange(pokemon, e) {
    this.setState({
      species: this.updateSpeciesState(String(pokemon.pokemon_id), (speciesState) => {
        return {
          pokemonState: this.updatePokemonState(speciesState, String(pokemon.id), (pokemonState) => {
            return {
              check: !pokemonState.check
            }
          })
        }
      })
    })
  },

  getInitialPokemonState(specie) {
    const pokemonState = {}
    specie.pokemon.forEach((p, i) => {
      pokemonState[p.id] = { check: false }
    })
    return pokemonState
  },

  _handleSortSpecies(sortBy, e) {
    this.props.sortSpeciesBy(sortBy)
  },

  getSortDirectionClassName(key) {
    let {
      sortBy,
      sortDir
    } = this.props

    if (sortBy === key) {
      return sortDir === 'ASC' ? 'sorting_asc' : 'sorting_desc'
    } else {
      return 'sorting'
    }
  },

  updateSpeciesState(id, updater) {
    const newSpecieState = {}
    const existingSpecieState = this.state.species[String(id)]

    newSpecieState[String(id)] = Object.assign({}, existingSpecieState, updater(existingSpecieState))

    return Object.assign({}, this.state.species, newSpecieState)
  },

  updatePokemonState(speciesState, pid, updater) {
    const existingPokemonByIdState = speciesState.pokemonState[String(pid)]

    const newPokemonByIdState = {}
    newPokemonByIdState[String(pid)] = Object.assign({}, existingPokemonByIdState, updater(existingPokemonByIdState))

    return Object.assign({}, speciesState.pokemonState, newPokemonByIdState)
  },

  sortPokemonBy(newSortBy, speciesIndex) {
    const pokemonId = this.props.monsters.species[speciesIndex].pokemon_id

    let {
      sortBy,
      sortDir
    } = this.state.species[pokemonId]

    let newSortDir = null

    if (newSortBy === sortBy) {
      newSortDir = sortDir === 'ASC' ? 'DESC' : 'ASC'
    } else {
      newSortDir = 'DESC'
    }

    this.props.updateSpecies(speciesIndex, (speciesAtIndex) => {
      return {
        pokemon: this.props.getSortedPokemon(speciesAtIndex, newSortBy, newSortDir)
      }
    })

    this.setState({
      species: this.updateSpeciesState(pokemonId, () => {
        return {
          sortDir: newSortDir,
          sortBy: newSortBy
        }
      })
    })
  },

  getPokemonChecked ()
  {
    let species = this.props.monsters.species
    let speciesState = this.state.species
    let checkedPokemon = []

    species.forEach ((specie) => {
      specie.pokemon.forEach ((p) => {
        if (speciesState[specie.pokemon_id].pokemonState[p.id].check) {
          checkedPokemon.push(p)
        }
      })
    })

    return checkedPokemon
  },

  getSortState(specie) {
    let {
      sortBy,
      sortDir
    } = this.state.species[specie.pokemon_id]

    return { sortBy, sortDir }
  }

})

export default Species
