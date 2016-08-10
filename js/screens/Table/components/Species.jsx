import React from 'react'
import PokemonTable from './Pokemon'

function child(species) {
    return < PokemonTable species={species} />
}


const Species = React.createClass({

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
                    {monsters.species.map(function (species) {
                        return (
                            <tr key={species.pokemon_id}>
                                <td className="details-control"></td>
                                <td>{species.pokemon_id}</td>
                                <td>{species.name}</td>
                                <td>{species.count}</td>
                                <td>{species.candy}</td>
                                <td>{species.evolves}</td>
                            </tr>, child(species)
                        )
                    })}
                    </tbody>
                </table>
            </div>
        )
    },

})

export default Species