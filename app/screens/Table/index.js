import React from 'react'
import {
  ipcRenderer
} from 'electron'
import $ from 'jquery'
import findIndex from 'lodash/findIndex'

import SpeciesTable from './components/Species'
import SpeciesCounter from './components/SpeciesPokemonCounter'
import CheckCounter from './components/CheckCounter'

import confirmDialog from '../ConfirmationDialog'

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

function countDown(method, index, statusH, callback) {
  const interval = setInterval(() => {
    statusH.innerHTML = `${method} / ${index} second(s) left`
    index--
    if (index <= 0) {
      clearInterval(interval)
      running = false
      statusH.innerHTML = 'Idle'
      callback()
    }
  }, 1000)
}

function randomDelay(min, max) {
  return Math.round((min + Math.random() * (max - min)) * 1000)
}

function setBackgroundImage(team) {
  const header = document.getElementById('profile-header')
  let teamName = null
  switch (team) {
    case 1:
      teamName = 'mystic'
      break
    case 2:
      teamName = 'valor'
      break
    case 3:
      teamName = 'instinct'
      break
    default:
  }

  header.style.backgroundImage = `url("./imgs/${teamName}.jpg")`
}

const Table = React.createClass({

  childContextTypes: {
    monsterUpdater: React.PropTypes.func.isRequired
  },

  getInitialState() {
    const monsters = ipcRenderer.sendSync('get-players-pokemons')
    const sortBy = 'pokemon_id'
    const sortDir = 'ASC'

    return {
      monsters: this.getNewMonsters(monsters, sortBy, sortDir),
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

    const usernameH = document.getElementById('username-h')

    const playerInfo = ipcRenderer.sendSync('get-player-info')
    if (playerInfo.success) {
      setBackgroundImage(playerInfo.player_data.team)

      usernameH.innerHTML = playerInfo.player_data.username
    } else {
      ipcRenderer.send('error-message', 'Failed in retrieving player info.  Please restart.')
    }

    ipcRenderer.send('table-did-mount')

    ipcRenderer.on('transfer-pokemon-complete', this.handleTransferCompleted)
    ipcRenderer.on('evolve-pokemon-complete', this.handleEvolveCompleted)
  },

  componentWillUnmount() {
    ipcRenderer.off('transfer-pokemon-complete', this.handleTransferCompleted)
    ipcRenderer.off('evolve-pokemon-complete', this.handleEvolveCompleted)
  },

  render() {
    // <!--<h5 id="pokestorage-h"></h5>
    // <h5 id="bagstorage-h"></h5>-->
    const {
      monsters,
      filterBy,
      sortBy,
      sortDir
    } = this.state

    return (
      <div>
        <header className="header" id="profile-header">
          <div className="row">
            <div className="col-xs-6">
              <p id="username-h" />
            </div>
            <div className="col-xs-6 pull-right">
              <p>
                <span>Status:{' '}
                  <span id="status-h" ref={(c) => { this.statusH = c }}>Idle</span>
                </span>
              </p>
              <SpeciesCounter monsters={monsters} />
              <p>
                <span>
                  <CheckCounter ref={(c) => { this.checkCounter = c }} />
                </span>
              </p>
            </div>
          </div>
        </header>

        <div className="container">
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
                className="btn btn-warning"
                id="transfer-btn"
                value="Transfer selected"
                onClick={this.handleTransfer}
              />
              {" "}
              <input
                type="button"
                className="btn btn-danger"
                id="evolve-btn"
                value="Evolve selected"
                onClick={this.handleEvolve}
              />
            </span>
          </h1>

          <div className="row">
            <div className="col-md-12">
              <div className="form-group input-group">
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
          </div>

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

  updateMonster(pokemon, index, speciesIndex) {
    this.updateSpecies(speciesIndex, (speciesAtIndex) => {
      const sorted = this.getSortedPokemon(Object.assign({}, speciesAtIndex, {
        pokemon: Immutable.array.set(speciesAtIndex.pokemon, index, pokemon)
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
        running = true

        selectedPokemon.forEach((pokemon, index) => {
          ipcRenderer.send('transfer-pokemon', pokemon, index * randomDelay(2, 3))
        })

        this.handleCountDown('Transfer', selectedPokemon.length * 2.5)
      },

      primaryText: 'Transfer without favorites',
      onClickPrimary: () => {
        running = true

        const filteredPokemon = selectedPokemon.filter((p) => {
          const isntFavorite = !p.favorite ? -1 : 0 // TODO stop this -1/0 garbage

          return isntFavorite
        })

        filteredPokemon.forEach((pokemon, index) => {
          ipcRenderer.send('transfer-pokemon', pokemon, index * randomDelay(2, 3))
        })

        this.handleCountDown('Transfer', filteredPokemon.length * 2.5)
      }
    })
  },

  handleEvolve() {
    if (runningCheck()) return

    const selectedPokemon = this.speciesTable.getPokemonChecked()
    if (selectedPokemon.length < 1) return

    confirmDialog($(this.confirmationDialog), {
      title: 'Confirm Evolve',
      message: 'You are about the evolve the following Pokemon',
      pokemon: selectedPokemon,
      primaryText: 'Evolve Selected',
      onClickSecondary: () => {},
      onClickPrimary: () => {
        running = true

        selectedPokemon.forEach((pokemon, index) => {
          ipcRenderer.send('evolve-pokemon', String(pokemon.id), index * randomDelay(25, 30))
        })

        this.handleCountDown('Evolve', selectedPokemon.length * 27.5)
      }
    })
  },

  handleCountDown(method, index) {
    const { statusH } = this

    countDown(method, index, statusH, () => {
      ipcRenderer.send('information-dialog', 'Complete!', `Finished ${method}`)
      this.handleRefresh()
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
    let pokemonIndex = -1

    const specieIndex = findIndex(this.state.monsters.species, (specie) => {
      pokemonIndex = findIndex(specie.pokemon, (p) => {
        const isPokemon = p.id === pokemon.id
        return isPokemon
      })
      return pokemonIndex > -1
    })

    if (pokemonIndex > -1) {
      this.updateMonster(null, pokemonIndex, specieIndex)
      this.updateCheckedCount(-1)
    }
  },

  handleEvolveCompleted(event, pokemon) {
    this.removeMonster(pokemon)
  },

  handleTransferCompleted(event, pokemon) {
    this.removeMonster(pokemon)
  }
})

export default Table
