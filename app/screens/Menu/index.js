import React from 'react'

const Menu = require('react-burger-menu').slide

const MainMenu = React.createClass({
  render() {
    return (
      <Menu noOverlay >
        <div className="navbar-collapse collapse sidebar-navbar-collapse">
          <ul className="nav navbar-nav">
            <li><h3>Settings</h3></li>
            <li><a href="#">Menu Item 2</a></li>
            <li><a href="#">Menu Item 3</a></li>
            <li><a href="#">Menu Item 4</a></li>
          </ul>
        </div>
      </Menu>
    )
  }
})

export default MainMenu
