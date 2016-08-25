import {
  handleActions
} from 'redux-actions'

const initialState = {
  selectedPokemon: null,
  current: null
}

export default handleActions({
  UPDATE_PROGRESS(state, action) {
    return Object.assign({}, state, action.payload)
  }
}, initialState)
