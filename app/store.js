import {
  compose,
  applyMiddleware,
  createStore
} from 'redux'
import createLogger from 'redux-logger'

import reducer from './reducers'

// Create Logger for logging of actions
const logger = createLogger()

// http://redux.js.org/docs/api/compose.html
const storeEnhancer = compose(applyMiddleware(logger))


function configureStore(initialState) {
  return createStore(reducer, initialState, storeEnhancer)
}

const initialState = {}

export default configureStore(initialState)
