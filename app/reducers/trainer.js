import {
  every,
  mapValues,
} from 'lodash'
import {
  handleActions
} from 'redux-actions'
import {
  ipcRenderer,
} from 'electron'

import { Immutable, Organize } from '../utils'

import {
  defaultSettings
} from './settings'

const {
  getSortedPokemon,
  getSortedSpecies
} = Organize

const ASCENDING = 'ASC'
const DESCENDING = 'DESC'

const initialState = {
  trainerData: null,
  monsters: null,
  filterBy: '',
  sortBy: defaultSettings.defaultPokedexSortBy,
  sortDir: defaultSettings.defaultPokedexSortDirection,
  speciesState: null,
  selectedCount: 0,
}

function getInitialPokemonState(specie) {
  const pokemonState = {}
  specie.pokemon.forEach((p) => {
    pokemonState[p.id] = { check: false }
  })
  return pokemonState
}

function getNewSpeciesState(state) {
  const speciesState = {}

  const sortBy = defaultSettings.defaultSpecieSortBy
  const sortDir = defaultSettings.defaultSpecieSortDirection

  let selectedCount = 0

  state.monsters.species.forEach((specie) => {
    const pid = String(specie.pokemon_id)
    let existingSpecieState = null

    if (state.speciesState) existingSpecieState = state.speciesState[pid]

    // specie state already exists
    if (existingSpecieState) {
      const updatedSpecieState = { pokemonState: {} }
      let checkAll = true
      specie.pokemon.forEach((p) => {
        // pokemon already exists
        if (existingSpecieState.pokemonState[p.id]) {
          updatedSpecieState.pokemonState[p.id] = existingSpecieState.pokemonState[p.id]
          const isChecked = updatedSpecieState.pokemonState[p.id].check
          checkAll = checkAll && isChecked
          if (isChecked) selectedCount++
        // pokemon does not exist
        } else {
          updatedSpecieState.pokemonState[p.id] = { check: false }
          checkAll = false
        }
      })
      updatedSpecieState.checkAll = checkAll
      speciesState[pid] = {
        ...existingSpecieState,
        ...updatedSpecieState,
      }
    // specie state does not exist
    } else {
      speciesState[pid] = {
        pokemonState: getInitialPokemonState(specie),
        checkAll: false,
        collapsed: true,
        sortBy,
        sortDir
      }
    }
  })

  return {
    speciesState,
    selectedCount
  }
}

// TODO Utils
function getNewMonsters(state, monsters, sortBy, sortDir) {
  const sortedSpecies = getSortedSpecies(monsters, sortBy, sortDir)

  // Mutates, but it is okay because we sliced/sorted above ^
  sortedSpecies.forEach((specie) => {
    // we don't have a specieState on start, sort will fallback to defaults
    const specieState = state.speciesState ? state.speciesState[specie.pokemon_id] : null

    specie.pokemon = getSortedPokemon(specie, specieState)
  })
  return {
    ...monsters,
    species: sortedSpecies,
  }
}

// Anytime the speciesState changes we should recount selected
function updateSpecies(state, index, updater) {
  const specieAtIndexPokemonId = index + 1
  const indexForSpecie = state.monsters.species.findIndex(specie => specie.pokemon_id === specieAtIndexPokemonId)
  const specieAtIndex = state.monsters.species[indexForSpecie]
  const updatedSpecies = { ...specieAtIndex, ...updater(specieAtIndex) }

  const updatedMonsters = {
    ...state.monsters,
    species: Immutable.array.set(state.monsters.species, indexForSpecie, updatedSpecies),
  }

  const updatedStateWithMonsters = {
    ...state,
    monsters: updatedMonsters,
  }

  const {
    speciesState,
    selectedCount
  } = getNewSpeciesState(updatedStateWithMonsters)

  return {
    ...updatedStateWithMonsters,
    speciesState,
    selectedCount,
  }
}

function updateSpeciesState(state, id, updater) {
  const {
    speciesState,
  } = state
  const existingSpecieState = speciesState[String(id)]

  return {
    ...speciesState,
    [String(id)]: {
      ...existingSpecieState,
      ...updater(existingSpecieState),
    },
  }
}

function updatePokemonState(speciesState, pid, updater) {
  const existingPokemonByIdState = speciesState.pokemonState[String(pid)]

  const newPokemonByIdState = {}
  newPokemonByIdState[String(pid)] = {
    ...existingPokemonByIdState,
    ...updater(existingPokemonByIdState),
  }

  return {
    ...speciesState.pokemonState,
    ...newPokemonByIdState
  }
}

function updateMonster(state, pokemon, options = {}) {
  const speciesIndex = pokemon.pokemon_id - 1

  const updatedPokemon = options.remove ? null : pokemon

  return updateSpecies(state, speciesIndex, (speciesAtIndex) => {
    const index = speciesAtIndex.pokemon.findIndex((p) => p.id === pokemon.id)

    const sorted = getSortedPokemon({
      ...speciesAtIndex,
      pokemon: Immutable.array.set(speciesAtIndex.pokemon, index, updatedPokemon),
    }, state.speciesState[pokemon.pokemon_id])

    return { // make sure we sort the new pokemon index now that we updated it
      pokemon: sorted
    }
  })
}

function getNewSortDirectionFromSortBy(sortBy, specieState) {
  let sortDir = null

  // If we are already sorting this way, flip direction
  if (sortBy === specieState.sortBy) {
    sortDir = specieState.sortDir === ASCENDING ? DESCENDING : ASCENDING
  // Otherwise use descending
  } else {
    sortDir = DESCENDING
  }

  return sortDir
}

export default handleActions({
  GET_TRAINER_INFO_SUCCESS(state, action) {
    return {
      ...state,
      ...action.payload,
    }
  },

  GET_TRAINER_INFO_FAILED(state, action) {
    ipcRenderer.send('error-message', String(action.payload))
    return state
  },

  GET_TRAINER_POKEMON_SUCCESS(state, action) {
    const monsters = getNewMonsters(state, action.payload, state.sortBy, state.sortDir)

    const updatedStateWithMonsters = {
      ...state,
      monsters,
    }

    const {
      speciesState,
      selectedCount
    } = getNewSpeciesState(updatedStateWithMonsters)

    // TODO always sort the data before we return it
    return {
      ...updatedStateWithMonsters,
      speciesState,
      selectedCount,
    }
  },

  GET_TRAINER_POKEMON_FAILED(state, action) {
    console.error(action.payload) // eslint-disable-line
    return state
  },

  UPDATE_MONSTER(state, action) {
    const {
      pokemon,
      options
    } = action.payload

    return updateMonster(state, pokemon, options)
  },

  UPDATE_SPECIES(state, action) {
    const {
      index,
      updater
    } = action.payload

    return updateSpecies(state, index, updater)
  },

  // TODO Maybe just generic UPDATE_TRAINER_STORE
  // using this too much right now, taking the easy way out of refactoring
  UPDATE_MONSTER_SORT(state, action) {
    return { ...state, ...action.payload }
  },

  SORT_SPECIES(state, action) {
    const {
      sortBy,
      speciesIndex, // this index could be wrong when sorted, so we use findIndex
    } = action.payload

    const pokemonId = speciesIndex + 1

    const specieState = state.speciesState[pokemonId]

    const sortDir = getNewSortDirectionFromSortBy(sortBy, specieState)

    const updatedSpeciesState = {
      ...state,
      speciesState: updateSpeciesState(state, pokemonId, () => ({ sortDir, sortBy })),
    }

    return updateSpecies(updatedSpeciesState, speciesIndex, (speciesAtIndex) => {
      const sorted = getSortedPokemon(speciesAtIndex, null, sortBy, sortDir)

      return {
        pokemon: sorted
      }
    })
  },

  TOGGLE_FAVORITE_POKEMON_SUCCESS(state, action) {
    return updateMonster(state, action.payload)
  },

  TOGGLE_FAVORITE_POKEMON_FAILED(state, action) {
    console.error(action.payload) // eslint-disable-line
    return state
  },

  POWER_UP_POKEMON_SUCCESS(state, action) {
    const pokemon = action.payload
    const message = `Upgraded ${pokemon.nickname} successfully!`
    const title = `Power Up ${pokemon.nickname}`
    ipcRenderer.send('information-dialog', message, title)

    return state
  },

  POWER_UP_POKEMON_FAILED(state, action) {
    console.error(action.payload) // eslint-disable-line
    return state
  },

  RENAME_POKEMON_SUCCESS(state, action) {
    return updateMonster(state, action.payload)
  },

  RENAME_POKEMON_FAILED(state, action) {
    console.error(action.payload) // eslint-disable-line
    return state
  },

  TRANSFER_POKEMON_SUCCESS(state, action) {
    const pokemon = action.payload
    console.info(`Transferred ${pokemon.id}`) // eslint-disable-line
    return state
  },

  TRANSFER_POKEMON_FAILED(state, action) {
    console.error(action.payload) // eslint-disable-line
    return state
  },

  EVOLVE_POKEMON_SUCCESS(state, action) {
    const pokemon = action.payload
    console.info(`Evolved ${pokemon.id}`) // eslint-disable-line
    return state
  },

  EVOLVE_POKEMON_FAILED(state, action) {
    console.error(action.payload) // eslint-disable-line
    return state
  },

  COLLAPSE_BY_SPECIES(state, action) {
    const specie = action.payload

    if (specie.count < 1) return state

    return {
      ...state,
      speciesState: updateSpeciesState(state, specie.pokemon_id, (speciesState) => {
        const newCollapsed = !speciesState.collapsed

        return { collapsed: newCollapsed }
      }),
    }
  },

  CHECK_ALL_BY_SPECIES(state, action) {
    const species = action.payload

    let selectedCount = state.selectedCount

    const speciesState = updateSpeciesState(state, species.pokemon_id, (specieState) => {
      const newCheckAllState = !specieState.checkAll
      const newPokemonState = {}
      const ids = Object.keys(specieState.pokemonState)

      ids.forEach(id => {
        if (newCheckAllState !== specieState.pokemonState[id].check) {
          if (newCheckAllState) {
            selectedCount++
          } else {
            selectedCount--
          }
        }

        newPokemonState[id] = {
          ...specieState.pokemonState[id],
          check: newCheckAllState,
        }
      })

      return {
        checkAll: newCheckAllState,
        pokemonState: newPokemonState
      }
    })

    return {
      ...state,
      speciesState,
      selectedCount,
    }
  },

  CHECK_POKEMON(state, action) {
    const pokemon = action.payload

    let selectedCount = state.selectedCount

    const speciesState = updateSpeciesState(state,
      String(pokemon.pokemon_id),
      (specieState) => {
        const updatedPokemonState = updatePokemonState(
          specieState,
          String(pokemon.id),
          (pokemonState) => {
            const newChecked = !pokemonState.check

            if (newChecked) {
              selectedCount++
            } else {
              selectedCount--
            }

            return { check: newChecked }
          }
        )

        return {
          checkAll: every(updatedPokemonState, { check: true }),
          pokemonState: updatedPokemonState
        }
      }
    )

    return {
      ...state,
      speciesState,
      selectedCount,
    }
  },

  SORT_ALL_SPECIES(state, action) {
    const sortBy = action.payload

    const sortDir = getNewSortDirectionFromSortBy(sortBy, state)

    const monsters = {
      ...state.monsters,
      species: getSortedSpecies(state.monsters, sortBy, sortDir),
    }

    return {
      ...state,
      sortDir,
      sortBy,
      monsters
    }
  },

  SORT_WITH_DEFAULTS(state, action) {
    const {
      defaultPokedexSortBy,
      defaultPokedexSortDirection,
      defaultSpecieSortBy,
      defaultSpecieSortDirection,
    } = action.payload

    const updatedSpeciesAndMonstersState = {
      ...state.monsters,
      species: getSortedSpecies(state.monsters, defaultPokedexSortBy, defaultPokedexSortDirection).map((s) => {
        const sorted = getSortedPokemon(s, null, defaultSpecieSortBy, defaultSpecieSortDirection)

        return { ...s, pokemon: sorted }
      }),
    }

    const updatedSpeciesState = mapValues(state.speciesState, (specieState) => {
      const newSpecieState = {
        ...specieState,
        sortBy: defaultSpecieSortBy,
        sortDir: defaultSpecieSortDirection,
      }

      return newSpecieState
    })

    return {
      ...state,
      monsters: updatedSpeciesAndMonstersState,
      sortBy: defaultPokedexSortBy,
      sortDir: defaultPokedexSortDirection,
      speciesState: updatedSpeciesState,
    }
  },
}, initialState)
