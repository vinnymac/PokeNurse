import {
  handleActions
} from 'redux-actions'
import {
  ipcRenderer
} from 'electron'

import { Immutable, getSortedPokemon } from '../utils'

const initialState = {
  trainerData: null,
  monsters: null
}

function updateSpecies(state, index, updater) {
  const speciesAtIndex = state.monsters.species[index]
  const updatedSpecies = Object.assign({}, speciesAtIndex, updater(speciesAtIndex))

  const updatedMonsters = Object.assign({}, state.monsters, {
    species: Immutable.array.set(state.monsters.species, index, updatedSpecies)
  })

  return Object.assign({}, state, {
    monsters: updatedMonsters
  })
}

export default handleActions({
  GET_TRAINER_INFO_SUCCESS(state, action) {
    return Object.assign({}, state, action.payload)
  },

  GET_TRAINER_INFO_FAILED(state, action) {
    ipcRenderer.send('error-message', action.payload)
    return state
  },

  GET_TRAINER_POKEMON_SUCCESS(state, action) {
    return Object.assign({}, state, { monsters: action.payload })
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

    const speciesIndex = pokemon.pokemon_id - 1

    const updatedPokemon = options.remove ? null : pokemon

    return updateSpecies(state, speciesIndex, (speciesAtIndex) => {
      const index = speciesAtIndex.pokemon.findIndex((p) => p.id === pokemon.id)

      const sorted = getSortedPokemon(Object.assign({}, speciesAtIndex, {
        pokemon: Immutable.array.set(speciesAtIndex.pokemon, index, updatedPokemon)
      }))

      return { // make sure we sort the new pokemon index now that we updated it
        pokemon: sorted
      }
    })
  },

  UPDATE_SPECIES(state, action) {
    const {
      index,
      updater
    } = action.payload

    return updateSpecies(state, index, updater)
  }
}, initialState)
