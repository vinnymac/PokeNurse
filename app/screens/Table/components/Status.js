import React, {
  PropTypes
} from 'react'
import {
  connect
} from 'react-redux'
import { bindActionCreators } from 'redux'

import Progress from './Progress'

import { updateStatus, resetStatus } from '../../../actions'

const Status = React.createClass({
  displayName: 'Status',

  propTypes: {
    status: PropTypes.object,
    resetStatus: PropTypes.func.isRequired,
    updateStatus: PropTypes.func.isRequired
  },

  componentDidUpdate(prevProps) {
    // TODO add thunks and move interval to redux action creators
    if (!prevProps.status.current && this.props.status.current) {
      this.countDownInterval()
    }
  },

  render() {
    const {
      method,
      time,
      current
    } = this.props.status

    let label = 'Idle'

    if (method && current) {
      label = `Running ${method} on cp${current.cp} ${current.name} / ${time} second(s) left`
    }

    return (
      <div className="status-container">
        <div className="row col-sm-12">
          <div className="col-sm-6 status">
            <span>{`Status: ${label}`}</span>
          </div>
          <div className="col-sm-6 progressbar">
            <Progress progress={this.props.status} />
          </div>
        </div>
      </div>
    )
  },

  countDownInterval() {
    let { time } = this.props.status

    const { finished } = this.props.status

    const interval = setInterval(() => {
      this.props.updateStatus({ time: time-- })

      if (time <= 0) {
        clearInterval(interval)
        finished()
        this.props.resetStatus()
      }
    }, 1000)
  }
})

export default connect(state => ({
  status: state.status
}), (dispatch => bindActionCreators({
  updateStatus, resetStatus
}, dispatch)))(Status)
