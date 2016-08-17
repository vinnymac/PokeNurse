import React from 'react'

var Counter = React.createClass({
  getInitialState () {
    return {
      count: 0
    }
  },

  handleCheck (check) {
    let {
      count
    } = this.state

    let newCount
    
    newCount = check ? count + 1 : count - 1

    this.setState({
      count: newCount
    })

  },

  render () {
    let {
      count
    } = this.state

    return (
      <p>
      Selected: {count}
      </p>
    )
  },

})

export default Counter
