import React, {
  PropTypes
} from 'react'
import {
  ipcRenderer
} from 'electron'
import $ from 'jquery'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import MainMenu from '../Menu'
import Status from './components/Status'
import SpeciesTable from './components/Species'
import SpeciesCounter from './components/SpeciesPokemonCounter'
import CheckCounter from './components/CheckCounter'

import confirmDialog from '../ConfirmationDialog'
import {
  updateStatus,
  logout,
  getTrainerPokemon,
  updateSpecies,
  updateMonster,
  updateMonsterSort,
  evolvePokemon,
  transferPokemon,
} from '../../actions'

window.$ = window.jQuery = $
require('bootstrap')

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
    trainerData: PropTypes.object,
    getTrainerPokemon: PropTypes.func.isRequired,
    monsters: PropTypes.object,
    updateSpecies: PropTypes.func.isRequired,
    updateMonster: PropTypes.func.isRequired,
    updateMonsterSort: PropTypes.func.isRequired,
    speciesState: PropTypes.object,
    filterBy: PropTypes.string,
    sortBy: PropTypes.string,
    sortDir: PropTypes.string,
    transferPokemon: PropTypes.func.isRequired,
    evolvePokemon: PropTypes.func.isRequired,
  },

  componentDidMount() {
    document.title = 'PokéNurse • Home'

    ipcRenderer.send('table-did-mount')
  },

  render() {
    // <!--<h5 id="pokestorage-h"></h5>
    // <h5 id="bagstorage-h"></h5>-->
    const {
      filterBy,
      sortBy,
      sortDir
    } = this.props

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
            <div className="navbar-header">
              <MainMenu />
            </div>
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
                  <CheckCounter />
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
            </span>
          </h1>

          <SpeciesTable
            filterBy={filterBy}
            sortBy={sortBy}
            sortDir={sortDir}
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
        />

        <div
          className="modal fade"
          id="settingsModal"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="settingsModalLabel"
        />
      </div>
    )
  },

  updateMonster(pokemon, options = {}) {
    this.props.updateMonster({ pokemon, options })
  },

  updateSpecies(index, updater) {
    this.props.updateSpecies({ index, updater })
  },

  onFilterChange(event) {
    this.props.updateMonsterSort({
      filterBy: String(event.target.value).toLowerCase()
    })
  },

  handleRefresh() {
    this.props.getTrainerPokemon()
  },

  getPokemonChecked() {
    const {
      monsters,
      speciesState
    } = this.props
    const checkedPokemon = []

    monsters.species.forEach((specie) => {
      specie.pokemon.forEach((p) => {
        if (speciesState[specie.pokemon_id].pokemonState[p.id].check) {
          checkedPokemon.push(p)
        }
      })
    })

    return checkedPokemon
  },

  handleTransfer() {
    if (runningCheck()) return

    const selectedPokemon = this.getPokemonChecked()
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
          this.props.transferPokemon(pokemon, index * randomDelay(2, 3))
            .then(() => {
              this.handleTransferCompleted(pokemon)
            })
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
          this.props.transferPokemon(pokemon, index * randomDelay(2, 3))
            .then(() => {
              this.handleTransferCompleted(pokemon)
            })
        })
      }
    })
  },

  handleEvolve() {
    if (runningCheck()) return

    const selectedPokemon = this.getPokemonChecked()
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
          this.props.evolvePokemon(pokemon, index * randomDelay(25, 30))
            .then(() => {
              this.handleEvolveCompleted(pokemon)
            })
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

  removeMonster(pokemon) {
    this.updateMonster(pokemon, { remove: true })
  },

  handleEvolveCompleted(pokemon) {
    this.props.updateStatus({ current: pokemon })
    this.removeMonster(pokemon)
  },

  handleTransferCompleted(pokemon) {
    this.props.updateStatus({ current: pokemon })
    this.removeMonster(pokemon)
  },

})

export default connect((state => ({
  trainerData: state.trainer.trainerData,
  monsters: state.trainer.monsters,
  speciesState: state.trainer.speciesState,
  sortBy: state.trainer.sortBy,
  sortDir: state.trainer.sortDir,
  filterBy: state.trainer.filterBy,
})), (dispatch => bindActionCreators({
  updateStatus,
  logout,
  getTrainerPokemon,
  updateSpecies,
  updateMonster,
  updateMonsterSort,
  evolvePokemon,
  transferPokemon,
}, dispatch)))(Table)
