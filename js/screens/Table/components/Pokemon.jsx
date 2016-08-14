import React from 'react'
import renderModal from '../../Detail'
import { ipcRenderer } from 'electron'
import $ from 'jquery'

import { Immutable } from '../../../utils'

const Pokemon = React.createClass({

  contextTypes: {
    monsterUpdater: React.PropTypes.func.isRequired
  },

  // getInitialState () {
  //   return {
  //     checkAll: false,
  //     rowState: this.props.checked
  //   }
  // },

  // checkRow (index, event) {
  //   let { rowState, checkAll } = this.state
  //   let newRowState = Immutable.array.set(this.state.rowState, index, !rowState[ index ])
  //
  //   let newCheckAllState = checkAll ? !checkAll : false
  //
  //   this.setState({
  //     rowState: newRowState,
  //     checkAll: newCheckAllState
  //   })
  // },
  //
  // checkAll () {
  //   let rowState = []
  //   let checkState = !this.state.checkAll
  //
  //   this.state.rowState.forEach((row, i) => {
  //     rowState[ i ] = checkState
  //   })
  //
  //   this.setState({
  //     rowState: rowState,
  //     checkAll: checkState
  //   })
  // },

  componentDidMount () {
    $(this.refs.tBody).find('[data-toggle="tooltip"]').tooltip()
  },

  componentDidUpdate () {
    $(this.refs.tBody).find('[data-toggle="tooltip"]').tooltip()
  },

  render () {
    let { species } = this.props
    console.log(this.props)
    return (
      <tr className='child' key={'sub' + species.pokemon_id}>
        <td colSpan='7'>
          <table className='table table-condensed table-hover table-striped'>
            <thead>
            <tr>
              <th width='5%'>
                <input
                  type='checkbox'
                  //checked={this.state.checkAll}
                  //onChange={this.checkAll}
                />
              </th>
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
      speciesIndex
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
              key={pokemon.id}
              disabled={pokemon.deployed || pokemon.favorite}
              //checked={this.state.rowState[ String(pokemon.id) ].checked}
              //onChange={this.checkRow.bind(this, i)}
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
      setTimeout(() => { document.getElementById('refresh-btn').click() }, 1500)
    }
  },

  handleClickFavorite (pokemon, index, speciesIndex, e) {
    ipcRenderer.send('favorite-pokemon', pokemon.id, !pokemon.favorite)
    let updatedPokemon = Object.assign(pokemon, { favorite: !pokemon.favorite ? -1 : -0 })
    this.context.monsterUpdater(updatedPokemon, index, speciesIndex)
    // TODO Update the data immediately to reflect favorite
    // updatePokemonById(button.dataset.pokemonId, 'favorite', setToFavorite)
  },

  handleClickNickname (pokemon, species, e) {
    renderModal($(document.getElementById('detailModal')), pokemon, species)
  }

})

export default Pokemon
