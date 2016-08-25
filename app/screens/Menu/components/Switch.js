import React from 'react'

const Switch = React.createClass({
  propTypes: {
    on: React.PropTypes.bool,
    onClick: React.PropTypes.func,
    enabled: React.PropTypes.bool,
    className: React.PropTypes.string,
    children: React.PropTypes.node
  },

  defaultProps: {
    on: false,
    onClick: () => {},
    enabled: true,
    className: ''
  },

  constructor(props) {
    super(props)
    this.state = {
      on: this.props.on
    }
  },

  componentWillReceiveProps(nextProps) {
    this.setState({
      on: nextProps.on
    })
  },

  render() {
    const className = ['switch', this.props.className, (this.state.on ? 'on ' : ''), (this.props.enabled ? '' : 'disabled ')].join(' ')
    return (
      <div className={className} onClick={this.handleClick}>
        <div className="switch-toggle" children={this.props.children} />
      </div>
    )
  },

  handleClick(e) {
    e.preventDefault()
    if (this.props.enabled) {
      this.props.onClick()
      this.setState({
        on: !this.state.on
      })
    }
  },
})

export default Switch
