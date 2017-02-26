import React, {
  PropTypes,
} from 'react'

import PokemonRow from './PokemonRow'

const PokemonTableBody = ({
  species, pokemon, getPokemonState, onCheckedChange,
  toggleFavoritePokemon, powerUpPokemon,
}) => {
  const pokemonRows = pokemon.map(p =>
    <PokemonRow
      key={p.id}
      getPokemonState={getPokemonState}
      species={species}
      pokemon={p}
      onCheckedChange={onCheckedChange}
      toggleFavoritePokemon={toggleFavoritePokemon}
      powerUpPokemon={powerUpPokemon}
    />
  )

  return (
    <tbody>
      {pokemonRows}
    </tbody>
  )
}

PokemonTableBody.propTypes = {
  onCheckedChange: PropTypes.func.isRequired,
  species: PropTypes.object.isRequired,
  pokemon: PropTypes.array.isRequired,
  getPokemonState: PropTypes.func.isRequired,
  toggleFavoritePokemon: PropTypes.func.isRequired,
  powerUpPokemon: PropTypes.func.isRequired,
}

export default PokemonTableBody
