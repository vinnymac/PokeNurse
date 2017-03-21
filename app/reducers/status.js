import {
  handleActions
} from 'redux-actions'

const initialState = {
  selectedPokemon: null,
  current: null,
  time: 0,
  method: '',
}

export default handleActions({
  UPDATE_STATUS(state, action) {
    return {
      ...state,
      ...action.payload,
    }
  },

  RESET_STATUS() {
    return initialState
  }
}, initialState)
