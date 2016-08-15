import React from 'react'
import renderModal from '../../Detail'
import { ipcRenderer } from 'electron'
import $ from 'jquery'

import { Immutable } from '../../../utils'

const Pokemon = React.createClass({

  contextTypes: {
    monsterUpdater: React.PropTypes.func.isRequired
  },

  checkRow (id, pid, e) {
    this.props.onCheckedChange(id, pid)
  },

  checkAll (id) {
    this.props.onCheckAll(id)
  },

  componentDidMount () {
    $(this.refs.tBody).find('[data-toggle="tooltip"]').tooltip()
  },

  componentDidUpdate () {
    $(this.refs.tBody).find('[data-toggle="tooltip"]').tooltip()
  },

  render () {
    let {
      species,
      checkAll
    } = this.props

    return (
      <tr className='child' key={'sub' + species.pokemon_id}>
        <td colSpan='7'>
          <table className='table table-condensed table-hover table-striped'>
            <thead>
            <tr>
              <th width='5%'>
                <input
                  type='checkbox'
                  checked={checkAll}
                  onChange={this.checkAll.bind(this, species.pokemon_id)}
                />
              </th>
              <th
                width='5%'
                className={this.getSortDirectionClassName('favorite')}
                tabIndex='0'
                rowSpan='1'
                colSpan='1'
                aria-controls='pokemon-data'
                aria-label='Favorite: activate to sort column ascending'
                onClick={this._handleSortPokemon.bind(this, 'favorite')}
              >
                <span className='glyphicon glyphicon-star favorite-yellow'></span>
              </th>
              <th>
                P↑
              </th>
              <th
                width='15%'
                className={this.getSortDirectionClassName('name')}
                tabIndex='0'
                rowSpan='1'
                colSpan='1'
                aria-controls='pokemon-data'
                aria-label='Name: activate to sort column ascending'
                onClick={this._handleSortPokemon.bind(this, 'name')}
              >
                Name
              </th>
              <th
                className={this.getSortDirectionClassName('nickname')}
                tabIndex='0'
                rowSpan='1'
                colSpan='1'
                aria-controls='pokemon-data'
                aria-label='Nickname: activate to sort column ascending'
                onClick={this._handleSortPokemon.bind(this, 'nickname')}
              >
                Nickname
              </th>
              <th
                className={this.getSortDirectionClassName('cp')}
                tabIndex='0'
                rowSpan='1'
                colSpan='1'
                aria-controls='pokemon-data'
                aria-label='CP: activate to sort column ascending'
                onClick={this._handleSortPokemon.bind(this, 'cp')}
              >
                CP
              </th>
              <th
                className={this.getSortDirectionClassName('iv')}
                tabIndex='0'
                rowSpan='1'
                colSpan='1'
                aria-controls='pokemon-data'
                aria-label='IV: activate to sort column ascending'
                onClick={this._handleSortPokemon.bind(this, 'iv')}
              >
                IV
              </th>
            </tr>
            </thead>
            <tbody ref='tBody'>
            {this.getPokemonComponents(species)}
            </tbody>
          </table>
        </td>
      </tr>
    )
  },

  getPokemonComponents (species) {
    let {
      speciesIndex,
      pokemonState
    } = this.props

    return species.pokemon.map((pokemon, i) => {
      let favorite = pokemon.favorite ? 'glyphicon glyphicon-star favorite-yellow' : 'glyphicon glyphicon-star-empty'
      let pokeiv = pokemon[ 'iv' ] + '% (' + pokemon[ 'attack' ] + '/' + pokemon[ 'defense' ] + '/' + pokemon[ 'stamina' ] + ')'
      let powerupComponent

      if (pokemon.cp === pokemon.max_cp) {
        let tip = `Max CP ${pokemon.max_cp}`
        powerupComponent = <span
          data-toggle='tooltip'
          data-placement='right'
          data-html='true'
          title={tip}
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
              key={pokemon.id}
              disabled={pokemon.deployed || pokemon.favorite}
              checked={pokemonState[ String(pokemon.id) ].check && !pokemon.favorite}
              onChange={this.checkRow.bind(this, String(pokemon.pokemon_id), String(pokemon.id) )}
            />
          </td>
          <td>
            <span
              className={`favorite ${favorite}`}
              id='favoriteBtn'
              data-pokemon-id={pokemon.id}
              onClick={this.handleClickFavorite.bind(this, pokemon, i, speciesIndex)}
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
    if (ipcRenderer.sendSync('confirmation-dialog', 'power up').success) {
      ipcRenderer.send('power-up-pokemon', pokemon.id, pokemon.nickname)
      // TODO Calculate and update the pokemon immediately with estimates
    }
  },

  handleClickFavorite (pokemon, index, speciesIndex, e) {
    ipcRenderer.send('favorite-pokemon', pokemon.id, !pokemon.favorite)
    let updatedPokemon = Object.assign(pokemon, { favorite: !pokemon.favorite ? -1 : -0 })
    this.context.monsterUpdater(updatedPokemon, index, speciesIndex)
  },

  handleClickNickname (pokemon, species, e) {
    renderModal($(document.getElementById('detailModal')), pokemon, species)
  },

  _handleSortPokemon (sortBy, e) {
    let {
      speciesIndex,
      sortPokemonBy
    } = this.props

    sortPokemonBy(sortBy, speciesIndex)
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

export default Pokemon
