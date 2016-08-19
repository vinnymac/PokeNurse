import React, {
  PropTypes
} from 'react'

const SelectedPokemon = React.createClass({
  displayName: 'SelectedPokemon',

  propTypes: {
    pokemon: PropTypes.array
  },

  render() {
    const {
      pokemon
    } = this.props

    return (
      <div>
        <p>
          Total: <strong>{pokemon.length}</strong> (scroll to see them all)
        </p>
        <div className="confirmationTable">
          <table className="table table-striped table-condensed">
            <tbody>
               { this.buildRows(pokemon) }
            </tbody>
          </table>
        </div>
      </div>
    )
  },

  buildRows(pokemon) {
    return (
      pokemon.map((p, i) => {
        const favoriteGlyph = 'glyphicon glyphicon-star favorite-yellow'
        const emptyFavoriteGlyph = 'glyphicon glyphicon-star-empty'
        const favorite = p.favorite ? favoriteGlyph : emptyFavoriteGlyph

        return (
          <tr key={i}>
            <td>
              <span className={`favorite ${favorite}`} />
            </td>
            <td>{p.name}</td>
            <td>{p.nickname}</td>
            <td>{p.cp}</td>
            <td>{p.iv}</td>
          </tr>
        )
      })
    )
  }


})

export default SelectedPokemon
