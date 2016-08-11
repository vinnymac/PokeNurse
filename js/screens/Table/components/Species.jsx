import React from 'react'
import PokemonTable from './Pokemon'

const Species = React.createClass({

    getInitialState () {
      let {
        monsters
      } = this.props

      let species = {}
      for (let specie of monsters.species) {
        species[String(specie.pokemon_id)] = {collapsed: true}
      }

      return {species: species}
    },

    render () {
        let {
            monsters
        } = this.props

        return (
            <div>
                <table className="table table-condensed table-hover">
                    <thead>
                    <tr>
                        <th></th>
                        <th>
                            Pokedex #
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
                    </tr>
                    </thead>
                    <tbody>
                    {this.getPokemonComponents(monsters.species)}
                    </tbody>
                </table>
            </div>
        )
    },

    getPokemonComponents (monsterSpecies) {
      return monsterSpecies.map((species) => {
        let collapsed = this.state.species[species.pokemon_id].collapsed

        return ([
          <tr
            className={collapsed ? '' : 'shown'}
            key={"header" + species.pokemon_id}
          >
            <td
              className="details-control"
              onClick={this.handleCollapse.bind(this, species.pokemon_id)}
            />
            <td>{species.pokemon_id}</td>
            <td className='sprites'>
              <img className='pokemon-avatar-sprite' src={`./imgs/pokemonSprites/${species.pokemon_id || 0}.png`}/>
            </td>
            <td>{species.name}</td>
            <td>{species.count}</td>
            <td>{species.candy}</td>
            <td>{species.evolves}</td>
          </tr>, this.getPokemonTable(species, collapsed)
        ])
      })
    },

    getPokemonTable (species, collapsed) {
      if (collapsed) return null

      return (<PokemonTable
        species={species}
        key={"child" + species.pokemon_id}
      />)
    },

    handleCollapse (id, e) {
      let newState = {}
      newState[String(id)] = {collapsed: !this.state.species[String(id)].collapsed}

      let species = Object.assign({}, this.state.species, newState)
      this.setState({
        species: species
      })
    }
})

export default Species
