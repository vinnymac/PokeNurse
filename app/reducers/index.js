import {
  combineReducers
} from 'redux'

import status from './status'
import authenticate from './authenticate'
import trainer from './trainer'

const appReducer = combineReducers({
  status,
  authenticate,
  trainer
})

export default (state, action) => {
  if (action.type === 'USER_LOGOUT') {
    state = undefined
  }

  return appReducer(state, action)
}
