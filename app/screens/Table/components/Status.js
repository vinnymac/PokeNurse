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
})

export default connect(state => ({
  status: state.status
}), null)(Status)
