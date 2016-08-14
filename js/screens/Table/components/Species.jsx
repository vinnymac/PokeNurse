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

    return { species: species }
  },

  render () {
    let {
      monsters
    } = this.props

    return (
      <div className="row">
        <div className="col-md-12">
          <table className='table table-condensed table-hover'>
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
    return (<tr>
      <th></th>
      <th>
        Pokédex #
      </th>
      <th>
        Sprite
      </th>
      <th>
        Name
      </th>
      <th>
        Count
      </th>
      <th>
        Candy
      </th>
      <th>
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
      let pokemonState = this.state.species[ species.pokemon_id ].pokemonState

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
      key={'child' + species.pokemon_id}
    />)
  },

  handleCollapse (id, e) {
    let newState = {}
    newState[ String(id) ] = {
      collapsed: !this.state.species[ String(id) ].collapsed,
      pokemonState: this.state.species[ String(id) ].pokemonState,
      checkAll: this.state.species[ String(id) ].checkAll,
    }

    let species = Object.assign({}, this.state.species, newState)
    this.setState({
      species: species
    })
  },

  handleInitPokemonState (specie) {
    let pokemonState = {}
    specie.pokemon.forEach((p, i) => {
      pokemonState[p.id] = { check: false }
    })
    return pokemonState
  },

})

export default Species
