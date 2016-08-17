import React from 'react'

let counter = 0

const Counter = React.createClass({
  displayName: 'Counter',

  getInitialState() {
    return { count: counter }
  },

  render() {
    let {
      count
    } = this.state

    return (
      <p>
      Selected: {count}
      </p>
    )
  },

  handleRecount(changes) {
    counter += changes

    this.setState({
      count: counter
    })
  }

})

export default Counter
