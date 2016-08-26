import {
  createAction
} from 'redux-actions'

export default {
  updateStatus: createAction('UPDATE_STATUS'),
  resetStatus: createAction('RESET_STATUS')
}
