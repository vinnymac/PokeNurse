import React from 'react'

const Menu = require('react-burger-menu').slide

const MainMenu = React.createClass({
  render() {
    return (
      <Menu noOverlay >
        <a id="home" className="menu-item" href="/">Home</a>
        <a id="about" className="menu-item" href="/about">About</a>
        <a id="contact" className="menu-item" href="/contact">Contact</a>
      </Menu>
    )
  }
})

export default MainMenu
