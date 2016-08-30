import path from 'path'
import {
  remote
} from 'electron'
import {
  createAction
} from 'redux-actions'

import * as fs from 'async-file'

const saveAccountCredentialsFailed = createAction('SAVE_ACCOUNT_CREDENTIALS_FAILED')
const saveAccountCredentialsSuccess = createAction('SAVE_ACCOUNT_CREDENTIALS_SUCCESS')

const checkAndDeleteCredentialsFailed = createAction('CHECK_AND_DELETE_CREDENTIALS_FAILED')
const checkAndDeleteCredentialsSuccess = createAction('CHECK_AND_DELETE_CREDENTIALS_SUCCESS')

const accountPath = path.join(remote.app.getPath('appData'), '/pokenurse/account.json')

export default {
  saveAccountCredentialsFailed,
  saveAccountCredentialsSuccess,
  login: createAction('USER_LOGIN'),
  logout: createAction('USER_LOGOUT'),
  checkAndDeleteCredentials() {
    return async (dispatch) => {
      try {
        if (await fs.exists(accountPath)) {
          await fs.unlink(accountPath)
          dispatch(checkAndDeleteCredentialsSuccess())
        }
      } catch (error) {
        dispatch(checkAndDeleteCredentialsFailed())
      }
    }
  },
  saveAccountCredentials(creds) {
    const credentials = JSON.stringify(creds)

    return async (dispatch) => {
      try {
        const response = await fs.writeFile(accountPath, credentials)
        dispatch(saveAccountCredentialsSuccess(response))
      } catch (error) {
        dispatch(saveAccountCredentialsFailed(error))
      }
    }
  }
}
