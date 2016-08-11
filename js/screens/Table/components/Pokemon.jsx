import React from 'react'
import renderModal from '../../Detail'

const Pokemon = React.createClass({
  render () {
    let {species} = this.props

    return (
      <tr className='child' key={'sub' + species.pokemon_id}>
        <td colSpan='6'>
          <table className='table table-condensed table-hover'>
            <thead>
              <tr>
                <th></th>
                <th>
                  <span className='glyphicon glyphicon-star favorite-yellow'></span>
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
              {this.getPokemonComponents(species)}
            </tbody>
          </table>
        </td>
      </tr>
    )
  },

  getPokemonComponents (species) {
    return species.pokemon.map((pokemon) => {
      let favorite = pokemon.favorite ? 'glyphicon glyphicon-star favorite-yellow' : 'glyphicon glyphicon-star-empty'
      let favoriteBool = pokemon.favorite ? 'true' : 'false'
      let pokeiv = pokemon['iv'] + '% (' + pokemon['attack'] + '/' + pokemon['defense'] + '/' + pokemon['stamina'] + ')'

      return (
        <tr key={pokemon.id}>
          <td>
            <input
              type='checkbox'
              value={String(pokemon.id)}
              disabled={pokemon.deployed}
            />
          </td>
          <td>
            <span
              className={`favorite ${favorite}`}
              id='favoriteBtn'
              data-pokemon-id={pokemon.id}
              data-pokemon-favorited={favoriteBool}
              onClick={this.handleClickFavorite.bind(this, pokemon)}
            />
          </td>
          <td>
            {pokemon.name}
          </td>
          <td onClick={this.handleClickNickname.bind(this, pokemon, species)}>
            <a
              className='nickname'
              data-pokemon-id={pokemon.id}
            >
              {pokemon.nickname}
            </a>
          </td>
          <td>
            {pokemon.cp}
          </td>
          <td>
            {pokeiv}
          </td>
        </tr>)
    })
  },

  handleClickFavorite (pokemon, e) {
    console.log(pokemon)
  },

  handleClickNickname (pokemon, species, e) {
    renderModal($(document.getElementById('detailModal')), pokemon, species)
  }

})

export default Pokemon
