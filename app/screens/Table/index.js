import React, {
  PropTypes
} from 'react'
import {
  ipcRenderer
} from 'electron'
import $ from 'jquery'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  ButtonGroup,
  Button,
} from 'react-bootstrap'

import MainMenu from '../Menu'
import Status from './components/Status'
import SpeciesTable from './components/Species'
import SpeciesCounter from './components/SpeciesPokemonCounter'
import CheckCounter from './components/CheckCounter'
import PokemonTable from './components/PokemonTable'

import confirmDialog from '../ConfirmationDialog'
import {
  refreshPokemon,
  updateSpecies,
  updateMonster,
  updateMonsterSort,
  evolveSelectedPokemon,
  transferSelectedPokemon,
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

const teams = [
  {
    name: 'default',
    color: '#000000',
  },
  {
    name: 'mystic',
    color: '#1162bc',
  },
  {
    name: 'valor',
    color: '#cb1617',
  },
  {
    name: 'instinct',
    color: '#fad131',
  },
]

function getHeaderBackgroundStyles(teamIndex) {
  const team = teams[teamIndex]

  return {
    backgroundColor: team.color,
    backgroundImage: `url('./imgs/${team.name}.jpg')`,
    backgroundRepeat: 'no-repeat'
  }
}

const Table = React.createClass({

  propTypes: {
    trainerData: PropTypes.shape({
      username: PropTypes.string,
    }),
    refreshPokemon: PropTypes.func.isRequired,
    monsters: PropTypes.object,
    updateSpecies: PropTypes.func.isRequired,
    updateMonster: PropTypes.func.isRequired,
    updateMonsterSort: PropTypes.func.isRequired,
    speciesState: PropTypes.object,
    filterBy: PropTypes.string,
    sortBy: PropTypes.string,
    sortDir: PropTypes.string,
    evolveSelectedPokemon: PropTypes.func.isRequired,
    transferSelectedPokemon: PropTypes.func.isRequired,
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

    let mainTable

    if (false) {
      mainTable = (<SpeciesTable
        filterBy={filterBy}
        sortBy={sortBy}
        sortDir={sortDir}
                   />)
    } else {
      mainTable = (<PokemonTable
        filterBy={filterBy}
        sortBy={sortBy}
        sortDir={sortDir}
                   />)
    }

    return (
      <div>
        <nav className="global-nav">
          <div className="nav-header" style={backgroundHeaderStyles}>
            <div>
              <MainMenu eggs={monsters.eggs} />
            </div>
            <div className="flex p5 flex-row">
              {' '}
              <strong className="mra" id="username-h">
                {username}
              </strong>

              <div className="flex search">
                <label htmlFor="search">
                  <i className="fa fa-search" aria-hidden="true" />
                </label>

                <input
                  type="search"
                  id="search"
                  placeholder="Search…"
                  ref={(c) => { this.search = c }}
                  onChange={this.onFilterChange}
                />

                <label htmlFor="search">
                  <button
                    alt="Clear search field"
                    onClick={this.handleClearSearch}
                  >
                    x
                  </button>
                </label>
              </div>

              <div>
                <SpeciesCounter monsters={monsters} />
                {' | '}
                <span className="ib">
                  <CheckCounter />
                </span>
              </div>
            </div>
          </div>

          <Status />

          <header className="flex p5">
            <h2 className="h2 mra">
              <ButtonGroup data-toggle="buttons">
                <Button
                  className="noselect"
                  bsStyle="info"
                  active={true}
                >
                  <input
                    type="radio"
                    name="auth-radio"
                    value={'pokemon'}
                    defaultChecked={true}
                  />
                  Pokémon
                </Button>
                <Button
                  className="noselect"
                  bsStyle="info"
                  active={false}
                >
                  <input
                    type="radio"
                    name="auth-radio"
                    value={'species'}
                    defaultChecked={false}
                  />
                  Species
                </Button>
              </ButtonGroup>
              <span
                className="fa fa-refresh"
                id="refresh-btn"
                role="button"
                onClick={this.handleRefresh}
              />
            </h2>

            <span>
              <input
                type="button"
                className="btn btn-warning"
                id="transfer-btn"
                value="Transfer"
                onClick={this.handleTransfer}
              />
              {' '}
              <input
                type="button"
                className="btn btn-danger"
                id="evolve-btn"
                value="Evolve"
                onClick={this.handleEvolve}
              />
            </span>
          </header>
        </nav>

        <div className="container table-container">
          {mainTable}
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
    this.props.refreshPokemon()
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

        running = true

        this.props.transferSelectedPokemon(selectedPokemon)
          .then(() => this.handleAllComplete())
          .catch(() => this.handleAllComplete())
      },

      primaryText: 'Transfer without favorites',
      onClickPrimary: () => {
        if (runningCheck()) return

        const filteredPokemon = selectedPokemon.filter((p) => {
          const isntFavorite = !p.favorite ? -1 : 0 // TODO stop this -1/0 garbage

          return isntFavorite
        })

        running = true

        this.props.transferSelectedPokemon(filteredPokemon)
          .then(() => this.handleAllComplete())
          .catch(() => this.handleAllComplete())
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

        running = true

        this.props.evolveSelectedPokemon(selectedPokemon)
          .then(() => this.handleAllComplete())
          .catch(() => this.handleAllComplete())
      }
    })
  },

  handleAllComplete() {
    running = false
  },

  handleClearSearch() {
    this.search.value = ''
    this.onFilterChange({ target: this.search })
    this.search.focus()
  }
})

export default connect((state => ({
  trainerData: state.trainer.trainerData,
  monsters: state.trainer.monsters,
  speciesState: state.trainer.speciesState,
  sortBy: state.trainer.sortBy,
  sortDir: state.trainer.sortDir,
  filterBy: state.trainer.filterBy,
})), (dispatch => bindActionCreators({
  refreshPokemon,
  updateSpecies,
  updateMonster,
  updateMonsterSort,
  evolveSelectedPokemon,
  transferSelectedPokemon,
}, dispatch)))(Table)
