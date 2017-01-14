import React, {
  PropTypes
} from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import actions from '../../../actions'

import PokemonTableHead from './PokemonTableHead'
import PokemonTableBody from './PokemonTableBody'

class PokemonTable extends React.PureComponent {
  static displayName = 'PokemonTable'

  static propTypes = {
    speciesIndex: PropTypes.number,
    sortBy: PropTypes.string,
    sortDir: PropTypes.string,
    sortPokemonBy: PropTypes.func.isRequired,
    onCheckedChange: PropTypes.func.isRequired,
    species: PropTypes.object.isRequired,
    pokemon: PropTypes.array.isRequired,
    checkAll: PropTypes.bool.isRequired,
    onCheckAll: PropTypes.func.isRequired,
    getPokemonState: PropTypes.func.isRequired,
    toggleFavoritePokemon: PropTypes.func.isRequired,
    powerUpPokemon: PropTypes.func.isRequired,
  }

  render() {
    const {
      species,
      checkAll,
      getPokemonState,
      pokemon,
      onCheckedChange,
      toggleFavoritePokemon,
      powerUpPokemon,
      speciesIndex,
      sortPokemonBy,
      sortDir,
      sortBy,
      onCheckAll,
    } = this.props

    return (<table className="table table-condensed table-hover table-striped">
      <PokemonTableHead
        checkAll={checkAll}
        sortBy={sortBy}
        sortDir={sortDir}
        sortPokemonBy={sortPokemonBy}
        speciesIndex={speciesIndex}
        species={species}
        onCheckAll={onCheckAll}
      />
      <PokemonTableBody
        species={species}
        pokemon={pokemon}
        getPokemonState={getPokemonState}
        onCheckedChange={onCheckedChange}
        toggleFavoritePokemon={toggleFavoritePokemon}
        powerUpPokemon={powerUpPokemon}
      />
    </table>)
  }
}

export default connect(null, dispatch => bindActionCreators({
  toggleFavoritePokemon: actions.toggleFavoritePokemon,
  powerUpPokemon: actions.powerUpPokemon
}, dispatch))(PokemonTable)
