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

    return (
      <ul className="nav navbar-nav submenu">
      {eggList.map((e, i) =>
        <li key={i}>
          {e.egg_km_walked_start}.0 / {e.egg_km_walked_target}.0 km
        </li>
      )}
      </ul>
    )
  }
})

export default Eggs
