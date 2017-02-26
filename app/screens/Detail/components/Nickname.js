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
  if (num === 0) return String.fromCharCode(9450)
  if (num < 21) return String.fromCharCode(9311 + num)
  return `${num}`
}

// 07 instead of 7, but 10 is still 10
function zeroPad(str, len = 3) {
  return `${Array(len - str.length).join('0')}${str}`
}

function templateRename(pokemon, name) {
  const totalEnergy = parseInt(Math.floor(100 / pokemon.move_2.energy_cost), 10)
  const energy = getNumberInCircle(totalEnergy)
  const vi = zeroPad((100 - pokemon.iv).toFixed(0))
  const attack = getNumberInCircle(pokemon.attack)
  const defense = getNumberInCircle(pokemon.defense)
  const stamina = getNumberInCircle(pokemon.stamina)

  return name
    .replace('[IV]', pokemon.iv.toFixed(0))
    .replace('[VI]', vi)
    .replace('[ATT]', attack)
    .replace('[DEF]', defense)
    .replace('[STA]', stamina)
    .replace('[FAST]', pokemon.move_1.power.toFixed(0))
    .replace('[CHARGE]', pokemon.move_2.power.toFixed(0))
    .replace('[ENERGY]', energy)
    .replace('[HP]', pokemon.stamina_max)
}

class Nickname extends React.Component {
  static propTypes = {
    pokemon: PropTypes.object.isRequired,
    renamePokemon: PropTypes.func.isRequired
  }

  state = {
    newNickname: this.props.pokemon.nickname,
    editing: false
  }

  componentDidUpdate() {
    if (this.state.editing) {
      this.lastActiveElement = document.activeElement
      this.input.focus()
      this.input.select()
    } else if (this.lastActiveElement) {
      this.lastActiveElement.focus()
    }
  }

  render() {
    const {
      editing,
      newNickname,
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
  }

  handleEdit = () => {
    this.setState({
      editing: true
    })
  }

  handleKeyPress = (e) => {
    const {
      pokemon,
    } = this.props

    if (e.key === 'Enter') {
      const newName = templateRename(pokemon, e.target.value)

      if (newName.length > 12) {
        ipcRenderer.send('error-message', 'The name must contain 12 characters or less.')
        return
      }

      this.props.renamePokemon(pokemon, newName, (updatedPokemon) => {
        this.handleRenameComplete(updatedPokemon)
      })
    }
  }

  handleRenameComplete = (updatedPokemon) => {
    const {
      pokemon
    } = this.props

    if (updatedPokemon.id !== pokemon.id) return

    this.setState({
      newNickname: updatedPokemon.nickname,
      editing: false
    })
  }
}

export default connect(null, dispatch => bindActionCreators({
  renamePokemon
}, dispatch))(Nickname)
