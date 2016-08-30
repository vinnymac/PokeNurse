import React, {
  PropTypes
} from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  updateStatus,
  logout
} from '../../actions'

const Menu = require('react-burger-menu').slide

const MainMenu = React.createClass({
  propTypes: {
    updateStatus: PropTypes.func.isRequired,
    logout: PropTypes.func.isRequired
  },

  render() {
    return (
      <Menu noOverlay >
        <div>
          <ul className="nav navbar-nav">
            <li><a>Settings <i className="glyphicon glyphicon-cog" /></a></li>
            <li><a>Trainer Info <i className="glyphicon glyphicon-user" /></a></li>
            <li><a>Applied Items <i className="glyphicon glyphicon-chevron-down" /></a></li>
            <li><a>Inventory <i className="glyphicon glyphicon-chevron-down" /></a></li>
            <li><a>Eggs <i className="glyphicon glyphicon-chevron-down" /></a></li>
            <li><a onClick={this.handleSignOut}>Sign Out <i className="glyphicon glyphicon-off" /></a></li>
          </ul>
        </div>
      </Menu>
    )
  },

  handleSignOut() {
    this.props.logout()
  }
})

export default connect(null, (dispatch => bindActionCreators({ updateStatus, logout }, dispatch)))(MainMenu)
