import React, {
  PropTypes
} from 'react'
import { ipcRenderer } from 'electron'
import $ from 'jquery'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {
  toggleFavoritePokemon,
  powerUpPokemon
} from '../../../actions'

import renderModal from '../../Detail'
import Tooltip from '../../Tooltip'

const favoriteGlyph = 'glyphicon glyphicon-star favorite-yellow'
const emptyFavoriteGlyph = 'glyphicon glyphicon-star-empty'

const Pokemon = React.createClass({

  displayName: 'PokemonTable',

  propTypes: {
    speciesIndex: PropTypes.number,
    sortBy: PropTypes.string,
    sortDir: PropTypes.string,
    sortPokemonBy: PropTypes.func.isRequired,
    onCheckedChange: PropTypes.func.isRequired,
    species: PropTypes.object.isRequired,
    checkAll: PropTypes.bool.isRequired,
    onCheckAll: PropTypes.func.isRequired,
    pokemonState: PropTypes.object.isRequired,
    toggleFavoritePokemon: PropTypes.func.isRequired,
    powerUpPokemon: PropTypes.func.isRequired,
  },

  contextTypes: {
    monsterUpdater: React.PropTypes.func.isRequired
  },

  render() {
    const {
      species,
      checkAll
    } = this.props

    return (
      <tr className="child" key={`sub${species.pokemon_id}`}>
        <td colSpan="7">
          <table className="table table-condensed table-hover table-striped">
            <thead>
              <tr>
                <th width="5%">
                  <input
                    type="checkbox"
                    checked={checkAll}
                    onChange={this.checkAll.bind(this, species)}
                  />
                </th>
                <th
                  width="5%"
                  className={this.getSortDirectionClassName('favorite')}
                  tabIndex="0"
                  rowSpan="1"
                  colSpan="1"
                  aria-controls="pokemon-data"
                  aria-label="Favorite: activate to sort column ascending"
                  onClick={this.handleSortPokemon.bind(this, 'favorite')}
                >
                  <span className="glyphicon glyphicon-star favorite-yellow" />
                </th>
                <th>
                  P↑
                </th>
                <th
                  width="15%"
                  className={this.getSortDirectionClassName('name')}
                  tabIndex="0"
                  rowSpan="1"
                  colSpan="1"
                  aria-controls="pokemon-data"
                  aria-label="Name: activate to sort column ascending"
                  onClick={this.handleSortPokemon.bind(this, 'name')}
                >
                  Name
                </th>
                <th
                  className={this.getSortDirectionClassName('nickname')}
                  tabIndex="0"
                  rowSpan="1"
                  colSpan="1"
                  aria-controls="pokemon-data"
                  aria-label="Nickname: activate to sort column ascending"
                  onClick={this.handleSortPokemon.bind(this, 'nickname')}
                >
                  Nickname
                </th>
                <th
                  className={this.getSortDirectionClassName('cp')}
                  tabIndex="0"
                  rowSpan="1"
                  colSpan="1"
                  aria-controls="pokemon-data"
                  aria-label="CP: activate to sort column ascending"
                  onClick={this.handleSortPokemon.bind(this, 'cp')}
                >
                  CP
                </th>
                <th
                  className={this.getSortDirectionClassName('iv')}
                  tabIndex="0"
                  rowSpan="1"
                  colSpan="1"
                  aria-controls="pokemon-data"
                  aria-label="IV: activate to sort column ascending"
                  onClick={this.handleSortPokemon.bind(this, 'iv')}
                >
                  IV
                </th>
              </tr>
            </thead>
            <tbody ref={(c) => { this.tBody = c }}>
              {this.getPokemonComponents(species)}
            </tbody>
          </table>
        </td>
      </tr>
    )
  },

  checkRow(pokemon) {
    this.props.onCheckedChange(pokemon)
  },

  checkAll(species) {
    this.props.onCheckAll(species)
  },

  getPokemonComponents(species) {
    const {
      pokemonState
    } = this.props

    return species.pokemon.map((pokemon) => {
      const favorite = pokemon.favorite ? favoriteGlyph : emptyFavoriteGlyph
      const pokeiv = `${pokemon.iv}% (${pokemon.attack}/${pokemon.defense}/${pokemon.stamina})`
      const powerUpTip = this.getPowerUpTip(pokemon)
      const cpTip = `Max CP: ${pokemon.max_cp}`
      const ivTip = (<span>
        {`Attack: ${pokemon.attack}`}
        <br />
        {`Defense: ${pokemon.defense}`}
        <br />
        {`Stamina: ${pokemon.stamina}`}
      </span>)
      const isChecked = pokemonState[String(pokemon.id)].check

      return (
        <tr key={pokemon.id}>
          <td>
            <input
              type="checkbox"
              value={String(pokemon.id)}
              key={pokemon.id}
              disabled={pokemon.deployed}
              checked={isChecked}
              onChange={this.checkRow.bind(this, pokemon)}
            />
          </td>
          <td>
            <span
              className={`favorite ${favorite}`}
              id="favoriteBtn"
              data-pokemon-id={pokemon.id}
              onClick={this.handleClickFavorite.bind(this, pokemon)}
            />
          </td>
          <td onClick={this.handleClickPowerup.bind(this, pokemon)}>
            <Tooltip
              placement="right"
              id="power_up_tooltip"
              message={powerUpTip}
              delayShow={100}
              wrapperTag="a"
              show
            >
              P↑
            </Tooltip>
          </td>
          <td>
            {pokemon.name}
          </td>
          <td onClick={this.handleClickNickname.bind(this, pokemon, species)}>
            <a
              className="nickname"
              data-pokemon-id={pokemon.id}
            >
              {pokemon.nickname}
            </a>
          </td>
          <td>
            <Tooltip
              placement="right"
              id="cp_tooltip"
              message={cpTip}
              delayShow={100}
              wrapperTag="span"
              show
            >
              {pokemon.cp}
            </Tooltip>
          </td>
          <td>
            <Tooltip
              placement="right"
              id="iv_tooltip"
              message={ivTip}
              delayShow={100}
              wrapperTag="span"
              show
            >
              {pokeiv}
            </Tooltip>
          </td>
        </tr>)
    })
  },

  getPowerUpTip(pokemon) {
    if (pokemon.cp === pokemon.max_cp) {
      return `Max CP ${pokemon.max_cp}`
    }

    return (<span>
      {`Stardust Cost = ${pokemon.stardust_cost}`}
      <br />
      {`Candy Cost = ${pokemon.candy_cost}`}
      <br />
      {`CP After ≅ ${Math.round(pokemon.next_cp) + pokemon.cp}`}
      <br />
      {`Max Stardust = ${pokemon.stardust_max_cost}`}
      <br />
      {`Max Candy = ${pokemon.candy_max_cost}`}
    </span>)
  },

  handleClickPowerup(pokemon) {
    if (ipcRenderer.sendSync('confirmation-dialog', 'power up').success) {
      // TODO Calculate and update the pokemon immediately with estimates
      this.props.powerUpPokemon(pokemon)
    }
  },

  handleClickFavorite(pokemon) {
    this.props.toggleFavoritePokemon(pokemon)
  },

  handleClickNickname(pokemon, species) {
    renderModal($(document.getElementById('detailModal')), pokemon, species, this.context.monsterUpdater)
  },

  handleSortPokemon(sortBy) {
    const {
      speciesIndex,
      sortPokemonBy
    } = this.props

    sortPokemonBy(sortBy, speciesIndex)
  },

  getSortDirectionClassName(key) {
    const {
      sortBy,
      sortDir
    } = this.props

    if (sortBy === key) {
      return sortDir === 'ASC' ? 'sorting_asc' : 'sorting_desc'
    }

    return 'sorting'
  }

})

export default connect(null, dispatch => bindActionCreators({
  toggleFavoritePokemon,
  powerUpPokemon
}, dispatch))(Pokemon)
