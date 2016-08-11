import React from 'react'
import renderModal from '../../Detail'

const Pokemon = React.createClass({
  componentDidMount () {
    $(this.refs.tooltip).tooltip()
  },

  componentDidUpdate () {
    $(this.refs.tooltip).tooltip()
  },

  render () {
    let {species} = this.props

    return (
      <tr className='child' key={'sub' + species.pokemon_id}>
        <td colSpan='7'>
          <table className='table table-condensed table-hover'>
            <thead>
              <tr>
                <th width='5%'><input type='checkbox' /></th>
                <th width='5%'>
                  <span className='glyphicon glyphicon-star favorite-yellow'></span>
                </th>
                <th>
                  P↑
                </th>
                <th width='15%'>
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
      let powerupComponent

      if (pokemon.cp === pokemon.max_cp) {
        let tip = `Max CP ${pokemon.max_cp}`
        powerupComponent = <span
          data-toggle='tooltip'
          data-placement='right'
          data-html='true'
          title={tip}
          ref='tooltip'
        >
          P↑
        </span>
      } else {
        let tip = `
        Stardust Cost = ${pokemon.stardust_cost} <br>
        Candy Cost = ${pokemon.candy_cost} <br>
        CP After ≅ ${Math.round(pokemon.next_cp) + pokemon.cp} <br>
        Max Stardust = ${pokemon.stardust_max_cost} <br>
        Max Candy = ${pokemon.candy_max_cost}
        `
        powerupComponent = <a
          id='powerUp'
          data-pokemon-id={pokemon.id}
          data-nickname={pokemon.nickname}
          data-toggle='tooltip'
          data-placement='right'
          data-html='true'
          title={tip}
          ref='tooltip'
        >
          P↑
        </a>
      }

      return (
        <tr key={pokemon.id}>
          <td>
            <input
              type='checkbox'
              value={String(pokemon.id)}
              disabled={pokemon.deployed || pokemon.favorite}
            />
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
                  <td onClick={this.handleClickPowerup.bind(this, pokemon)}>
                    {powerupComponent}
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

  handleClickPowerup (pokemon, e) {
    console.log(pokemon)
  },

  handleClickFavorite (pokemon, e) {
    console.log(pokemon)
  },

  handleClickNickname (pokemon, species, e) {
      renderModal($(document.getElementById('detailModal')), pokemon, species)
  }

})

export default Pokemon
