import React, {
  PropTypes
} from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import $ from 'jquery'
import {
  updateStatus,
  logout
} from '../../actions'
import renderSettings from '../Settings'
// import Eggs from './components/Eggs'

const Menu = require('react-burger-menu').slide

const MainMenu = React.createClass({
  propTypes: {
    updateStatus: PropTypes.func.isRequired,
    logout: PropTypes.func.isRequired,
    eggs: PropTypes.array,
  },

  render() {
    // const {
    //   eggs
    // } = this.props

    return (
      <Menu>
        <div>
          <ul className="nav navbar-nav">
            <li><a onClick={this.handleClickSettings}>Settings <i className="fa fa-cog" /></a></li>
            {
              // <li><a>Applied Items <i className="glyphicon glyphicon-chevron-down" /></a></li>
              // <li>
              //   <a>
              //     Eggs <i className="glyphicon glyphicon-chevron-down" />
              //   </a>
              //   <Eggs eggList={eggs} />
              // </li>
              // <li><a>Trainer Info <i className="glyphicon glyphicon-user" /></a></li>
              // <li><a>Inventory <i className="glyphicon glyphicon-chevron-down" /></a></li>
            }
            <li><a onClick={this.handleSignOut}>Sign Out <i className="fa fa-power-off" /></a></li>
          </ul>
        </div>
      </Menu>
    )
  },

  handleClickSettings() {
    renderSettings($(document.getElementById('settingsModal')))
  },

  handleSignOut() {
    this.props.logout()
  },
})

export default connect(null, (dispatch => bindActionCreators({ updateStatus, logout }, dispatch)))(MainMenu)
