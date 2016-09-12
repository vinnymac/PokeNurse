import {
  createAction
} from 'redux-actions'

const updateStatus = createAction('UPDATE_STATUS')
const resetStatus = createAction('RESET_STATUS')

let currentInterval = null

function resetStatusAndStopCountdown() {
  clearInterval(currentInterval)
  return async (dispatch) => {
    dispatch(resetStatus())
  }
}

function startCountdownStatus(statusUpdates) {
  return async (dispatch) => {
    let {
      time,
    } = statusUpdates

    dispatch(updateStatus(statusUpdates))

    currentInterval = setInterval(() => {
      dispatch(updateStatus({ time: time-- }))

      if (time <= 0) {
        dispatch(resetStatusAndStopCountdown())
      }
    }, 1000)
  }
}

export default {
  updateStatus,
  resetStatus,
  resetStatusAndStopCountdown,
  startCountdownStatus,
}
