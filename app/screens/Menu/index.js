import React from 'react'

const Menu = require('react-burger-menu').slide

const MainMenu = React.createClass({
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
          </ul>
        </div>
      </Menu>
    )
  }
})

export default MainMenu
