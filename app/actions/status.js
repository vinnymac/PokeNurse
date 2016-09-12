import {
  createAction
} from 'redux-actions'

const updateStatus = createAction('UPDATE_STATUS')
const resetStatus = createAction('RESET_STATUS')

export default {
  updateStatus,
  resetStatus,
  startCountdownStatus(statusUpdates, finished) {
    return async (dispatch) => {
      let {
        time,
      } = statusUpdates

      dispatch(updateStatus(statusUpdates))

      const interval = setInterval(() => {
        dispatch(updateStatus({ time: time-- }))

        if (time <= 0) {
          clearInterval(interval)
          finished()
          dispatch(resetStatus())
        }
      }, 1000)
    }
  }
}
