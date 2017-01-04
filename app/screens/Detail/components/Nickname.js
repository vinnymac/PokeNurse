import {
  ipcRenderer,
} from 'electron'
import React, {
  PropTypes
} from 'react'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { renamePokemon } from '../../../actions'

function getNumberInCircle(num) {
  return String.fromCharCode(9311 + num)
}

const Nickname = React.createClass({
  propTypes: {
    pokemon: PropTypes.object.isRequired,
    renamePokemon: PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      newNickname: this.props.pokemon.nickname,
      editing: false
    }
  },

  componentDidUpdate() {
    if (this.state.editing) {
      this.lastActiveElement = document.activeElement
      this.input.focus()
      this.input.select()
    } else if (this.lastActiveElement) {
      this.lastActiveElement.focus()
    }
  },

  render() {
    const {
      editing,
      newNickname
    } = this.state

    if (editing) {
      return (
        <input
          type="text"
          className="input-lg"
          onKeyPress={this.handleKeyPress}
          defaultValue={newNickname}
          placeholder="Enter a new nickname"
          ref={(c) => { this.input = c }}
        />
      )
    }

    return (
      <div id="pokemon_name">
        {newNickname}
        {' '}
        <div
          className="fa fa-pencil"
          style={{ cursor: 'pointer' }}
          title="Click to Edit"
          onClick={this.handleEdit}
        />
      </div>
    )
  },

  handleEdit() {
    this.setState({
      editing: true
    })
  },

  handleKeyPress(e) {
    const {
      pokemon,
    } = this.props

    if (e.key === 'Enter') {
      let newName = e.target.value

      const totalEnergy = parseInt(Math.floor(100 / pokemon.move_2.energy_cost), 10)
      const energy = getNumberInCircle(totalEnergy)
      const vi = (100 - pokemon.iv).toFixed(0)
      const attack = getNumberInCircle(pokemon.attack)
      const defense = getNumberInCircle(pokemon.defense)
      const stamina = getNumberInCircle(pokemon.stamina)

      newName = newName
        .replace('[IV]', pokemon.iv.toFixed(0))
        .replace('[VI]', vi)
        .replace('[ATT]', attack)
        .replace('[DEF]', defense)
        .replace('[STA]', stamina)
        .replace('[FAST]', pokemon.move_1.power.toFixed(0))
        .replace('[CHARGE]', pokemon.move_2.power.toFixed(0))
        .replace('[ENERGY]', energy)
        .replace('[HP]', pokemon.stamina_max)

      if (newName.length > 12) {
        ipcRenderer.send('error-message', 'The name must contain 12 characters or less.')
        return
      }

      this.props.renamePokemon(pokemon, newName, (updatedPokemon) => {
        this.handleRenameComplete(updatedPokemon)
      })
    }
  },

  handleRenameComplete(updatedPokemon) {
    const {
      pokemon
    } = this.props

    if (updatedPokemon.id !== pokemon.id) return

    this.setState({
      newNickname: updatedPokemon.nickname,
      editing: false
    })
  }

})

export default connect(null, dispatch => bindActionCreators({
  renamePokemon
}, dispatch))(Nickname)
