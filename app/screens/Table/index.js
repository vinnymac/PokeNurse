import React, {
  PropTypes
} from 'react'
import {
  ipcRenderer
} from 'electron'
import $ from 'jquery'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import Status from './components/Status'
import SpeciesTable from './components/Species'
import SpeciesCounter from './components/SpeciesPokemonCounter'
import CheckCounter from './components/CheckCounter'

import confirmDialog from '../ConfirmationDialog'
import {
  updateStatus,
  logout,
  getTrainerInfo,
  getTrainerPokemon
} from '../../actions'
import {
  Immutable,
  Organize
} from '../../utils'

window.$ = window.jQuery = $
require('bootstrap')

const COLUMN_SORT_AS_NUM = {
  nickname: false,
  iv: true,
  cp: true,
  favorite: true,
  pokemon_id: true,
  name: false,
  count: true,
  candy: true,
  evolves: true
}

let running = false

// Helper Methods

function runningCheck() {
  if (running) {
    ipcRenderer.send('error-message', 'An action is already running')
    return true
  }
  return false
}

function randomDelay(min, max) {
  return Math.round((min + Math.random() * (max - min)) * 1000)
}

function getHeaderBackgroundStyles(team) {
  let teamName = null
  let teamColor = null

  switch (team) {
    case 1:
      teamName = 'mystic'
      teamColor = '#1162bc'
      break
    case 2:
      teamName = 'valor'
      teamColor = '#cb1617'
      break
    case 3:
      teamName = 'instinct'
      teamColor = '#fad131'
      break
    default:
  }

  return {
    backgroundColor: teamColor,
    backgroundImage: `url("./imgs/${teamName}.jpg")`,
    backgroundRepeat: 'no-repeat'
  }
}

const Table = React.createClass({

  propTypes: {
    updateStatus: PropTypes.func.isRequired,
    logout: PropTypes.func.isRequired,
    getTrainerInfo: PropTypes.func.isRequired,
    trainerData: PropTypes.object,
    getTrainerPokemon: PropTypes.func.isRequired,
    monsters: PropTypes.object
  },

  childContextTypes: {
    monsterUpdater: PropTypes.func.isRequired
  },

  getInitialState() {
    const sortBy = 'pokemon_id'
    const sortDir = 'ASC'

    return {
      filterBy: '',
      sortBy,
      sortDir
    }
  },

  getChildContext() {
    return {
      monsterUpdater: this.updateMonster
    }
  },

  componentDidMount() {
    document.title = 'PokéNurse • Home'

    ipcRenderer.on('receive-players-pokemons', (event, data) => {
      this.setState({ monsters: this.getNewMonsters(data, this.state.sortBy, this.state.sortDir) })
    })

    // Fetch the latest trainer info
    this.props.getTrainerInfo()

    this.props.getTrainerPokemon()

    ipcRenderer.send('table-did-mount')

    ipcRenderer.on('transfer-pokemon-complete', this.handleTransferCompleted)
    ipcRenderer.on('evolve-pokemon-complete', this.handleEvolveCompleted)
  },

  componentWillUnmount() {
    ipcRenderer.removeListener('transfer-pokemon-complete', this.handleTransferCompleted)
    ipcRenderer.removeListener('evolve-pokemon-complete', this.handleEvolveCompleted)
  },

  render() {
    // <!--<h5 id="pokestorage-h"></h5>
    // <h5 id="bagstorage-h"></h5>-->
    const {
      filterBy,
      sortBy,
      sortDir
    } = this.state

    const {
      trainerData,
      monsters
    } = this.props

    const username = trainerData ? trainerData.username : ''
    const backgroundHeaderStyles = trainerData ? getHeaderBackgroundStyles(trainerData.team) : {}

    // TODO let parts of the screen render without monsters
    if (!monsters) return null

    return (
      <div>
        <div className="container">
          <nav
            className="navbar navbar-inverse navbar-fixed-top"
            style={backgroundHeaderStyles}
          >
            <div className="navbar-header username">
              {' '}
              <strong>
                <span id="username-h">
                  {username}
                </span>
              </strong>
            </div>
            <div className="navbar-right">
              <div className="stats">
                <SpeciesCounter monsters={monsters} />
                {' | '}
                <span>
                  <CheckCounter ref={(c) => { this.checkCounter = c }} />
                </span>
              </div>
            </div>
            <div className="navbar-form navbar-right">
              <div className="form-group input-group search">
                <span className="input-group-addon">
                  <span className="glyphicon glyphicon-search" aria-hidden="true" />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search"
                  ref={(c) => { this.search = c }}
                  onChange={this.onFilterChange}
                />
              </div>
            </div>
          </nav>
        </div>
        <Status />

        <div className="container table-container">
          <h1>
            <span>Pokémon</span>
            <span
              className="glyphicon glyphicon-refresh"
              id="refresh-btn"
              onClick={this.handleRefresh}
            />

            <span className="pull-right">
              <input
                type="button"
                className="btn btn-primary"
                value="Toggle Caught Species"
                onClick={this.handleToggleShowAllSpecies}
              />
              {" "}
              <input
                type="button"
                className="btn btn-warning"
                id="transfer-btn"
                value="Transfer"
                onClick={this.handleTransfer}
              />
              {" "}
              <input
                type="button"
                className="btn btn-danger"
                id="evolve-btn"
                value="Evolve"
                onClick={this.handleEvolve}
              />
              {" "}
              <input
                type="button"
                className="btn btn-default"
                value="Sign Out"
                onClick={this.handleSignOut}
              />
            </span>
          </h1>

          <SpeciesTable
            ref={(c) => { this.speciesTable = c }}
            monsters={monsters}
            filterBy={filterBy}
            sortBy={sortBy}
            sortDir={sortDir}
            sortSpeciesBy={this.sortSpeciesBy}
            updateSpecies={this.updateSpecies}
            getSortedPokemon={this.getSortedPokemon}
            updateCheckedCount={this.updateCheckedCount}
          />
        </div>

        <div
          className="modal fade"
          id="confirmationDialog"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="confirmationDialogLabel"
          ref={(c) => { this.confirmationDialog = c }}
        />

        <div
          className="modal fade"
          id="detailModal"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="detailModalLabel"
          ref={(c) => { this.detailModal = c }}
        />
      </div>
    )
  },

  updateCheckedCount(count) {
    this.checkCounter.handleRecount(count)
  },

  updateMonster(pokemon, options = {}) {
    const speciesIndex = pokemon.pokemon_id - 1

    const updatedPokemon = options.remove ? null : pokemon

    this.updateSpecies(speciesIndex, (speciesAtIndex) => {
      const index = speciesAtIndex.pokemon.findIndex((p) => p.id === pokemon.id)

      const sorted = this.getSortedPokemon(Object.assign({}, speciesAtIndex, {
        pokemon: Immutable.array.set(speciesAtIndex.pokemon, index, updatedPokemon)
      }))

      return { // make sure we sort the new pokemon index now that we updated it
        pokemon: sorted
      }
    })
  },

  updateSpecies(index, updater) {
    const speciesAtIndex = this.state.monsters.species[index]
    const updatedSpecies = Object.assign({}, speciesAtIndex, updater(speciesAtIndex))

    const updatedMonsters = Object.assign({}, this.state.monsters, {
      species: Immutable.array.set(this.state.monsters.species, index, updatedSpecies)
    })

    this.setState({
      monsters: updatedMonsters
    })
  },

  onFilterChange(event) {
    this.setState({
      filterBy: String(event.target.value).toLowerCase()
    })
  },

  handleRefresh() {
    ipcRenderer.send('get-players-pokemons', 'async')
  },

  handleTransfer() {
    if (runningCheck()) return

    const selectedPokemon = this.speciesTable.getPokemonChecked()
    if (selectedPokemon.length < 1) return

    confirmDialog($(this.confirmationDialog), {
      title: 'Confirm Transfer',
      message: `Transferring normally doesn't allow favorites.
      Please choose how you would like to transfer your selected pokemon.`,
      pokemon: selectedPokemon,
      secondaryText: 'Transfer All',
      onClickSecondary: () => {
        if (runningCheck()) return

        this.handleCountDown(selectedPokemon, 'Transfer', selectedPokemon.length * 2.5)

        selectedPokemon.forEach((pokemon, index) => {
          ipcRenderer.send('transfer-pokemon', pokemon, index * randomDelay(2, 3))
        })
      },

      primaryText: 'Transfer without favorites',
      onClickPrimary: () => {
        if (runningCheck()) return

        const filteredPokemon = selectedPokemon.filter((p) => {
          const isntFavorite = !p.favorite ? -1 : 0 // TODO stop this -1/0 garbage

          return isntFavorite
        })

        this.handleCountDown(filteredPokemon, 'Transfer', filteredPokemon.length * 2.5)

        filteredPokemon.forEach((pokemon, index) => {
          ipcRenderer.send('transfer-pokemon', pokemon, index * randomDelay(2, 3))
        })
      }
    })
  },

  handleEvolve() {
    if (runningCheck()) return

    const selectedPokemon = this.speciesTable.getPokemonChecked()
    if (selectedPokemon.length < 1) return

    confirmDialog($(this.confirmationDialog), {
      title: 'Confirm Evolve',
      message: 'You are about to evolve the following Pokemon',
      pokemon: selectedPokemon,
      primaryText: 'Evolve Selected',
      onClickSecondary: () => {},
      onClickPrimary: () => {
        if (runningCheck()) return

        this.handleCountDown(selectedPokemon, 'Evolve', selectedPokemon.length * 27.5)

        selectedPokemon.forEach((pokemon, index) => {
          ipcRenderer.send('evolve-pokemon', pokemon, index * randomDelay(25, 30))
        })
      }
    })
  },

  handleCountDown(selectedPokemon, method, time) {
    running = true

    this.props.updateStatus({
      selectedPokemon,
      method,
      time,
      finished: () => {
        running = false
        ipcRenderer.send('information-dialog', 'Complete!', `Finished ${method}`)
        this.handleRefresh()
      }
    })
  },

  getSortedSpecies(monsters, sortBy, sortDir) {
    const species = monsters.species.slice()

    if (COLUMN_SORT_AS_NUM[sortBy]) {
      Organize.sortAsNumber(species, sortBy, sortDir)
    } else {
      Organize.sortAsString(species, sortBy, sortDir)
    }

    return species
  },

  getSortedPokemon(specie, sortBy, sortDir) {
    const pokemon = specie.pokemon.slice()

    if (!sortBy && !sortDir) {
      // Hacky way of retrieving the current sort state of species.jsx
      if (this.speciesTable) {
        const sortState = this.speciesTable.getSortState(specie)
        sortBy = sortState.sortBy
        sortDir = sortState.sortDir
      } else {
        sortBy = 'cp'
        sortDir = 'DESC'
      }
    }

    if (COLUMN_SORT_AS_NUM[sortBy]) {
      Organize.sortAsNumber(pokemon, sortBy, sortDir)
    } else {
      Organize.sortAsString(pokemon, sortBy, sortDir)
    }

    return pokemon
  },

  sortSpeciesBy(newSortBy) {
    const {
      sortBy,
      sortDir
    } = this.state

    let newSortDir = null

    if (newSortBy === sortBy) {
      newSortDir = sortDir === 'ASC' ? 'DESC' : 'ASC'
    } else {
      newSortDir = 'DESC'
    }

    const monsters = Object.assign({}, this.state.monsters, {
      species: this.getSortedSpecies(this.state.monsters, newSortBy, newSortDir)
    })

    this.setState({
      sortDir: newSortDir,
      sortBy: newSortBy,
      monsters
    })
  },

  getNewMonsters(monsters, sortBy, sortDir) {
    const sortedSpecies = this.getSortedSpecies(monsters, sortBy, sortDir)

    // Mutates, but it is okay because we sliced/sorted above ^
    sortedSpecies.forEach(specie => {
      specie.pokemon = this.getSortedPokemon(specie)
    })

    return Object.assign({}, monsters, {
      species: sortedSpecies
    })
  },

  removeMonster(pokemon) {
    this.updateMonster(pokemon, { remove: true })
    // TODO this happens whether or not we find something to remove
    // we should only update the count if we successfully remove
    this.updateCheckedCount(-1)
  },

  handleEvolveCompleted(event, pokemon) {
    this.props.updateStatus({ current: pokemon })
    this.removeMonster(pokemon)
  },

  handleTransferCompleted(event, pokemon) {
    this.props.updateStatus({ current: pokemon })
    this.removeMonster(pokemon)
  },

  handleToggleShowAllSpecies() {
    this.speciesTable.toggleShowAllSpecies()
  },

  handleSignOut() {
    this.props.logout()
  }
})

export default connect((state => ({
  trainerData: state.trainer.trainerData,
  monsters: state.trainer.monsters
})), (dispatch => bindActionCreators({
  updateStatus,
  logout,
  getTrainerInfo,
  getTrainerPokemon
}, dispatch)))(Table)
