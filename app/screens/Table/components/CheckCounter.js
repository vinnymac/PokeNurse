import React from 'react'

let counter = 0

const CheckCounter = React.createClass({
  displayName: 'CheckCounter',

  getInitialState() {
    return { count: counter }
  },

  render() {
    let {
      count
    } = this.state

    return (
      <span>
      Selected: {count}
      </span>
    )
  },

  handleRecount(changes) {
    counter += changes

    this.setState({
      count: counter
    })
  }

})

export default CheckCounter
