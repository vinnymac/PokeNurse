import React, {
  PropTypes
} from 'react'

import {
  ipcRenderer
} from 'electron'

const Nickname = React.createClass({
  propTypes: {
    pokemon: PropTypes.object.isRequired,
    monsterUpdater: PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      newNickname: this.props.pokemon.nickname,
      editing: false
    }
  },

  componentDidMount() {
    ipcRenderer.on('rename-pokemon-complete', this.handleRenameComplete)
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

  componentWillUnmount() {
    ipcRenderer.removeListener('rename-pokemon-complete', this.handleRenameComplete)
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
          className="glyphicon glyphicon-pencil"
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
      ipcRenderer.send('rename-pokemon', this.props.pokemon.id, e.target.value)
    }
  },

  handleRenameComplete(event, id, nickname) {
    const {
      pokemon
    } = this.props

    if (id !== pokemon.id) return

    const updatedPokemon = Object.assign({}, pokemon, { nickname })

    this.props.monsterUpdater(updatedPokemon)

    this.setState({
      newNickname: nickname,
      editing: false
    })
  }

})

export default Nickname
