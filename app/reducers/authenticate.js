import fs from 'fs'
import path from 'path'
import {
  handleActions
} from 'redux-actions'
import {
  remote,
  ipcRenderer
} from 'electron'

const accountPath = path.join(remote.app.getPath('appData'), '/pokenurse/account.json')

const credentialsInitialState = {}

// Helper to initialize the credentials state with existing account.json
function getAccountCredentials() {
  if (!fs.existsSync(accountPath)) {
    return credentialsInitialState
  }

  // Maybe use readFile instead
  const credentials = JSON.parse(fs.readFileSync(accountPath))

  return {
    method: credentials.method,
    username: credentials.username,
    password: credentials.password,
    hashingKey: credentials.hashingKey,
    apiVersion: credentials.apiVersion,
  }
}

const initialState = {
  loggedIn: false,
  authenticating: false,
  credentials: getAccountCredentials(),
}

export default handleActions({
  USER_LOGIN_STARTED(state) {
    return Object.assign({}, state, { authenticating: true })
  },

  USER_LOGIN_SUCCESS(state) {
    return Object.assign({}, state, {
      loggedIn: true,
      authenticating: false,
    })
  },

  USER_LOGIN_FAILED(state, action) {
    ipcRenderer.send('error-message', String(action.payload.error))
    return Object.assign({}, state, {
      loggedIn: false,
      authenticating: false,
    })
  },

  USER_LOGOUT(state) {
    return Object.assign({}, state, { loggedIn: false })
  },

  CHECK_AND_DELETE_CREDENTIALS_SUCCESS(state) {
    return Object.assign({}, state, { credentials: credentialsInitialState })
  },

  CHECK_AND_DELETE_CREDENTIALS_FAILED(state) {
    console.error('Failed to check and delete credentials.') // eslint-disable-line
    return state
  },

  SAVE_ACCOUNT_CREDENTIALS_SUCCESS(state, action) {
    return Object.assign({}, state, { credentials: action.payload.credentials })
  },

  SAVE_ACCOUNT_CREDENTIALS_FAILED(state) {
    console.error('Failed to save account credentials.') // eslint-disable-line
    return state
  },
}, initialState)
