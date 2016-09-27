import React, {
  PropTypes
} from 'react'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { renamePokemon } from '../../../actions'

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
          maxLength="12"
          placeholder="Enter a new nickname"
          ref={(c) => { this.input = c }}
        />
      )
    }

    return (
      <div id="pokemon_name">
        {newNickname}
        {" "}
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
    if (e.key === 'Enter') {
      this.props.renamePokemon(this.props.pokemon, e.target.value, (updatedPokemon) => {
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
