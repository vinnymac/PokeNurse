import React, {
  PropTypes
} from 'react'
import QuickMove from './QuickMove'
import CinematicMove from './CinematicMove'
import Nickname from './Nickname'
import Evolutions from './Evolutions'

class ModalBody extends React.Component {
  static propTypes = {
    transform: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    hp: PropTypes.string.isRequired,
    cp: PropTypes.number.isRequired,
    pokemon: PropTypes.object.isRequired,
    maxCP: PropTypes.number.isRequired,
    type: PropTypes.array.isRequired,
    weight: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    attack: PropTypes.string.isRequired,
    defense: PropTypes.string.isRequired,
    cpPerUpgrade: PropTypes.string.isRequired,
    candies: PropTypes.number.isRequired,
    fastMove: PropTypes.object.isRequired,
    chargedMove: PropTypes.object.isRequired,
    evolutionIds: PropTypes.node,
    possibleQuickMoves: PropTypes.array,
    possibleCinematicMoves: PropTypes.array,
  }

  render() {
    const {
      transform,
      name,
      hp,
      cp,
      pokemon,
      maxCP,
      type,
      weight,
      height,
      attack,
      defense,
      cpPerUpgrade,
      candies,
      fastMove,
      chargedMove,
      evolutionIds,
      possibleQuickMoves,
      possibleCinematicMoves,
    } = this.props

    const quickMoves = possibleQuickMoves.map((possibleQuickMove, i) =>
      <QuickMove key={i} move={possibleQuickMove} myMove={fastMove} />
    )

    const cinematicMoves = possibleCinematicMoves.map((possibleCinematicMove, i) =>
      <CinematicMove key={i} move={possibleCinematicMove} myMove={chargedMove} />
    )

    return (<div className="modal-body">
      <div id="pokemon_sprite_wrapper">
        <div style={{ textAlign: 'center', fontSize: '11px' }}>
          <span>CP</span>
          <span style={{ fontSize: '20px' }}>{cp}</span>
          <span>{` (Max ${maxCP})`}</span>
        </div>
        <div id="pokemon_sprite_sphere_wrapper">
          <div id="pokemon_sprite_sphere" />
          <div id="pokemon_sprite_sphere_dot" style={{ WebkitTransform: transform }} />
        </div>

        <img
          onClick={this.handleCry}
          title="Listen to Cry"
          alt="Profile Sprite"
          id="pokemon_profile_sprite"
          src={this.handleSprite(pokemon)}
          onError={() => { document.getElementById('pokemon_profile_sprite').src = `./imgs/3d/${pokemon.pokemon_id}.webp` }}
        />
        <audio
          id="pokemonCry"
          ref={(c) => { this.cry = c }}
        >
          <source
            src={`./cries/${pokemon.pokemon_id}.ogg`}
            type="audio/ogg"
          />
        </audio>
      </div>

      <div id="pokemon_contents">
        <Nickname pokemon={pokemon} />
        <div id="pokemon_health_bar" />
        <div id="pokemon_health">{`HP ${hp}`}</div>
        <div className="pokemon_info">
          <div className="pokemon-info-item split-4-way">
            <div className="pokemon-info-item-text">
              {`${weight}`}
              <span className="pokemon-stat-unit">&thinsp;kg</span>
            </div>
            <div className="pokemon-info-item-title">Weight</div>
          </div>
          <div className="pokemon-info-item split-2-way">
            <div className="pokemon-info-item-text">{`${type.join(' / ')}`}</div>
            <div className="pokemon-info-item-title">Type</div>
          </div>
          <div className="pokemon-info-item split-4-way">
            <div className="pokemon-info-item-text">
              {`${height}`}
              <span className="pokemon-stat-unit">&thinsp;m</span>
            </div>
            <div className="pokemon-info-item-title">Height</div>
          </div>
        </div>
        <div className="pokemon_info">
          <div className="pokemon-info-item split-2-way">
            <div className="pokemon-info-item-text cp-upgrade">{cpPerUpgrade}</div>
            <div className="pokemon-info-item-title">CP Per Upgrade</div>
          </div>
          <div className="pokemon-info-item split-2-way">
            <div className="pokemon-info-item-text candy-count">{candies}</div>
            <div className="pokemon-info-item-title">{`${name} Candy`}</div>
          </div>
        </div>
        <div className="pokemon_info">
          <div className="pokemon-info-item split-3-way">
            <div className="pokemon-info-item-text combat-stat">{`${attack}`}</div>
            <div className="pokemon-info-item-title">Attack</div>
          </div>
          <div className="pokemon-info-item split-3-way">
            <div className="pokemon-info-item-text combat-stat">{`${defense}`}</div>
            <div className="pokemon-info-item-title">Defense</div>
          </div>
          <div className="pokemon-info-item split-3-way">
            <div className="pokemon-info-item-text combat-stat">{`${pokemon.iv}%`}</div>
            <div className="pokemon-info-item-title">IV</div>
          </div>
        </div>
        <div className="pokemon_move_info">
          <div className="pokemon-move-item-title">Quick Moves</div>
          {quickMoves}
          <div className="pokemon-move-item-title">Charged Moves</div>
          {cinematicMoves}
        </div>
        <Evolutions evolutionIds={evolutionIds} />
      </div>
    </div>)
  }

  handleCry = () => {
    this.cry.play()
  }

  handleSprite = (pokemon) => {
    let imgPath
    if (pokemon.gender === 'Female') {
      if (pokemon.shiny) {
        // Is FEMALE and SHINY
        imgPath = `./imgs/3d/${pokemon.pokemon_id}-fs.webp`
      } else {
        // Is FEMALE
        imgPath = `./imgs/3d/${pokemon.pokemon_id}-f.webp`
      }
    } else if (pokemon.shiny) {
      // Is MALE or GENDERLESS and SHINY
      imgPath = `./imgs/3d/${pokemon.pokemon_id}-s.webp`
    } else {
      // Is MALE or GENDERLESS
      imgPath = `./imgs/3d/${pokemon.pokemon_id}.webp`
    }
    return imgPath
  }
}

export default ModalBody
