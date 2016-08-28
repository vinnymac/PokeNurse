import {
  combineReducers
} from 'redux'

import status from './status'
import authenticate from './authenticate'

const appReducer = combineReducers({
  status,
  authenticate
})

export default (state, action) => {
  if (action.type === 'USER_LOGOUT') {
    state = undefined
  }

  return appReducer(state, action)
}
