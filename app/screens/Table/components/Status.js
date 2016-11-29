import React, {
  PropTypes
} from 'react'
import {
  connect
} from 'react-redux'

import Progress from './Progress'

const Status = React.createClass({
  displayName: 'Status',

  propTypes: {
    status: PropTypes.object,
  },

  render() {
    const {
      method,
      time,
      current
    } = this.props.status

    let label = 'Idle'

    if (method && current) {
      const timeLabel = typeof time === 'number' ? time.toFixed(2) : ''

      label = `Running ${method} on cp${current.cp} ${current.name} / ${timeLabel} second(s) left`
    }

    return (
      <div className="status-container flex p5 flex-row">
        <div className="status mra">
          <span>{`Status: ${label}`}</span>
        </div>
        <div className="progressbar">
          <Progress progress={this.props.status} />
        </div>
      </div>
    )
  },
})

export default connect(state => ({
  status: state.status
}), null)(Status)
