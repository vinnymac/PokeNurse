import React from 'react'
import renderModal from '../../Detail'
import {ipcRenderer} from 'electron'
import $ from 'jquery'

const Pokemon = React.createClass({

  getInitialState () {
    let rowState = []
    this.props.species.pokemon.forEach((p, i) => {
      rowState.push(false)
    })

    return {
      checkAll: false,
      rowState: rowState
    }
  },

  checkRow (index, event) {
    let {rowState, checkAll} = this.state
    let newRowState = [
      ...this.state.rowState.slice(0, index),
      !rowState[index],
      ...this.state.rowState.slice(index + 1)
    ]

    let newCheckAllState = checkAll ? !checkAll : false

    this.setState({
      rowState: newRowState,
      checkAll: newCheckAllState
    })
  },

  checkAll () {
    let rowState = []
    let checkState = !this.state.checkAll

    this.state.rowState.forEach((row, i) => {
      rowState[ i ] = checkState
    })

    this.setState({
      rowState: rowState,
      checkAll: checkState
    })
  },

  componentDidMount () {
    $(this.refs.tBody).find('[data-toggle="tooltip"]').tooltip()
  },

  componentDidUpdate () {
    $(this.refs.tBody).find('[data-toggle="tooltip"]').tooltip()
  },

  render () {
    let { species } = this.props

    return (
      <tr className='child' key={'sub' + species.pokemon_id}>
        <td colSpan='7'>
          <table className='table table-condensed table-hover'>
            <thead>
              <tr>
                <th width='5%'>
                  <input
                    type='checkbox'
                    checked={this.state.checkAll}
                    onChange={this.checkAll}
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
              key={i}
              disabled={pokemon.deployed || pokemon.favorite}
              checked={this.state.rowState[ i ]}
              onChange={this.checkRow.bind(this, i)}
            />
          </td>
          <td>
            <span
              className={`favorite ${favorite}`}
              id='favoriteBtn'
              data-pokemon-id={pokemon.id}
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
    if (ipcRenderer.sendSync('confirmation-dialog', 'power up').success) {
      ipcRenderer.send('power-up-pokemon', pokemon.id, pokemon.nickname)
      setTimeout(() => { document.getElementById('refresh-btn').click() }, 1500)
    }
  },

  handleClickFavorite (pokemon, e) {
    ipcRenderer.send('favorite-pokemon', pokemon.id, !pokemon.favorite)
    // TODO Update the data immediately to reflect favorite
    // updatePokemonById(button.dataset.pokemonId, 'favorite', setToFavorite)
  },

  handleClickNickname (pokemon, species, e) {
      renderModal($(document.getElementById('detailModal')), pokemon, species)
  }

})

export default Pokemon
