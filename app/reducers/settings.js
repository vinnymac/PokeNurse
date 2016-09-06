import path from 'path'
import fs from 'fs'
import {
  handleActions
} from 'redux-actions'
import {
  remote
} from 'electron'

const settingsPath = path.join(remote.app.getPath('appData'), '/pokenurse/settings.json')

const initialSettingsState = {
  showSpeciesWithZeroPokemon: true,
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

const initialState = getInitialSettingsState()

export default handleActions({
  TOGGLE_SHOW_SPECIES_WITH_ZERO_POKEMON(state) {
    return updateSettingState(state, {
      showSpeciesWithZeroPokemon: !state.showSpeciesWithZeroPokemon
    })
  },

  RESET_ALL_SETTINGS(state) {
    return updateSettingState(state, initialSettingsState)
  },
}, initialState)
