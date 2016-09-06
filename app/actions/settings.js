import {
  createAction
} from 'redux-actions'

export default {
  toggleShowSpeciesWithZeroPokemon: createAction('TOGGLE_SHOW_SPECIES_WITH_ZERO_POKEMON'),
  toggleAutoLogin: createAction('TOGGLE_AUTO_LOGIN'),
  resetAllSettings: createAction('RESET_ALL_SETTINGS'),
}
