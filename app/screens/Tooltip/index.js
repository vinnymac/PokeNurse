import React, { PropTypes } from 'react'
import {
  OverlayTrigger,
  Tooltip,
  Button
} from 'react-bootstrap'

// This wrapper allows for tooltips to be used around disabled elements
// For example a disabled input or button may have a tooltip to inform the user
const TooltipWrapper = React.createClass({
  displayName: 'TooltipWrapper',

  propTypes: {
    id: PropTypes.string.isRequired,
    show: PropTypes.bool,
    message: PropTypes.node,
    placement: PropTypes.string,
    delayShow: PropTypes.number,
    wrapperClass: PropTypes.string,
    wrapperStyle: PropTypes.object,
    wrapperTag: PropTypes.string,
    children: React.PropTypes.node
  },

  render() {
    const {
      show,
      id,
      message,
      placement,
      delayShow,
      wrapperClass,
      wrapperStyle,
      wrapperTag
    } = this.props

    let tooltip = null

    if (show) {
      tooltip = (<Tooltip id={id}>
        {message}
      </Tooltip>)
    } else {
      tooltip = <div />
    }

    const WrapperTag = wrapperTag || 'div'

    const { childrenWithDisabledSupport, hasDisabledChildren } = this.renderChildren()

    let disabledWrapperStyle = null

    if (hasDisabledChildren) {
      disabledWrapperStyle = Object.assign({}, {
        display: 'inline-block',
        cursor: 'not-allowed'
      }, wrapperStyle)
    }

    return (<OverlayTrigger
      placement={placement}
      overlay={tooltip}
      delayShow={delayShow}
    >
      <WrapperTag
        className={wrapperClass}
        style={disabledWrapperStyle}
      >
        {childrenWithDisabledSupport}
      </WrapperTag>
    </OverlayTrigger>)
  },


  renderChildren() {
    const { children } = this.props

    let hasDisabledChildren = false

    const childrenWithDisabledSupport = React.Children.map(children, (child) => {
      const isChildType = child.type in [Button, React.DOM.button]

      if (child && isChildType && child.props.disabled) {
        hasDisabledChildren = true
        const childStyle = Object.assign({}, child.props.style, { pointerEvents: 'none' })
        return React.cloneElement(child, { style: childStyle })
      }

      return child
    })

    return { childrenWithDisabledSupport, hasDisabledChildren }
  }
})

export default TooltipWrapper
