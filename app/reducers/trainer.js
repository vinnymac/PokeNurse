import {
  handleActions
} from 'redux-actions'
import {
  ipcRenderer
} from 'electron'

import { Immutable, Organize } from '../utils'

const {
  getSortedPokemon,
  getSortedSpecies
} = Organize

const initialState = {
  trainerData: null,
  monsters: null,
  filterBy: '',
  sortBy: 'pokemon_id',
  sortDir: 'ASC',
  showSpeciesWithZeroPokemon: true,
  speciesState: null
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

  const sortBy = 'cp'
  const sortDir = 'DESC'

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
          checkAll = checkAll && updatedSpecieState.pokemonState[p.id].check
        // pokemon does not exist
        } else {
          updatedSpecieState.pokemonState[p.id] = { check: false }
          checkAll = false
        }
      })
      updatedSpecieState.checkAll = checkAll
      speciesState[pid] = Object.assign({}, existingSpecieState, updatedSpecieState)
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

  return speciesState
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

  return Object.assign({}, monsters, {
    species: sortedSpecies
  })
}

function updateSpecies(state, index, updater) {
  const speciesAtIndex = state.monsters.species[index]
  const updatedSpecies = Object.assign({}, speciesAtIndex, updater(speciesAtIndex))

  const updatedMonsters = Object.assign({}, state.monsters, {
    species: Immutable.array.set(state.monsters.species, index, updatedSpecies)
  })

  const updatedStateWithMonsters = Object.assign({}, state, {
    monsters: updatedMonsters
  })

  return Object.assign({}, updatedStateWithMonsters, {
    speciesState: getNewSpeciesState(updatedStateWithMonsters)
  })
}

function updateSpeciesState(state, id, updater) {
  const {
    speciesState
  } = state
  const newSpecieState = {}
  const existingSpecieState = speciesState[String(id)]

  newSpecieState[String(id)] = Object.assign(
    {},
    existingSpecieState,
    updater(existingSpecieState)
  )

  return Object.assign({}, speciesState, newSpecieState)
}

function updateMonster(state, pokemon, options = {}) {
  const speciesIndex = pokemon.pokemon_id - 1

  const updatedPokemon = options.remove ? null : pokemon

  return updateSpecies(state, speciesIndex, (speciesAtIndex) => {
    const index = speciesAtIndex.pokemon.findIndex((p) => p.id === pokemon.id)

    const sorted = getSortedPokemon(Object.assign({}, speciesAtIndex, {
      pokemon: Immutable.array.set(speciesAtIndex.pokemon, index, updatedPokemon)
    }), state.speciesState[pokemon.pokemon_id])

    return { // make sure we sort the new pokemon index now that we updated it
      pokemon: sorted
    }
  })
}

export default handleActions({
  GET_TRAINER_INFO_SUCCESS(state, action) {
    return Object.assign({}, state, action.payload)
  },

  GET_TRAINER_INFO_FAILED(state, action) {
    ipcRenderer.send('error-message', String(action.payload))
    return state
  },

  GET_TRAINER_POKEMON_SUCCESS(state, action) {
    const monsters = getNewMonsters(state, action.payload, state.sortBy, state.sortDir)

    const updatedStateWithMonsters = Object.assign({}, state, { monsters })

    // TODO always sort the data before we return it
    return Object.assign({}, updatedStateWithMonsters, {
      speciesState: getNewSpeciesState(updatedStateWithMonsters)
    })
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
    return Object.assign({}, state, action.payload)
  },

  SORT_SPECIES(state, action) {
    const {
      sortBy,
      sortDir,
      pokemonId
    } = action.payload

    const updatedSpeciesState = Object.assign({}, state, {
      speciesState: updateSpeciesState(state, pokemonId, () => ({ sortDir, sortBy }))
    })

    const speciesIndex = pokemonId - 1

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
    const message = `Upgraded ${pokemon.nickname} succesfully!`
    const title = `Power Up ${pokemon.nickname}`
    ipcRenderer.send('information-dialog', message, title)

    return state
  },

  POWER_UP_POKEMON_FAILED(state, action) {
    console.error(action.payload) // eslint-disable-line
    return state
  }
}, initialState)
