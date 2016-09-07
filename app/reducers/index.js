import {
  combineReducers
} from 'redux'

import status from './status'
import authenticate from './authenticate'
import trainer from './trainer'
import settings from './settings'

const appReducer = combineReducers({
  status,
  authenticate,
  trainer,
  settings,
})

export default (state, action) => {
  if (action.type === 'USER_LOGOUT') {
    state = {
      authenticate: state.authenticate,
      settings: state.settings,
    }
  }

  return appReducer(state, action)
}
