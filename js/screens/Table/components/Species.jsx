import React from 'react'
import PokemonTable from './Pokemon'

const Species = React.createClass({

  getInitialState () {
    let {
      monsters
    } = this.props

    let species = {}

    let sortBy = ''
    let sortDir = 'ASC'

    for (let specie of monsters.species) {
      species[ String(specie.pokemon_id) ] = {
        pokemonState: this.getInitialPokemonState(specie),
        checkAll: false,
        collapsed: true,
        sortBy: sortBy,
        sortDir: sortDir
      }
    }

    return {
      species: species
    }
  },

  render () {
    let {
      monsters
    } = this.props

    return (
      <div className='row'>
        <div className='col-md-12'>
          <table className='table table-condensed table-hover display no-footer'>
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

  getSpeciesHeader () {
    let {
      sortSpeciesBy
    } = this.props

    return (<tr>
      <th></th>
      <th
        className={this.getSortDirectionClassName('pokemon_id')}
        tabIndex='0'
        rowSpan='1'
        colSpan='1'
        aria-controls='pokemon-data'
        aria-label='Pokédex #: activate to sort column ascending'
        onClick={this._handleSortSpecies.bind(this, 'pokemon_id')}
      >
        Pokédex #
      </th>
      <th>
        Sprite
      </th>
      <th
        className={this.getSortDirectionClassName('name')}
        tabIndex='0'
        rowSpan='1'
        colSpan='1'
        aria-controls='pokemon-data'
        aria-label='Name: activate to sort column ascending'
        onClick={this._handleSortSpecies.bind(this, 'name')}
      >
        Name
      </th>
      <th
        className={this.getSortDirectionClassName('count')}
        tabIndex='0'
        rowSpan='1'
        colSpan='1'
        aria-controls='pokemon-data'
        aria-label='Count: activate to sort column ascending'
        onClick={this._handleSortSpecies.bind(this, 'count')}
      >
        Count
      </th>
      <th
        className={this.getSortDirectionClassName('candy')}
        tabIndex='0'
        rowSpan='1'
        colSpan='1'
        aria-controls='pokemon-data'
        aria-label='Candy: activate to sort column ascending'
        onClick={this._handleSortSpecies.bind(this, 'candy')}
      >
        Candy
      </th>
      <th
        className={this.getSortDirectionClassName('evolves')}
        tabIndex='0'
        rowSpan='1'
        colSpan='1'
        aria-controls='pokemon-data'
        aria-label='Evolves: activate to sort column ascending'
        onClick={this._handleSortSpecies.bind(this, 'evolves')}
      >
        Evolves
      </th>
    </tr>)
  },

  getSpeciesBody (monsterSpecies) {

    let {
      filterBy
    } = this.props

    let speciesState = this.state.species

    return monsterSpecies.map((specie, i) => {
      if (String(specie[ 'name' ]).toLowerCase().indexOf(filterBy) === -1) {
        return null
      }

      let {
        collapsed,
        pokemonState,
        checkAll
      } = speciesState[ specie.pokemon_id ]

      return ([
        <tr
          className={collapsed ? '' : 'shown'}
          key={'header' + specie.pokemon_id}
        >
          <td
            className='details-control'
            onClick={this.handleCollapse.bind(this, specie.pokemon_id)}
          />
          <td>{specie.pokemon_id}</td>
          <td className='sprites'>
            <img
              className='pokemon-avatar-sprite' src={`./imgs/pokemonSprites/${specie.pokemon_id || 0}.png`}
            />
          </td>
          <td>{specie.name}</td>
          <td>{specie.count}</td>
          <td>{specie.candy}</td>
          <td>{specie.evolves}</td>
        </tr>, this.getPokemonTable(specie, i, collapsed, pokemonState, checkAll)
      ])
    })
  },

  getPokemonTable (species, index, collapsed, pokemonState, checkAll) {
    if (collapsed) return null

    return (<PokemonTable
      species={species}
      speciesIndex={index}
      pokemonState={pokemonState}
      checkAll={checkAll}
      onCheckedChange={this.handleCheckedChange}
      onCheckAll={this.handleCheckAll}
      key={'child' + species.pokemon_id}
    />)
  },

  handleCollapse (id, e) {
    this.setState({
      species: this.updateSpeciesState(id, (speciesState) => {
        return {
          collapsed: !speciesState.collapsed
        }
      })
    })
  },


  handleCheckAll (id, e) {
    this.setState({
      species: this.updateSpeciesState(id, (speciesState) => {
        let newCheckAllState = !speciesState.checkAll
        let newPokemonState = {}

        for (let id in speciesState.pokemonState) {
          newPokemonState[id] = Object.assign({}, speciesState.pokemonState[id], {check: newCheckAllState})
        }

        return {
          checkAll: newCheckAllState,
          pokemonState: newPokemonState
        }
      })
    })
  },

  handleCheckedChange (id, pid, e) {
    this.setState({
      species: this.updateSpeciesState(id, (speciesState) => {
        return {
          pokemonState: this.updatePokemonState(speciesState, pid, (pokemonState) => {
            return {
              check: !pokemonState.check
            }
          })
        }
      })
    })
  },

  getInitialPokemonState (specie) {
    let pokemonState = {}
    specie.pokemon.forEach((p, i) => {
      pokemonState[p.id] = { check: false }
    })
    return pokemonState
  },

  _handleSortSpecies (sortBy, e) {
    this.props.sortSpeciesBy(sortBy)
  },

  getSortDirectionClassName (key) {
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

  updateSpeciesState (id, updater) {
    let newSpecieState = {}
    let existingSpecieState = this.state.species[ String(id) ]

    newSpecieState[ String(id) ] = Object.assign({}, existingSpecieState, updater(existingSpecieState))

    return Object.assign({}, this.state.species, newSpecieState)
  },

  updatePokemonState (speciesState, pid, updater) {
    let existingPokemonByIdState = speciesState.pokemonState[ String(pid) ]

    let newPokemonByIdState = {}
    newPokemonByIdState[ String(pid) ] = Object.assign({}, existingPokemonByIdState, updater(existingPokemonByIdState))

    return Object.assign({}, speciesState.pokemonState, newPokemonByIdState)
  }

})

export default Species
