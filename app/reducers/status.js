import {
  handleActions
} from 'redux-actions'

const initialState = {
  selectedPokemon: null,
  current: null,
  running: false,
  time: 0,
  method: '',
  finished: null
}

export default handleActions({
  UPDATE_STATUS(state, action) {
    return Object.assign({}, state, action.payload)
  },

  RESET_STATUS() {
    return initialState
  }
}, initialState)
