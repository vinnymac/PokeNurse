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
        <div className="row">
          <div className="col-xs-6 pull-left">
            Total: <strong>{pokemon.length}</strong>
          </div>
          <div className="col-xs-6 pull-right">Scroll to see them all</div>
        </div>
        <p className="confirmationTable">
          <table className="table table-striped table-condensed">
            <tbody>
               { this.buildRows(pokemon) }
            </tbody>
          </table>
        </p>
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
