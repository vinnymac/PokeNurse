import React, {
  PropTypes
} from 'react'

import {
  ipcRenderer
} from 'electron'

const Nickname = React.createClass({
  propTypes: {
    nickname: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired
  },

  getInitialState() {
    return {
      newNickname: this.props.nickname,
      editing: false
    }
  },

  componentDidMount() {
    ipcRenderer.on('rename-pokemon-complete', this.handleRenameComplete)
  },

  componentDidUpdate() {
    if (this.state.editing) {
      this.input.focus()
      this.input.select()
    }
  },

  componentWillUnmount() {
    ipcRenderer.off('rename-pokemon-complete', this.handleRenameComplete)
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
      ipcRenderer.send('rename-pokemon', this.props.id, e.target.value)
    }
  },

  handleRenameComplete(event, id, nickname) {
    if (id !== this.props.id) return

    this.setState({
      newNickname: nickname,
      editing: false
    })
  }

})

export default Nickname
