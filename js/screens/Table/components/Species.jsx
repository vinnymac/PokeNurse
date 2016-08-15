import React from 'react'
import PokemonTable from './Pokemon'

const Species = React.createClass({

  getInitialState () {
    let {
      monsters
    } = this.props

    let species = {}

    for (let specie of monsters.species) {
      species[ String(specie.pokemon_id) ] = {
        pokemonState: this.handleInitPokemonState(specie),
        checkAll: false,
        collapsed: true
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
          <table className='table table-condensed table-hover display no-footer dataTable'>
            <thead>
            {this.getSpeciesHeader()}
            </thead>
            <tbody>
            {this.getPokemonComponents(monsters.species)}
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
        onClick={this._handleSortSpecies.bind(this, 'pokemon_id', true)}
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
        onClick={this._handleSortSpecies.bind(this, 'name', false)}
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
        onClick={this._handleSortSpecies.bind(this, 'count', true)}
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
        onClick={this._handleSortSpecies.bind(this, 'candy', true)}
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
        onClick={this._handleSortSpecies.bind(this, 'evolves', true)}
      >
        Evolves
      </th>
    </tr>)
  },

  getPokemonComponents (monsterSpecies) {

    let {
      filterBy
    } = this.props

    return monsterSpecies.map((species, i) => {
      if (String(species[ 'name' ]).toLowerCase().indexOf(filterBy) === -1) {
        return null
      }

      let collapsed = this.state.species[ species.pokemon_id ].collapsed
      let pokemonState = this.handleInitPokemonState(species)

      return ([
        <tr
          className={collapsed ? '' : 'shown'}
          key={'header' + species.pokemon_id}
        >
          <td
            className='details-control'
            onClick={this.handleCollapse.bind(this, species.pokemon_id)}
          />
          <td>{species.pokemon_id}</td>
          <td className='sprites'>
            <img
              className='pokemon-avatar-sprite' src={`./imgs/pokemonSprites/${species.pokemon_id || 0}.png`}
            />
          </td>
          <td>{species.name}</td>
          <td>{species.count}</td>
          <td>{species.candy}</td>
          <td>{species.evolves}</td>
        </tr>, this.getPokemonTable(species, i, collapsed, pokemonState)
      ])
    })
  },

  getPokemonTable (species, index, collapsed, pokemonState) {
    if (collapsed) return null

    return (<PokemonTable
      species={species}
      speciesIndex={index}
      pokemonState={pokemonState}
      onCheckedChange={this.handleCheckedChange}
      key={'child' + species.pokemon_id}
    />)
  },

  handleCollapse (id, e) {
    let newSpecieState = {}
    let existingSpecieState = this.state.species[ String(id) ]

    newSpecieState[ String(id) ] = Object.assign({}, existingSpecieState, {
      collapsed: !existingSpecieState.collapsed
    })

    let species = Object.assign({}, this.state.species, newSpecieState)
    this.setState({
      species: species
    })
  },

  handleCheckedChange (id, pid, e) {
    let existingPokemonState = this.state.species[ String(id) ].pokemonState[ String(pid) ]

    let newPokemonState = this.state.species[ String(id) ].pokemonState[ String (pid) ] = Object.assign({}, existingPokemonState, {
      check: !existingPokemonState.check
    })

    let species = Object.assign({}, this.state.species, newPokemonState)
    this.setState({
      species: species
    })
    console.log(this.state.species[ String(id) ])
  },

  handleInitPokemonState (specie) {
    let pokemonState = {}
    specie.pokemon.forEach((p, i) => {
      pokemonState[p.id] = { check: false }
    })
    return pokemonState
  },

  _handleSortSpecies (sortBy, sortAsNum, e) {
    this.props.sortSpeciesBy(sortBy, sortAsNum)
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
  }

})

export default Species
