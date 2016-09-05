import {
  createAction
} from 'redux-actions'

export default {
  toggleShowSpeciesWithZeroPokemon: createAction('TOGGLE_SHOW_SPECIES_WITH_ZERO_POKEMON'),
  resetAllSettings: createAction('RESET_ALL_SETTINGS'),
}
