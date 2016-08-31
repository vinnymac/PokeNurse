import {
  handleActions
} from 'redux-actions'
import {
  ipcRenderer
} from 'electron'

const initialState = {
  trainerData: null,
  monsters: null
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
}, initialState)
