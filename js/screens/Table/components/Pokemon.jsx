import React from 'react'

function prepDisplay(d) {
    for (var i = 0; i < d.pokemon.length; i++) {
        var poke = d.pokemon[i]
        var checkBox = '<input type="checkbox" value="' + poke.id.toString() + '"'
        var favorite = 'glyphicon glyphicon-star-empty'
        var pokeiv = poke['iv'] + '% (' + poke['attack'] + '/' + poke['defense'] + '/' + poke['stamina'] + ')'
        var favoriteBool = poke['favorite'] ? 'true' : 'false'

        if (poke.deployed) checkBox += ' disabled'
        if (poke.favorite) favorite = 'glyphicon glyphicon-star favorite-yellow'

        poke.td_checkbox = checkBox + '>'
        poke.td_favorite = '<span class="favorite ' + favorite + '" id="favoriteBtn" data-pokemon-id="' + poke.id + '" data-pokemon-favorited="' + favoriteBool + '" />'
        poke.td_name = poke.name
        poke.td_nickname = '<a class="nickname" data-pokemon-id="' + poke.id + '">' + poke.nickname + '</a>'
        poke.td_cp = poke.cp
        poke.td_pokeiv = pokeiv
    }

    return d.pokemon
}

const Pokemon = React.createClass({

    render () {
        let {
            species
        } = this.props

        return (
            <tr className="child" key={'sub' + species.pokemon_id}>
                <td colSpan="6">
                    <table className="table table-condensed table-hover">
                        <thead>
                        <tr>
                            <th></th>
                            <th>
                                Favorite
                            </th>
                            <th>
                                Name
                            </th>
                            <th>
                                Nickname
                            </th>
                            <th>
                                CP
                            </th>
                            <th>
                                IV
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {prepDisplay(species).map(function (pokemon) {
                            return (
                                <tr key={pokemon.id}>
                                    <td><span dangerouslySetInnerHTML={{__html: pokemon.td_checkbox}}></span></td>
                                    <td><span dangerouslySetInnerHTML={{__html: pokemon.td_favorite}}></span></td>
                                    <td>{pokemon.td_name}</td>
                                    <td><span dangerouslySetInnerHTML={{__html: pokemon.td_nickname}}></span></td>
                                    <td>{pokemon.td_cp}</td>
                                    <td>{pokemon.td_pokeiv}</td>
                                </tr>)
                        })}
                        </tbody>
                    </table>
                </td>
            </tr>
        )
    },

})

export default Pokemon
