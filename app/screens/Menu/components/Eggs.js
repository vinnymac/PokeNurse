import React, {
  PropTypes
} from 'react'

const Eggs = React.createClass({
  propTypes: {
    eggList: PropTypes.array,
  },

  render() {
    const {
      eggList
    } = this.props

    const eggs = eggList.map((e, i) =>
      <li key={i}>
        {e.egg_km_walked_start}.0 / {e.egg_km_walked_target}.0 km
      </li>
    )

    return (
      <ul className="nav navbar-nav submenu">
        {eggs}
      </ul>
    )
  }
})

export default Eggs
