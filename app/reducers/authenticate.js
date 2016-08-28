import {
  handleActions
} from 'redux-actions'

const initialState = {
  loggedIn: false
}

export default handleActions({
  USER_LOGIN(state) {
    return Object.assign({}, state, { loggedIn: true })
  },

  USER_LOGOUT(state) {
    return Object.assign({}, state, { loggedIn: false })
  }
}, initialState)
