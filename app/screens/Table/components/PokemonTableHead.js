import React, {
  PropTypes,
} from 'react'

class PokemonTableHead extends React.PureComponent {
  static displayName = 'PokemonTableHead'

  static propTypes = {
    speciesIndex: PropTypes.number,
    sortBy: PropTypes.string,
    sortDir: PropTypes.string,
    sortPokemonBy: PropTypes.func.isRequired,
    species: PropTypes.object.isRequired,
    checkAll: PropTypes.bool.isRequired,
    onCheckAll: PropTypes.func.isRequired,
  }

  render() {
    const {
      checkAll,
    } = this.props

    return (
      <thead>
        <tr>
          <th width="5%">
            <input
              type="checkbox"
              checked={checkAll}
              onChange={this.handleCheckAll}
            />
          </th>
          <th
            width="5%"
            className={this.getSortDirectionClassName('favorite')}
            tabIndex="0"
            rowSpan="1"
            colSpan="1"
            aria-controls="pokemon-data"
            aria-label="Favorite: activate to sort column ascending"
            onClick={this.handleSortPokemon.bind(this, 'favorite')}
          >
            <span className="fa fa-star favorite-yellow" />
          </th>
          <th>
            P↑
          </th>
          <th
            width="15%"
            className={this.getSortDirectionClassName('name')}
            tabIndex="0"
            rowSpan="1"
            colSpan="1"
            aria-controls="pokemon-data"
            aria-label="Name: activate to sort column ascending"
            onClick={this.handleSortPokemon.bind(this, 'name')}
          >
            Name
          </th>
          <th
            className={this.getSortDirectionClassName('nickname')}
            tabIndex="0"
            rowSpan="1"
            colSpan="1"
            aria-controls="pokemon-data"
            aria-label="Nickname: activate to sort column ascending"
            onClick={this.handleSortPokemon.bind(this, 'nickname')}
          >
            Nickname
          </th>
          <th
            className={this.getSortDirectionClassName('cp')}
            tabIndex="0"
            rowSpan="1"
            colSpan="1"
            aria-controls="pokemon-data"
            aria-label="CP: activate to sort column ascending"
            onClick={this.handleSortPokemon.bind(this, 'cp')}
          >
            CP
          </th>
          <th
            className={this.getSortDirectionClassName('level')}
            tabIndex="0"
            rowSpan="1"
            colSpan="1"
            aria-controls="pokemon-data"
            aria-label="Level: activate to sort column ascending"
            onClick={this.handleSortPokemon.bind(this, 'level')}
          >
            Level
          </th>
          <th
            className={this.getSortDirectionClassName('iv')}
            tabIndex="0"
            rowSpan="1"
            colSpan="1"
            aria-controls="pokemon-data"
            aria-label="IV: activate to sort column ascending"
            onClick={this.handleSortPokemon.bind(this, 'iv')}
          >
            IV
          </th>
        </tr>
      </thead>
    )
  }

  handleCheckAll = () => {
    const {
      onCheckAll,
      species,
    } = this.props

    onCheckAll(species)
  }

  handleSortPokemon = (sortBy) => {
    const {
      speciesIndex,
      sortPokemonBy
    } = this.props

    sortPokemonBy(sortBy, speciesIndex)
  }

  getSortDirectionClassName = (key) => {
    const {
      sortBy,
      sortDir
    } = this.props

    if (sortBy === key) {
      return sortDir === 'ASC' ? 'sorting_asc' : 'sorting_desc'
    }

    return 'sorting'
  }
}

export default PokemonTableHead
