import React, {
  PropTypes,
  Component,
} from 'react'
import {
  connect
} from 'react-redux'

import Progress from './Progress'

class Status extends Component {
  static displayName = 'Status'

  static propTypes = {
    status: PropTypes.object,
  }

  render() {
    const {
      method,
    } = this.props.status

    return (
      <div className="status-container flex p5 flex-row">
        <div className="status mra">
          <span>{`Status: ${this.getLabel()}`}</span>
        </div>
        <div className="progressbar">
          {method ? <Progress progress={this.props.status} /> : null}
        </div>
      </div>
    )
  }

  getLabel = () => {
    const {
      method,
      time,
      current
    } = this.props.status

    let label = 'Idle'

    if (method) {
      if (current) {
        const timeLabel = typeof time === 'number' ? time.toFixed(2) : ''

        label = `Running ${method} on cp$ {current.cp} ${current.name} / ${timeLabel} second(s) left`
      } else {
        label = `Running Batch ${method}`
      }
    }

    return label
  }
}

export default connect(state => ({
  status: state.status
}), null)(Status)
