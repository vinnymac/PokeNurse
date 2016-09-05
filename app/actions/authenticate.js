import path from 'path'
import pogobuf from 'pogobuf'
import {
  remote
} from 'electron'
import {
  createAction
} from 'redux-actions'

import * as fs from 'async-file'

import client from '../client'

import {
  getTrainerInfo,
  getTrainerPokemon
} from './trainer'

const saveAccountCredentialsFailed = createAction('SAVE_ACCOUNT_CREDENTIALS_FAILED')
const saveAccountCredentialsSuccess = createAction('SAVE_ACCOUNT_CREDENTIALS_SUCCESS')

const checkAndDeleteCredentialsFailed = createAction('CHECK_AND_DELETE_CREDENTIALS_FAILED')
const checkAndDeleteCredentialsSuccess = createAction('CHECK_AND_DELETE_CREDENTIALS_SUCCESS')

const userLoginSuccess = createAction('USER_LOGIN_SUCCESS')
const userLoginFailed = createAction('USER_LOGIN_FAILED')

const accountPath = path.join(remote.app.getPath('appData'), '/pokenurse/account.json')

export default {
  client,

  login({ method, username, password }) {
    return async (dispatch) => {
      let login
      if (method === 'google') {
        login = new pogobuf.GoogleLogin()
      } else {
        login = new pogobuf.PTCLogin()
      }

      try {
        const token = await login.login(username, password)

        client.setAuthInfo(method, token)
        client.init()

        // TODO display a loading spinner
        // then fetch all necessary things
        await Promise.all([
          dispatch(getTrainerInfo()),
          dispatch(getTrainerPokemon())
        ])

        dispatch(userLoginSuccess())
      } catch (error) {
        console.error(error) // eslint-disable-line
        dispatch(userLoginFailed({ error }))
      }
    }
  },

  logout: createAction('USER_LOGOUT'),

  checkAndDeleteCredentials() {
    return async (dispatch) => {
      try {
        if (await fs.exists(accountPath)) {
          await fs.unlink(accountPath)
        }
        dispatch(checkAndDeleteCredentialsSuccess())
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
