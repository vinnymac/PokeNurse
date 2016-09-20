import {
  createAction
} from 'redux-actions'

const updateStatus = createAction('UPDATE_STATUS')
const resetStatus = createAction('RESET_STATUS')

export default {
  updateStatus,
  resetStatus,
}
