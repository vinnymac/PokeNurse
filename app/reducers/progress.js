import {
  handleActions
} from 'redux-actions'

const initialState = {
  now: 0
}

export default handleActions({
  UPDATE_PROGRESS(state, action) {
    console.log("UPDATE", state, action)
    return Object.assign({}, state, action.payload)
  }
}, initialState)
