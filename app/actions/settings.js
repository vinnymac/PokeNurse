import {
  createAction
} from 'redux-actions'

export default {
  toggleShowSpeciesWithZeroPokemon: createAction('TOGGLE_SHOW_SPECIES_WITH_ZERO_POKEMON'),
  toggleAutoLogin: createAction('TOGGLE_AUTO_LOGIN'),
  resetAllSettings: createAction('RESET_ALL_SETTINGS'),
  changeDefaultPokedexSortBy: createAction('CHANGE_DEFAULT_POKEDEX_SORT_BY'),
  changeDefaultPokedexSortDirection: createAction('CHANGE_DEFAULT_POKEDEX_SORT_DIRECTION'),
  changeDefaultSpecieSortBy: createAction('CHANGE_DEFAULT_SPECIE_SORT_BY'),
  changeDefaultSpecieSortDirection: createAction('CHANGE_DEFAULT_SPECIE_SORT_DIRECTION'),
}
