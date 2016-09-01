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

// Helper to initialize the credentials state with existing account.json
function getAccountCredentials() {
  if (!fs.existsSync(accountPath)) {
    return {}
  }

  // Maybe use readFile instead
  const credentials = JSON.parse(fs.readFileSync(accountPath))

  return {
    method: credentials.method,
    username: credentials.username,
    password: credentials.password
  }
}

const initialState = {
  loggedIn: false,
  credentials: getAccountCredentials()
}

export default handleActions({
  USER_LOGIN_SUCCESS(state) {
    return Object.assign({}, state, { loggedIn: true })
  },

  USER_LOGIN_FAILED(state, action) {
    ipcRenderer.send('error-message', String(action.payload.error))
    return Object.assign({}, state, { loggedIn: false })
  },

  USER_LOGOUT(state) {
    return Object.assign({}, state, { loggedIn: false })
  },
}, initialState)
