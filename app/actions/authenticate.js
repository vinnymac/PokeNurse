import path from 'path'
import pogobuf from 'pogobuf'
import {
  remote
} from 'electron'
import {
  createAction
} from 'redux-actions'

import * as fs from 'async-file'

import { setClient } from '../client'

import {
  getTrainerInfoAndPokemon,
} from './trainer'

const saveAccountCredentialsFailed = createAction('SAVE_ACCOUNT_CREDENTIALS_FAILED')
const saveAccountCredentialsSuccess = createAction('SAVE_ACCOUNT_CREDENTIALS_SUCCESS')

const checkAndDeleteCredentialsFailed = createAction('CHECK_AND_DELETE_CREDENTIALS_FAILED')
const checkAndDeleteCredentialsSuccess = createAction('CHECK_AND_DELETE_CREDENTIALS_SUCCESS')

const userLoginStarted = createAction('USER_LOGIN_STARTED')
const userLoginSuccess = createAction('USER_LOGIN_SUCCESS')
const userLoginFailed = createAction('USER_LOGIN_FAILED')

const accountPath = path.join(remote.app.getPath('appData'), '/pokenurse/account.json')

export default {
  login({ method, username, password, hashingKey, apiVersion }) {
    return async (dispatch) => {
      dispatch(userLoginStarted())

      let login
      if (method === 'google') {
        login = new pogobuf.GoogleLogin()
      } else {
        login = new pogobuf.PTCLogin()
      }

      try {
        const token = await login.login(username, password)

        const options = {
          hashingKey,
          authType: method,
          authToken: token,
          useHashingServer: !!hashingKey,
        }

        // Use default API version
        if (hashingKey) options.version = apiVersion || 5702

        const client = new pogobuf.Client(options)

        await client.init()

        setClient(client)

        // TODO display a loading spinner
        // then fetch all necessary things
        await dispatch(getTrainerInfoAndPokemon())

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

  saveAccountCredentials(credentials) {
    return async (dispatch) => {
      try {
        const response = await fs.writeFile(accountPath, JSON.stringify(credentials))
        dispatch(saveAccountCredentialsSuccess({ response, credentials }))
      } catch (error) {
        dispatch(saveAccountCredentialsFailed(error))
      }
    }
  }
}
