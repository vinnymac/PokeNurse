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
        <div className="confirmationTable">
          <table className="table table-striped table-condensed">
            <thead>
              <tr>
                <td>Favorite</td>
                <td>Name</td>
                <td>Nickname</td>
                <td>CP</td>
                <td>IV</td>
              </tr>
            </thead>
            <tbody>
               { this.buildRows(pokemon) }
            </tbody>
          </table>
        </div>
        <p className="confirmationTotal">
          <strong>Total: {pokemon.length}</strong> (scroll to see them all)
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
            <td>{p.iv}%</td>
          </tr>
        )
      })
    )
  }


})

export default SelectedPokemon
