import path from 'path'
import fs from 'fs'
import {
  handleActions
} from 'redux-actions'
import {
  remote
} from 'electron'

const settingsPath = path.join(remote.app.getPath('appData'), '/pokenurse/settings.json')

const ASCENDING = 'ASC'
const DESCENDING = 'DESC'

const initialSettingsState = {
  showSpeciesWithZeroPokemon: true,
  autoLogin: false,
  defaultPokedexSortBy: 'pokemon_id',
  defaultPokedexSortDirection: ASCENDING,
  defaultSpecieSortBy: 'cp',
  defaultSpecieSortDirection: DESCENDING,
}

function getInitialSettingsState() {
  if (!fs.existsSync(settingsPath)) {
    return initialSettingsState
  }

  const settingsJSON = JSON.parse(fs.readFileSync(settingsPath))

  return Object.assign({}, initialSettingsState, settingsJSON)
}

function updateSettingState(state, setting) {
  const updated = Object.assign({}, state, setting)

  fs.writeFileSync(settingsPath, JSON.stringify(updated))

  return updated
}

const defaultSettings = getInitialSettingsState()

export {
  defaultSettings,
}

export default handleActions({
  TOGGLE_SHOW_SPECIES_WITH_ZERO_POKEMON(state) {
    return updateSettingState(state, {
      showSpeciesWithZeroPokemon: !state.showSpeciesWithZeroPokemon
    })
  },

  TOGGLE_AUTO_LOGIN(state) {
    return updateSettingState(state, {
      autoLogin: !state.autoLogin
    })
  },

  RESET_ALL_SETTINGS(state) {
    return updateSettingState(state, initialSettingsState)
  },

  CHANGE_DEFAULT_POKEDEX_SORT_BY(state, action) {
    return updateSettingState(state, {
      defaultPokedexSortBy: action.payload
    })
  },

  CHANGE_DEFAULT_POKEDEX_SORT_DIRECTION(state, action) {
    return updateSettingState(state, {
      defaultPokedexSortDirection: action.payload
    })
  },

  CHANGE_DEFAULT_SPECIE_SORT_DIRECTION(state, action) {
    return updateSettingState(state, {
      defaultSpecieSortDirection: action.payload
    })
  },

  CHANGE_DEFAULT_SPECIE_SORT_BY(state, action) {
    return updateSettingState(state, {
      defaultSpecieSortBy: action.payload
    })
  },
}, defaultSettings)
